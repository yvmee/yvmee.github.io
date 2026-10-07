/**
 * Runs after the client and SSR builds:
 * 1. fetches a GitHub snapshot (live data is fetched again in the browser),
 * 2. renders the page to static HTML so crawlers and AI engines get the full content,
 * 3. writes SEO/GEO files and generated images into dist/.
 */
import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

import { contentUpdated } from "./content-updated.ts"
import { icons, ogImage, ogImageSize } from "./images.ts"
import { loadContent } from "./load-content.ts"
import {
  headTags,
  llmsTxt,
  manifest,
  markdownCv,
  robotsTxt,
  sitemap,
  type SeoOptions,
} from "./seo.ts"
import type { fetchSnapshot, RepoSnapshot } from "../src/lib/github.ts"

/** Shape of src/entry-server.tsx after the SSR build */
type Server = {
  render: (snapshot: RepoSnapshot) => string
  fetchSnapshot: typeof fetchSnapshot
}

const root = join(import.meta.dirname, "..")
const dist = join(root, "dist")
const serverDir = join(root, "dist-server")

const content = loadContent()
const server: Server = await import(
  pathToFileURL(join(serverDir, "entry-server.js")).href
)

const repos = content.projects.flatMap((p) => (p.github ? [p.github.repo] : []))
const snapshot = await server.fetchSnapshot(content.projects, {
  token: process.env.GITHUB_TOKEN,
  signal: AbortSignal.timeout(15_000),
})
const fetched = Object.keys(snapshot)
console.log(
  `GitHub snapshot: ${fetched.length}/${repos.length} repositories` +
    (fetched.length < repos.length
      ? ` (missing: ${repos.filter((r) => !snapshot[r]).join(", ")}, using YAML fallbacks)`
      : "")
)

const options: SeoOptions = {
  updated: contentUpdated(),
  ogImage: {
    path: "/og-image.png",
    ...ogImageSize,
    alt: `${content.profile.name}, ${content.profile.headline}`,
  },
}

// Preload the fonts used above the fold (latin subsets of the body and pixel font)
const preloads = readdirSync(join(dist, "assets"))
  .filter((file) =>
    /^(lexend|pixelify-sans)-latin-wght-normal-.+\.woff2$/.test(file)
  )
  .map(
    (file) =>
      `<link rel="preload" href="/assets/${file}" as="font" type="font/woff2" crossorigin />`
  )
if (preloads.length !== 2) throw new Error("Expected two font files to preload")

const template = readFileSync(join(dist, "index.html"), "utf8")
const snapshotJson = JSON.stringify(snapshot).replaceAll("<", "\\u003c")
const html = template
  .replace(
    "<!--app-head-->",
    [...preloads, headTags(content, options)].join("\n    ")
  )
  .replace("<!--app-html-->", server.render(snapshot))
  .replace(
    "</body>",
    `  <script type="application/json" id="github-snapshot">${snapshotJson}</script>\n  </body>`
  )

if (html.includes("<!--app-")) throw new Error("Unreplaced placeholder")

const files: Record<string, string | Buffer> = {
  "index.html": html,
  // GitHub Pages serves 404.html for unknown paths: show the site, but keep it out of the index.
  "404.html": html.replace(
    /<meta name="robots" content="[^"]*" \/>/,
    '<meta name="robots" content="noindex" />'
  ),
  "llms.txt": llmsTxt(content, options),
  "llms-full.txt": markdownCv(content, options),
  "sitemap.xml": sitemap(content, options),
  "robots.txt": robotsTxt(content),
  "manifest.webmanifest": manifest(content),
  "og-image.png": await ogImage(content),
  ...icons(),
}

for (const [name, data] of Object.entries(files)) {
  writeFileSync(join(dist, name), data)
}
rmSync(serverDir, { recursive: true, force: true })

console.log(`Prerendered ${Object.keys(files).length} files into dist/`)
