import { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { KolamCorner, CenterSigil, SectionHeader } from "@modules/common/components/brand"
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  extractHowToFromDescription,
  ProductFaqEntry,
} from "@lib/util/json-ld"
import BuyButtons from "./buy-buttons"

// DRAFT — MAN-19 sample landing page, built for local review only. Not
// linked from nav/sitemap yet; visit directly at
// /pages/rahu-ketu-pooja-kala-sarpa-dosha-remedy to preview.
// Rendered per-request so pricing reflects the visitor's region (INR for
// India, USD otherwise), same pattern as the pregnancy-poojas hub page.
export const dynamic = "force-dynamic"

const PAGE_PATH = "/pages/rahu-ketu-pooja-kala-sarpa-dosha-remedy"
const PRODUCT_HANDLE =
  "rahu-ketu-dosha-parihara-pooja-sarpa-dosha-parihara-pooja-at-sri-kalahasti-temple"

export const metadata: Metadata = {
  title: "Rahu Ketu Dosha & Kala Sarpa Parihara Pooja at Sri Kalahasti Temple",
  description:
    "Rahu Ketu Dosha Parihara Pooja (Sarpa Dosha Parihara / Kala Sarpa Dosha remedy) performed on your behalf at Sri Kalahasti Temple — for marriage delays, fertility struggles, and difficult planetary influences. Book online, no travel required.",
  alternates: { canonical: PAGE_PATH },
  openGraph: { url: PAGE_PATH },
}

// Real Q&A grounded in the live Medusa product description for this handle
// (see src/lib/data/product-faq-content.ts for the shorter set already on
// the product page — these two extra entries pull additional detail already
// present in that same description: timing and benefits).
const FAQ_ENTRIES: ProductFaqEntry[] = [
  {
    question: "What is Rahu Ketu pooja and who should do it?",
    answer:
      "The Rahu Ketu Dosha Parihara Pooja (also called Sarpa Dosha Parihara Pooja or Kala Sarpa Dosha remedy) at Sri Kalahasti Temple is a Vedic remedy for the negative effects of Rahu, Ketu, and Kala Sarpa dosha in a person's horoscope. It's recommended for individuals with a Rahu/Ketu or Kala Sarpa dosha, unmarried individuals facing repeated obstacles in marriage, couples struggling to conceive, and anyone seeking to mitigate difficult planetary influences.",
  },
  {
    question: "Why is Sri Kalahasti Temple used specifically for Rahu Ketu remedies?",
    answer:
      "Sri Kalahasti is one of the Panchabhoota Sthalams (representing the element of Wind) and one of South India's most revered Shiva temples, known for its self-manifested (swayambhu) air-linga. It's considered especially powerful for Rahu-Ketu related doshas, and thousands of devotees travel there every year specifically for this parihara — many returning to fulfil vows after receiving positive results.",
  },
  {
    question: "How is the pooja performed if I can't travel to Sri Kalahasti myself?",
    answer:
      "A PariharaOnline representative performs the pooja on your behalf at the temple. The ritual involves worshipping a silver snake (sarpam), offering prayers to Lord Shiva, and donating the silver snake to the temple's hundi in your name — after your sankalpam (name, nakshatram, gothram) is submitted. This booking covers one person; increase the quantity for additional devotees.",
  },
  {
    question: "When is the best time to perform this pooja?",
    answer:
      "For best results, it's traditionally recommended on Sundays or Tuesdays during Rahu Kalam, though our representative can perform it on your behalf on any day between 6:30 AM and 9:00 PM.",
  },
  {
    question: "What are the benefits of the Rahu Ketu Dosha Parihara Pooja?",
    answer:
      "Devotees perform this pooja seeking mitigation of Rahu-Ketu doshas, removal of obstacles in marriage, assistance with childbirth for couples, overall improvement in life circumstances, and spiritual growth through connection with Lord Shiva.",
  },
]

async function fetchProduct(countryCode: string) {
  const product = await listProducts({
    countryCode,
    queryParams: { handle: PRODUCT_HANDLE },
  })
    .then(({ response }) => response.products[0])
    .catch(() => null)
  if (!product) return null

  const { cheapestPrice } = getProductPrice({ product })
  const variant = product.variants?.[0]

  return {
    product,
    priceLabel: cheapestPrice?.calculated_price ?? null,
    priceNumber: cheapestPrice?.calculated_price_number ?? null,
    currency: cheapestPrice?.currency_code ?? null,
    variantId: variant?.id as string | undefined,
    maxQuantity:
      variant?.manage_inventory && !variant?.allow_backorder
        ? Math.max(variant.inventory_quantity || 0, 1)
        : undefined,
  }
}

type Props = { params: Promise<{ countryCode: string }> }

