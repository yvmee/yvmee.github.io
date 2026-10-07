/**
 * Tiny pixel-art toolkit. Everything is deterministic (seeded) so the
 * prerendered HTML and the hydrated client render identical SVG.
 */

export type Cell = (x: number, y: number) => boolean

/** Merges horizontal runs of filled cells into a compact SVG path. */
export function cellsToPath(width: number, height: number, filled: Cell) {
  let d = ""
  for (let y = 0; y < height; y++) {
    let x = 0
    while (x < width) {
      if (!filled(x, y)) {
        x++
        continue
      }
      const start = x
      while (x < width && filled(x, y)) x++
      d += `M${start} ${y}h${x - start}v1h${start - x}z`
    }
  }
  return d
}

/** Mulberry32: small, fast, seeded PRNG. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Circle = { x: number; y: number; r: number }

/** A puffy cloud: union of circles with a flat bottom, like the reference art. */
export function cloudPath(circles: Circle[]) {
  const width = Math.ceil(Math.max(...circles.map((c) => c.x + c.r))) + 1
  const bottom = Math.max(...circles.map((c) => c.y))
  const height = Math.ceil(bottom) + 1
  const path = cellsToPath(width, height, (x, y) => {
    if (y > bottom) return false
    return circles.some(
      (c) => (x + 0.5 - c.x) ** 2 + (y + 0.5 - c.y) ** 2 <= c.r * c.r
    )
  })
  return { path, width, height }
}

/** Generates a random cloud made of overlapping bumps, biggest in the middle. */
export function randomCloud(seed: number, size: number) {
  const random = rng(seed)
  const bumps = 3 + Math.floor(random() * 3)
  const radii = Array.from({ length: bumps }, (_, i) => {
    const middle = 1 - Math.abs(i / (bumps - 1) - 0.5) * 1.4
    return size * (0.38 + random() * 0.2) * (0.6 + middle * 0.8)
  })
  const base = Math.ceil(Math.max(...radii) * 1.3)
  const circles: Circle[] = []
  let x = radii[0] + 0.5
  radii.forEach((r, i) => {
    circles.push({ x, y: base - r * 0.3, r })
    x += (r + (radii[i + 1] ?? 0)) * (0.55 + random() * 0.2)
  })
  return cloudPath(circles)
}

export function circlePath(radius: number) {
  const size = radius * 2
  const path = cellsToPath(
    size,
    size,
    (x, y) => (x + 0.5 - radius) ** 2 + (y + 0.5 - radius) ** 2 <= radius ** 2
  )
  return { path, width: size, height: size }
}

/** Midpoint-displacement ridge line, returns one height per column. */
export function ridge(seed: number, width: number, roughness = 0.55) {
  const random = rng(seed)
  let size = 1
  while (size < width) size *= 2
  const heights = new Array<number>(size + 1).fill(0)
  heights[0] = random()
  heights[size] = random()
  let step = size
  let scale = 1
  while (step > 1) {
    const half = step / 2
    for (let i = half; i < size; i += step) {
      heights[i] =
        (heights[i - half] + heights[i + half]) / 2 + (random() - 0.5) * scale
    }
    step = half
    scale *= roughness
  }
  const slice = heights.slice(0, width)
  const min = Math.min(...slice)
  const max = Math.max(...slice)
  return slice.map((h) => (h - min) / (max - min || 1))
}

/**
 * Snowy mountain range made of overlapping peaks with a little noise.
 * Returns the silhouette and a shading layer on the flanks facing away from
 * the light (light comes from the left).
 */
export function mountainPaths(
  seed: number,
  width: number,
  height: number,
  peak = 0.85
) {
  const random = rng(seed)
  const noise = ridge(seed + 99, width, 0.6)
  const count = Math.max(3, Math.round(width / 60))
  const peaks = Array.from({ length: count }, (_, i) => ({
    x: ((i + 0.15 + random() * 0.7) * width) / count,
    h: (0.5 + random() * 0.5) * peak * (height - 2),
    slope: 0.45 + random() * 0.5,
  }))

  const tops: number[] = []
  const owner: number[] = []
  for (let x = 0; x < width; x++) {
    let best = -Infinity
    let index = 0
    peaks.forEach((p, i) => {
      const h = p.h - Math.abs(x - p.x) * p.slope
      if (h > best) {
        best = h
        index = i
      }
    })
    tops.push(Math.round(height - 1 - Math.max(1, best) - noise[x] * 2))
    owner.push(index)
  }

  const fill = cellsToPath(width, height, (x, y) => y >= tops[x])
  const shade = cellsToPath(width, height, (x, y) => {
    const depth = y - tops[x]
    const p = peaks[owner[x]]
    if (depth < 1 || x <= p.x + 1) return false
    const band = 2 + (x - p.x) * 0.5
    if (depth <= 2) return true
    if (depth > band) return false
    return (x + y) % 2 === 0
  })
  return { fill, shade, width, height }
}

/** Horizontal streaks of light on water. */
export function seaPath(seed: number, width: number, height: number) {
  const random = rng(seed)
  const rows: string[] = []
  for (let y = 0; y < height; y += 2) {
    let x = Math.floor(random() * 6)
    const density = 0.25 + (y / height) * 0.6
    while (x < width) {
      const length = 2 + Math.floor(random() * (4 + density * 18))
      if (random() < density) rows.push(`M${x} ${y}h${length}v1h${-length}z`)
      x += length + 1 + Math.floor(random() * 8 * (1 - density))
    }
  }
  return rows.join("")
}

/** Draws a sprite from a list of strings; each character maps to a color class. */
export function spritePaths(rows: string[]) {
  const height = rows.length
  const width = Math.max(...rows.map((r) => r.length))
  const colors = new Set(rows.join("").replaceAll(".", ""))
  const paths: Record<string, string> = {}
  for (const color of colors) {
    paths[color] = cellsToPath(width, height, (x, y) => rows[y][x] === color)
  }
  return { paths, width, height }
}

/** A long, flat-bottomed bank of clouds spanning `width` cells. */
export function cloudBankPath(seed: number, width: number, height: number) {
  const random = rng(seed)
  const circles: Circle[] = []
  let x = -4
  while (x < width + 4) {
    const r = height * (0.3 + random() * 0.45)
    circles.push({ x, y: height + r * 0.15, r })
    x += r * (0.9 + random() * 0.7)
  }
  return cellsToPath(width, height, (cx, cy) =>
    circles.some(
      (c) => (cx + 0.5 - c.x) ** 2 + (cy + 0.5 - c.y) ** 2 <= c.r * c.r
    )
  )
}
