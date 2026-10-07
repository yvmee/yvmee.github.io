/**
 * Search engine (SEO) and generative engine (GEO) metadata, generated from the
 * YAML content: <head> tags, JSON-LD, llms.txt, sitemap.xml, robots.txt and
 * the web app manifest.
 */
import type { Content, Period, Project } from "../src/content/schema.ts"

const months = [
  "Jan.",
  "Feb.",
  "Mar.",
  "Apr.",
  "May",
  "Jun.",
  "Jul.",
  "Aug.",
  "Sep.",
  "Oct.",
  "Nov.",
  "Dec.",
]

function formatDate(date: string) {
  const [year, month] = date.split("-")
  return month ? `${months[Number(month) - 1]} ${year}` : year
}

function formatPeriod(period: Period) {
  if (!period.end) return formatDate(period.start)
  const end = period.end === "present" ? "Present" : formatDate(period.end)
  return `${formatDate(period.start)} – ${end}`
}

function plain(text: string) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

export type SeoOptions = {
  /** YYYY-MM-DD */
  updated: string
  ogImage: { path: string; width: number; height: number; alt: string }
}

const publicContacts = (content: Content) =>
  content.profile.contacts.filter((c) => c.public)

const profileUrls = (content: Content) =>
  publicContacts(content)
    .filter((c) => c.url.startsWith("http"))
    .map((c) => c.url)

function projectUrl(project: Project) {
  return project.links[0]?.url ?? project.github?.fallback.homepage
}

export function jsonLd(content: Content, options: SeoOptions) {
  const { site, profile } = content
  const personId = `${site.url}/#person`
  const email = publicContacts(content).find((c) => c.type === "email")

  const institutions = [
    ...new Map(
      content.education.map((e) => [
        e.institution,
        {
          "@type": "CollegeOrUniversity",
          name: e.institution,
          ...(e.url && { url: e.url }),
        },
      ])
    ).values(),
  ]

  const person = {
    "@type": "Person",
    "@id": personId,
    name: profile.name,
    givenName: profile.givenName,
    familyName: profile.familyName,
    jobTitle: profile.headline,
    description: plain(profile.summary),
    url: `${site.url}/`,
    image: `${site.url}${profile.avatar.src ?? "/pixel-avatar.png"}`,
    ...(email && { email: email.value }),
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.location.city,
      addressCountry: profile.location.countryCode,
    },
    homeLocation: {
      "@type": "Place",
      name: `${profile.location.city}, ${profile.location.country}`,
    },
    alumniOf: institutions,
    hasCredential: content.education
      .filter((e) => /^(B|M)\.?Sc|^Ph\.?D|Bachelor|Master/i.test(e.degree))
      .map((e) => ({
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "degree",
        name: e.degree,
        recognizedBy: { "@type": "CollegeOrUniversity", name: e.institution },
      })),
    knowsAbout: content.skills.groups.flatMap((g) => g.items),
    knowsLanguage: content.languages.map((l) => ({
      "@type": "Language",
      name: l.name,
    })),
    sameAs: profileUrls(content),
  }

  const kinds = {
    game: "VideoGame",
    software: "SoftwareApplication",
    research: "CreativeWork",
    other: "CreativeWork",
  } as const

  const projects = content.projects.map((project) => {
    const url = projectUrl(project)
    return {
      "@type": kinds[project.kind],
      "@id": `${site.url}/#project-${project.id}`,
      name: project.name,
      description: plain(project.summary),
      ...(url && { url }),
      dateCreated: project.period.start,
      creator: { "@id": personId },
      keywords: project.tech.join(", "),
      ...(project.kind === "software" && {
        applicationCategory: "BrowserApplication",
      }),
      ...(project.github && {
        sameAs: [`https://github.com/${project.github.repo}`],
      }),
    }
  })

  const exhibitions = content.exhibitions.map((exhibition) => ({
    "@type": "ExhibitionEvent",
    name: exhibition.event,
    startDate: exhibition.date,
    location: { "@type": "Place", name: exhibition.location },
    description: plain(exhibition.description),
    workFeatured: {
      "@type": "CreativeWork",
      name: exhibition.work,
      creator: { "@id": personId },
    },
  }))

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: `${site.url}/`,
        name: profile.name,
        inLanguage: site.lang,
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": `${site.url}/#profile`,
        url: `${site.url}/`,
        name: site.title,
        description: site.description,
        inLanguage: site.lang,
        isPartOf: { "@id": `${site.url}/#website` },
        dateModified: options.updated,
        mainEntity: { "@id": personId },
      },
      person,
      ...projects,
      ...exhibitions,
    ],
  }
}

