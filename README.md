# yvmee.github.io

One-page CV website with a pixel-art "desktop OS" theme (day/night, windows, clouds, mountains, sea). Built with React 19, Vite, Tailwind CSS v4 and shadcn/ui on Base UI. The page is prerendered to static HTML at build time and deployed to GitHub Pages at https://yvmee.github.io.

All text comes from YAML files in `content/`, validated by a zod schema.

## Quick start

Requires Node >= 24. The scripts in `build/` are TypeScript run directly by Node's built-in type stripping (no ts-node or tsx).

```bash
npm install
npm run dev            # dev server with reload on content/*.yaml changes
npm run build          # tsc + client build + SSR build + prerender into dist/
npm run preview        # serve dist/ locally
npm run lint           # eslint
npm run format         # prettier --write
npm run format:check   # prettier --check (CI runs this)
npm run typecheck      # tsc -b
```

## Editing content

Everything lives in `content/`. The schema is `src/content/schema.ts` (field comments there are the reference).

| File               | Holds                                                                             |
| ------------------ | --------------------------------------------------------------------------------- |
| `site.yaml`        | URL, title, meta description, keywords, window titles, greeting, section titles   |
| `profile.yaml`     | Name, headline, location, `summary`, `about` paragraphs, avatar, contacts         |
| `skills.yaml`      | Skill groups and items                                                            |
| `languages.yaml`   | Spoken languages with display level and optional CEFR level                       |
| `projects.yaml`    | Projects: kind, summary, period, tech, highlights, links, optional `github` block |
| `exhibitions.yaml` | Exhibitions: event, location, year, exhibited work, description                   |
| `experience.yaml`  | Work experience with period and highlights                                        |
| `education.yaml`   | Degrees with period, grade and labelled detail lines                              |

Notes:

- Files are validated with zod at dev and build time. Invalid YAML fails the build with a readable per-file error (`build/load-content.ts`).
- The dev server does a full reload when a YAML file in `content/` changes.
- Inline markdown (`**bold**`, `*italic*`, `[link](url)`) works in fields marked as such in the schema: `profile.summary`, `profile.about`, project `summary` and `highlights`, experience `highlights`, exhibition `description`, education `details[].text`.
- Dates are quoted strings: `"2025-11"`, or `"2025"` / `"2025-11-03"`. `period.end` may be `"present"` or omitted. Unquoted numbers are coerced to strings, but quote them anyway.
- Contacts with `public: false` (the phone number) never appear on the website, in JSON-LD, `llms.txt` or `llms-full.txt`. They stay in the YAML for other consumers such as a CV PDF generator.
- `profile.avatar.src` can point to an image in `public/` (for example `/me.jpg`) to replace the built-in pixel avatar. Do not name it `pixel-avatar.png`: the build generates that file from the pixel sprite. When set, it is also used as the JSON-LD `Person.image`.
- The schema is the contract for a future CV PDF generator. `/llms-full.txt` is already a complete Markdown rendering of the CV (`markdownCv` in `build/seo.ts`).

## GitHub repository data

Projects with a `github.repo` (`owner/name`) show stats from the GitHub REST API. For each field, the first available source wins:

1. Live data fetched in the visitor's browser. Cached per tab in `sessionStorage` for 10 minutes. Unauthenticated limit is 60 requests/hour per visitor IP. If a live fetch fails, the snapshot is kept for that repo.
2. Build-time snapshot, fetched during `npm run build` (`build/prerender.ts`). Uses `GITHUB_TOKEN` if set (the workflow passes it). It is embedded in the HTML as `<script id="github-snapshot">`, so crawlers and no-JS visitors see it and hydration matches.
3. `github.fallback` in `projects.yaml`, for any field the API did not return. Supported keys: `description`, `homepage`, `language`, `topics`, `stars`.

Fields used from the API: `html_url`, `description`, `homepage`, `language`, `topics`, `stargazers_count`, `forks_count`, `license` (SPDX id), `pushed_at`, plus the per-language byte breakdown from `/languages`. Forks, license, push date and the language breakdown have no fallback. The dev server has no snapshot, so it shows fallback values until the live fetch completes.

Local builds without a token work, but can hit the rate limit. A failed repo is logged ("using YAML fallbacks") and does not fail the build. To use a token locally: `GITHUB_TOKEN=... npm run build`.

## How the build works

`npm run build` runs, in order:

1. `tsc -b` type check.
2. `vite build` client bundle into `dist/`.
3. `vite build --ssr src/entry-server.tsx --outDir dist-server` server bundle exposing `render()` and `fetchSnapshot()`.
4. `node build/prerender.ts` fetches the GitHub snapshot, renders `<App>` to a string, injects it plus head tags into `dist/index.html`, writes the files below, then deletes `dist-server/`.

Files written to `dist/` by the prerender step:

