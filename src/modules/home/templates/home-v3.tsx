import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  CenterSigil,
  Img,
  KolamCorner,
  Logo,
  SectionHeader,
  Stars,
} from "@modules/common/components/brand"
import { getProductPrice } from "@lib/util/get-product-price"
import HeroChatInput from "@modules/home/components/hero-chat-input"

type HomeV3Props = {
  countryCode: string
  products: HttpTypes.StoreProduct[]
  region?: HttpTypes.StoreRegion
}

/* =====================================================================
   The Parihara V3 home page — chat-forward landing.
   Design source: docs/design/Parihara-Final.html → HomeHiFi
   ===================================================================== */

const FEATURED_HANDLES = [
  "garbarakshambigai-ghee",
  "garbarakshambigai-oil",
  "rahu-ketu-dosha-parihara",
] as const

const FEATURED_OVERLAY: Record<
  string,
  { tag: string; deity: string; img: string; stars: number; reviews: number; sub: string }
> = {
  "garbarakshambigai-ghee": {
    tag: "For Conceiving",
    deity: "Garbarakshambigai · Tirukkarukavur",
    img: "GHEE · LAMP IN COPPER VESSEL",
    stars: 4.9,
    reviews: 281,
    sub: "Temple-blessed prasadham · sealed glass jar",
  },
  "garbarakshambigai-oil": {
    tag: "For Safe Delivery",
    deity: "Garbarakshambigai · Tirukkarukavur",
    img: "OIL · BRONZE LAMP",
    stars: 4.9,
    reviews: 333,
    sub: "For 3rd-trimester abhyangam",
  },
  "rahu-ketu-dosha-parihara": {
    tag: "For Sarpa Dosha",
    deity: "Sri Kalahasti · Andhra Pradesh",
    img: "KALAHASTI TEMPLE GOPURAM",
    stars: 4.8,
    reviews: 126,
    sub: "Performed at Sri Kalahasti · 11 priests",
  },
}

const INTENT_TILES: { title: string; sub: string; count: string; href: string }[] = [
  {
    title: "Health & healing",
    sub: "Mrityunjaya · Dhanvantri · Ayushya",
    count: "32 rituals",
    href: "/products/mrityunjaya-homam",
  },
  {
    title: "Family & children",
    sub: "Garbarakshambigai · Putra Kameshti · Annaprasana",
    count: "24 rituals",
    href: "/products/garbarakshambigai-ghee",
  },
  {
    title: "Career & wealth",
    sub: "Sudarshana · Lakshmi · Kubera",
    count: "18 rituals",
    href: "/products/sudarshana-homam",
  },
  {
    title: "Marriage",
    sub: "Swayamvara Parvathi · Kanchi Kamakshi",
    count: "12 rituals",
    href: "/products/swayamvara-parvathi-homam",
  },
  {
    title: "Astrology remedies",
    sub: "Rahu Ketu · Navagraha · Sani Peyarchi",
    count: "40 rituals",
    href: "/products/navagraha-homam",
  },
  {
    title: "For ancestors",
    sub: "Tila Homam · Tarpanam · Pitru Paksha",
    count: "9 rituals",
    href: "/products/thila-homam-rameswaram",
  },
]

const SUGGESTION_CHIPS = [
  "For my father's recovery from a stroke",
  "We've been trying to conceive",
  "Saturn return remedies",
  "My daughter's marriage is delayed",
]

