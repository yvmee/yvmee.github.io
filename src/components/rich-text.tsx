import { Fragment, type ReactNode } from "react"

const token = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g

/** Renders the tiny inline-markdown subset used in the YAML files. */
export function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = []
  let last = 0

  for (const match of text.matchAll(token)) {
    const [whole, bold, italic, label, url] = match
    if (match.index > last) nodes.push(text.slice(last, match.index))
    const key = match.index
    if (bold) nodes.push(<strong key={key}>{bold}</strong>)
    else if (italic) nodes.push(<em key={key}>{italic}</em>)
    else
      nodes.push(
        <a key={key} href={url} className="link">
          {label}
        </a>
      )
    last = match.index + whole.length
  }
  if (last < text.length) nodes.push(text.slice(last))

  return <Fragment>{nodes}</Fragment>
}
