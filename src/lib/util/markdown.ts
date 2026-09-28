const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

type Variant = "default" | "article"

const renderInline = (value: string, variant: Variant = "default") => {
  let html = escapeHtml(value)
  const plain = variant === "article"

  html = html.replace(
    /`([^`]+)`/g,
    plain
      ? "<code>$1</code>"
      : '<code class="rounded bg-grey-5 px-1.5 py-0.5 text-[0.95em]">$1</code>'
  )
  const linkClass = plain
    ? ""
    : ' class="text-brand-600 underline underline-offset-4 hover:text-brand-700"'
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    `<a href="$2" target="_blank" rel="noreferrer"${linkClass}>$1</a>`
  )
  // Site-relative links (e.g. internal links between blog posts).
  html = html.replace(
    /\[([^\]]+)\]\((\/[^\s)]*)\)/g,
    `<a href="$2"${linkClass}>$1</a>`
  )
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>")

  return html
}

/** Inline markdown (links, bold, italic) for short article strings like takeaways. */
export const renderInlineMarkdown = (value: string) =>
  renderInline(value, "article")

const headingId = (value: string) =>
  value
    .toLowerCase()
    .replace(/[`*_[\]()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

/** Heading text without inline markdown (for tables of contents). */
const plainText = (value: string) =>
  value
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_]/g, "")
    .trim()

