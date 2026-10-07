import {
  EnvelopeSimpleIcon,
  GameControllerIcon,
  GithubLogoIcon,
  GlobeIcon,
  LinkIcon,
  LinkedinLogoIcon,
  PhoneIcon,
  type Icon,
} from "@phosphor-icons/react"

import type { Contact } from "@/content/schema"

const icons: Record<Contact["type"], Icon> = {
  email: EnvelopeSimpleIcon,
  phone: PhoneIcon,
  linkedin: LinkedinLogoIcon,
  github: GithubLogoIcon,
  itch: GameControllerIcon,
  steam: GameControllerIcon,
  website: GlobeIcon,
  other: LinkIcon,
}

export function ContactIcon({
  type,
  className,
}: {
  type: Contact["type"]
  className?: string
}) {
  const Component = icons[type]
  return <Component aria-hidden="true" weight="bold" className={className} />
}
