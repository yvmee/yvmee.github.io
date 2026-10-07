import { StrictMode } from "react"
import { renderToString } from "react-dom/server"

import { App } from "./App"
import type { RepoSnapshot } from "./lib/github"

export { fetchSnapshot } from "./lib/github"

/** Used by build/prerender.ts to produce the static HTML. */
export function render(snapshot: RepoSnapshot) {
  return renderToString(
    <StrictMode>
      <App snapshot={snapshot} />
    </StrictMode>
  )
}
