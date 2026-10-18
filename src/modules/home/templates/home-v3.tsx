import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  KolamCorner,
  SectionHeader,
  Stars,
} from "@modules/common/components/brand"
import { getProductPrice } from "@lib/util/get-product-price"
import LiteYouTube from "@modules/common/components/lite-youtube"
import HomeHero from "@modules/home/components/home-hero"
import AartiStrip from "@modules/home/components/aarti-strip"
import { todayIst } from "@lib/util/blog-publish"
import { PRODUCT_BUNDLES } from "@lib/data/product-bundles"
import Link from "next/link"

export type HomeBlogPost = { slug: string; title: string; description: string; publishedAt: string; image?: string; imageAlt?: string; readingTime?: number }

type HomeV3Props = {
  countryCode: string
  products: HttpTypes.StoreProduct[]
  region?: HttpTypes.StoreRegion
  posts?: HomeBlogPost[]
}

/* =====================================================================
   The Parihara V3 home page — chat-forward landing.
   Design source: docs/design/Parihara-Final.html → HomeHiFi
   ===================================================================== */


// Seasonal feature: the banner shown above "Most ordered" in the home hero, only inside its date window (IST).
// Can also be switched on from Medusa admin without a deploy: give a product the metadata
// `featured_until` = YYYY-MM-DD (and optionally `featured_label`, e.g. "Diwali").
const SEASONAL_CALENDAR: { handle: string; label: string; from: string; until: string; note?: string }[] = [
  {
    handle: "navratri-poojas-online",
    label: "Navratri",
    from: "2026-09-25",
    until: "2026-10-20",
    note: "Choose one or more poojas for the last days of Navratri: Durga Ashtami, Maha Navami and Vijayadashami.",
  },
]




// `title` is used only for the iframe's accessibility label; the visible title
// is YouTube's own overlay. Add more entries here as more clips are published.
const RECENT_VIDEOS: { title: string; youtubeId: string }[] = [
  { title: "How homams performed in pariharaOnline", youtubeId: "1Ycn82X6VP4" },
  { title: "Shivaratri Special homam", youtubeId: "iEsN8ftTU_o" },
]

const FAQS: { q: string; a: string }[] = [
  {
    q: "How does an online pooja work?",
    a: "You book the pooja and share the sankalpam details (name, nakshatra, gothram). Our priests perform the ritual in your name at the temple or in our yagasala, and you receive the prasadam along with an HD video clip.",
  },
  {
    q: "Will I receive prasadam?",
    a: "Yes — temple-blessed prasadam is couriered to you worldwide. If you prefer, you can choose to have it donated at the temple instead of shipped.",
  },
  {
    q: "When and how do I get the video?",
    a: "HD video clips of your homam or pooja are sent within 24–48 hours of the ritual — as proof, blessing and a keepsake.",
  },
  {
    q: "What payment methods can I use?",
    a: "UPI, credit/debit cards and net banking via Razorpay, and PayPal for international devotees. You pay in INR within India and in USD internationally.",
  },
  {
    q: "Can I get a refund?",
    a: "If a pooja hasn't been scheduled yet, reach out and we'll help. Full details are on our refund policy page.",
  },
]

const formatPrice = (product: HttpTypes.StoreProduct) => {
  try {
    const { cheapestPrice } = getProductPrice({ product })
    return cheapestPrice?.calculated_price ?? null
  } catch {
    return null
  }
}