const renderBlocks = (markdown: string, variant: Variant) => {
  const article = variant === "article"
  const lines = markdown.replace(/\r\n/g, "\n").split("\n")
  const blocks: string[] = []
  /** Indexes into `blocks` of every h2 (used to split articles into sections). */
  const h2Indexes: number[] = []
  /** Every h2 in document order, with the same id the rendered heading gets. */
  const toc: { id: string; text: string }[] = []
  const usedIds = new Set<string>()
  let paragraphLines: string[] = []
  let listItems: string[] = []
  let orderedItems: string[] = []
  let quoteLines: string[] = []
  let codeLines: string[] = []
  let inCodeBlock = false

  const inline = (value: string) => renderInline(value, variant)

  const uniqueId = (text: string) => {
    const base = headingId(text) || "section"
    let id = base
    let n = 2
    while (usedIds.has(id)) id = `${base}-${n++}`
    usedIds.add(id)
    return id
  }

  const paragraph = (value: string) =>
    article
      ? `<p>${inline(value.trim())}</p>`
      : `<p class="mb-4 text-base leading-8 text-grey-70">${inline(value.trim())}</p>`

  const heading = (rawLevel: number, value: string) => {
    if (article) {
      // The page renders the H1 from frontmatter, so body headings start at h2.
      const level = Math.max(2, rawLevel)
      const text = value.trim()
      const id = uniqueId(text)
      if (level === 2) {
        h2Indexes.push(blocks.length)
        toc.push({ id, text: plainText(text) })
      }
      return `<h${level} id="${id}">${inline(text)}</h${level}>`
    }
    const level = rawLevel
    const className =
      level === 1
        ? "mt-8 mb-4 text-3xl font-bold text-grey-90"
        : level === 2
          ? "mt-8 mb-4 text-2xl font-semibold text-grey-90"
          : "mt-6 mb-3 text-xl font-semibold text-grey-90"

    return `<h${level} class="${className}">${inline(value.trim())}</h${level}>`
  }

  const flushParagraph = () => {
    if (paragraphLines.length) {
      blocks.push(paragraph(paragraphLines.join(" ")))
      paragraphLines = []
    }
  }

  const flushList = () => {
    if (listItems.length) {
      const items = listItems.map((item) => `<li>${inline(item)}</li>`).join("")
      blocks.push(
        article
          ? `<ul>${items}</ul>`
          : `<ul class="mb-5 list-disc space-y-2 pl-6 text-base leading-8 text-grey-70">${items}</ul>`
      )
      listItems = []
    }
  }

  const flushOrdered = () => {
    if (orderedItems.length) {
      const items = orderedItems.map((item) => `<li>${inline(item)}</li>`).join("")
      blocks.push(
        article
          ? `<ol>${items}</ol>`
          : `<ol class="mb-5 list-decimal space-y-2 pl-6 text-base leading-8 text-grey-70">${items}</ol>`
      )
      orderedItems = []
    }
  }

  const flushQuote = () => {
    while (quoteLines.length && !quoteLines[quoteLines.length - 1].trim()) {
      quoteLines.pop()
    }
    if (quoteLines.length) {
      if (article) {
        // Blank "> " lines separate paragraphs inside the quote.
        const paras = quoteLines
          .join("\n")
          .split(/\n\s*\n/)
          .filter((para) => para.trim())
          .map((para) => `<p>${inline(para.replace(/\n/g, " ").trim())}</p>`)
          .join("")
        blocks.push(`<blockquote>${paras}</blockquote>`)
      } else {
        blocks.push(
          `<blockquote class="mb-5 rounded-2xl border-l-4 border-brand-400 bg-brand-50 px-5 py-4 text-base italic leading-8 text-grey-70">${quoteLines
            .map((line) => inline(line))
            .join("<br />")}</blockquote>`
        )
      }
      quoteLines = []
    }
  }

  const flushCode = () => {
    if (codeLines.length) {
      const code = escapeHtml(codeLines.join("\n"))
      blocks.push(
        article
          ? `<pre><code>${code}</code></pre>`
          : `<pre class="mb-5 overflow-x-auto rounded-2xl bg-grey-90 p-4 text-sm leading-7 text-grey-5"><code>${code}</code></pre>`
      )
      codeLines = []
    }
  }

  const flushAll = () => {
    flushParagraph()
    flushList()
    flushOrdered()
    flushQuote()
  }

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        flushCode()
      } else {
        flushAll()
      }
      inCodeBlock = !inCodeBlock
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    if (!line.trim()) {
      // Keep a blockquote open across blank lines only if the next quote line
      // continues it; otherwise a blank line ends every block.
      if (quoteLines.length) {
        quoteLines.push("")
        continue
      }
      flushAll()
      continue
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/)
    if (headingMatch) {
      flushAll()
      blocks.push(heading(headingMatch[1].length, headingMatch[2]))
      continue
    }

    if (/^---+$/.test(line.trim())) {
      flushAll()
      blocks.push(article ? "<hr />" : '<hr class="my-8 border-grey-10" />')
      continue
    }

    const quoteMatch = line.match(/^>\s?(.*)$/)
    if (quoteMatch) {
      flushParagraph()
      flushList()
      flushOrdered()
      quoteLines.push(quoteMatch[1])
      continue
    }

    // Any non-quote line after a blank closes the quote.
    if (quoteLines.length) flushQuote()

    const unorderedMatch = line.match(/^[-*]\s+(.*)$/)
    if (unorderedMatch) {
      flushParagraph()
      flushOrdered()
      listItems.push(unorderedMatch[1])
      continue
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/)
    if (orderedMatch) {
      flushParagraph()
      flushList()
      orderedItems.push(orderedMatch[1])
      continue
    }

    // Indented continuation of a list item.
    if (/^\s{2,}\S/.test(line) && (listItems.length || orderedItems.length)) {
      const target = listItems.length ? listItems : orderedItems
      target[target.length - 1] += ` ${line.trim()}`
      continue
    }

    paragraphLines.push(line.trim())
  }

  flushAll()
  flushCode()

  return { blocks, h2Indexes, toc }
}

export const markdownToHtml = (markdown: string) =>
  renderBlocks(markdown, "default").blocks.join("\n")

/**
 * Render a blog article body (semantic HTML, styled by `.ph-article` in
 * globals.css; h1 demoted to h2; h2/h3 get anchor ids) split into two halves
 * so a server component can be placed between them. The split happens just
 * before the 3rd h2 — i.e. after the 2nd `##` section. With fewer than three
 * h2s, everything is in `before` and `after` is empty.
 */
export const renderArticleMarkdown = (markdown: string) => {
  const { blocks, h2Indexes, toc } = renderBlocks(markdown, "article")
  const splitAt = h2Indexes.length >= 3 ? h2Indexes[2] : blocks.length
  return {
    before: blocks.slice(0, splitAt).join("\n"),
    after: blocks.slice(splitAt).join("\n"),
    headings: h2Indexes.length,
    /** `##` headings (id + plain text) for an "In this article" list. */
    toc,
  }
}
