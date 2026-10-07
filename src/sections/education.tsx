import content from "virtual:content"

import { Cloud, CloudBank } from "@/components/pixel/scenery"
import { RichText } from "@/components/rich-text"
import { Badge } from "@/components/ui/badge"
import { Panel, Scene } from "@/components/window"
import type { Education as EducationEntry } from "@/content/schema"
import { formatPeriod } from "@/lib/format"

const { site, education } = content

export function Education() {
  return (
    <Scene
      id="education"
      title={site.sections.education}
      decor={
        <>
          <Cloud seed={12} size={8} className="absolute top-24 right-[5%]" />
          <CloudBank seed={7} height={14} className="absolute bottom-0 h-16" />
        </>
      }
      className="flex flex-col gap-4 pt-2 pb-16 sm:gap-6 sm:pb-20"
    >
      {education.map((entry) => (
        <EducationWindow
          key={`${entry.institution}-${entry.degree}`}
          entry={entry}
        />
      ))}
    </Scene>
  )
}

function EducationWindow({ entry }: { entry: EducationEntry }) {
  return (
    <article className="contents">
      <Panel title={entry.institution} bodyClassName="flex flex-col gap-2">
        <p className="font-medium">{entry.degree}</p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
          <span>{entry.location}</span>
          <time dateTime={entry.period.start}>
            {formatPeriod(entry.period)}
          </time>
          {entry.grade && (
            <Badge className="h-5 rounded-sm bg-sky text-[0.7rem] text-ink">
              {entry.grade}
            </Badge>
          )}
        </p>
        {entry.url && (
          <p>
            <a href={entry.url} className="link font-mono text-xs">
              {new URL(entry.url).hostname}
            </a>
          </p>
        )}
        {entry.details.length > 0 && (
          <dl className="space-y-2 text-sm leading-relaxed">
            {entry.details.map((detail) => (
              <div key={detail.label}>
                <dt className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                  {detail.label}
                </dt>
                <dd>
                  <RichText text={detail.text} />
                </dd>
              </div>
            ))}
          </dl>
        )}
      </Panel>
    </article>
  )
}
