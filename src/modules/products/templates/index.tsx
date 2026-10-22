import Link from "next/link"
import { Suspense } from "react"

import { HttpTypes } from "@medusajs/types"
import { localizeHref } from "@lib/util/localize-href"
import {
  getProductGalleryImages,
  getProductGalleryEntries,
  getMockProductDetailContent,
  howItWorksSteps,
} from "@lib/mock-storefront"
import { ProductFaqEntry } from "@lib/data/product-faq-content"
import type { LangCode } from "@lib/i18n/languages"

import ProductActionsWrapper from "./product-actions-wrapper"
import ProductSpread, { BundleProductSpread } from "./product-spread"
import LandingSpread from "./landing-spread"
import { LANDING_PRODUCTS } from "@lib/data/landing-products"
import { PRODUCT_BUNDLES } from "@lib/data/product-bundles"
import RelatedProducts from "../components/related-products"
import TrackOnMount from "@/components/analytics/track-on-mount"
import { getProductPrice } from "@lib/util/get-product-price"

// Videos shown once, under "About This Ritual", for specific products (keyed by handle).
const PRODUCT_VIDEOS: Record<string, { youtubeId: string; title: string }> = {
  "sudarsana-homam": { youtubeId: "1Ycn82X6VP4", title: "How a homam is performed at PariharaOnline" },
}

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
  // Real, product-specific Q&A (hero product pages only) — see
  // src/lib/data/product-faq-content.ts. Rendered as visible, liftable
  // answer-shaped content in addition to FAQPage JSON-LD (MAN-18).
  faqEntries?: ProductFaqEntry[]
  // i18n — display-only, never affects product/JSON-LD data (page.tsx keeps
  // `product` itself in English for structured data; these are pre-translated
  // separately so a translation hiccup can never corrupt the real product data).
  lang?: LangCode
  hintedLang?: LangCode | null
  translatedTitle?: string
  translatedDescription?: string | null
}