- `index.html`, `404.html` (same page, `robots` set to `noindex`)
- `llms.txt`, `llms-full.txt`, `sitemap.xml`, `robots.txt`, `manifest.webmanifest`
- `og-image.png` (1200x630, rendered with satori + resvg)
- `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `pixel-avatar.png` (all generated from the sprites in `src/components/pixel/sprites.ts`)

The `lastmod` date and the "last updated" values come from the last git commit touching `content/` (`build/content-updated.ts`; falls back to today if not a git checkout). The workflow checks out the full history (`fetch-depth: 0`) so this is the real date of the last content change.

## SEO and GEO

Implemented:

- Prerendered semantic HTML: one `h1`, `h2` per section.
- Meta description, canonical URL, Open Graph and Twitter cards with a generated OG image.
- JSON-LD `@graph`: `WebSite`, `ProfilePage`, `Person` (`alumniOf`, `hasCredential`, `knowsAbout`, `knowsLanguage`, `sameAs`), one node per project (`VideoGame` for `game`, `SoftwareApplication` for `software`, `CreativeWork` for `research` and `other`) and `ExhibitionEvent` per exhibition.
- `rel="me"` identity links for every public contact with an http(s) URL.
- `sitemap.xml` with `lastmod` from the last commit touching `content/`.
- `robots.txt` that allows everyone and explicitly lists AI search and assistant crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Google-Extended, Applebot-Extended).
- `llms.txt` (curated entry point) and `llms-full.txt` (full CV in Markdown).
- Preloads for the Lexend and Pixelify Sans latin fonts.
- `404.html` with `noindex`.

Tips:

- Keep `profile.summary` answer-first and factual. Search and AI engines quote it.
- Keep `site.description` between 120 and 160 characters (the schema only enforces a 200 maximum).
- After the first deploy, add the site to Google Search Console and Bing Webmaster Tools and submit `https://yvmee.github.io/sitemap.xml`.
- Validate structured data with https://search.google.com/test/rich-results and https://validator.schema.org.
- Link the website from your LinkedIn and GitHub profiles. Reciprocal links strengthen the identity signal.

## Deployment

`.github/workflows/deploy.yml` runs on manual dispatch and on push to `main` when one of these paths changes: `src/**`, `content/**`, `public/**`, `build/**`, `index.html`, `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `.prettierrc`, `.prettierignore`, `components.json`, `.github/workflows/deploy.yml`. Editing only this README does not deploy.

Steps: `npm ci`, `npm run lint`, `npm run format:check`, `npm run build` (with `GITHUB_TOKEN`), then upload `dist/` and deploy with `actions/deploy-pages`. A failing lint or format check blocks the deploy, so run `npm run format` before pushing.

One-time setup: repository Settings, Pages, Source: "GitHub Actions".

Dependabot (`.github/dependabot.yml`) checks GitHub Actions and npm dependencies weekly. npm minor and patch updates are grouped into one PR.

## Customizing the look

- Design tokens are CSS variables in `src/index.css`: `:root` is day, `.dark` is night. Tailwind colors such as `bg-sky`, `bg-paper`, `text-ink` map to them. The theme class is applied before first paint by an inline script in `index.html`.
- Layout primitives are in `src/components/window.tsx`: `Scene` is a full-width section window with a sky background and an `h2` title bar, `Panel` is a small collapsible "program" window.
- Pixel-art helpers are in `src/components/pixel/pixel.ts`: seeded procedural clouds, mountains and sea (deterministic, so prerendered and hydrated SVG match). Sprites are arrays of strings in `src/components/pixel/sprites.ts` (`.` is transparent, other characters are palette keys). The favicon, OG image and `pixel-avatar.png` are generated from them by `build/images.ts`.
- Add shadcn components with `npx shadcn@latest add <name>`. `components.json` selects the Base UI style (`base-lyra`), Phosphor icons and the `@/components/ui` alias.

## Project structure

```
content/            YAML content (single source of truth)
public/             static files copied to dist/ as-is (create it when needed, e.g. for an avatar image)
src/
  content/          zod schema (schema.ts) and virtual:content typings
  sections/         page sections (hero, projects, experience, ...)
  components/       window.tsx, taskbar, rich-text, contact icons
    pixel/          pixel-art helpers, sprites, scenery components
    ui/             shadcn components
  hooks/            use-live-repos (GitHub), use-theme
  lib/              github.ts (API client), format, utils
  entry-server.tsx  SSR entry used by the prerender step
  main.tsx          client entry (hydrates the prerendered HTML)
  index.css         design tokens and Tailwind setup
build/
  load-content.ts   reads and validates content/*.yaml
  vite-plugin-content.ts  exposes the content as virtual:content, dev reload
  prerender.ts      post-build: static HTML and generated files
  seo.ts            head tags, JSON-LD, llms.txt, sitemap, robots, manifest
  images.ts         favicons and OG image from sprites
  content-updated.ts  date of the last commit touching content/
.github/            deploy workflow, Dependabot config
```
