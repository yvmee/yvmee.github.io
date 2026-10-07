import content from "virtual:content"

import { Cloud, Mountains } from "@/components/pixel/scenery"
import { RichText } from "@/components/rich-text"
import { Badge } from "@/components/ui/badge"
import { Panel, Scene } from "@/components/window"
import type { Language } from "@/content/schema"

const { site, profile, skills, languages } = content

const badgeClassName = "h-6 rounded-sm border-2 border-ink px-2 text-xs"

function languageLevel(language: Language) {
  if (!language.cefr || language.cefr === "native") return language.level
  return `${language.level} (${language.cefr})`
}

export function Programs() {
  return (
    <Scene
      id="about"
      title={site.sections.about}
      decor={
        <>
          <Cloud seed={5} size={9} className="absolute top-16 right-[8%]" />
          <Cloud seed={19} size={6} className="absolute top-1/3 left-[3%]" />
          <Mountains seed={4} className="absolute bottom-0 h-40 sm:h-52" />
        </>
      }
      className="grid items-start gap-4 pt-2 pb-24 sm:gap-6 sm:pb-36 lg:grid-cols-[1.2fr_1fr]"
    >
      <div className="flex flex-col gap-4 sm:gap-6">
        <Panel title="Software List" bodyClassName="space-y-4">
          {skills.groups.map((group) => (
            <div key={group.id}>
              <h4 className="mb-2 font-mono text-xs tracking-wide text-muted-foreground uppercase">
                {group.title}
              </h4>
              <ul className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <li key={item}>
                    <Badge variant="outline" className={badgeClassName}>
                      {item}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Panel>

        <Panel title="Languages">
          <ul className="flex flex-wrap gap-1.5">
            {languages.map((language) => (
              <li key={language.name}>
                <Badge variant="outline" className={badgeClassName}>
                  {language.name}
                  <span className="text-muted-foreground">
                    · {languageLevel(language)}
                  </span>
                </Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="About Me" bodyClassName="space-y-3 leading-relaxed">
        {profile.about.map((paragraph) => (
          <p key={paragraph}>
            <RichText text={paragraph} />
          </p>
        ))}
      </Panel>
    </Scene>
  )
}
