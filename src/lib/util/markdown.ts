const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const renderInline = (value: string) => {
  let html = escapeHtml(value)

  html = html.replace(
    /`([^`]+)`/g,
    '<code class="rounded bg-grey-5 px-1.5 py-0.5 text-[0.95em]">$1</code>'
  )
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer" class="text-brand-600 underline underline-offset-4 hover:text-brand-700">$1</a>'
  )
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>")

  return html
}

const paragraph = (value: string) =>
  `<p class="mb-4 text-base leading-8 text-grey-70">${renderInline(
    value.trim()
  )}</p>`

const heading = (level: number, value: string) => {
  const className =
    level === 1
      ? "mt-8 mb-4 text-3xl font-bold text-grey-90"
      : level === 2
        ? "mt-8 mb-4 text-2xl font-semibold text-grey-90"
        : "mt-6 mb-3 text-xl font-semibold text-grey-90"

  return `<h${level} class="${className}">${renderInline(
    value.trim()
  )}</h${level}>`
}

export const markdownToHtml = (markdown: string) => {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n")
  const blocks: string[] = []
  let paragraphLines: string[] = []
  let listItems: string[] = []
  let orderedItems: string[] = []
  let quoteLines: string[] = []
  let codeLines: string[] = []
  let inCodeBlock = false

  const flushParagraph = () => {
    if (paragraphLines.length) {
      blocks.push(paragraph(paragraphLines.join(" ")))
      paragraphLines = []
    }
  }

  const flushList = () => {
    if (listItems.length) {
      blocks.push(
        `<ul class="mb-5 list-disc space-y-2 pl-6 text-base leading-8 text-grey-70">${listItems
          .map((item) => `<li>${renderInline(item)}</li>`)
          .join("")}</ul>`
      )
      listItems = []
    }
  }

  const flushOrdered = () => {
    if (orderedItems.length) {
      blocks.push(
        `<ol class="mb-5 list-decimal space-y-2 pl-6 text-base leading-8 text-grey-70">${orderedItems
          .map((item) => `<li>${renderInline(item)}</li>`)
          .join("")}</ol>`
      )
      orderedItems = []
    }
  }

  const flushQuote = () => {
    if (quoteLines.length) {
      blocks.push(
        `<blockquote class="mb-5 rounded-2xl border-l-4 border-brand-400 bg-brand-50 px-5 py-4 text-base italic leading-8 text-grey-70">${quoteLines
          .map((line) => renderInline(line))
          .join("<br />")}</blockquote>`
      )
      quoteLines = []
    }
  }

  const flushCode = () => {
    if (codeLines.length) {
      blocks.push(
        `<pre class="mb-5 overflow-x-auto rounded-2xl bg-grey-90 p-4 text-sm leading-7 text-grey-5"><code>${escapeHtml(
          codeLines.join("\n")
        )}</code></pre>`
      )
      codeLines = []
    }
  }

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        flushCode()
      } else {
        flushParagraph()
        flushList()
        flushOrdered()
        flushQuote()
      }
      inCodeBlock = !inCodeBlock
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    if (!line.trim()) {
      flushParagraph()
      flushList()
      flushOrdered()
      flushQuote()
      continue
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/)
    if (headingMatch) {
      flushParagraph()
      flushList()
      flushOrdered()
      flushQuote()
      blocks.push(heading(headingMatch[1].length, headingMatch[2]))
      continue
    }

    if (/^---+$/.test(line.trim())) {
      flushParagraph()
      flushList()
      flushOrdered()
      flushQuote()
      blocks.push('<hr class="my-8 border-grey-10" />')
      continue
    }

    const unorderedMatch = line.match(/^[-*]\s+(.*)$/)
    if (unorderedMatch) {
      flushParagraph()
      flushOrdered()
      flushQuote()
      listItems.push(unorderedMatch[1])
      continue
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/)
    if (orderedMatch) {
      flushParagraph()
      flushList()
      flushQuote()
      orderedItems.push(orderedMatch[1])
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

    paragraphLines.push(line.trim())
  }

  flushParagraph()
  flushList()
  flushOrdered()
  flushQuote()
  flushCode()

  return blocks.join("\n")
}