export default async function RahuKetuPoojaPage(props: Props) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)
  if (!region) notFound()

  const data = await fetchProduct(countryCode)
  if (!data) notFound()
  const { product, priceLabel, priceNumber, currency, variantId, maxQuantity } = data

  const galleryImages = ((product.images as { url: string }[]) ?? [])
    .map((i) => i.url)
    .filter(Boolean)

  const cleanTitle = product.title.replace(/\s+/g, " ").trim()

  const howTo = extractHowToFromDescription({
    title: cleanTitle,
    description: product.description,
    url: PAGE_PATH,
  })

  const jsonLdBlocks = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Poojas & Homams", url: "/store" },
      { name: "Rahu Ketu Dosha Parihara Pooja", url: PAGE_PATH },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: cleanTitle,
      description:
        "Rahu Ketu Dosha Parihara Pooja / Sarpa Dosha Parihara Pooja performed on your behalf at Sri Kalahasti Temple.",
      image: product.thumbnail || undefined,
      brand: { "@type": "Brand", name: "PariharaOnline" },
      ...(priceNumber && {
        offers: {
          "@type": "Offer",
          price: priceNumber,
          priceCurrency: currency?.toUpperCase(),
          availability: "https://schema.org/InStock",
          url: `https://www.pariharaonline.com/products/${product.handle}`,
        },
      }),
    },
    buildFaqJsonLd(FAQ_ENTRIES),
    ...(howTo ? [howTo] : []),
  ]

  return (
    <div style={{ background: "var(--paper)" }}>
      {jsonLdBlocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ padding: "64px 24px 56px", background: "var(--paper)" }}
      >
        <KolamCorner size={80} style={{ position: "absolute", top: 18, left: 18, opacity: 0.5 }} />
        <KolamCorner
          size={80}
          style={{ position: "absolute", top: 18, right: 18, transform: "scaleX(-1)", opacity: 0.5 }}
        />
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <CenterSigil size={14} />
            <span className="ph-eyebrow ph-eyebrow-gold">Sri Kalahasti Temple · Andhra Pradesh</span>
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
            Rahu Ketu Dosha &amp; <span style={{ color: "var(--sindoor)" }}>Kala Sarpa</span> Parihara Pooja
          </h1>
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: "clamp(15px, 1.8vw, 17px)",
              color: "var(--ink-3)",
              maxWidth: 680,
              margin: "0 auto 28px",
            }}
          >
            One of the most effective remedies for Rahu/Ketu and Kala Sarpa dosha — performed at
            Sri Kalahasti Temple by our representative, on your behalf. No travel required; your
            sankalpam is submitted and the pooja is done in your name.
          </p>
          <a href="#book" className="ph-btn ph-btn-sindoor ph-btn-lg">
            Book this pooja
          </a>
        </div>
      </section>

      {/* ── Who this is for ──────────────────────────────────── */}
      <section style={{ padding: "56px 0" }}>
        <div className="content-container" style={{ maxWidth: 860 }}>
          <SectionHeader
            eyebrow="Who this pooja is for"
            title="Do any of these describe you?"
            align="center"
          />
          <div
            className="grid grid-cols-1 sm:grid-cols-2"
            style={{ gap: 16, marginTop: 32 }}
          >
            {[
              "You have a Rahu / Ketu dosha or Kala Sarpa dosha in your horoscope",
              "You're unmarried and facing repeated, unexplained obstacles to marriage",
              "You and your partner are struggling to conceive",
              "You're seeking to mitigate difficult planetary influences generally",
            ].map((text) => (
              <div
                key={text}
                className="ph-card-flat"
                style={{ padding: "18px 20px", display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <span style={{ color: "var(--sindoor)", fontSize: 15, lineHeight: "24px" }}>●</span>
                <span className="ph-body" style={{ color: "var(--ink-2)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About the temple ─────────────────────────────────── */}
      <section style={{ padding: "56px 0", background: "var(--paper-2)" }}>
        <div className="content-container" style={{ maxWidth: 1000 }}>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 48, alignItems: "center" }}>
            <div
              style={{
                position: "relative",
                aspectRatio: "4/3",
                borderRadius: 14,
                overflow: "hidden",
                background: "var(--paper-3)",
              }}
            >
              {product.thumbnail && (
                <Image
                  src={product.thumbnail}
                  alt="Sri Kalahasti Temple"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              )}
            </div>
            <div>
              <p className="ph-eyebrow ph-eyebrow-sindoor" style={{ marginBottom: 10 }}>
                Why Sri Kalahasti
              </p>
              <h2 className="ph-h2" style={{ marginBottom: 16 }}>
                A Panchabhoota Sthalam, revered for Rahu-Ketu parihara.
              </h2>
              <p className="ph-body" style={{ color: "var(--ink-2)", marginBottom: 12 }}>
                Sri Kalahasti is one of the five Panchabhoota Sthalams — representing the element
                of Wind — and one of South India's most famous Shiva temples, renowned for its
                self-manifested (swayambhu) air-linga. It's considered especially powerful for
                Rahu-Ketu related issues, and this pooja involves worshipping a silver snake
                (sarpam), which is then offered to the temple as a donation in the hundi.
              </p>
              <p className="ph-body" style={{ color: "var(--ink-2)" }}>
                Thousands of devotees from India and abroad perform this puja every year, often
                returning to fulfil vows after receiving positive results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it's performed ───────────────────────────────── */}
      <section style={{ background: "var(--ink)", padding: "64px 0" }}>
        <div className="content-container" style={{ maxWidth: 900, textAlign: "center" }}>
          <p className="ph-eyebrow" style={{ color: "var(--gold-soft)", marginBottom: 10 }}>
            Can't travel to Sri Kalahasti?
          </p>
          <h2 className="ph-h2" style={{ color: "var(--paper)", marginBottom: 40 }}>
            Here's how we perform it on your behalf.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 20 }}>
            {[
              "Worshipping a silver snake (sarpam) at the temple",
              "Offering prayers to Lord Shiva in your name (sankalpam)",
              "Donating the silver snake to the temple's hundi",
            ].map((step, i) => (
              <div
                key={step}
                style={{
                  background: "rgba(250,246,238,0.06)",
                  border: "1px solid rgba(250,246,238,0.1)",
                  borderRadius: 14,
                  padding: "28px 20px",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--sindoor)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    margin: "0 auto 16px",
                  }}
                >
                  {i + 1}
                </div>
                <p className="ph-body-sm" style={{ color: "rgba(250,246,238,0.75)" }}>{step}</p>
              </div>
            ))}
          </div>
          <p className="ph-body-sm" style={{ color: "rgba(250,246,238,0.55)", marginTop: 28 }}>
            Recommended on Sundays or Tuesdays during Rahu Kalam — but performed for you any day,
            6:30 AM to 9:00 PM.
          </p>
        </div>
      </section>

      {/* ── Booking card ──────────────────────────────────────── */}
      <section id="book" style={{ padding: "64px 0" }}>
        <div className="content-container" style={{ maxWidth: 620 }}>
          <div className="ph-card" style={{ padding: 32 }}>
            <p className="ph-eyebrow ph-eyebrow-gold" style={{ marginBottom: 10 }}>
              Book this pooja
            </p>
            <h2 className="ph-h3" style={{ marginBottom: 8 }}>{cleanTitle}</h2>
            <p className="ph-body-sm" style={{ color: "var(--ink-4)", marginBottom: 20 }}>
              This booking covers one person. Increase the quantity below for additional
              devotees.
            </p>

            {priceLabel && (
              <p style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--ink)", marginBottom: 20 }}>
                {priceLabel}
              </p>
            )}

            <BuyButtons variantId={variantId} countryCode={countryCode} maxQuantity={maxQuantity} />

            <div style={{ marginTop: 20 }}>
              <LocalizedClientLink
                href={`/products/${product.handle}`}
                className="ph-body-sm"
                style={{ color: "var(--sindoor)", fontWeight: 600, textDecoration: "none" }}
              >
                Full details, sankalpam form &amp; more photos →
              </LocalizedClientLink>
            </div>
          </div>

          {galleryImages.length > 1 && (
            <div className="grid grid-cols-3" style={{ gap: 10, marginTop: 20 }}>
              {galleryImages.slice(0, 3).map((url) => (
                <div
                  key={url}
                  style={{
                    position: "relative",
                    aspectRatio: "1/1",
                    borderRadius: 10,
                    overflow: "hidden",
                    border: "1px solid var(--ink-line)",
                  }}
                >
                  <Image src={url} alt="Sri Kalahasti Temple" fill className="object-cover" sizes="200px" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section style={{ background: "var(--paper-2)", padding: "64px 0" }}>
        <div className="content-container" style={{ maxWidth: 860 }}>
          <SectionHeader eyebrow="Frequently asked" title="About this pooja." align="center" />
          <div style={{ marginTop: 32 }}>
            {FAQ_ENTRIES.map((faq, i) => (
              <details key={i} style={{ borderBottom: "1px solid var(--ink-line)" }}>
                <summary
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "22px 0",
                    cursor: "pointer",
                    listStyle: "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: 19,
                      fontWeight: 500,
                      color: "var(--ink)",
                      lineHeight: 1.25,
                    }}
                  >
                    {faq.question}
                  </span>
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      border: "1px solid var(--ink-line-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 18,
                      color: "var(--ink)",
                    }}
                  >
                    +
                  </span>
                </summary>
                <div className="ph-body" style={{ paddingBottom: 22, color: "var(--ink-2)", lineHeight: 1.7 }}>
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Close ────────────────────────────────────────────── */}
      <section style={{ padding: "56px 0" }}>
        <div className="content-container" style={{ maxWidth: 640, textAlign: "center" }}>
          <h2 className="ph-h2" style={{ marginBottom: 12 }}>A spiritual concierge you can trust</h2>
          <p className="ph-body" style={{ color: "var(--ink-3)", marginBottom: 24 }}>
            We are devotees who bring the temple's blessings to you, wherever you are. Your
            sankalpam details are collected securely, the pooja is performed in your name, and
            you'll receive confirmation once it's done.
          </p>
          <p className="ph-body-sm" style={{ color: "var(--ink-4)" }}>
            Questions? WhatsApp <strong style={{ color: "var(--sindoor)" }}>+91 97432 44501</strong>{" "}
            or ask on{" "}
            <LocalizedClientLink href="/ask-parihara" style={{ color: "var(--sindoor)" }}>
              Ask Parihara
            </LocalizedClientLink>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
