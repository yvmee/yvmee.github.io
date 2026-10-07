import { execSync } from "node:child_process"

/** Date (YYYY-MM-DD) of the last commit that changed /content, falls back to today. */
export function contentUpdated() {
  try {
    const date = execSync("git log -1 --format=%cs -- content", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim()
    if (date) return date
  } catch {
    // Not a git checkout
  }
  return new Date().toISOString().slice(0, 10)
}
