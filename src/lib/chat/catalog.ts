/**
 * Ask Parihara product catalog (server-only).
 *
 * Fetches every published product from the Medusa store API, keeps it in
 * process memory for 10 minutes, and renders a compact table that goes into
 * the system prompt. That way the assistant knows the whole catalog, not a
 * hand-maintained list of handles. Tools (recommendProducts / showBookingForm)
 * resolve handles and variants against the same data, so prices and variant
 * ids always come from Medusa and never from the model.
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://pariharaonline.medusajs.app"
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const TTL_MS = 10 * 60 * 1000
const DESC_CHARS = 300

// Published placeholder products that must never be recommended.
const EXCLUDED_HANDLES = new Set(["test-product", "sample-bundle-product"])

export type CatalogVariant = {
  id: string
  title: string
  priceInr: number | null
  priceUsd: number | null
}

export type CatalogProduct = {
  id: string
  handle: string
  title: string
  subtitle: string | null
  description: string
  thumbnail: string | null
  collection: string | null
  categories: string[]
  variants: CatalogVariant[]
}

let cache: { at: number; products: CatalogProduct[] } | null = null
let inflight: Promise<CatalogProduct[]> | null = null

export function stripHtml(html: string): string {
  return String(html ?? "")
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim()
}

function priceOf(v: any, currency: "inr" | "usd"): number | null {
  const p = (v?.prices || []).find((x: any) => x?.currency_code === currency)
  return typeof p?.amount === "number" ? Math.round(p.amount) : null
}

export function toCatalogProduct(p: any): CatalogProduct | null {
  if (!p?.handle || EXCLUDED_HANDLES.has(p.handle)) return null
  if (p.status && p.status !== "published") return null
  const variants: CatalogVariant[] = (p.variants || [])
    .map((v: any) => ({
      id: v.id,
      title: String(v.title || "").trim(),
      priceInr: priceOf(v, "inr"),
      priceUsd: priceOf(v, "usd"),
    }))
    // Drop placeholder variants with no real price (e.g. "None / None" at 0).
    .filter((v: CatalogVariant) => v.id && ((v.priceInr ?? 0) > 0 || (v.priceUsd ?? 0) > 0))
  if (!variants.length) return null
  const desc = stripHtml(p.description || "")
  return {
    id: p.id,
    handle: p.handle,
    title: String(p.title || "").replace(/\s+/g, " ").trim(),
    subtitle: p.subtitle ? String(p.subtitle).trim() : null,
    description: desc.length > DESC_CHARS ? desc.slice(0, DESC_CHARS).trimEnd() + "…" : desc,
    thumbnail: p.thumbnail || null,
    collection: p.collection?.title || null,
    categories: (p.categories || []).map((c: any) => c?.name).filter(Boolean),
    variants,
  }
}

async function fetchCatalog(): Promise<CatalogProduct[]> {
  const fields = [
    "id",
    "title",
    "handle",
    "subtitle",
    "status",
    "description",
    "thumbnail",
    "collection.title",
    "categories.name",
    "variants.id",
    "variants.title",
    "variants.prices.amount",
    "variants.prices.currency_code",
  ].join(",")
  const out: CatalogProduct[] = []
  const limit = 100
  for (let offset = 0; offset < 1000; offset += limit) {
    const res = await fetch(
      `${BACKEND_URL}/store/products?limit=${limit}&offset=${offset}&fields=${encodeURIComponent(fields)}`,
      { headers: { "x-publishable-api-key": PUB_KEY }, cache: "no-store" }
    )
    if (!res.ok) throw new Error(`catalog fetch failed: ${res.status}`)
    const json = await res.json()
    for (const p of json.products || []) {
      const c = toCatalogProduct(p)
      if (c) out.push(c)
    }
    if (offset + limit >= (json.count ?? 0)) break
  }
  return out
}

/** All published products, cached in-process for 10 minutes. */
export async function getCatalog(): Promise<CatalogProduct[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.products
  if (!inflight) {
    inflight = fetchCatalog()
      .then((products) => {
        cache = { at: Date.now(), products }
        return products
      })
      .catch((err) => {
        console.warn("[chat catalog]", err?.message ?? err)
        // Serve stale data rather than nothing.
        return cache?.products ?? []
      })
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}

/** Resolve a handle the model produced (exact, then tolerant match). */
export function findProduct(
  catalog: CatalogProduct[],
  handle: string
): CatalogProduct | null {
  const h = String(handle || "").trim().toLowerCase().replace(/^\/?products\//, "")
  if (!h) return null
  return (
    catalog.find((p) => p.handle === h) ||
    catalog.find((p) => p.handle.startsWith(h) || h.startsWith(p.handle)) ||
    null
  )
}

/** Pick a variant by (partial) title, else the first priced variant. */
export function pickVariant(
  product: CatalogProduct,
  variantTitle?: string | null
): CatalogVariant {
  const q = String(variantTitle || "").trim().toLowerCase()
  if (q) {
    const hit =
      product.variants.find((v) => v.title.toLowerCase() === q) ||
      product.variants.find((v) => v.title.toLowerCase().includes(q))
    if (hit) return hit
  }
  return product.variants[0]
}

function fmtPrice(v: CatalogVariant): string {
  const inr = v.priceInr != null ? `₹${v.priceInr}` : "₹?"
  const usd = v.priceUsd != null ? `$${v.priceUsd}` : "$?"
  return `${inr}/${usd}`
}

/**
 * Compact catalog table for the system prompt. One row per product:
 * handle | title | collection | prices (per variant) | about.
 */
export function formatCatalogForPrompt(catalog: CatalogProduct[]): string {
  if (!catalog.length) {
    return "PRODUCT CATALOG\n(Catalog temporarily unavailable. Do not guess handles; for specific services say our team can advise on WhatsApp.)"
  }
  const rows = catalog.map((p) => {
    const prices =
      p.variants.length === 1
        ? fmtPrice(p.variants[0])
        : p.variants
            .map((v) => `${v.title.length > 70 ? v.title.slice(0, 70) + "…" : v.title}: ${fmtPrice(v)}`)
            .join("; ")
    const group = [p.collection, ...p.categories].filter(Boolean).join("/") || "-"
    const about = [p.subtitle, p.description].filter(Boolean).join(" — ").replace(/\|/g, "/")
    return `${p.handle} | ${p.title.replace(/\|/g, "/")} | ${group} | ${prices} | ${about}`
  })
  return [
    `PRODUCT CATALOG (all ${catalog.length} published products; prices INR/USD; use the exact handle in tools)`,
    "handle | title | collection | price(s) | about",
    ...rows,
  ].join("\n")
}

/** Test hook. */
export function __resetCatalogCache() {
  cache = null
  inflight = null
}