export default function ProductTemplate({
  product,
  region,
  countryCode,
  images,
  faqEntries,
  lang = "en",
  hintedLang,
  translatedTitle,
  translatedDescription,
}: ProductTemplateProps) {
  const displayTitle = lang !== "en" && translatedTitle ? translatedTitle : product.title
  const displayDescription =
    lang !== "en" && translatedDescription !== undefined ? translatedDescription : product.description
  const content = getMockProductDetailContent(product)
  const galleryEntries = getProductGalleryEntries(product)
  const displayEntries = galleryEntries.length
    ? galleryEntries
    : images
        .slice(0, 6)
        .filter((img) => !!img.url)
        .map((img, i) => ({ url: img.url as string, alt: i === 0 ? product.title : `${product.title} — image ${i + 1}` }))
  const displayGallery = displayEntries.map((e) => e.url)
  const altFor = (src: string | null, fallback: string) =>
    displayEntries.find((e) => e.url === src)?.alt || fallback

  // Prasadam is a physical item, not a ritual: different card wording and button.
  const isPrasad = /prasad/i.test(`${product.collection?.handle ?? ""} ${product.collection?.title ?? ""} ${product.title ?? ""}`)
  const currency = region.currency_code
  const landing = product.handle ? LANDING_PRODUCTS[product.handle] : undefined

  let viewPrice = 0
  try {
    viewPrice = getProductPrice({ product }).cheapestPrice?.calculated_price_number ?? 0
  } catch {}

  return (
    <div style={{ background: "var(--paper)" }}>
      <TrackOnMount
        event="view_item"
        params={{ currency: currency.toUpperCase(), value: viewPrice, items: [{ item_id: product.id, item_name: product.title, price: viewPrice, item_category: product.collection?.title ?? undefined }] }}
      />
      <div style={{ borderTop: "1px solid var(--ink-line)" }} />

      {/* Breadcrumb (not on special landing pages: it wraps to several lines on phones) */}
      {!landing && (
      <div className="content-container" style={{ paddingTop: 18, paddingBottom: 4 }}>
        <nav style={{ display: "flex", alignItems: "center", gap: 6 }} aria-label="breadcrumb">
          <Link
            href={localizeHref(countryCode, "/")}
            style={{ fontSize: 12, color: "var(--ink-4)", textDecoration: "none" }}
          >
            Home
          </Link>
          <span style={{ fontSize: 12, color: "var(--ink-line-2)" }}>/</span>
          <Link
            href={
              product.collection?.handle
                ? localizeHref(countryCode, `/collections/${product.collection.handle}`)
                : localizeHref(countryCode, "/store")
            }
            style={{ fontSize: 12, color: "var(--ink-4)", textDecoration: "none" }}
          >
            {product.collection?.title || "Rituals"}
          </Link>
          <span style={{ fontSize: 12, color: "var(--ink-line-2)" }}>/</span>
          <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 500 }}>
            {product.title}
          </span>
        </nav>
      </div>

      )}

      {/* ── Product page spread: story + gallery on the left, booking card fixed on the right ── */}
      {landing ? (
        <LandingSpread
          title={displayTitle}
          lang={lang}
          hintedLang={hintedLang}
          description={displayDescription}
          gallery={displayEntries}
          review={content.review}
          currency={currency}
          config={landing}
          actions={
            <Suspense fallback={<div style={{ height: 52, borderRadius: 10, background: "var(--sindoor)", opacity: 0.7 }} />}>
              <ProductActionsWrapper
                id={product.id}
                region={region}
                showPujaDetails={false}
                showPrice={true}
                buttonText={landing.kind === "pooja" ? "Book this pooja" : "Add to cart"}
                buttonClassName="ph-btn ph-btn-sindoor ph-btn-lg ph-btn-block"
                stickyWhen="away"
              />
            </Suspense>
          }
        />
      ) : product.handle && PRODUCT_BUNDLES[product.handle] ? (
        <BundleProductSpread
          product={product}
          region={region}
          title={displayTitle}
          lang={lang}
          hintedLang={hintedLang}
          description={displayDescription}
          gallery={displayEntries}
          review={content.review}
          video={product.handle ? PRODUCT_VIDEOS[product.handle] : null}
          currency={currency}
        />
      ) : (
        <ProductSpread
          product={product}
          title={displayTitle}
          lang={lang}
          hintedLang={hintedLang}
          description={displayDescription}
          gallery={displayEntries}
          review={content.review}
          video={product.handle ? PRODUCT_VIDEOS[product.handle] : null}
          currency={currency}
          isPrasad={isPrasad}
          actions={
            <Suspense fallback={<div style={{ height: 52, borderRadius: 10, background: "var(--sindoor)", opacity: 0.7 }} />}>
              <ProductActionsWrapper
                id={product.id}
                region={region}
                showPujaDetails={false}
                showPrice={true}
                buttonText={isPrasad ? "Add to cart" : "Book this pooja"}
                buttonClassName="ph-btn ph-btn-sindoor ph-btn-lg ph-btn-block"
              />
            </Suspense>
          }
        />
      )}

      {/* ── How It Works — dark section ──────────────────────── */}
      <section style={{ background: "var(--ink)", padding: "64px 0" }}>
        <div className="content-container">
          <h2 className="ph-h2" style={{ color: "var(--paper)", marginBottom: 40 }}>
            How It Works
          </h2>
          <style>{`
            @media (min-width: 768px) {
              .how-it-works-grid { grid-template-columns: repeat(4, 1fr) !important; }
            }
          `}</style>
          <div
            className="how-it-works-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}
          >
            {howItWorksSteps.map((step, index) => (
              <article
                key={step.title}
                style={{
                  borderRadius: 14,
                  background: "rgba(250,246,238,0.06)",
                  border: "1px solid rgba(250,246,238,0.1)",
                  padding: 24,
                  textAlign: "center",
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
                    fontSize: 13,
                    fontWeight: 700,
                    margin: "0 auto 16px",
                  }}
                >
                  {index + 1}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--paper)",
                    margin: "0 0 10px",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="ph-body-sm"
                  style={{ color: "rgba(250,246,238,0.65)", margin: 0, lineHeight: 1.6 }}
                >
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Real, product-specific FAQ (hero products only) ─────── */}
      {faqEntries && faqEntries.length > 0 && (
        <section style={{ background: "var(--paper-2)", padding: "64px 0" }}>
          <div className="content-container" style={{ maxWidth: 860 }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <p className="ph-eyebrow ph-eyebrow-gold" style={{ marginBottom: 10 }}>
                Frequently asked
              </p>
              <h2 className="ph-h2">About {product.title}.</h2>
            </div>

            <div>
              {faqEntries.map((faq, i) => (
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
                        fontSize: 21,
                        fontWeight: 500,
                        color: "var(--ink)",
                        lineHeight: 1.25,
                      }}
                      lang={lang !== "en" ? lang : undefined}
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
                  <div
                    className="ph-body"
                    style={{ paddingBottom: 22, color: "var(--ink-2)", lineHeight: 1.7 }}
                    lang={lang !== "en" ? lang : undefined}
                  >
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section style={{ background: "var(--paper)", padding: "64px 0" }}>
        <div className="content-container" style={{ maxWidth: 860 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p className="ph-eyebrow ph-eyebrow-gold" style={{ marginBottom: 10 }}>
              Common questions
            </p>
            <h2 className="ph-h2">Before you book.</h2>
          </div>

          <div>
            {[
              {
                q: "How soon will the puja be performed after booking?",
                a: "Most pujas are scheduled within 3–7 days of booking. You'll receive a confirmation with the tentative date within 1–2 business days.",
              },
              {
                q: "Will I receive proof that the puja was done?",
                a: "Yes — we send ritual completion photos, and for homams a short video clip, via WhatsApp or email after the ceremony.",
              },
              {
                q: "How do I provide my devotee details (sankalpam)?",
                a: "You'll be asked for name, nakshatram (birth star), rasi, and gothram in the cart before checkout. The puja is valid with just a name and prayer if you don't have the others.",
              },
              {
                q: "Is prasadam sent internationally?",
                a: "Yes. Prasadam is sent worldwide via Speed Post (India) or EMS (International). Delivery typically takes 7–21 days depending on the destination.",
              },
              {
                q: "Can I book this for someone else?",
                a: "Absolutely. You can enter any devotee's details in the cart. Many bookings are made by family members on behalf of parents, children, or loved ones abroad.",
              },
            ].map((faq, i) => (
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
                      fontSize: 21,
                      fontWeight: 500,
                      color: "var(--ink)",
                      lineHeight: 1.25,
                    }}
                  >
                    {faq.q}
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
                <div
                  className="ph-body"
                  style={{ paddingBottom: 22, color: "var(--ink-2)", lineHeight: 1.7 }}
                >
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <a
              href={localizeHref(countryCode, "/faq")}
              className="ph-body-sm"
              style={{
                color: "var(--ink)",
                borderBottom: "1px solid var(--ink-line-2)",
                paddingBottom: 2,
                textDecoration: "none",
              }}
            >
              See all questions →
            </a>
          </div>
        </div>
      </section>

      {/* ── Related products ──────────────────────────────────── */}
      <section style={{ background: "var(--paper-2)", padding: "64px 0" }}>
        <div className="content-container">
          <RelatedProducts product={product} countryCode={countryCode} />
        </div>
      </section>
    </div>
  )
}
