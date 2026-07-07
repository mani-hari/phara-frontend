import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

import { HttpTypes } from "@medusajs/types"
import { localizeHref } from "@lib/util/localize-href"
import {
  getProductGalleryImages,
  getMockProductDetailContent,
  howItWorksSteps,
} from "@lib/mock-storefront"

import ProductActionsWrapper from "./product-actions-wrapper"
import RelatedProducts from "../components/related-products"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

export default function ProductTemplate({
  product,
  region,
  countryCode,
  images,
}: ProductTemplateProps) {
  const content = getMockProductDetailContent(product)
  const gallery = getProductGalleryImages(product)
  const displayGallery = gallery.length
    ? gallery
    : images.slice(0, 6).map((img) => img.url).filter(Boolean)

  // Split on double-newline so each paragraph renders cleanly
  const descriptionParagraphs = content.description
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const primaryImg = displayGallery[0] ?? null
  const secondImg = displayGallery[1] ?? null
  const gridImgs = displayGallery.slice(2)

  return (
    <div style={{ background: "var(--paper)" }}>
      <div style={{ borderTop: "1px solid var(--ink-line)" }} />

      {/* Breadcrumb */}
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

      {/* ── Main 2-col section ─────────────────────────────────── */}
      <section
        className="content-container"
        style={{ paddingTop: 24, paddingBottom: 64 }}
        data-testid="product-container"
      >
        <style>{`
          @media (min-width: 1024px) {
            .product-main-grid { grid-template-columns: 1.15fr 1fr !important; gap: 56px !important; }
          }
        `}</style>
        <div
          className="product-main-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: 40 }}
        >
          {/* ── LEFT: image gallery ───────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {primaryImg ? (
              <>
                {/* First image — full width */}
                <div
                  style={{
                    position: "relative",
                    height: 480,
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "var(--paper-2)",
                  }}
                >
                  <Image
                    src={primaryImg}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 640px"
                    priority
                  />
                </div>

                {/* Second image — same height as primary */}
                {secondImg && (
                  <div
                    style={{
                      position: "relative",
                      height: 480,
                      borderRadius: 14,
                      overflow: "hidden",
                      background: "var(--paper-2)",
                    }}
                  >
                    <Image
                      src={secondImg}
                      alt={`${product.title} 2`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 640px"
                    />
                  </div>
                )}

                {/* Remaining images — 2-col grid */}
                {gridImgs.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    {gridImgs.map((src, i) => (
                      <div
                        key={`${src}-${i}`}
                        style={{
                          position: "relative",
                          height: 240,
                          borderRadius: 10,
                          overflow: "hidden",
                          background: "var(--paper-2)",
                        }}
                      >
                        <Image
                          src={src}
                          alt={`${product.title} ${i + 3}`}
                          fill
                          className="object-cover"
                          sizes="320px"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Fallback placeholder */
              <div
                style={{
                  height: 480,
                  borderRadius: 14,
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(184,135,70,0.18), transparent 60%), radial-gradient(circle at 70% 70%, rgba(182,68,46,0.12), transparent 60%), var(--paper-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 12,
                  textAlign: "center",
                  padding: 32,
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 32,
                    color: "var(--ink)",
                    fontWeight: 400,
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  {product.title}
                </p>
                <p className="ph-body-sm" style={{ color: "var(--ink-4)" }}>
                  Imagery available in the temple management portal
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT: product info ───────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Category chips */}
            {content.heroTags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {content.heroTags.map((tag) => (
                  <span
                    key={tag.label}
                    className="ph-chip"
                    style={{
                      background: tag.bg,
                      color: tag.color,
                      borderColor: "transparent",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="ph-h1" style={{ margin: 0 }} data-testid="product-title">
              {product.title}
            </h1>

            <div style={{ height: 1, background: "var(--ink-line)" }} />

            {/* Effective For — ordered list */}
            <div>
              <p
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--ink-4)",
                  marginBottom: 12,
                  margin: "0 0 12px",
                }}
              >
                This pooja is for
              </p>
              <ol
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {content.effectiveFor.map((item, idx) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "rgba(182,68,46,0.10)",
                        color: "var(--sindoor)",
                        fontFamily: "var(--sans)",
                        fontSize: 11,
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 1,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--sans)",
                        fontSize: 14,
                        color: "var(--ink-2)",
                        lineHeight: 1.45,
                      }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div style={{ height: 1, background: "var(--ink-line)" }} />

            {/* ── Booking card ─────────────────────────────────── */}
            <div
              style={{
                border: "1px solid var(--ink-line)",
                borderRadius: 14,
                overflow: "hidden",
                background: "var(--paper)",
                boxShadow: "0 2px 20px rgba(26,20,16,0.07)",
              }}
            >
              {/* Card header */}
              <div
                style={{
                  padding: "16px 20px",
                  background: "rgba(182,68,46,0.04)",
                  borderBottom: "1px solid var(--ink-line)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--sindoor)",
                    flexShrink: 0,
                  }}
                />
                <p
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--ink-3)",
                    margin: 0,
                  }}
                >
                  Book This Ritual
                </p>
              </div>

              {/* Card body — variant selector + price + button */}
              <div style={{ padding: 20 }}>
                <Suspense
                  fallback={
                    <div
                      style={{
                        height: 52,
                        borderRadius: 10,
                        background: "var(--sindoor)",
                        opacity: 0.7,
                      }}
                    />
                  }
                >
                  <ProductActionsWrapper
                    id={product.id}
                    region={region}
                    showPujaDetails={false}
                    showPrice={true}
                    buttonText="Add Pooja to Cart"
                    buttonClassName="ph-btn ph-btn-sindoor ph-btn-lg ph-btn-block"
                  />
                </Suspense>

                <p
                  className="ph-body-sm"
                  style={{
                    color: "var(--ink-4)",
                    textAlign: "center",
                    marginTop: 12,
                    marginBottom: 0,
                  }}
                >
                  Devotee details (name, nakshatra, gothram) added in cart
                </p>
              </div>
            </div>

            <div style={{ height: 1, background: "var(--ink-line)" }} />

            {/* Devotee review */}
            <div>
              <p
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--ink-4)",
                  marginBottom: 12,
                  margin: "0 0 12px",
                }}
              >
                Devotee Review
              </p>
              <div
                className="ph-card"
                style={{ padding: 20, background: "var(--paper-2)" }}
              >
                <div style={{ color: "var(--gold)", letterSpacing: 2 }}>★★★★★</div>
                <p
                  className="ph-body-sm"
                  style={{ marginTop: 10, marginBottom: 0, lineHeight: 1.65, fontSize: 14 }}
                >
                  {content.review.text}
                </p>
                <p
                  className="ph-label"
                  style={{ marginTop: 10, color: "var(--ink-3)" }}
                >
                  — {content.review.author}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── About section — full width ─────────────────────── */}
        <div
          style={{
            marginTop: 56,
            paddingTop: 40,
            borderTop: "1px solid var(--ink-line)",
          }}
        >
          <style>{`
            @media (min-width: 1024px) {
              .product-about-grid { grid-template-columns: 1.2fr 1fr !important; }
            }
          `}</style>
          <div
            className="product-about-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: 48 }}
          >
            {/* About */}
            <div>
              <h2 className="ph-h3" style={{ marginBottom: 20 }}>
                About This Ritual
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {descriptionParagraphs.map((para, i) => (
                  <p
                    key={i}
                    className="ph-body"
                    style={{ margin: 0, lineHeight: 1.75, color: "var(--ink-2)" }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div>
              <h2 className="ph-h3" style={{ marginBottom: 20 }}>
                What&apos;s Included
              </h2>
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {content.included.map((item) => (
                  <li
                    key={item}
                    style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
                  >
                    <span
                      style={{
                        color: "var(--sindoor)",
                        fontWeight: 700,
                        marginTop: 2,
                        flexShrink: 0,
                        fontSize: 13,
                      }}
                    >
                      ✓
                    </span>
                    <span className="ph-body-sm" style={{ lineHeight: 1.6 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

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
                a: "Yes — we send ritual completion photos and, for homams, a video recording. All via WhatsApp or email after the ceremony.",
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