export function headTags(content: Content, options: SeoOptions) {
  const { site, profile } = content
  const url = `${site.url}/`
  const image = `${site.url}${options.ogImage.path}`
  const meta = (attr: "name" | "property", key: string, value: string) =>
    `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`

  const ld = JSON.stringify(jsonLd(content, options)).replaceAll("<", "\\u003c")

  return [
    `<title>${escapeHtml(site.title)}</title>`,
    meta("name", "description", site.description),
    meta("name", "author", profile.name),
    ...(site.keywords.length
      ? [meta("name", "keywords", site.keywords.join(", "))]
      : []),
    meta("name", "robots", "index, follow, max-image-preview:large"),
    `<link rel="canonical" href="${url}" />`,
    `<meta name="theme-color" media="(prefers-color-scheme: light)" content="#b6ddd6" />`,
    `<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1b3138" />`,
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`,
    `<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />`,
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`,
    `<link rel="manifest" href="/manifest.webmanifest" />`,
    `<link rel="sitemap" type="application/xml" href="/sitemap.xml" />`,
    // Identity links: lets crawlers connect this page with the same person's profiles
    ...profileUrls(content).map((href) => `<link rel="me" href="${href}" />`),
    // Open Graph / social previews
    meta("property", "og:type", "profile"),
    meta("property", "og:site_name", profile.name),
    meta("property", "og:locale", site.locale),
    meta("property", "og:url", url),
    meta("property", "og:title", site.title),
    meta("property", "og:description", site.description),
    meta("property", "og:image", image),
    meta("property", "og:image:width", String(options.ogImage.width)),
    meta("property", "og:image:height", String(options.ogImage.height)),
    meta("property", "og:image:alt", options.ogImage.alt),
    meta("property", "profile:first_name", profile.givenName),
    meta("property", "profile:last_name", profile.familyName),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", site.title),
    meta("name", "twitter:description", site.description),
    meta("name", "twitter:image", image),
    `<script type="application/ld+json">${ld}</script>`,
  ].join("\n    ")
}

