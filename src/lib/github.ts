import type { Project } from "../content/schema.ts"

/** The subset of GitHub repository data the site uses. Every field is optional. */
export type RepoData = {
  url?: string
  description?: string
  homepage?: string
  language?: string
  topics?: string[]
  stars?: number
  forks?: number
  license?: string
  pushedAt?: string
  /** Language name -> bytes, from /languages */
  languages?: Record<string, number>
}

/** repo ("owner/name") -> data. Embedded in the prerendered HTML. */
export type RepoSnapshot = Record<string, RepoData>

export type ResolvedRepo = {
  repo: string
  url: string
  description?: string
  homepage?: string
  language?: string
  topics: string[]
  stars?: number
  forks?: number
  license?: string
  pushedAt?: string
  languages: { name: string; share: number }[]
  /** true when at least one value came from the GitHub API */
  live: boolean
}

const api = "https://api.github.com/repos"

type ApiRepo = {
  html_url?: string
  description?: string | null
  homepage?: string | null
  language?: string | null
  topics?: string[]
  stargazers_count?: number
  forks_count?: number
  license?: { spdx_id?: string; name?: string } | null
  pushed_at?: string
}

function clean<T>(value: T | null | undefined) {
  if (value === null || value === undefined || value === "") return undefined
  return value
}

/** Fetches repository metadata and language breakdown. Throws on network/HTTP errors. */
export async function fetchRepo(
  repo: string,
  init: { token?: string; signal?: AbortSignal } = {}
): Promise<RepoData> {
  // Only CORS-safelisted headers in the browser, so requests need no preflight
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  }
  if (init.token) {
    headers.Authorization = `Bearer ${init.token}`
    headers["X-GitHub-Api-Version"] = "2022-11-28"
  }

  const get = async <T>(path: string) => {
    const response = await fetch(`${api}/${repo}${path}`, {
      headers,
      signal: init.signal,
    })
    if (!response.ok) throw new Error(`GitHub ${response.status} for ${repo}`)
    return (await response.json()) as T
  }

  const [data, languages] = await Promise.all([
    get<ApiRepo>(""),
    get<Record<string, number>>("/languages").catch(() => undefined),
  ])

  const license = data.license?.spdx_id
  return {
    url: clean(data.html_url),
    description: clean(data.description),
    homepage: clean(data.homepage),
    language: clean(data.language),
    topics: data.topics?.length ? data.topics : undefined,
    stars: data.stargazers_count,
    forks: data.forks_count,
    license: license && license !== "NOASSERTION" ? license : undefined,
    pushedAt: clean(data.pushed_at),
    languages:
      languages && Object.keys(languages).length > 0 ? languages : undefined,
  }
}

/** Fetches every repo referenced by the projects; failures are left out. */
export async function fetchSnapshot(
  projects: Project[],
  init: { token?: string; signal?: AbortSignal } = {}
): Promise<RepoSnapshot> {
  const repos = projects.flatMap((p) => (p.github ? [p.github.repo] : []))
  const results = await Promise.allSettled(
    repos.map(async (repo) => [repo, await fetchRepo(repo, init)] as const)
  )
  return Object.fromEntries(
    results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []))
  )
}

/** Live/snapshot API values win; the YAML fallback fills whatever is missing. */
export function resolveRepo(
  github: NonNullable<Project["github"]>,
  data: RepoData | undefined
): ResolvedRepo {
  const fallback = github.fallback
  const live = data ?? {}
  const bytes = live.languages ?? {}
  const total = Object.values(bytes).reduce((sum, value) => sum + value, 0)
  const languages = Object.entries(bytes)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, share: value / total }))

  return {
    repo: github.repo,
    url: live.url ?? `https://github.com/${github.repo}`,
    description: live.description ?? fallback.description,
    homepage: live.homepage ?? fallback.homepage,
    language: live.language ?? fallback.language,
    topics: live.topics ?? fallback.topics ?? [],
    stars: live.stars ?? fallback.stars,
    forks: live.forks,
    license: live.license,
    pushedAt: live.pushedAt,
    languages,
    live: data !== undefined,
  }
}
