/**
 * Node-only loader for the YAML content files. Used by the Vite plugin at
 * build/dev time, never shipped to the browser.
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { parse } from "yaml"
import { z } from "zod"

import { contentFiles, type Content } from "../src/content/schema.ts"

export const contentDir = join(import.meta.dirname, "../content")

export function loadContent(dir = contentDir): Content {
  const result: Record<string, unknown> = {}
  const errors: string[] = []

  for (const [name, schema] of Object.entries(contentFiles)) {
    const file = join(dir, `${name}.yaml`)
    let raw: unknown
    try {
      raw = parse(readFileSync(file, "utf8"))
    } catch (error) {
      errors.push(`${name}.yaml: ${(error as Error).message}`)
      continue
    }

    const parsed = schema.safeParse(raw)
    if (parsed.success) {
      result[name] = parsed.data
    } else {
      errors.push(`${name}.yaml:\n${z.prettifyError(parsed.error)}`)
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid content:\n\n${errors.join("\n\n")}`)
  }

  return result as Content
}
