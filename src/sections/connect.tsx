import content from "virtual:content"

import { Sea, Sparkle, Sun } from "@/components/pixel/scenery"
import { Panel, Scene } from "@/components/window"

const { site, profile } = content

const sparkles = [
  { className: "top-[14%] left-[8%]", scale: 5, delay: "0s" },
  { className: "top-[30%] left-[22%]", scale: 3, delay: "0.8s" },
  { className: "top-[18%] right-[18%]", scale: 4, delay: "1.6s" },
  { className: "top-[36%] right-[8%]", scale: 5, delay: "0.4s" },
]

export function Connect() {
  const contacts = profile.contacts.filter((c) => c.public)
  return (
    <Scene
      id="contact"
      title={site.sections.connect}
      decor={
        <>
          {sparkles.map((sparkle) => (
            <Sparkle
              key={sparkle.className}
              scale={sparkle.scale}
              className={`absolute animate-twinkle ${sparkle.className}`}
              style={{ animationDelay: sparkle.delay }}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
            <div className="h-[30px] overflow-hidden">
              <Sun radius={12} scale={5} />
            </div>
            <Sea seed={12} className="h-36 sm:h-44" />
          </div>
        </>
      }
      className="flex flex-col items-center pt-8 pb-16 text-center sm:pt-12 sm:pb-24"
    >
      <p className="font-pixel text-3xl leading-tight font-bold text-outline sm:text-5xl">
        {site.connect.heading}
      </p>
      <p className="mt-2 font-pixel text-4xl font-bold text-outline sm:text-6xl">
        {site.connect.subheading}
      </p>

      <Panel
        title="Contact Me"
        className="mt-10 w-full max-w-lg text-left sm:mt-16"
      >
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-mono text-sm">
          {contacts.map((contact) => (
            <div key={contact.type} className="contents">
              <dt className="text-muted-foreground">
                <span aria-hidden="true">&gt; </span>
                {contact.label}:
              </dt>
              <dd className="min-w-0 truncate">
                <a
                  href={contact.url}
                  rel={contact.type === "email" ? undefined : "me noopener"}
                  className="link"
                >
                  {contact.value}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </Panel>
    </Scene>
  )
}
