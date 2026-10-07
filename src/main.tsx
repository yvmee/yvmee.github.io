import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"

import "./index.css"
import { App } from "./App"
import type { RepoSnapshot } from "./lib/github"

/** Build-time GitHub data embedded by build/prerender.ts, so hydration matches the HTML. */
function readSnapshot(): RepoSnapshot {
  const element = document.getElementById("github-snapshot")
  try {
    return element?.textContent ? JSON.parse(element.textContent) : {}
  } catch {
    return {}
  }
}

const root = document.getElementById("root")!
const app = (
  <StrictMode>
    <App snapshot={readSnapshot()} />
  </StrictMode>
)

// Production HTML is prerendered; the dev server serves an empty root.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