/** The complete CV as Markdown. Served as /llms-full.txt (and handy for a PDF generator). */
export function markdownCv(content: Content, options: SeoOptions) {
  const { site, profile } = content
  const lines: string[] = []
  const push = (...items: string[]) => lines.push(...items)

  push(`# ${profile.name}`, "")
  push(`> ${plain(profile.summary)}`, "")
  push(
    `- Role: ${profile.headline}`,
    `- Location: ${profile.location.city}, ${profile.location.country}`,
    `- Website: ${site.url}/`,
    ...publicContacts(content).map(
      (c) => `- ${c.label}: ${c.url.startsWith("mailto:") ? c.value : c.url}`
    ),
    `- Last updated: ${options.updated}`,
    ""
  )

  if (profile.about.length)
    push("## About", "", ...profile.about.flatMap((p) => [p, ""]))

  push("## Skills", "")
  for (const group of content.skills.groups)
    push(`- **${group.title}:** ${group.items.join(", ")}`)
  push("", "## Languages", "")
  for (const l of content.languages)
    push(
      `- **${l.name}:** ${l.level}${l.cefr && l.cefr !== "native" ? ` (${l.cefr})` : ""}`
    )

  push("", "## Selected Projects", "")
  for (const project of content.projects) {
    push(`### ${project.name}`, "")
    push(
      `*${project.periodLabel ?? formatPeriod(project.period)}* · ${project.tech.join(", ")}`,
      ""
    )
    push(project.summary, "")
    for (const h of project.highlights) push(`- ${h}`)
    const links = [
      ...project.links,
      ...(project.github
        ? [
            {
              label: "GitHub",
              url: `https://github.com/${project.github.repo}`,
            },
          ]
        : []),
    ]
    if (links.length)
      push(
        "",
        `Links: ${links.map((l) => `[${l.label}](${l.url})`).join(" · ")}`
      )
    push("")
  }

  push("## Selected Exhibitions", "")
  for (const e of content.exhibitions)
    push(`- **${e.event}** (${e.location}): ${e.description}`)

  push("", "## Experience", "")
  for (const e of content.experience) {
    push(
      `### ${e.title}`,
      "",
      `${e.organization}, ${e.location} · *${formatPeriod(e.period)}*`,
      ""
    )
    for (const h of e.highlights) push(`- ${h}`)
    push("")
  }

  push("## Education", "")
  for (const e of content.education) {
    push(
      `### ${e.institution}`,
      "",
      `${e.degree}${e.grade ? ` · ${e.grade}` : ""} · ${e.location} · *${formatPeriod(e.period)}*`,
      ""
    )
    for (const d of e.details) push(`- **${d.label}:** ${d.text}`)
    push("")
  }

  return (
    lines
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trimEnd() + "\n"
  )
}

/** https://llmstxt.org — a short, curated entry point for language models. */
export function llmsTxt(content: Content, options: SeoOptions) {
  const { site, profile } = content
  const sections = [
    ["about", "About, skills & languages"],
    ["projects", "Projects"],
    ["exhibitions", "Exhibitions"],
    ["experience", "Experience"],
    ["education", "Education"],
    ["contact", "Contact"],
  ]
  return [
    `# ${profile.name}`,
    "",
    `> ${plain(profile.summary)}`,
    "",
    `This is the single-page personal website and CV of ${profile.name} (last updated ${options.updated}). All content is also available as one Markdown file, linked under Optional.`,
    "",
    "## Website",
    "",
    ...sections.map(([id, label]) => `- [${label}](${site.url}/#${id})`),
    "",
    "## Projects",
    "",
    ...content.projects.map((p) => {
      const url = projectUrl(p) ?? `${site.url}/#project-${p.id}`
      return `- [${p.name}](${url}): ${plain(p.summary)}`
    }),
    "",
    "## Profiles",
    "",
    ...publicContacts(content)
      .filter((c) => c.url.startsWith("http"))
      .map((c) => `- [${c.label}](${c.url})`),
    "",
    "## Optional",
    "",
    `- [Full CV in Markdown](${site.url}/llms-full.txt): skills, projects, exhibitions, experience and education`,
    "",
  ].join("\n")
}

export function sitemap(content: Content, options: SeoOptions) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${content.site.url}/</loc>
    <lastmod>${options.updated}</lastmod>
  </url>
</urlset>
`
}

/** Allows everyone, explicitly including AI search and assistant crawlers. */
export function robotsTxt(content: Content) {
  const aiCrawlers = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-SearchBot",
    "Claude-User",
    "PerplexityBot",
    "Google-Extended",
    "Applebot-Extended",
  ]
  return [
    "User-agent: *",
    "Allow: /",
    "",
    ...aiCrawlers.map((bot) => `User-agent: ${bot}`),
    "Allow: /",
    "",
    `Sitemap: ${content.site.url}/sitemap.xml`,
    "",
  ].join("\n")
}

export function manifest(content: Content) {
  return JSON.stringify(
    {
      name: content.site.title,
      short_name: content.profile.givenName,
      description: content.site.description,
      start_url: "/",
      display: "browser",
      background_color: "#f2f9f7",
      theme_color: "#b6ddd6",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      ],
    },
    null,
    2
  )
}
