/**
 * Schema for the YAML files in /content.
 *
 * These files are the single source of truth for the website and any other
 * consumer (e.g. a CV PDF generator). Keep this file free of browser/node
 * specific imports so it can be shared everywhere.
 *
 * Text fields marked as "inline markdown" support **bold**, *italic* and
 * [links](https://example.com).
 */
import { z } from "zod"

/** "2024", "2024-04" or "2024-04-15" */
const partialDate = z
  .union([z.string(), z.number()])
  .transform((value) => String(value))
  .pipe(
    z
      .string()
      .regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, "Use YYYY, YYYY-MM or YYYY-MM-DD")
  )

export const periodSchema = z.object({
  start: partialDate,
  /** Omit for a single point in time, use "present" for ongoing. */
  end: z.union([partialDate, z.literal("present")]).optional(),
})

export const linkSchema = z.object({
  label: z.string(),
  url: z.url(),
})

export const siteSchema = z.object({
  /** Canonical origin without trailing slash, e.g. https://yvmee.github.io */
  url: z.url().transform((value) => value.replace(/\/+$/, "")),
  lang: z.string().default("en"),
  locale: z.string().default("en_US"),
  /** <title> of the page */
  title: z.string(),
  /** Meta description, ideally 120–160 characters */
  description: z.string().max(200),
  keywords: z.array(z.string()).default([]),
  /** Title of the top window, e.g. "LARA'S PORTFOLIO" */
  windowTitle: z.string(),
  /** Speech bubble next to the avatar */
  greeting: z.string(),
  /** Title bars of the section windows */
  sections: z.object({
    about: z.string(),
    projects: z.string(),
    exhibitions: z.string(),
    experience: z.string(),
    education: z.string(),
    connect: z.string(),
  }),
  connect: z.object({
    heading: z.string(),
    subheading: z.string(),
  }),
})

export const contactSchema = z.object({
  type: z.enum([
    "email",
    "phone",
    "linkedin",
    "github",
    "itch",
    "steam",
    "website",
    "other",
  ]),
  label: z.string(),
  /** Human readable value, e.g. "linkedin.com/in/lara-liebmann" */
  value: z.string(),
  url: z.string(),
  /** false = only for private consumers (e.g. the PDF), never on the website */
  public: z.boolean().default(true),
})

export const profileSchema = z.object({
  name: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  /** Short job title, used for <title>, JSON-LD jobTitle and the hero */
  headline: z.string(),
  location: z.object({
    city: z.string(),
    country: z.string(),
    /** ISO 3166-1 alpha-2 */
    countryCode: z.string().length(2),
  }),
  /** One or two sentences that stand on their own (answer-first, used by search/AI engines). Inline markdown. */
  summary: z.string(),
  /** Longer about-me paragraphs. Inline markdown. */
  about: z.array(z.string()).default([]),
  avatar: z
    .object({
      /** Path relative to /public, e.g. "/me.jpg". Omit to use the built-in pixel avatar. */
      src: z.string().optional(),
      alt: z.string(),
    })
    .default({ alt: "Pixel art avatar" }),
  contacts: z.array(contactSchema),
})

export const skillGroupSchema = z.object({
  id: z.string(),
  title: z.string(),
  items: z.array(z.string()),
})

export const skillsSchema = z.object({
  groups: z.array(skillGroupSchema),
})

export const languageSchema = z.object({
  name: z.string(),
  /** e.g. "Native", "Fluent", "Basic" */
  level: z.string(),
  /** "native", a CEFR level like "C1" or a range like "A2-B1" */
  cefr: z
    .string()
    .regex(
      /^(native|[ABC][12](-[ABC][12])?)$/,
      'Use "native", a CEFR level ("B2") or a range ("A2-B1")'
    )
    .optional(),
})

export const languagesSchema = z.array(languageSchema)

export const githubSchema = z.object({
  /** owner/name */
  repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/, "Use owner/name"),
  /** Used only when the GitHub API does not provide a value (or is unreachable). */
  fallback: z
    .object({
      description: z.string().optional(),
      homepage: z.string().optional(),
      language: z.string().optional(),
      topics: z.array(z.string()).optional(),
      stars: z.number().optional(),
    })
    .default({}),
})

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Determines the schema.org type: game = VideoGame, software = SoftwareApplication, otherwise CreativeWork */
  kind: z.enum(["game", "software", "research", "other"]).default("other"),
  /** One-liner, inline markdown */
  summary: z.string(),
  period: periodSchema,
  /** Shown instead of the formatted period, e.g. "Hackatum Nov. 2025" */
  periodLabel: z.string().optional(),
  tech: z.array(z.string()).default([]),
  /** Inline markdown bullet points */
  highlights: z.array(z.string()).default([]),
  links: z.array(linkSchema).default([]),
  github: githubSchema.optional(),
})

export const projectsSchema = z.array(projectSchema)

export const exhibitionSchema = z.object({
  event: z.string(),
  location: z.string(),
  date: partialDate,
  /** The exhibited work */
  work: z.string(),
  /** Inline markdown */
  description: z.string(),
  url: z.url().optional(),
})

export const exhibitionsSchema = z.array(exhibitionSchema)

export const experienceSchema = z.object({
  title: z.string(),
  organization: z.string(),
  location: z.string(),
  period: periodSchema,
  /** Inline markdown bullet points */
  highlights: z.array(z.string()).default([]),
})

export const experiencesSchema = z.array(experienceSchema)

export const educationSchema = z.object({
  institution: z.string(),
  /** e.g. "M.Sc. Informatics — Games Engineering" */
  degree: z.string(),
  location: z.string(),
  period: periodSchema,
  grade: z.string().optional(),
  url: z.url().optional(),
  /** Labelled detail lines, e.g. coursework or scholarships. Inline markdown. */
  details: z
    .array(z.object({ label: z.string(), text: z.string() }))
    .default([]),
})

export const educationsSchema = z.array(educationSchema)

/** Mapping of content file name (without .yaml) to its schema */
export const contentFiles = {
  site: siteSchema,
  profile: profileSchema,
  skills: skillsSchema,
  languages: languagesSchema,
  projects: projectsSchema,
  exhibitions: exhibitionsSchema,
  experience: experiencesSchema,
  education: educationsSchema,
} as const

export const contentSchema = z.object(contentFiles)

export type Content = z.infer<typeof contentSchema>
export type Site = Content["site"]
export type Profile = Content["profile"]
export type Contact = z.infer<typeof contactSchema>
export type SkillGroup = z.infer<typeof skillGroupSchema>
export type Language = z.infer<typeof languageSchema>
export type Project = z.infer<typeof projectSchema>
export type Exhibition = z.infer<typeof exhibitionSchema>
export type Experience = z.infer<typeof experienceSchema>
export type Education = z.infer<typeof educationSchema>
export type Period = z.infer<typeof periodSchema>
