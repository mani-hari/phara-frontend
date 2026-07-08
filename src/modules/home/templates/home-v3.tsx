import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  CenterSigil,
  Img,
  KolamCorner,
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
  "garbharakshambika-ghee",
  "garbharakshambika-oil",
  "rahu-ketu-dosha-parihara-pooja-sarpa-dosha-parihara-pooja-at-sri-kalahasti-temple",
] as const

const FEATURED_OVERLAY: Record<
  string,
  { tag: string; deity: string; img: string; stars: number; reviews: number; sub: string }
> = {
  "garbharakshambika-ghee": {
    tag: "For Conceiving",
    deity: "Garbarakshambigai · Tirukkarukavur",
    img: "GHEE · LAMP IN COPPER VESSEL",
    stars: 4.9,
    reviews: 281,
    sub: "Temple-blessed prasadham · sealed glass jar",
  },
  "garbharakshambika-oil": {
    tag: "For Safe Delivery",
    deity: "Garbarakshambigai · Tirukkarukavur",
    img: "OIL · BRONZE LAMP",
    stars: 4.9,
    reviews: 333,
    sub: "For 3rd-trimester abhyangam",
  },
  "rahu-ketu-dosha-parihara-pooja-sarpa-dosha-parihara-pooja-at-sri-kalahasti-temple": {
    tag: "For Sarpa Dosha",
    deity: "Sri Kalahasti · Andhra Pradesh",
    img: "KALAHASTI TEMPLE GOPURAM",
    stars: 4.8,
    reviews: 126,
    sub: "Performed at Sri Kalahasti · 11 priests",
  },
}

const INTENT_TILES: { title: string; sub: string; prompt: string }[] = [
  {
    title: "Health & healing",
    sub: "Mrityunjaya · Dhanvantri · Ayushya",
    prompt: "I'm looking for a pooja for health and healing",
  },
  {
    title: "Family & children",
    sub: "Garbarakshambigai · Putra Kameshti · Annaprasana",
    prompt: "I want a pooja for family and children",
  },
  {
    title: "Career & wealth",
    sub: "Sudarshana · Lakshmi · Kubera",
    prompt: "Which pooja helps with career and wealth?",
  },
  {
    title: "Marriage",
    sub: "Swayamvara Parvathi · Kanchi Kamakshi",
    prompt: "A pooja to help with marriage",
  },
  {
    title: "Astrology remedies",
    sub: "Rahu Ketu · Navagraha · Sani Peyarchi",
    prompt: "I need astrology remedies",
  },
  {
    title: "For ancestors",
    sub: "Tila Homam · Tarpanam · Pitru Paksha",
    prompt: "Poojas for my ancestors (pitru)",
  },
]

const SUGGESTION_CHIPS = [
  "For my father's recovery from a stroke",
  "We've been trying to conceive",
  "Saturn return remedies",
  "My daughter's marriage is delayed",
]

// TODO: replace youtubeId with the real YouTube video IDs (the part after
// watch?v=). Empty IDs render a "add video" placeholder so nothing wrong ships.
const RECENT_VIDEOS: { title: string; meta: string; youtubeId: string }[] = [
  { title: "Sudarshana Homam", meta: "Performed in our yagasala", youtubeId: "1Ycn82X6VP4" },
  { title: "Ganapati Homam", meta: "Performed in our yagasala", youtubeId: "" },
  { title: "Mrityunjaya Homam", meta: "Performed in our yagasala", youtubeId: "" },
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
          <div className="mb-8">
            <SectionHeader title="Most popular poojas" />
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
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    </div>
                  ) : (
                    <Img style={{ height: 220 }} deep>
                      {overlay?.img ?? product.title?.toUpperCase()}
                    </Img>
                  )}
                  <div style={{ padding: 22 }}>
                    <div className="flex items-center mb-2">
                      {overlay && <span className="ph-chip ph-chip-sindoor">{overlay.tag}</span>}
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
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <LocalizedClientLink
              href="/collections/pujas-and-homams"
              className="ph-body-sm"
              style={{ color: "var(--ink)", borderBottom: "1px solid var(--ink-line-2)", paddingBottom: 2 }}
            >
              Browse all poojas →
            </LocalizedClientLink>
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
                href={`/ask-parihara?q=${encodeURIComponent(tile.prompt)}`}
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
                  className="flex items-center justify-end"
                  style={{ marginTop: 16 }}
                >
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
          <div className="mb-8">
            <SectionHeader
              eyebrow="From our yagasala"
              title="Video snippets of your Homams / Yagnas"
              sub="Every homam is performed by our priests in our own yagasala. The HD video clips are sent within 24 hours — proof, blessing and keepsake."
            />
          </div>
          <div
            className="grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
                    <iframe
                      src={`https://www.youtube.com/embed/${v.youtubeId}`}
                      title={v.title}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                    />
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
                  <div className="ph-h4" style={{ marginBottom: 2 }}>{v.title}</div>
                  <div className="ph-body-sm">{v.meta}</div>
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
                Ask our astrologer
              </LocalizedClientLink>
              <span
                className="ph-body-sm"
                style={{ color: "rgba(250,246,238,0.55)" }}
              >
                Available in 6 languages
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
