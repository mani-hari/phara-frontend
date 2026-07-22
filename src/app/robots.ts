import type { MetadataRoute } from "next"

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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  }
}
