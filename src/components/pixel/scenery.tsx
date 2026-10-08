import type { CSSProperties, SVGProps } from "react"

import { cn } from "@/lib/utils"

import {
  circlePath,
  cloudBankPath,
  mountainPaths,
  randomCloud,
  seaPath,
  spritePaths,
} from "./pixel"
import { avatarPalette, avatarRows, strawberryRows } from "./sprites"

type PixelSvgProps = Omit<SVGProps<SVGSVGElement>, "width" | "height"> & {
  width: number
  height: number
  /** Size of one art pixel in CSS pixels. Omit for fluid sizing via className. */
  scale?: number
}

function PixelSvg({
  width,
  height,
  scale,
  style,
  children,
  ...props
}: PixelSvgProps) {
  const size: CSSProperties = scale
    ? { width: width * scale, height: height * scale }
    : {}
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      style={{ ...size, ...style }}
      {...props}
    >
      {children}
    </svg>
  )
}

export function Cloud({
  seed,
  size = 8,
  scale = 5,
  className,
  style,
}: {
  seed: number
  size?: number
  scale?: number
  className?: string
  style?: CSSProperties
}) {
  const { path, width, height } = randomCloud(seed, size)
  return (
    <PixelSvg
      width={width}
      height={height}
      scale={scale}
      className={cn("pointer-events-none fill-cloud", className)}
      style={style}
    >
      <path d={path} />
    </PixelSvg>
  )
}

export function Sun({
  radius = 6,
  scale = 5,
  className,
}: {
  radius?: number
  scale?: number
  className?: string
}) {
  const { path, width, height } = circlePath(radius)
  return (
    <PixelSvg
      width={width}
      height={height}
      scale={scale}
      className={cn("pointer-events-none fill-sun", className)}
    >
      <path d={path} />
    </PixelSvg>
  )
}

/** Full-width mountain range anchored to the bottom of its container. */
export function Mountains({
  seed,
  height = 40,
  className,
}: {
  seed: number
  height?: number
  className?: string
}) {
  const width = 400
  const back = mountainPaths(seed + 1, width, height, 0.95)
  const front = mountainPaths(seed, width, height, 0.6)
  return (
    <PixelSvg
      width={width}
      height={height}
      preserveAspectRatio="xMidYMax slice"
      className={cn("pointer-events-none w-full", className)}
    >
      <path d={back.fill} className="fill-cloud opacity-60" />
      <path d={front.fill} className="fill-cloud" />
      <path d={front.shade} className="fill-sky-deep" />
    </PixelSvg>
  )
}

/** Full-width bank of clouds anchored to the bottom of its container. */
export function CloudBank({
  seed,
  height = 24,
  className,
}: {
  seed: number
  height?: number
  className?: string
}) {
  const width = 320
  return (
    <PixelSvg
      width={width}
      height={height}
      preserveAspectRatio="xMidYMax slice"
      className={cn("pointer-events-none w-full fill-cloud", className)}
    >
      <path d={cloudBankPath(seed, width, height)} />
    </PixelSvg>
  )
}

export function Sea({
  seed,
  height = 30,
  className,
}: {
  seed: number
  height?: number
  className?: string
}) {
  const width = 320
  return (
    <PixelSvg
      width={width}
      height={height}
      preserveAspectRatio="xMidYMax slice"
      className={cn("pointer-events-none w-full fill-cloud", className)}
    >
      <path d={seaPath(seed, width, height)} />
    </PixelSvg>
  )
}

const sparkle = spritePaths([
  "...X...",
  "...X...",
  "..XXX..",
  "XXXXXXX",
  "..XXX..",
  "...X...",
  "...X...",
])

export function Sparkle({
  scale = 4,
  className,
  style,
}: {
  scale?: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <PixelSvg
      width={sparkle.width}
      height={sparkle.height}
      scale={scale}
      className={cn("pointer-events-none fill-cloud", className)}
      style={style}
    >
      <path d={sparkle.paths.X} />
    </PixelSvg>
  )
}

const strawberry = spritePaths(strawberryRows)

/** The little strawberry in the corner of each window. */
export function Strawberry({
  scale = 3,
  className,
}: {
  scale?: number
  className?: string
}) {
  return (
    <PixelSvg
      width={strawberry.width}
      height={strawberry.height}
      scale={scale}
      className={cn("shrink-0", className)}
    >
      <path d={strawberry.paths.R} className="fill-berry" />
      <path d={strawberry.paths.Y} className="fill-seed" />
      <path d={strawberry.paths.G} className="fill-leaf" />
    </PixelSvg>
  )
}

const avatar = spritePaths(avatarRows)

export function PixelAvatar({
  title,
  className,
}: {
  title: string
  className?: string
}) {
  return (
    <svg
      viewBox={`0 0 ${avatar.width} ${avatar.height}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={title}
      className={className}
    >
      {Object.entries(avatar.paths).map(([color, d]) => (
        <path key={color} d={d} fill={avatarPalette[color]} />
      ))}
    </svg>
  )
}
