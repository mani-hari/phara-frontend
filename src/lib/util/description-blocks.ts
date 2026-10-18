// Parses a product description written with light markup ("## " heading, "> " sloka line,
// "- " bullet) into blocks and heading-led sections. Shared by the product templates.
export type DescBlock =
  | { kind: "heading" | "para" | "bullet"; text: string }
  | { kind: "sloka"; lines: string[] }

export type DescSection = { heading: string | null; blocks: DescBlock[] }

export function parseDescription(description: string | null | undefined): DescBlock[] {
  const lines = (description ?? "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  return lines.reduce<DescBlock[]>((out, line) => {
    if (line.startsWith("## ")) out.push({ kind: "heading", text: line.slice(3).trim() })
    // Older descriptions mark sections with a short line ending in ":" or "?" ("Who is it for?",
    // "Benefits of the Homam:"); treat those as headings too.
    else if (line.length <= 60 && /[:?]$/.test(line) && !/^[-–•*>]/.test(line))
      out.push({ kind: "heading", text: line.replace(/:$/, "").trim() })
    else if (line.startsWith(">")) {
      const text = line.replace(/^>\s*/, "")
      const last = out[out.length - 1]
      if (last && last.kind === "sloka") last.lines.push(text)
      else out.push({ kind: "sloka", lines: [text] })
    } else if (/^[-–•*]\s*/.test(line)) out.push({ kind: "bullet", text: line.replace(/^[-–•*]\s*/, "") })
    else out.push({ kind: "para", text: line })
    return out
  }, [])
}

/** Splits blocks into sections: the opening (heading null) and one per "## " heading. */
export function toSections(blocks: DescBlock[]): DescSection[] {
  const out: DescSection[] = [{ heading: null, blocks: [] }]
  for (const b of blocks) {
    if (b.kind === "heading") out.push({ heading: b.text, blocks: [] })
    else out[out.length - 1].blocks.push(b)
  }
  return out.filter((s, i) => i > 0 || s.blocks.length)
}
