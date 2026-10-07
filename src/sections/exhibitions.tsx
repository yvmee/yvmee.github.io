import { MapPinIcon } from "@phosphor-icons/react"

import content from "virtual:content"

import { Cloud, Sparkle } from "@/components/pixel/scenery"
import { RichText } from "@/components/rich-text"
import { Panel, Scene } from "@/components/window"
import type { Exhibition } from "@/content/schema"
import { formatDate } from "@/lib/format"

const { site, exhibitions } = content

export function Exhibitions() {
  return (
    <Scene
      id="exhibitions"
      title={site.sections.exhibitions}
      decor={
        <>
          <Cloud seed={14} size={8} className="absolute top-24 -right-4" />
          <Sparkle className="absolute top-20 left-[12%] animate-twinkle" />
          <Sparkle
            scale={3}
            className="absolute top-1/2 right-[30%] animate-twinkle [animation-delay:0.8s]"
          />
          <Sparkle
            scale={5}
            className="absolute bottom-10 left-[40%] animate-twinkle [animation-delay:1.6s]"
          />
          <Sparkle
            scale={3}
            className="absolute right-[8%] bottom-1/4 animate-twinkle [animation-delay:2.4s]"
          />
        </>
      }
      className="grid gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-4"
    >
      {exhibitions.map((exhibition) => (
        <ExhibitionWindow
          key={`${exhibition.event}-${exhibition.work}`}
          exhibition={exhibition}
        />
      ))}
    </Scene>
  )
}

function ExhibitionWindow({ exhibition }: { exhibition: Exhibition }) {
  return (
    <article className="contents">
      <Panel title={exhibition.event} bodyClassName="flex flex-col gap-3">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPinIcon aria-hidden="true" weight="bold" className="size-3.5" />
            {exhibition.location}
          </span>
          <time dateTime={exhibition.date}>{formatDate(exhibition.date)}</time>
        </p>
        <p className="text-sm leading-relaxed">
          <RichText text={exhibition.description} />
        </p>
      </Panel>
    </article>
  )
}
