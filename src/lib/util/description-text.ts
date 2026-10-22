// Product descriptions may use light markup ("## " headings, "> " sloka lines, "- " bullets).
// These helpers give plain text for meta tags and structured data.

const stripLine = (l: string) => l.trim().replace(/^(##|>|[-–•*])\s*/, "")

/** Opening text before the first "## " heading, as one line (meta description / link previews). */
export function descriptionIntro(description: string | null | undefined): string {
  const lines = (description ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const cut = lines.findIndex((l) => l.startsWith("## "))
  return (cut > 0 ? lines.slice(0, cut) : lines).map(stripLine).join(" ")
}

/** Whole description with markup removed, line breaks kept (structured data). */
export function descriptionPlain(description: string | null | undefined): string {
  return (description ?? "").split(/\r?\n/).map(stripLine).filter(Boolean).join("\n")
}

/** A search-result length description (~155 chars), cut at a sentence or word boundary. */
export function metaDescription(text: string | null | undefined, max = 155): string {
  const t = (text ?? "").replace(/\s+/g, " ").replace(/^(significance of this temple \/ pooja:|who is it for\?)\s*/i, "").trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max + 1)
  const sentence = cut.lastIndexOf(". ")
  if (sentence > max * 0.6) return cut.slice(0, sentence + 1)
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:–-]$/, "") + "…"
}
