import content from "virtual:content"

import { Taskbar } from "@/components/taskbar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useLiveRepos } from "@/hooks/use-live-repos"
import type { RepoSnapshot } from "@/lib/github"
import { formatDate } from "@/lib/format"
import { Connect } from "@/sections/connect"
import { Education } from "@/sections/education"
import { Exhibitions } from "@/sections/exhibitions"
import { Experience } from "@/sections/experience"
import { Hero } from "@/sections/hero"
import { Programs } from "@/sections/programs"
import { Projects } from "@/sections/projects"

const { profile } = content

export function App({ snapshot }: { snapshot: RepoSnapshot }) {
  const repos = useLiveRepos(content.projects, snapshot)

  return (
    <TooltipProvider>
      <a
        href="#main"
        className="sr-only z-50 rounded-sm border-2 bg-paper px-3 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <main
        id="main"
        className="mx-auto flex max-w-6xl flex-col gap-6 px-3 pt-3 pb-20 sm:gap-10 sm:px-6 sm:pt-6"
      >
        <Hero />
        <Programs />
        <Projects repos={repos} />
        <Exhibitions />
        <div className="grid items-start gap-6 sm:gap-10 lg:grid-cols-2">
          <Experience />
          <Education />
        </div>
        <Connect />
        <footer className="pb-4 text-center font-mono text-xs text-muted-foreground">
          <p>
            © {__CONTENT_UPDATED__.slice(0, 4)} {profile.name} · Last updated{" "}
            <time dateTime={__CONTENT_UPDATED__}>
              {formatDate(__CONTENT_UPDATED__)}
            </time>
          </p>
          <p className="mt-1">
            Built with React, shadcn/ui &amp; Base UI
          </p>
        </footer>
      </main>
      <Taskbar />
    </TooltipProvider>
  )
}
