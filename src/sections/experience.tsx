import content from "virtual:content"

import { Cloud } from "@/components/pixel/scenery"
import { RichText } from "@/components/rich-text"
import { Panel, Scene } from "@/components/window"
import type { Experience as ExperienceEntry } from "@/content/schema"
import { formatPeriod } from "@/lib/format"

const { site, experience } = content

export function Experience() {
  return (
    <Scene
      id="experience"
      title={site.sections.experience}
      decor={
        <>
          <Cloud seed={23} size={9} className="absolute top-28 -left-6" />
          <Cloud seed={41} size={7} className="absolute right-[6%] bottom-12" />
        </>
      }
      className="flex flex-col gap-4 pt-2 sm:gap-6"
    >
      {experience.map((entry) => (
        <ExperienceWindow
          key={`${entry.title}-${entry.organization}-${entry.period.start}`}
          entry={entry}
        />
      ))}
    </Scene>
  )
}

function ExperienceWindow({ entry }: { entry: ExperienceEntry }) {
  return (
    <article className="contents">
      <Panel title={entry.title} bodyClassName="flex flex-col gap-2">
        <p className="font-medium">{entry.organization}</p>
        <p className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
          <span>{entry.location}</span>
          <time dateTime={entry.period.start}>
            {formatPeriod(entry.period)}
          </time>
        </p>
        {entry.highlights.length > 0 && (
          <ul className="space-y-1 text-sm leading-relaxed">
            {entry.highlights.map((highlight) => (
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
        )}
      </Panel>
    </article>
  )
}
