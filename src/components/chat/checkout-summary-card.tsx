"use client"

import { CONTACT, waLink } from "@lib/contact"

// Booking summary shown after the chat booking form. The item has already
// been added to the visitor's storefront cart (POST /api/chat/checkout); the
// button takes them to the storefront's secure checkout, where Razorpay (INR)
// or PayPal (USD) payment, the address and order confirmation are handled.
// The button is never disabled without a visible reason.

export type ChatCheckoutStatus = "loading" | "ready" | "error"

type CheckoutSummaryCardProps = {
  serviceTitle: string
  variantTitle?: string | null
  price: number | null
  currency: "INR" | "USD"
  bookingDetails: {
    poojaPersonName: string
    nakshatra?: string
    gothram?: string
  }
  status: ChatCheckoutStatus
  checkoutUrl?: string
  productUrl?: string
  error?: string
  onRetry?: () => void
  onSaveLater: () => void
}

function fmt(price: number | null, currency: "INR" | "USD") {
  if (price == null) return "—"
  return currency === "INR"
    ? `₹${price.toLocaleString("en-IN")}`
    : `$${price.toLocaleString("en-US")}`
}

export default function CheckoutSummaryCard({
  serviceTitle,
  variantTitle,
  price,
  currency,
  bookingDetails,
  status,
  checkoutUrl,
  productUrl,
  error,
  onRetry,
  onSaveLater,
}: CheckoutSummaryCardProps) {
  const showVariant = variantTitle && !/^default/i.test(variantTitle)

  return (
    <div
      style={{
        background: "var(--cream)",
        border: "1px solid var(--ink-line)",
        borderRadius: 12,
        padding: "20px",
        boxShadow: "var(--shadow-sm)",
        maxWidth: "100%",
      }}
    >
      <h3
        style={{
          margin: "0 0 14px",
          paddingBottom: 12,
          borderBottom: "1px solid var(--ink-line)",
          fontSize: 16,
          fontWeight: 600,
          fontFamily: "var(--serif)",
          color: "var(--ink)",
        }}
      >
        Booking Summary
      </h3>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.4, flex: 1 }}>
          {serviceTitle}
          {showVariant && (
            <span style={{ display: "block", fontSize: 12, color: "var(--ink-4)" }}>
              {variantTitle}
            </span>
          )}
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--sindoor)",
            whiteSpace: "nowrap",
            fontFeatureSettings: "'tnum' 1",
          }}
        >
          {fmt(price, currency)}
        </span>
      </div>

      <div
        style={{
          padding: "10px 12px",
          background: "var(--paper)",
          border: "1px solid var(--ink-line)",
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 12.5,
          color: "var(--ink-3)",
          lineHeight: 1.6,
        }}
      >
        <div>
          <span style={{ color: "var(--ink-4)" }}>For: </span>
          <strong style={{ color: "var(--ink)" }}>{bookingDetails.poojaPersonName}</strong>
        </div>
        {bookingDetails.nakshatra && (
          <div>
            <span style={{ color: "var(--ink-4)" }}>Nakshatra: </span>
            {bookingDetails.nakshatra}
          </div>
        )}
        {bookingDetails.gothram && (
          <div>
            <span style={{ color: "var(--ink-4)" }}>Gothram: </span>
            {bookingDetails.gothram}
          </div>
        )}
      </div>

      {status === "loading" && (
        <button
          type="button"
          disabled
          className="ph-btn ph-btn-sindoor ph-btn-block"
          style={{ fontSize: 14, fontWeight: 600, opacity: 0.7, cursor: "wait" }}
        >
          Adding to your cart…
        </button>
      )}

      {status === "ready" && checkoutUrl && (
        <>
          <a
            href={checkoutUrl}
            className="ph-btn ph-btn-sindoor ph-btn-block"
            style={{ fontSize: 14, fontWeight: 600, textDecoration: "none", textAlign: "center" }}
          >
            Continue to secure payment →
          </a>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--ink-4)", textAlign: "center" }}>
            Added to your cart. You&apos;ll enter your address and pay with{" "}
            {currency === "INR" ? "Razorpay (UPI, cards, netbanking)" : "PayPal or card"} on the
            next page.
          </p>
        </>
      )}

      {status === "error" && (
        <div role="alert">
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--sindoor)", lineHeight: 1.5 }}>
            {error || "We couldn't add this to your cart."} You can book it from the product page,
            or our team can help on WhatsApp at {CONTACT.whatsappDisplay}.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="ph-btn ph-btn-sindoor"
                style={{ fontSize: 13, padding: "8px 14px" }}
              >
                Try again
              </button>
            )}
            {productUrl && (
              <a
                href={productUrl}
                className="ph-btn ph-btn-ghost"
                style={{ fontSize: 13, padding: "8px 14px", textDecoration: "none" }}
              >
                Open product page
              </a>
            )}
            <a
              href={waLink(`Hi, I'd like to book ${serviceTitle}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="ph-btn ph-btn-ghost"
              style={{ fontSize: 13, padding: "8px 14px", textDecoration: "none" }}
            >
              WhatsApp us
            </a>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button
          type="button"
          onClick={onSaveLater}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            color: "var(--ink-4)",
            textDecoration: "underline",
            padding: 0,
          }}
        >
          Save &amp; complete later
        </button>
      </div>
    </div>
  )
}
