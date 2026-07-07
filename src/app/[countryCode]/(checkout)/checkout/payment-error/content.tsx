"use client"

import { useSearchParams } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const WHATSAPP_NUMBER = "919999999999"

const TIPS = [
  {
    icon: "💳",
    title: "Try a different card",
    desc: "Ensure your card is enabled for online transactions. Try a different Visa, Mastercard, or Amex.",
  },
  {
    icon: "📱",
    title: "Use UPI",
    desc: "UPI payments via Google Pay, PhonePe, or BHIM rarely fail and are instant.",
  },
  {
    icon: "🔄",
    title: "Refresh and retry",
    desc: "Sometimes a temporary network hiccup causes failures. Refresh the page and try once more.",
  },
  {
    icon: "🌐",
    title: "Check your bank",
    desc: "Your bank may require OTP confirmation or have blocked the transaction. Check your bank's SMS or email alert.",
  },
]

const REASON_MESSAGES: Record<string, string> = {
  cancelled: "You cancelled the payment. Your cart is still saved — return whenever you're ready.",
  verification_failed: "Payment was processed but could not be verified. Please contact us — we'll resolve this quickly.",
  capture_failed: "We were unable to capture your PayPal payment. No charge was made.",
  not_completed: "Your PayPal payment was not completed. No charge was made.",
  order_failed: "Payment succeeded but we had trouble confirming your order. Please contact us immediately.",
  default: "Something went wrong during payment. Your cart is saved and no money has been charged.",
}

export default function PaymentErrorContent() {
  const params = useSearchParams()
  const reason = params.get("reason") || "default"
  const message = REASON_MESSAGES[reason] || REASON_MESSAGES.default

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I had a payment issue on PariharaOnline. Order not completed.")}`

  return (
    <div style={{ background: "var(--paper)", minHeight: "calc(100vh - 64px)", paddingTop: 48, paddingBottom: 80 }}>
      <div className="content-container" style={{ maxWidth: 560 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#fef2f0",
            border: "2px solid var(--sindoor)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            marginBottom: 18,
          }}>
            ⚠️
          </div>
          <h1 className="ph-h2" style={{ marginBottom: 10 }}>Payment not completed</h1>
          <p className="ph-body" style={{ color: "var(--ink-3)", maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>
            {message}
          </p>
        </div>

        {/* Tips */}
        <div style={{ border: "1px solid var(--ink-line)", borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
          <h3 className="ph-h4" style={{ marginBottom: 18 }}>What you can try</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {TIPS.map((tip) => (
              <div key={tip.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{tip.icon}</span>
                <div>
                  <p className="ph-body" style={{ fontWeight: 600, marginBottom: 2 }}>{tip.title}</p>
                  <p className="ph-body-sm" style={{ color: "var(--ink-3)", lineHeight: 1.6 }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div style={{
          background: "var(--sindoor-soft)",
          border: "1px solid var(--sindoor)",
          borderRadius: 12,
          padding: "18px 22px",
          marginBottom: 28,
        }}>
          <p className="ph-body" style={{ fontWeight: 600, marginBottom: 6 }}>Need help?</p>
          <p className="ph-body-sm" style={{ color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.6 }}>
            Our team is available on WhatsApp to assist you in completing your booking. We respond within minutes.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="ph-btn ph-btn-sindoor"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}
          >
            <span>💬</span> Chat on WhatsApp
          </a>
          <p className="ph-body-sm" style={{ color: "var(--ink-4)", marginTop: 10 }}>
            or call / text +91 99999 99999
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <LocalizedClientLink
            href="/checkout"
            className="ph-btn ph-btn-primary"
            style={{ padding: "12px 28px", fontSize: 15, fontWeight: 700 } as any}
          >
            Try again →
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/cart"
            className="ph-btn ph-btn-ghost"
            style={{ padding: "12px 24px", fontSize: 15 } as any}
          >
            Back to cart
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
