import { useCallback, useSyncExternalStore } from "react"

export type Theme = "light" | "dark"

/** Must match the inline script in index.html that applies the theme before first paint. */
export const themeStorageKey = "theme"

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  })
  return () => observer.disconnect()
}

const getTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light"

/** Day/night theme. Returns null during prerendering and hydration. */
export function useTheme() {
  const theme = useSyncExternalStore<Theme | null>(
    subscribe,
    getTheme,
    () => null
  )

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark")
    try {
      localStorage.setItem(themeStorageKey, next)
    } catch {
      // Ignore unavailable storage, the theme still applies for this visit.
    }
  }, [])

  return { theme, setTheme }
}
