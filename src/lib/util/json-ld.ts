// Shared JSON-LD (schema.org) builders for GEO/AEO (AI answer-engine
// citability — ChatGPT, Claude, Perplexity, Google AI Overviews).
//
// Kept in one place so markup stays consistent across product/collection/
// about pages and is easy to audit. Same canonical-domain convention as
// src/app/sitemap.ts and src/app/robots.ts.

const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.pariharaonline.com"
).replace(/\/$/, "")

function absoluteUrl(url: string): string {
  return url.startsWith("http") ? url : `${SITE}${url}`
}

// ---------------------------------------------------------------------------
// BreadcrumbList
// ---------------------------------------------------------------------------
export type BreadcrumbItem = { name: string; url: string }

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  }
}

// ---------------------------------------------------------------------------
// HowTo — parsed from the real "How the homam/pooja is performed" section
// that most ritual product descriptions already contain (authored by the
// PariharaOnline team in Medusa). Returns null rather than inventing steps
// when a description doesn't have that section, per MAN-18 scope (don't
// fabricate specifics we can't verify from real product copy).
// ---------------------------------------------------------------------------
export function extractHowToFromDescription(params: {
  title: string
  description?: string | null
  url: string
}) {
  const { title, description, url } = params
  if (!description) return null

  const lines = description.split(/\r?\n/).map((l) => l.trim())
  const headerIdx = lines.findIndex(
    (l) => /^how\b/i.test(l) && /is performed/i.test(l)
  )
  if (headerIdx === -1) return null

  const steps: string[] = []
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    if (/^[-–•*]\s*/.test(line)) {
      const text = line.replace(/^[-–•*]\s*/, "").trim()
      if (text) steps.push(text)
    } else {
      // First non-bullet, non-blank line after the bullet run ends the
      // "how it's performed" section (e.g. the next "Benefits of the
      // Homam:" header, which reuses the same bullet formatting).
      break
    }
  }

  if (steps.length < 2) return null

  // Best-effort typical-duration extraction (e.g. "lasts for about 2-3
  // hours", "Duration: 2 hours"). Left out entirely when not present —
  // never fabricated.
  let totalTime: string | undefined
  const durationMatch = description.match(
    /(\d+)\s*(?:-|to)?\s*(\d+)?\s*hours?/i
  )
  if (durationMatch) {
    const hours = durationMatch[2]
      ? Math.max(Number(durationMatch[1]), Number(durationMatch[2]))
      : Number(durationMatch[1])
    if (hours > 0 && hours <= 24) totalTime = `PT${hours}H`
  }

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How ${title} is performed`,
    description: `Step-by-step overview of how PariharaOnline's Vedic priests/representatives perform ${title}.`,
    url: absoluteUrl(url),
    ...(totalTime && { totalTime }),
    step: steps.map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text,
    })),
  }
}

// ---------------------------------------------------------------------------
// FAQPage — built from real, hand-curated Q&A content (see
// src/lib/data/product-faq-content.ts). Never auto-generated from scratch.
// ---------------------------------------------------------------------------
export type ProductFaqEntry = { question: string; answer: string }

export function buildFaqJsonLd(entries: ProductFaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  }
}
