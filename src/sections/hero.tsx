import type { CSSProperties } from "react"

import content from "virtual:content"

import { ContactIcon } from "@/components/contact-icon"
import { Cloud, CloudBank, PixelAvatar, Sun } from "@/components/pixel/scenery"
import { RichText } from "@/components/rich-text"
import { buttonVariants } from "@/components/ui/button"
import { Panel, Scene } from "@/components/window"
import { cn } from "@/lib/utils"

const { site, profile } = content

/** Drifting clouds: [seed, size, top, duration (s), delay (s)] */
const clouds = [
  [3, 10, "8%", 140, -20],
  [11, 7, "30%", 110, -75],
  [27, 12, "52%", 170, -120],
  [42, 6, "18%", 95, -40],
] as const

export function Hero() {
  const links = profile.contacts.filter(
    (c) => c.public && c.type !== "phone" && c.type !== "other"
  )
  return (
    <Scene
      id="home"
      title={site.windowTitle}
      titleAs="p"
      decor={
        <>
          <Sun className="absolute top-[38%] left-[34%] hidden sm:block" />
          <Cloud
            seed={64}
            size={22}
            className="absolute right-[-3%] bottom-16 hidden md:block"
          />
          {clouds.map(([seed, size, top, duration, delay]) => (
            <div
              key={seed}
              className="absolute left-0 animate-drift"
              style={
                {
                  top,
                  "--drift-duration": `${duration}s`,
                  animationDelay: `${delay}s`,
                } as CSSProperties
              }
            >
              <Cloud seed={seed} size={size} />
            </div>
          ))}
          <CloudBank seed={7} height={22} className="absolute bottom-0 h-28" />
        </>
      }
    >
      <div className="flex flex-wrap items-start gap-4 sm:gap-6">
        <Panel title="Digital Me" className="w-36 sm:w-44" bodyClassName="p-2">
          {profile.avatar.src ? (
            <img
              src={profile.avatar.src}
              alt={profile.avatar.alt}
              width={176}
              height={192}
              className="aspect-11/12 w-full object-cover [image-rendering:pixelated]"
            />
          ) : (
            <PixelAvatar title={profile.avatar.alt} className="w-full" />
          )}
        </Panel>
        <p className="relative mt-4 rounded-2xl border-2 bg-paper px-4 py-2 font-pixel text-lg sm:mt-8 sm:text-xl">
          <span
            aria-hidden="true"
            className="absolute top-1/2 -left-2.5 size-4 -translate-y-1/2 rotate-45 border-b-2 border-l-2 bg-paper"
          />
          {site.greeting}
          <span aria-hidden="true" className="ml-1 animate-blink">
            ▌
          </span>
        </p>
      </div>

      <Panel
        title="README.txt"
        headingLevel={3}
        className="mt-8 max-w-2xl sm:mt-12"
        bodyClassName="space-y-4 sm:p-6"
      >
        <div>
          <h1 className="font-pixel text-4xl leading-none sm:text-6xl">
            {profile.name}
          </h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            {profile.headline} · {profile.location.city},{" "}
            {profile.location.country}
          </p>
        </div>
        <p className="leading-relaxed">
          <RichText text={profile.summary} />
        </p>
        <ul className="flex flex-wrap gap-2" aria-label="Profiles and contact">
          {links.map((contact) => (
            <li key={contact.type}>
              <a
                href={contact.url}
                rel={contact.type === "email" ? undefined : "me noopener"}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-sm border-2 border-ink hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <ContactIcon type={contact.type} />
                {contact.label}
              </a>
            </li>
          ))}
        </ul>
      </Panel>
    </Scene>
  )
}
