/** Pixel sprites as rows of characters. "." is transparent. Shared with build scripts. */

/** The little strawberry in the corner of each window (G leaves, R berry, Y seeds). */
export const strawberryRows = [
  ".GG.G.GG.",
  "..GGGGG..",
  ".RRGRGRR.",
  "RRYRRRYRR",
  "RRRRYRRRR",
  "RYRRRRRYR",
  ".RRRYRRR.",
  "..RYRRR..",
  "...RRR...",
]

export const avatarRows = [
  "......KKKKKKKKKK......",
  "....KKKKKKKKKKKKKK....",
  "...KKKKKHHKKKKKKKKK...",
  "..KKKKKHHKKKKKKKKKKK..",
  "..KKKKKKKKSSKKKKKKKK..",
  ".KKKKKKKSSSSSSKKKKKKK.",
  ".KKKKKSSSSSSSSSSKKKKK.",
  ".KKKKSSSSSSSSSSSSKKKK.",
  ".KKKSSSSSSSSSSSSSSKKK.",
  ".KKKSSSSSSSSSSSSSSKKK.",
  ".KKKSSEWSSSSSSEWSSKKK.",
  ".KKKSSEESSSSSSEESSKKK.",
  ".KKKSBBSSSSSSSSBBSKKK.",
  ".KKKSSSSSSMMSSSSSSKKK.",
  ".KKKKSSSSSSSSSSSSKKKK.",
  ".KKKKKSSSSSSSSSSKKKKK.",
  ".KKKKKKKSSSSSSKKKKKKK.",
  "KKKKKKDDDSSSSDDDKKKKKK",
  "KKKKKCCCDDSSDDCCCKKKKK",
  "KKKKCCCCCDDDDCCCCCKKKK",
  ".KKKCCCCCCCCCCCCCCKKK.",
  ".KKCCCCCCCCCCCCCCCCKK.",
  "..CCCCCCCCCCCCCCCCCC..",
  "..CCCCCCCCCCCCCCCCCC..",
]

/** Fixed palette so the portrait looks the same in day and night mode. */
export const avatarPalette: Record<string, string> = {
  K: "#F5C689",
  H: "#FFCE8F",
  S: "#fde9df",
  E: "#1f2a2b",
  W: "#ffffff",
  B: "#ffa08c",
  M: "#c0563f",
  C: "#1F2A2B",
  D: "#46605f",
}
