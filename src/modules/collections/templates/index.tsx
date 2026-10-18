import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getProductPrice } from "@lib/util/get-product-price"
import NeedBrowser, { type BrowseItem } from "@modules/collections/components/need-browser"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const collectionPageCopy: Record<
  string,
  { eyebrow: string; title: string; description: string; popularLabel: string }
> = {
  "pujas-and-homams": {
    eyebrow: "Sacred Rituals",
    title: "Poojas & Homams",
    description:
      "Poojas and homams performed in your family's name, for prosperity, protection, family wellbeing, education and planetary relief.",
    popularLabel: "Popular Pujas",
  },
  "astrology-services": {
    eyebrow: "Jyotish Guidance",
    title: "Astrology Services Backed by Traditional Practice",
    description:
      "Consultations and reports from experienced astrologers, rooted in traditional practice.",
    popularLabel: "Popular Readings",
  },
}

// Need filters: a product belongs to a need when its title, handle or description mentions a keyword.
const NEEDS: { key: string; label: string; keywords: string[] }[] = [
  { key: "fertility", label: "Fertility & pregnancy", keywords: ["garbha", "conceiv", "pregnan", "childbirth", "putra", "santhana", "fertility", "delivery"] },
  { key: "health", label: "Health & healing", keywords: ["health", "mrityunjaya", "dhanvantri", "dhanwantari", "ayushya", "healing", "disease", "longevity"] },
  { key: "marriage", label: "Marriage & family", keywords: ["marriage", "swayamvara", "kalyana", "family", "feminine", "husband", "wife"] },
  { key: "career", label: "Career & prosperity", keywords: ["career", "job", "business", "prosperity", "lakshmi", "kubera", "wealth", "success", "sudarsh", "ganapathy", "ganapathi"] },
  { key: "planets", label: "Planets & doshas", keywords: ["navagraha", "rahu", "ketu", "sani", "shani", "saturn", "dosha", "jupiter", "guru peyarchi", "transit", "planet"] },
  { key: "learning", label: "Learning & exams", keywords: ["saraswati", "education", "exam", "learning", "student"] },
  { key: "ancestors", label: "Ancestors", keywords: ["pitru", "ancestor", "tila", "tarpan", "shraddh", "mahalaya"] },
  { key: "festivals", label: "Festivals", keywords: ["navratri", "diwali", "shivaratri", "deepam", "ekadashi", "festival", "pongal", "puja package"] },
  { key: "prasadam", label: "Prasadam", keywords: ["prasad", "udi", "panchamritham"] },
]

export default async function CollectionTemplate({
  collection,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // Flat page: the whole collection (no pagination).
  const {
    response: { products: collectionProducts },
  } = await listProducts({
    countryCode,
    queryParams: {
      collection_id: [collection.id],
      limit: 100,
    },
  })

  const copy = collectionPageCopy[collection.handle || ""] || {
    eyebrow: "PariharaOnline",
    title: collection.title,
    description:
      collection.metadata?.description?.toString() ||
      `${collection.title}, performed in your family's name.`,
    popularLabel: "",
  }

  const items: BrowseItem[] = collectionProducts.map((p) => {
    const hay = `${p.title} ${p.handle} ${(p.description || "").slice(0, 600)}`.toLowerCase()
    let price: string | null = null
    try {
      price = getProductPrice({ product: p }).cheapestPrice?.calculated_price ?? null
    } catch {}
    return {
      id: p.id,
      handle: p.handle || "",
      title: p.title,
      price,
      image: p.thumbnail || p.images?.[0]?.url || null,
      needs: NEEDS.filter((n) => n.keywords.some((k) => hay.includes(k))).map((n) => n.key),
    }
  })
  const needs = NEEDS.filter((n) => items.some((i) => i.needs.includes(n.key))).map(({ key, label }) => ({ key, label }))

  return (
    <div style={{ background: "var(--paper)" }} data-testid="category-container">
      <section className="content-container" style={{ paddingTop: 28, paddingBottom: 8 }}>
        <p className="ph-eyebrow ph-eyebrow-gold" style={{ margin: "0 0 8px" }}>
          {copy.eyebrow}
        </p>
        <h1 className="ph-h1" style={{ margin: 0 }}>
          {copy.title}
        </h1>
        <p className="ph-body" style={{ margin: "12px 0 0", maxWidth: 680, color: "var(--ink-3)" }}>
          {copy.description}{" "}
          <LocalizedClientLink href="/ask-parihara" style={{ color: "var(--sindoor)", fontWeight: 600 }}>
            Not sure which? Ask us →
          </LocalizedClientLink>
        </p>
      </section>

      <section className="content-container" style={{ paddingTop: 20, paddingBottom: 64 }}>
        <NeedBrowser items={items} needs={needs} />
      </section>
    </div>
  )
}
