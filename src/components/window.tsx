import { useState, type ReactNode } from "react"

import { Strawberry } from "@/components/pixel/scenery"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

/**
 * A full-width "desktop" window with an inset title bar and a sky scene.
 * The title is the section heading (h2) so the document outline stays clean.
 */
export function Scene({
  id,
  title,
  titleAs: Title = "h2",
  decor,
  children,
  className,
}: {
  id: string
  title: string
  /** Use "p" when the title bar is decorative and the real heading lives inside */
  titleAs?: "h2" | "p"
  decor?: ReactNode
  children: ReactNode
  className?: string
}) {
  const headingId = `${id}-title`
  return (
    <section
      id={id}
      aria-labelledby={Title === "h2" ? headingId : undefined}
      className="relative isolate scroll-mt-4 overflow-hidden rounded-lg border-2 bg-sky"
    >
      <div className="relative z-20 m-2 flex items-center justify-between gap-3 rounded-md border-2 bg-paper px-3 py-1.5 sm:m-3">
        <Title
          id={headingId}
          className="truncate text-sm font-normal tracking-[0.12em] uppercase sm:text-base"
        >
          {title}
        </Title>
        <Strawberry />
      </div>
      {decor && (
        <div aria-hidden="true" className="@container absolute inset-0 -z-10">
          {decor}
        </div>
      )}
      <div className={cn("relative z-10 px-3 pb-5 sm:px-6 sm:pb-8", className)}>
        {children}
      </div>
    </section>
  )
}

/** Small "program" window. The title bar dots minimize it. */
export function Panel({
  title,
  headingLevel = 3,
  children,
  className,
  bodyClassName,
  actions,
}: {
  title: ReactNode
  headingLevel?: 3 | 4
  children: ReactNode
  className?: string
  bodyClassName?: string
  actions?: ReactNode
}) {
  const [open, setOpen] = useState(true)
  const Heading = `h${headingLevel}` as const
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn(
        "pixel-shadow flex flex-col rounded-md border-2 bg-paper text-card-foreground",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1",
          open && "border-b-2"
        )}
      >
        <Heading className="min-w-0 flex-1 text-sm font-normal text-balance sm:text-base">
          {title}
        </Heading>
        {actions}
        <CollapsibleTrigger
          aria-label={open ? "Minimize window" : "Restore window"}
          className="group -mr-1 flex cursor-pointer items-center gap-1 rounded-sm p-1 hover:bg-muted"
        >
          <span className="size-2.5 rounded-full border-2 transition-colors group-hover:bg-accent" />
          <span
            className={cn(
              "size-2.5 rounded-full border-2 transition-colors",
              !open && "bg-ink"
            )}
          />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent
        className={cn(
          "h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0"
        )}
      >
        <div className={cn("p-3 sm:p-4", bodyClassName)}>{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
