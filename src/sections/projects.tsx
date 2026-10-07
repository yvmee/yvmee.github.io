import {
  ArrowSquareOutIcon,
  GitForkIcon,
  GithubLogoIcon,
  ScalesIcon,
  StarIcon,
} from "@phosphor-icons/react"

import content from "virtual:content"

import { Cloud, Sparkle } from "@/components/pixel/scenery"
import { RichText } from "@/components/rich-text"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Panel, Scene } from "@/components/window"
import type { Project } from "@/content/schema"
import { formatDate, formatPeriod } from "@/lib/format"
import { resolveRepo, type RepoSnapshot, type ResolvedRepo } from "@/lib/github"
import { cn } from "@/lib/utils"

const { site, projects } = content

/** GitHub linguist colors for the languages most likely to show up. */
const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  HTML: "#e34c26",
  CSS: "#663399",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Python: "#3572a5",
  Java: "#b07219",
  ShaderLab: "#222c37",
  HLSL: "#aace60",
  GLSL: "#5686a5",
  Shell: "#89e051",
  Rust: "#dea584",
  Go: "#00add8",
}

export function Projects({ repos }: { repos: RepoSnapshot }) {
  return (
    <Scene
      id="projects"
      title={site.sections.projects}
      decor={
        <>
          <Cloud seed={31} size={8} className="absolute top-20 -left-4" />
          <Cloud seed={8} size={11} className="absolute -right-6 bottom-6" />
          <Sparkle className="absolute top-24 right-[20%] animate-twinkle" />
          <Sparkle
            scale={3}
            className="absolute bottom-[30%] left-[45%] animate-twinkle [animation-delay:1.2s]"
          />
        </>
      }
      className="grid items-start gap-4 pt-2 sm:gap-6 md:grid-cols-2 xl:grid-cols-3"
    >
      {projects.map((project) => (
        <ProjectWindow
          key={project.id}
          project={project}
          repo={
            project.github
              ? resolveRepo(project.github, repos[project.github.repo])
              : undefined
          }
        />
      ))}
    </Scene>
  )
}

function ProjectWindow({
  project,
  repo,
}: {
  project: Project
  repo?: ResolvedRepo
}) {
  const links = [...project.links]
  if (repo) {
    if (repo.homepage && !links.some((l) => sameUrl(l.url, repo.homepage!)))
      links.push({ label: "Website", url: repo.homepage })
    links.push({ label: "GitHub", url: repo.url })
  }
  const period = project.periodLabel ?? formatPeriod(project.period)

  return (
    <article id={`project-${project.id}`} className="contents">
      <Panel title={project.name} bodyClassName="flex flex-col gap-3">
        <p className="font-mono text-xs text-muted-foreground">
          <time dateTime={project.period.start}>{period}</time>
        </p>
        <p className="leading-relaxed font-medium">
          <RichText text={project.summary} />
        </p>
        <ul className="space-y-1 text-sm leading-relaxed">
          {project.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2">
              <span aria-hidden="true" className="font-mono text-accent-ink">
                &gt;
              </span>
              <span>
                <RichText text={highlight} />
              </span>
            </li>
          ))}
        </ul>
        {project.tech.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
            {project.tech.map((tech) => (
              <li key={tech}>
                <Badge className="h-5 rounded-sm bg-sky text-[0.7rem] text-ink">
                  {tech}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        {repo && <RepoInfo repo={repo} />}
        {links.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-2 pt-1">
            {links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-sm border-2 border-ink hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {link.label === "GitHub" ? (
                    <GithubLogoIcon aria-hidden="true" weight="bold" />
                  ) : (
                    <ArrowSquareOutIcon aria-hidden="true" weight="bold" />
                  )}
                  {link.label}
                  <span className="sr-only">: {project.name}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </article>
  )
}

function RepoInfo({ repo }: { repo: ResolvedRepo }) {
  const stats = [
    repo.stars !== undefined && {
      icon: StarIcon,
      label: `${repo.stars} star${repo.stars === 1 ? "" : "s"}`,
    },
    repo.forks !== undefined && {
      icon: GitForkIcon,
      label: `${repo.forks} fork${repo.forks === 1 ? "" : "s"}`,
    },
    repo.license && { icon: ScalesIcon, label: repo.license },
  ].filter((stat) => stat !== false && stat !== undefined && stat !== "")

  return (
    <div className="space-y-2 rounded-sm border-2 border-dashed p-2.5 text-sm">
      <p className="flex items-center gap-1.5 font-mono text-xs">
        <GithubLogoIcon aria-hidden="true" weight="bold" className="size-3.5" />
        {repo.repo}
        {repo.pushedAt && (
          <span className="ml-auto text-muted-foreground">
            updated{" "}
            <time dateTime={repo.pushedAt}>
              {formatDate(repo.pushedAt.slice(0, 7))}
            </time>
          </span>
        )}
      </p>
      {repo.description && <p className="text-sm">{repo.description}</p>}

      {repo.languages.length > 0 ? (
        <div>
          {/* Visual only; the legend below carries the same information */}
          <div
            aria-hidden="true"
            className="flex h-2.5 overflow-hidden rounded-full border-2"
          >
            {repo.languages.map((language) => (
              <Tooltip key={language.name}>
                <TooltipTrigger
                  render={<span />}
                  className="h-full"
                  style={{
                    width: `${language.share * 100}%`,
                    background: languageColors[language.name] ?? "#9aa5a6",
                  }}
                />
                <TooltipContent>
                  {language.name} {percent(language.share)}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[0.7rem] text-muted-foreground">
            {repo.languages.slice(0, 4).map((language) => (
              <li key={language.name} className="flex items-center gap-1">
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full"
                  style={{
                    background: languageColors[language.name] ?? "#9aa5a6",
                  }}
                />
                {language.name} {percent(language.share)}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        repo.language && (
          <p className="font-mono text-[0.7rem] text-muted-foreground">
            {repo.language}
          </p>
        )
      )}

      {(stats.length > 0 || repo.topics.length > 0) && (
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.7rem] text-muted-foreground">
          {stats.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-1">
              <Icon aria-hidden="true" weight="bold" className="size-3" />
              {label}
            </li>
          ))}
          {repo.topics.map((topic) => (
            <li key={topic}>#{topic}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function percent(share: number) {
  return `${(share * 100).toFixed(share < 0.1 ? 1 : 0)}%`
}

function sameUrl(a: string, b: string) {
  const normalize = (url: string) => url.replace(/\/+$/, "").toLowerCase()
  return normalize(a) === normalize(b)
}
