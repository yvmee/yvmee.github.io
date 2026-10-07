import { useEffect, useState } from "react"

import type { Project } from "@/content/schema"
import { fetchRepo, type RepoSnapshot } from "@/lib/github"

const cacheKey = "github-repos"
const cacheTtl = 10 * 60 * 1000

type Cache = { at: number; data: RepoSnapshot }

function readCache(): RepoSnapshot {
  try {
    const cache = JSON.parse(sessionStorage.getItem(cacheKey) ?? "") as Cache
    return Date.now() - cache.at < cacheTtl ? cache.data : {}
  } catch {
    return {}
  }
}

function writeCache(data: RepoSnapshot) {
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), data }))
  } catch {
    // Storage can be unavailable (private mode, quota). Live data still works.
  }
}

/**
 * Starts with the build-time snapshot (so hydration matches the prerendered
 * HTML), then replaces it with live GitHub API data in the browser.
 * The unauthenticated API allows 60 requests/hour, so responses are cached
 * per tab for a few minutes.
 */
export function useLiveRepos(projects: Project[], snapshot: RepoSnapshot) {
  const [repos, setRepos] = useState(snapshot)

  useEffect(() => {
    const controller = new AbortController()
    const cached = readCache()
    const wanted = projects.flatMap((p) => (p.github ? [p.github.repo] : []))
    const missing = wanted.filter((repo) => !cached[repo])

    Promise.allSettled(
      missing.map(async (repo) => {
        const data = await fetchRepo(repo, { signal: controller.signal })
        return [repo, data] as const
      })
    ).then((results) => {
      if (controller.signal.aborted) return
      const fresh = Object.fromEntries(
        results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []))
      )
      if (Object.keys(fresh).length > 0) writeCache({ ...cached, ...fresh })
      const live = { ...cached, ...fresh }
      if (Object.keys(live).length > 0) {
        setRepos((current) => ({ ...current, ...live }))
      }
    })

    return () => controller.abort()
  }, [projects])

  return repos
}