const RECENT_VIDEOS = [
  {
    title: "Sudarshana Homam for the Iyer family",
    meta: "Featured · 14 min",
    placeholder: "SUDARSHANA HOMAM · APRIL 28",
    featured: true,
  },
  {
    title: "Ganapati Homam",
    meta: "April 24 · 11 min",
    placeholder: "GANAPATI HOMAM",
    featured: false,
  },
  {
    title: "Mrityunjaya Homam",
    meta: "April 20 · 22 min",
    placeholder: "MRITYUNJAYA HOMAM",
    featured: false,
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

export default function HomeV3({ products, countryCode }: HomeV3Props) {
  const byHandle = new Map(products.map((p) => [p.handle, p]))
  const featured = FEATURED_HANDLES.map((h) => byHandle.get(h)).filter(
    (p): p is HttpTypes.StoreProduct => !!p
  )

  return (
    <div style={{ background: "var(--paper)" }}>
      {/* HERO ----------------------------------------------------------- */}
      <section
        className="relative overflow-hidden"
        style={{ padding: "64px 24px 56px", background: "var(--paper)" }}
      >
        <KolamCorner
          size={80}
          style={{ position: "absolute", top: 18, left: 18, opacity: 0.5 }}
        />
        <KolamCorner
          size={80}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            transform: "scaleX(-1)",
            opacity: 0.5,
          }}
        />
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <CenterSigil size={14} />
            <span className="ph-eyebrow ph-eyebrow-gold">
              Welcome · Guided since 2009
            </span>
            <CenterSigil size={14} />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 400,
              lineHeight: 1.15,
              color: "var(--ink)",
              marginBottom: 18,
              letterSpacing: "-0.01em",
            }}
          >
            What would you like a{" "}
            <span style={{ color: "var(--sindoor)" }}>pooja</span> for?
          </h1>
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: "clamp(15px, 1.8vw, 17px)",
              fontWeight: 400,
              lineHeight: 1.6,
              color: "var(--ink-3)",
              maxWidth: 680,
              margin: "0 auto 28px",
            }}
          >
            Tell us what&apos;s on your mind — a worry, a wish, a moment in the family.
            We&apos;ll suggest the right prayer or spiritual remedy that facilitates your wish.
          </p>

          {/* Interactive chat input */}
          <HeroChatInput countryCode={countryCode} />
        </div>
        {/* Sentinel: overlay watches this to know when hero has scrolled out */}
        <div id="ask-hero-sentinel" style={{ height: 0 }} aria-hidden />
      </section>

      {/* FEATURED PRODUCTS --------------------------------------------- */}
      <section style={{ padding: "64px 24px", background: "var(--paper-2)" }}>
        <div className="content-container" style={{ paddingInline: 0 }}>
          <div className="flex flex-col small:flex-row small:items-end justify-between gap-4 mb-8">
            <SectionHeader
              eyebrow="Most-loved this season"
              title="Begin where most devotees do."
            />
            <LocalizedClientLink
              href="/store"
              className="ph-body-sm self-start small:self-auto"
              style={{
                color: "var(--ink)",
                borderBottom: "1px solid var(--ink-line-2)",
                paddingBottom: 2,
              }}
            >
              Browse all rituals →
            </LocalizedClientLink>
          </div>
          <div
            className="grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {featured.map((product) => {
              const overlay = FEATURED_OVERLAY[product.handle ?? ""]
              const price = formatPrice(product)
              return (
                <LocalizedClientLink
                  key={product.id}
                  href={`/products/${product.handle}`}
                  className="ph-card ph-lift block"
                >
                  {product.thumbnail ? (
                    <div
                      style={{
                        position: "relative",
                        height: 220,
                        overflow: "hidden",
                        background: "var(--ink)",
                      }}
                    >
                      <Image
                        src={product.thumbnail}
                        alt={product.title ?? ""}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    </div>
                  ) : (
                    <Img style={{ height: 220 }} deep>
                      {overlay?.img ?? product.title?.toUpperCase()}
                    </Img>
                  )}
                  <div style={{ padding: 22 }}>
                    <div className="flex items-center justify-between mb-2">
                      {overlay && <span className="ph-chip ph-chip-sindoor">{overlay.tag}</span>}
                      <Stars value={overlay?.stars ?? 4.9} size={12} />
                    </div>
                    <h3 className="ph-h3" style={{ marginBottom: 6 }}>
                      {product.title}
                    </h3>
                    <div className="ph-body-sm">
                      {overlay?.sub ?? product.subtitle ?? ""}
                    </div>
                    {overlay && (
                      <div
                        style={{
                          fontFamily: "var(--serif)",
                          fontSize: 13,
                          color: "var(--ink-4)",
                          marginTop: 12,
                        }}
                      >
                        {overlay.deity}
                      </div>
                    )}
                    <div className="flex items-center justify-between" style={{ marginTop: 16 }}>
                      <span
                        className="ph-num ph-h4"
                        style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontWeight: 600 }}
                      >
                        {price ?? ""}
                      </span>
                      <span
                        className="ph-body-sm"
                        style={{ color: "var(--sindoor)", fontWeight: 600 }}
                      >
                        View details →
                      </span>
                    </div>
                  </div>
                </LocalizedClientLink>
              )
            })}
          </div>
        </div>
      </section>

      {/* BROWSE BY INTENT ---------------------------------------------- */}
      <section style={{ padding: "64px 24px", background: "var(--paper)" }}>
        <div className="content-container" style={{ paddingInline: 0 }}>
          <SectionHeader
            align="center"
            eyebrow="Find a ritual that fits"
            title="Browse by what you're seeking"
            sub="Every prayer has a tradition. Tell us the question — we'll show you the answer."
          />
          <div
            className="grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
              marginTop: 40,
            }}
          >
            {INTENT_TILES.map((tile) => (
              <LocalizedClientLink
                key={tile.title}
                href={tile.href}
                className="ph-card-flat ph-lift relative block"
                style={{ padding: 24 }}
              >
                <div className="ph-h4" style={{ marginBottom: 6 }}>
                  {tile.title}
                </div>
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 13,
                    color: "var(--ink-3)",
                    lineHeight: 1.5,
                  }}
                >
                  {tile.sub}
                </div>
                <div
                  className="flex items-center justify-between"
                  style={{ marginTop: 16 }}
                >
                  <span className="ph-label ph-num">{tile.count}</span>
                  <span style={{ color: "var(--sindoor)" }}>→</span>
                </div>
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT HOMAM VIDEOS ------------------------------------------- */}
      <section style={{ padding: "64px 24px", background: "var(--paper-3)" }}>
        <div className="content-container" style={{ paddingInline: 0 }}>
          <div className="flex flex-col small:flex-row small:items-end justify-between gap-4 mb-8">
            <SectionHeader
              eyebrow="From our yagasala"
              title="Live recordings, sent to every devotee."
              sub="Every homam is performed by our priests in our own yagasala. The HD video is sent within 24 hours — proof, blessing and keepsake."
            />
            <button type="button" className="ph-btn ph-btn-ghost self-start small:self-auto">
              All recordings →
            </button>
          </div>
          <div
            className="grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(280px, 2fr) repeat(2, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {RECENT_VIDEOS.map((v) => (
              <div
                key={v.title}
                className="ph-card relative"
                style={v.featured ? { gridColumn: "1 / 2" } : undefined}
              >
                <Img style={{ height: 280 }} deep>
                  {v.placeholder}
                </Img>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: v.featured ? 64 : 44,
                      height: v.featured ? 64 : 44,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.95)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: v.featured ? 22 : 16,
                      color: "var(--sindoor)",
                      paddingLeft: 4,
                    }}
                  >
                    ▶
                  </span>
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 14,
                    left: 14,
                    right: 14,
                    color: "#faf6ee",
                  }}
                >
                  <div
                    className="ph-eyebrow"
                    style={{ color: "var(--gold)", fontSize: v.featured ? 11 : 9 }}
                  >
                    {v.meta}
                  </div>
                  <div
                    className={v.featured ? "ph-h3" : "ph-h4"}
                    style={{ color: "#faf6ee", marginTop: 3 }}
                  >
                    {v.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                Book a 30-min reading
              </LocalizedClientLink>
              <span
                className="ph-num ph-body-sm"
                style={{ color: "rgba(250,246,238,0.55)" }}
              >
                From ₹2,650 · in 6 languages
              </span>
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

      {/* WHATSAPP / FAQ TEASER ----------------------------------------- */}
      <section style={{ padding: "48px 24px", background: "var(--paper-2)" }}>
        <div
          className="content-container"
          style={{
            paddingInline: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          <div className="ph-card" style={{ padding: 28 }}>
            <div className="flex items-center gap-4">
              <span
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "var(--sage-soft)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  color: "var(--sage)",
                }}
              >
                ♉
              </span>
              <span className="flex-1">
                <span className="ph-h4 block">Muhurat reminders on WhatsApp</span>
                <span className="ph-body-sm">
                  Auspicious dates · ekadasi · pradosha · your nakshatra
                </span>
              </span>
              <button type="button" className="ph-btn ph-btn-primary">
                Subscribe
              </button>
            </div>
          </div>
          <div className="ph-card" style={{ padding: 28 }}>
            <div className="flex items-center gap-4">
              <span
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "var(--gold-soft)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  color: "var(--gold-2)",
                }}
              >
                ?
              </span>
              <span className="flex-1">
                <span className="ph-h4 block">63 questions, answered.</span>
                <span className="ph-body-sm">
                  How poojas work · payments · refunds · prasadam
                </span>
              </span>
              <LocalizedClientLink href="/faq" className="ph-btn ph-btn-ghost">
                Read FAQ
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </section>

      {/* Footer signature ---------------------------------------------- */}
      <div style={{ padding: "32px 24px", textAlign: "center" }}>
        <Logo size={28} />
      </div>
    </div>
  )
}
