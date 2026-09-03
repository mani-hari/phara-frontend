import { NextResponse } from "next/server"

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.pariharaonline.com").replace(/\/$/, "")

// AI answer-engine crawlers we explicitly welcome (GEO/AEO). We WANT ChatGPT,
// Claude, Perplexity, Google AI Overviews, etc. to read and cite the site, so
// they are allowed the same public surface as everyone else.
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "Bingbot",
  "CCBot",
]

// Functional/private areas — no SEO/AEO value and shouldn't be crawled.
const DISALLOW = [
  "/api/",
  "/admin",
  "/account",
  "/checkout",
  "/cart",
  "/*/admin",
  "/*/account",
  "/*/checkout",
  "/*/cart",
]

// Content Signals (https://contentsignals.org): declared once per
// User-agent block, same policy for every crawler — we allow indexing and
// AI retrieval/citation, but withhold model-training rights.
const CONTENT_SIGNAL = "Content-Signal: ai-train=no, search=yes, ai-input=yes"

function renderBlock(userAgent: string): string {
  const lines = [`User-Agent: ${userAgent}`, CONTENT_SIGNAL, "Allow: /"]
  DISALLOW.forEach((path) => lines.push(`Disallow: ${path}`))
  return lines.join("\n")
}

export function GET() {
  const blocks = ["*", ...AI_BOTS].map(renderBlock)
  const body = [
    ...blocks,
    `Host: ${SITE}`,
    `Sitemap: ${SITE}/sitemap.xml`,
  ].join("\n\n")

  return new NextResponse(body + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
