import type { Period } from "@/content/schema"

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

/** "2024-04" -> "Apr. 2024". Deterministic so server and client render the same. */
export function formatDate(date: string) {
  const [year, month] = date.split("-")
  return month ? `${months[Number(month) - 1]} ${year}` : year
}

export function formatPeriod(period: Period) {
  if (!period.end) return formatDate(period.start)
  const end = period.end === "present" ? "Present" : formatDate(period.end)
  return `${formatDate(period.start)} – ${end}`
}

/** Strips inline markdown for plain-text consumers (meta tags, JSON-LD). */
export function stripMarkdown(text: string) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
}
