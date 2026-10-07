/**
 * Generates the favicon set and the Open Graph image from the pixel sprites
 * and the YAML content, so they never go out of sync with the site.
 */
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { Resvg } from "@resvg/resvg-js"
import satori from "satori"

import { randomCloud, spritePaths } from "../src/components/pixel/pixel.ts"
import {
  avatarPalette,
  avatarRows,
  strawberryRows,
} from "../src/components/pixel/sprites.ts"
import type { Content } from "../src/content/schema.ts"

const require = createRequire(import.meta.url)
const font = (pkg: string, file: string) =>
  readFileSync(require.resolve(`${pkg}/files/${file}`))

const colors = {
  sky: "#b6ddd6",
  skyDeep: "#97cbc1",
  ink: "#222f31",
  paper: "#ffffff",
  leaf: "#4f9e8b",
  berry: "#e5484d",
  seed: "#fff1c2",
  muted: "#55686a",
}

const spriteColors: Record<string, string> = {
  G: colors.leaf,
  R: colors.berry,
  Y: colors.seed,
}

function spriteSvg(
  rows: string[],
  palette: Record<string, string>,
  options: { background?: string; padding?: number } = {}
) {
  const { paths, width, height } = spritePaths(rows)
  const padding = options.padding ?? 0
  const size = Math.max(width, height) + padding * 2
  const x = (size - width) / 2
  const y = (size - height) / 2
  const body = Object.entries(paths)
    .map(([key, d]) => `<path d="${d}" fill="${palette[key]}"/>`)
    .join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${
    options.background
      ? `<rect width="${size}" height="${size}" fill="${options.background}"/>`
      : ""
  }<g transform="translate(${x} ${y})">${body}</g></svg>`
}

function png(svg: string, width: number) {
  return new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng()
}

export function icons() {
  const favicon = spriteSvg(strawberryRows, spriteColors, { padding: 0.5 })
  const tile = spriteSvg(strawberryRows, spriteColors, {
    background: colors.sky,
    padding: 2,
  })
  return {
    "favicon.svg": favicon,
    "favicon-32.png": png(favicon, 32),
    "apple-touch-icon.png": png(tile, 180),
    "icon-192.png": png(tile, 192),
    "icon-512.png": png(tile, 512),
    "pixel-avatar.png": png(
      spriteSvg(avatarRows, avatarPalette, {
        background: colors.sky,
        padding: 2,
      }),
      512
    ),
  }
}

type Node = {
  type: string
  props: { style?: Record<string, unknown>; children?: unknown; src?: string }
}

const h = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown
): Node => ({ type, props: { style, children } })

const img = (src: string, style: Record<string, unknown>): Node => ({
  type: "img",
  props: { src, style },
})

const dataUri = (svg: string) =>
  `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`

function cloudUri(seed: number, size: number) {
  const { path, width, height } = randomCloud(seed, size)
  return {
    src: dataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges"><path d="${path}" fill="${colors.paper}"/></svg>`
    ),
    width,
    height,
  }
}

export const ogImageSize = { width: 1200, height: 630 }

export async function ogImage(content: Content) {
  const { profile, site } = content
  const cloud = (
    seed: number,
    size: number,
    style: Record<string, unknown>
  ) => {
    const c = cloudUri(seed, size)
    return img(c.src, {
      position: "absolute",
      width: c.width * 8,
      height: c.height * 8,
      ...style,
    })
  }

  const avatar = dataUri(spriteSvg(avatarRows, avatarPalette))
  const tree = h(
    "div",
    {
      width: "100%",
      height: "100%",
      display: "flex",
      padding: 36,
      background: colors.paper,
      fontFamily: "Lexend",
    },
    h(
      "div",
      {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: colors.sky,
        border: `5px solid ${colors.ink}`,
        borderRadius: 18,
        overflow: "hidden",
      },
      [
        cloud(3, 10, { top: 170, left: 470 }),
        cloud(27, 13, { bottom: -30, right: -40 }),
        cloud(11, 7, { bottom: 40, left: -30 }),
        h(
          "div",
          {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: 18,
            padding: "10px 22px",
            background: colors.paper,
            border: `4px solid ${colors.ink}`,
            borderRadius: 12,
            fontSize: 30,
            letterSpacing: 4,
            color: colors.ink,
          },
          [
            h("span", {}, site.windowTitle),
            img(dataUri(spriteSvg(strawberryRows, spriteColors)), {
              width: 40,
              height: 40,
            }),
          ]
        ),
        h(
          "div",
          {
            display: "flex",
            alignItems: "center",
            gap: 48,
            padding: "24px 64px",
            flex: 1,
          },
          [
            h(
              "div",
              {
                display: "flex",
                padding: 14,
                background: colors.paper,
                border: `4px solid ${colors.ink}`,
                borderRadius: 12,
                boxShadow: `8px 8px 0 rgba(34,47,49,0.2)`,
              },
              img(avatar, { width: 240, height: 240 })
            ),
            h(
              "div",
              {
                display: "flex",
                flexDirection: "column",
                padding: "28px 36px",
                background: colors.paper,
                border: `4px solid ${colors.ink}`,
                borderRadius: 12,
                boxShadow: `8px 8px 0 rgba(34,47,49,0.2)`,
              },
              [
                h(
                  "div",
                  {
                    fontFamily: "Pixelify Sans",
                    fontSize: 84,
                    fontWeight: 700,
                    lineHeight: 1,
                    color: colors.ink,
                  },
                  profile.name
                ),
                h(
                  "div",
                  { marginTop: 18, fontSize: 34, color: colors.ink },
                  `${profile.headline} · ${profile.location.city}, ${profile.location.country}`
                ),
                h(
                  "div",
                  {
                    marginTop: 14,
                    fontSize: 26,
                    color: colors.muted,
                  },
                  site.url.replace(/^https?:\/\//, "")
                ),
              ]
            ),
          ]
        ),
      ]
    )
  )

  const svg = await satori(tree as never, {
    ...ogImageSize,
    fonts: [
      {
        name: "Lexend",
        data: font("@fontsource/lexend", "lexend-latin-400-normal.woff"),
        weight: 400,
      },
      {
        name: "Pixelify Sans",
        data: font(
          "@fontsource/pixelify-sans",
          "pixelify-sans-latin-700-normal.woff"
        ),
        weight: 700,
      },
    ],
  })
  return png(svg, ogImageSize.width)
}