export default function HomeV3({ products, countryCode, posts = [] }: HomeV3Props) {
  const byHandle = new Map(products.map((p) => [p.handle, p]))
  const today = todayIst()
  // Seasonal: calendar entries in their window, plus products flagged in Medusa via metadata.
  const seasonal: { product: HttpTypes.StoreProduct; label: string; note?: string; until: string }[] = []
  for (const e of SEASONAL_CALENDAR) {
    const p = byHandle.get(e.handle)
    if (p && e.from <= today && today <= e.until) seasonal.push({ product: p, label: e.label, note: e.note, until: e.until })
  }
  for (const p of products) {
    const until = typeof p.metadata?.featured_until === "string" ? (p.metadata.featured_until as string) : ""
    if (until && today <= until && !seasonal.some((x) => x.product.id === p.id))
      seasonal.push({ product: p, label: String(p.metadata?.featured_label || "Seasonal"), until })
  }
  const seasonalFeature = seasonal[0]
  const isNew = (d: string) => (Date.parse(today) - Date.parse(d)) / 86400000 <= 7
  const fmtUntil = (d: string) =>
    new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })


  const seasonalBanner = seasonalFeature ? (
            <LocalizedClientLink
              href={`/products/${seasonalFeature.product.handle}`}
              className="ph-card ph-lift home-seasonal"
              style={{ marginBottom: 24, overflow: "hidden" }}
            >
              <div style={{ position: "relative", minHeight: 240, background: "var(--ink)" }}>
                {seasonalFeature.product.thumbnail && (
                  <Image
                    src={seasonalFeature.product.thumbnail}
                    alt={seasonalFeature.product.title ?? ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 560px"
                  />
                )}
              </div>
              <div style={{ padding: 28, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
                <div>
                  <span className="ph-chip ph-chip-sindoor">
                    {seasonalFeature.label} · until {fmtUntil(seasonalFeature.until)}
                  </span>
                </div>
                <h3 className="ph-h2" style={{ margin: 0 }}>
                  {seasonalFeature.product.title}
                </h3>
                {(seasonalFeature.note || seasonalFeature.product.subtitle) && (
                  <p className="ph-body" style={{ margin: 0, color: "var(--ink-2)" }}>
                    {seasonalFeature.note || seasonalFeature.product.subtitle}
                  </p>
                )}
                <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
                  <span className="ph-num ph-h4" style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontWeight: 600 }}>
                    {/* Bundles are priced per pooja on their page; their own variants are not what customers buy. */}
                    {!PRODUCT_BUNDLES[seasonalFeature.product.handle ?? ""] && formatPrice(seasonalFeature.product)
                      ? `From ${formatPrice(seasonalFeature.product)}`
                      : ""}
                  </span>
                  <span className="ph-body-sm" style={{ color: "var(--sindoor)", fontWeight: 600 }}>
                    Choose your poojas →
                  </span>
                </div>
              </div>
            </LocalizedClientLink>
          ) : null

  return (
    <div style={{ background: "var(--paper)" }}>
      {/* HERO: first screen (intent tiles, seasonal banner, most ordered, Ask Parihara) */}
      <HomeHero products={products} countryCode={countryCode} seasonal={seasonalBanner} />

      {/* RECENT HOMAM VIDEOS ------------------------------------------- */}
      <section style={{ padding: "64px 24px", background: "var(--paper-3)" }}>
        <div className="content-container" style={{ paddingInline: 0 }}>
          <div className="mb-8">
            <SectionHeader
              eyebrow="From our yagasala"
              title="Video snippets of your Homams / Yagnas"
            />
          </div>
          <div
            className="grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {RECENT_VIDEOS.map((v) => (
              <div key={v.title} className="ph-card" style={{ overflow: "hidden" }}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 9",
                    background: "var(--ink)",
                  }}
                >
                  {v.youtubeId ? (
                    <div style={{ position: "absolute", inset: 0 }}>
                      <LiteYouTube id={v.youtubeId} title={v.title} radius={0} />
                    </div>
                  ) : (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(250,246,238,0.6)",
                        fontSize: 13,
                        fontFamily: "var(--sans)",
                        textAlign: "center",
                        padding: 16,
                      }}
                    >
                      YouTube video coming soon
                    </div>
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  <div className="ph-h4">{v.title}</div>
                </div>
              </div>
            ))}
          </div>
          <AartiStrip />
        </div>
      </section>


      {/* ASTROLOGY + TESTIMONIAL --------------------------------------- */}
      <section
        style={{
          padding: "64px 24px",
          background: "var(--paper)",
        }}
      >
        <div
          className="content-container"
          style={{
            paddingInline: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 32,
          }}
        >
          <div
            className="ph-card relative overflow-hidden"
            style={{
              padding: 40,
              background: "linear-gradient(135deg, #1a1410 0%, #2c1f15 100%)",
              color: "#faf6ee",
            }}
          >
            <KolamCorner
              color="#b88746"
              size={80}
              style={{ position: "absolute", top: 18, right: 18, opacity: 0.4 }}
            />
            <span className="ph-eyebrow" style={{ color: "var(--gold)" }}>
              Practical Astrology
            </span>
            <h2
              className="ph-h1"
              style={{ color: "#faf6ee", marginTop: 14, maxWidth: 360 }}
            >
              Real readings.
              <br />
              No fortune-telling.
            </h2>
            <p
              className="ph-body"
              style={{ color: "rgba(250,246,238,0.75)", maxWidth: 380, marginTop: 16 }}
            >
              Live consultation with Sanskrit-trained jyotishas. Birth-chart based, honest
              answers — and a remedy if needed. Not a script.
            </p>
            <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: 32 }}>
              <LocalizedClientLink
                href="/astrology"
                className="ph-btn ph-btn-sindoor ph-btn-lg"
              >
                Ask our astrologer
              </LocalizedClientLink>
            </div>
          </div>

          <div className="ph-card" style={{ padding: 36, background: "var(--paper-2)" }}>
            <span className="ph-eyebrow ph-eyebrow-sindoor">Devotees say</span>
            <p
              className="ph-h3"
              style={{ color: "var(--ink)", lineHeight: 1.3, marginTop: 14 }}
            >
              &ldquo;After the Mrityunjaya Homam, my father came home from the hospital. We
              watched the video together — he cried. So did I.&rdquo;
            </p>
            <div className="flex items-center gap-3" style={{ marginTop: 24 }}>
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "var(--gold-soft)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-serif), serif",
                  fontSize: 16,
                  color: "var(--gold-2)",
                  fontWeight: 600,
                }}
              >
                LR
              </span>
              <span>
                <span className="ph-body block" style={{ fontWeight: 600 }}>
                  Lakshmi R.
                </span>
                <span className="ph-label ph-num">Edison · New Jersey</span>
              </span>
              <span style={{ flex: 1 }} />
              <Stars value={5} size={14} />
            </div>
          </div>
        </div>
      </section>

      {/* FROM THE BLOG ------------------------------------------------ */}
      {posts.length > 0 && (
        <section style={{ padding: "64px 24px", background: "var(--paper)" }}>
          <div className="content-container" style={{ paddingInline: 0 }}>
            <div className="mb-8">
              <SectionHeader title="From the blog" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="ph-card ph-lift block" style={{ overflow: "hidden" }}>
                  {post.image && (
                    <div style={{ position: "relative", aspectRatio: "3 / 2", background: "var(--paper-2)" }}>
                      <Image src={post.image} alt={post.imageAlt || post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
                    </div>
                  )}
                  <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="flex items-center" style={{ gap: 8 }}>
                      {isNew(post.publishedAt) && <span className="ph-chip ph-chip-sindoor">New</span>}
                      {post.readingTime ? (
                        <span className="ph-body-sm" style={{ color: "var(--ink-4)" }}>
                          {post.readingTime} min read
                        </span>
                      ) : null}
                    </div>
                    <h3 className="ph-h4" style={{ margin: 0 }}>
                      {post.title}
                    </h3>
                    <p
                      className="ph-body-sm"
                      style={{ margin: 0, color: "var(--ink-3)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                    >
                      {post.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Link href="/blog" className="ph-body-sm" style={{ color: "var(--ink)", borderBottom: "1px solid var(--ink-line-2)", paddingBottom: 2 }}>
                Read all articles →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ ------------------------------------------------------------ */}
      <section style={{ padding: "64px 24px", background: "var(--paper-2)" }}>
        <div className="content-container" style={{ paddingInline: 0, maxWidth: 820 }}>
          <SectionHeader
            align="center"
            eyebrow="Good to know"
            title="Frequently asked questions"
          />
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map((f) => (
              <details key={f.q} className="ph-card" style={{ padding: "18px 22px" }}>
                <summary
                  style={{
                    cursor: "pointer",
                    fontFamily: "var(--sans)",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  {f.q}
                </summary>
                <p className="ph-body" style={{ marginTop: 10, color: "var(--ink-2)" }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <LocalizedClientLink href="/faq" className="ph-btn ph-btn-ghost">
              Read all FAQs →
            </LocalizedClientLink>
          </div>
        </div>
      </section>
    </div>
  )
}
