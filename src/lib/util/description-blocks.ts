// Parses a product description written with light markup ("## " heading, "> " sloka line,
// "- " bullet) into blocks and heading-led sections. Shared by the product templates.
export type DescBlock =
  | { kind: "heading" | "para" | "bullet"; text: string }
  | { kind: "sloka"; lines: string[] }

export type DescSection = { heading: string | null; blocks: DescBlock[] }

export function parseDescription(description: string | null | undefined): DescBlock[] {
  const lines = (description ?? "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  // Some imported descriptions put the bullet dash on its own line and the text on the next one.
  let nextIsBullet = false
  return lines.reduce<DescBlock[]>((out, line) => {
    if (/^[-–•*]$/.test(line)) {
      nextIsBullet = true
      return out
    }
    if (nextIsBullet) {
      nextIsBullet = false
      out.push({ kind: "bullet", text: line.replace(/^[-–•*]\s*/, "") })
      return out
    }
    if (line.startsWith("## ")) out.push({ kind: "heading", text: line.slice(3).trim() })
    // Older descriptions mark sections with a short line ending in ":" or "?" ("Who is it for?",
    // "Benefits of the Homam:"); treat those as headings too.
    else if (line.length <= 60 && /[:?]$/.test(line) && !/^[-–•*>]/.test(line))
      out.push({ kind: "heading", text: line.replace(/:$/, "").trim() })
    // ...or put the section name inline: "Significance of this pooja: The Rahu Ketu ...".
    else if (/^[A-Z][A-Za-z0-9 '&/,()-]{2,45}:\s+\S/.test(line) && !/^(note|nb|ps|tip)\b/i.test(line)) {
      const i = line.indexOf(":")
      out.push({ kind: "heading", text: line.slice(0, i).trim() })
      out.push({ kind: "para", text: line.slice(i + 1).trim() })
    }
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
  // "Keywords: ..." blocks are SEO leftovers from the old shop; never show them to visitors.
  return out.filter((s, i) => (i > 0 || s.blocks.length) && !/^keywords?$/i.test(s.heading || ""))
}
