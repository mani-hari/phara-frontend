import { Metadata } from "next"
import Link from "next/link"
import { HttpTypes } from "@medusajs/types"

import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { searchProducts, type SearchResponse } from "@lib/search/query"
import { localizeHref } from "@lib/util/localize-href"
import ProductPreview from "@modules/products/components/product-preview"
import AskPariharaBanner from "@modules/search/components/ask-parihara-banner"

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
}

export const dynamic = "force-dynamic"

const RESULT_LIMIT = 24
const SUGGESTED_QUERIES = ["Navagraha", "Shani", "Marriage", "Education", "Rahu Ketu"]

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ q?: string | string[] }>
}

async function loadResults(q: string, countryCode: string) {
  let search: SearchResponse = { query: q, results: [], mode: "keyword" }
  let products: HttpTypes.StoreProduct[] = []
  let region: HttpTypes.StoreRegion | null | undefined = null
  try {
    search = await searchProducts(q, { limit: RESULT_LIMIT })
    const ids = search.results.map((r) => r.id)
    if (ids.length) {
      region = await getRegion(countryCode)
      if (region) {
        const { response } = await listProducts({
          countryCode,
          queryParams: { id: ids, limit: ids.length },
        })
        // Keep search-rank order (Medusa returns its own order).
        const byId = new Map(response.products.map((p) => [p.id, p]))
        products = ids.map((id) => byId.get(id)).filter((p): p is HttpTypes.StoreProduct => !!p)
      }
    }
  } catch (err) {
    console.error("[search] page load failed:", err)
  }
  return { search, products, region }
}

async function loadPopularCollections() {
  try {
    const { collections } = await listCollections({ limit: "12" })
    // Skip Medusa's placeholder "default" collection.
    return collections.filter((c) => c.title && c.title.toLowerCase() !== "default").slice(0, 8)
  } catch {
    return []
  }
}

export default async function SearchPage(props: Props) {
  const { countryCode } = await props.params
  const sp = await props.searchParams
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q ?? "").trim().slice(0, 200)

  const { search, products, region } = q
    ? await loadResults(q, countryCode)
    : { search: null, products: [], region: null }
  const hasResults = products.length > 0 && !!region
  const collections = hasResults ? [] : await loadPopularCollections()

  return (
    <div style={{ background: "var(--paper)", borderTop: "1px solid var(--ink-line)" }}>
      <section className="content-container" style={{ paddingTop: 40, paddingBottom: 64 }}>
        <form
          action={localizeHref(countryCode, "/search")}
          method="get"
          role="search"
          style={{ display: "flex", gap: 8, maxWidth: 520, marginBottom: 28 }}
        >
          <input
            className="ph-input"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search poojas, remedies…"
            aria-label="Search products"
          />
          <button type="submit" className="ph-btn ph-btn-primary" style={{ flexShrink: 0 }}>
            Search
          </button>
        </form>

        {q ? (
          <>
            <p className="ph-eyebrow ph-eyebrow-gold" style={{ marginBottom: 6 }}>
              Search
            </p>
            <h1 className="ph-h3" style={{ margin: "0 0 8px" }}>
              Results for “{q}”
            </h1>
            <p className="ph-body-sm ph-num" style={{ color: "var(--ink-3)", margin: "0 0 20px" }}>
              {hasResults
                ? `${products.length} ${products.length === 1 ? "service" : "services"} found`
                : "No matching services"}
            </p>

            {process.env.NODE_ENV === "development" && search?.mode === "keyword" && (
              <p
                className="ph-body-sm"
                style={{
                  color: "var(--ink-3)",
                  border: "1px dashed var(--ink-line-2)",
                  borderRadius: "var(--r-md)",
                  padding: "8px 12px",
                  margin: "0 0 16px",
                }}
              >
                Dev: keyword-only search (no AI_GATEWAY_API_KEY or embeddings unavailable).
              </p>
            )}

            <div style={{ marginBottom: 28 }}>
              <AskPariharaBanner query={q} countryCode={countryCode} compact />
            </div>

            {hasResults ? (
              <ul
                className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
                data-testid="search-results"
              >
                {products.map((p) => (
                  <li key={p.id}>
                    <ProductPreview product={p} region={region!} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState countryCode={countryCode} collections={collections} />
            )}

            <div style={{ marginTop: 40 }}>
              <AskPariharaBanner query={q} countryCode={countryCode} />
            </div>
          </>
        ) : (
          <>
            <h1 className="ph-h3" style={{ margin: "0 0 20px" }}>
              Search the catalog
            </h1>
            <EmptyState countryCode={countryCode} collections={collections} />
          </>
        )}
      </section>
    </div>
  )
}

function EmptyState({
  countryCode,
  collections,
}: {
  countryCode: string
  collections: HttpTypes.StoreCollection[]
}) {
  return (
    <div data-testid="search-empty">
      <p className="ph-body" style={{ color: "var(--ink-3)", margin: "0 0 12px" }}>
        Try one of these:
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {SUGGESTED_QUERIES.map((s) => (
          <Link
            key={s}
            href={localizeHref(countryCode, `/search?q=${encodeURIComponent(s)}`)}
            className="ph-chip"
            style={{ textDecoration: "none" }}
          >
            {s}
          </Link>
        ))}
      </div>
      {collections.length > 0 && (
        <>
          <p className="ph-body" style={{ color: "var(--ink-3)", margin: "0 0 12px" }}>
            Or browse popular collections:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {collections.map((c) => (
              <Link
                key={c.id}
                href={localizeHref(countryCode, `/collections/${c.handle}`)}
                className="ph-chip ph-chip-gold"
                style={{ textDecoration: "none" }}
              >
                {c.title}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
