import { useEffect, useState } from "react"
import {
  BriefcaseIcon,
  EnvelopeSimpleIcon,
  GameControllerIcon,
  GraduationCapIcon,
  MoonIcon,
  SunIcon,
  TicketIcon,
  UserIcon,
  type Icon,
} from "@phosphor-icons/react"

import content from "virtual:content"

import { Strawberry } from "@/components/pixel/scenery"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTheme } from "@/hooks/use-theme"
import { cn } from "@/lib/utils"

const { site } = content

const items: { id: string; label: string; icon: Icon }[] = [
  { id: "about", label: site.sections.about, icon: UserIcon },
  { id: "projects", label: site.sections.projects, icon: GameControllerIcon },
  { id: "exhibitions", label: site.sections.exhibitions, icon: TicketIcon },
  { id: "experience", label: site.sections.experience, icon: BriefcaseIcon },
  { id: "education", label: site.sections.education, icon: GraduationCapIcon },
  { id: "contact", label: site.sections.connect, icon: EnvelopeSimpleIcon },
]

function useActiveSection() {
  const [active, setActive] = useState<string>()
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    )
    for (const id of ["home", ...items.map((i) => i.id)]) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [])
  return active
}

/** OS-style taskbar pinned to the bottom of the viewport. */
export function Taskbar() {
  const active = useActiveSection()
  const { theme, setTheme } = useTheme()

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 bg-paper/95 backdrop-blur supports-backdrop-filter:bg-paper/85">
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-1 px-2 sm:px-4">
        <a
          href="#home"
          className="flex h-9 items-center gap-2 rounded-sm border-2 px-2 font-pixel text-sm hover:bg-accent hover:text-accent-foreground"
        >
          <Strawberry scale={2} />
          <span className="hidden sm:inline">Start</span>
          <span className="sr-only sm:hidden">Back to top</span>
        </a>

        <nav aria-label="Sections" className="min-w-0 flex-1">
          <ul className="flex items-center justify-center gap-0.5 sm:gap-1">
            {items.map(({ id, label, icon: ItemIcon }) => (
              <li key={id}>
                <Tooltip>
                  <TooltipTrigger
                    render={<a href={`#${id}`} />}
                    aria-current={active === id ? "location" : undefined}
                    className={cn(
                      "flex h-9 items-center gap-1.5 rounded-sm border-2 border-transparent px-2 text-xs transition-colors hover:border-ink",
                      active === id && "border-ink bg-sky"
                    )}
                  >
                    <ItemIcon
                      aria-hidden="true"
                      weight="bold"
                      className="size-4.5"
                    />
                    <span className="hidden lg:inline">{label}</span>
                    <span className="sr-only lg:hidden">{label}</span>
                  </TooltipTrigger>
                  <TooltipContent className="lg:hidden">{label}</TooltipContent>
                </Tooltip>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-pressed={theme === null ? undefined : theme === "dark"}
          aria-label="Night mode"
          className="grid size-9 cursor-pointer place-items-center rounded-sm border-2 hover:bg-accent hover:text-accent-foreground"
        >
          <MoonIcon aria-hidden="true" weight="bold" className="dark:hidden" />
          <SunIcon
            aria-hidden="true"
            weight="bold"
            className="hidden dark:block"
          />
        </button>
      </div>
    </div>
  )
}
