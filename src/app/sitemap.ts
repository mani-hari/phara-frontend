import type { MetadataRoute } from "next"
import { listProducts } from "@lib/data/products"

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.pariharaonline.com").replace(/\/$/, "")

// Canonical URLs use the clean (India-default) paths — no country prefix — which
// is what the middleware serves for the default region.
const STATIC_PATHS: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/store", priority: 0.9 },
  { path: "/collections", priority: 0.7 },
  { path: "/categories", priority: 0.6 },
  { path: "/astrology", priority: 0.8 },
  { path: "/ask-parihara", priority: 0.7 },
  { path: "/how-it-works", priority: 0.6 },
  { path: "/faq", priority: 0.6 },
  { path: "/blog", priority: 0.6 },
  { path: "/about", priority: 0.5 },
  { path: "/contact", priority: 0.5 },
  { path: "/pages/poojas-for-pregnancy-and-safe-childbirth", priority: 0.7 },
  { path: "/terms", priority: 0.3 },
  { path: "/privacy", priority: 0.3 },
  { path: "/refund", priority: 0.3 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, priority }) => ({
    url: `${SITE}${path || "/"}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  }))

  // Best-effort: include all product pages. If the store API is unavailable at
  // build time, the static entries above are still emitted.
  try {
    const { response } = await listProducts({
      countryCode: "in",
      queryParams: { limit: 500, fields: "handle,updated_at" } as any,
    })
    for (const product of response.products || []) {
      if (!product.handle) continue
      entries.push({
        url: `${SITE}/products/${product.handle}`,
        lastModified: (product as any).updated_at ? new Date((product as any).updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      })
    }
  } catch {
    // ignore — static entries still ship
  }

  return entries
}
