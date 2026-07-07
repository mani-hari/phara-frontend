import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { retrieveCustomer } from "@lib/data/customer"

type Props = { order: HttpTypes.StoreOrder }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

const WHAT_NEXT = [
  {
    icon: "🙏",
    title: "Pooja scheduled",
    desc: "Our priests will perform your ritual on your preferred date.",
  },
  {
    icon: "🎥",
    title: "HD video within 24 h",
    desc: "You'll receive a recording of the full pooja in your inbox.",
  },
  {
    icon: "📦",
    title: "Prasad dispatched",
    desc: "Sanctified prasad is sent to your address after the ceremony.",
  },
]

export default async function OrderCompletedTemplate({ order }: Props) {
  const customer = await retrieveCustomer().catch(() => null)
  const currency = order.currency_code
  const subtotal = order.item_subtotal ?? order.subtotal ?? 0
  const shippingTotal = order.shipping_subtotal ?? 0
  const taxTotal = order.tax_total ?? 0
  const total = order.total ?? 0

  return (
    <div
      style={{
        background: "var(--paper)",
        minHeight: "calc(100vh - 64px)",
        paddingTop: 48,
        paddingBottom: 80,
      }}
    >
      <div className="content-container" style={{ maxWidth: 720 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--sindoor-soft)",
              border: "2px solid var(--sindoor)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              marginBottom: 20,
            }}
          >
            🙏
          </div>
          <h1 className="ph-h1" style={{ marginBottom: 10 }}>
            Your pooja is booked
          </h1>
          <p className="ph-body" style={{ color: "var(--ink-3)", maxWidth: 480, margin: "0 auto" }}>
            May your prayers be heard and your wishes fulfilled. We'll keep you
            updated every step of the way.
          </p>
        </div>

        {/* Order meta card */}
        <div
          className="ph-card"
          style={{
            border: "2px solid var(--sindoor)",
            background: "var(--sindoor-soft)",
            padding: "20px 24px",
            marginBottom: 24,
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            justifyContent: "space-between",
            alignItems: "center",
          }}
          data-testid="order-complete-container"
        >
          <div>
            <span className="ph-label" style={{ color: "var(--sindoor)", display: "block", marginBottom: 4 }}>
              ORDER CONFIRMED
            </span>
            <span className="ph-h3" style={{ color: "var(--ink)" }}>
              #{order.display_id}
            </span>
          </div>
          <div>
            <span className="ph-label" style={{ color: "var(--ink-4)", display: "block", marginBottom: 4 }}>
              DATE
            </span>
            <span className="ph-body ph-num" style={{ fontWeight: 600 }} data-testid="order-date">
              {formatDate(order.created_at)}
            </span>
          </div>
          <div>
            <span className="ph-label" style={{ color: "var(--ink-4)", display: "block", marginBottom: 4 }}>
              CONFIRMATION SENT TO
            </span>
            <span className="ph-body" style={{ fontWeight: 600 }} data-testid="order-email">
              {order.email}
            </span>
          </div>
        </div>

        {/* Items */}
        <div
          className="ph-card"
          style={{ border: "1px solid var(--ink-line)", padding: "0 24px", marginBottom: 24 }}
        >
          <div
            style={{
              padding: "14px 0",
              borderBottom: "1px solid var(--ink-line)",
            }}
          >
            <span className="ph-h4" style={{ margin: 0 }}>Your booking</span>
          </div>

          {(order.items ?? []).map((item: HttpTypes.StoreOrderLineItem) => {
            const title = item.product_title || item.title || "Service"
            const variantTitle = item.variant_title
            const lineTotal = (item.unit_price || 0) * (item.quantity || 1)

            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "16px 0",
                  borderBottom: "1px solid var(--ink-line)",
                  alignItems: "flex-start",
                }}
              >
                {item.thumbnail && (
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 8,
                      overflow: "hidden",
                      flexShrink: 0,
                      border: "1px solid var(--ink-line)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail}
                      alt={title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p className="ph-body" style={{ fontWeight: 600, marginBottom: 2 }}>
                    {title}
                  </p>
                  {variantTitle && variantTitle !== "Default Variant" && (
                    <p className="ph-body-sm" style={{ color: "var(--ink-4)", marginBottom: 4 }}>
                      {variantTitle}
                    </p>
                  )}
                  {item.quantity > 1 && (
                    <p className="ph-body-sm ph-num" style={{ color: "var(--ink-4)" }}>
                      Qty: {item.quantity}
                    </p>
                  )}
                  {/* Puja details from item metadata */}
                  {(item as any).metadata?.devotee_name && (
                    <p className="ph-body-sm" style={{ color: "var(--ink-3)", marginTop: 4 }}>
                      For: {(item as any).metadata.devotee_name}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p className="ph-body ph-num" style={{ fontWeight: 700 }}>
                    {convertToLocale({ amount: lineTotal, currency_code: currency })}
                  </p>
                </div>
              </div>
            )
          })}

          {/* Totals */}
          <div style={{ padding: "16px 0" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span className="ph-body-sm" style={{ color: "var(--ink-4)" }}>Subtotal</span>
              <span className="ph-body-sm ph-num" style={{ color: "var(--ink-3)" }}>
                {convertToLocale({ amount: subtotal, currency_code: currency })}
              </span>
            </div>
            {shippingTotal > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span className="ph-body-sm" style={{ color: "var(--ink-4)" }}>Shipping</span>
                <span className="ph-body-sm ph-num" style={{ color: "var(--ink-3)" }}>
                  {convertToLocale({ amount: shippingTotal, currency_code: currency })}
                </span>
              </div>
            )}
            {taxTotal > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span className="ph-body-sm" style={{ color: "var(--ink-4)" }}>Taxes</span>
                <span className="ph-body-sm ph-num" style={{ color: "var(--ink-3)" }}>
                  {convertToLocale({ amount: taxTotal, currency_code: currency })}
                </span>
              </div>
            )}
            <div
              style={{
                borderTop: "1px solid var(--ink-line)",
                marginTop: 8,
                paddingTop: 12,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span className="ph-body" style={{ fontWeight: 700 }}>Total paid</span>
              <span
                className="ph-body ph-num"
                style={{ fontWeight: 700, fontSize: 18 }}
                data-testid="order-total"
              >
                {convertToLocale({ amount: total, currency_code: currency })}
              </span>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div
          className="ph-card"
          style={{ border: "1px solid var(--ink-line)", padding: "20px 24px", marginBottom: 32 }}
        >
          <h3 className="ph-h4" style={{ marginBottom: 20 }}>What happens next</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {WHAT_NEXT.map((step) => (
              <div key={step.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{step.icon}</span>
                <div>
                  <p className="ph-body" style={{ fontWeight: 600, marginBottom: 2 }}>
                    {step.title}
                  </p>
                  <p className="ph-body-sm" style={{ color: "var(--ink-3)", lineHeight: 1.6 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account CTA for guests */}
        {!customer && (
          <div
            style={{
              border: "1px solid var(--ink-line)",
              borderRadius: 14,
              padding: "20px 24px",
              marginBottom: 24,
              background: "var(--paper)",
            }}
          >
            <h3 className="ph-h4" style={{ marginBottom: 8 }}>Save time on your next booking</h3>
            <p className="ph-body-sm" style={{ color: "var(--ink-3)", marginBottom: 16, lineHeight: 1.6 }}>
              Create a free account to store your devotee details, track orders, and checkout faster next time.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <LocalizedClientLink
                href={`/account/register?email=${encodeURIComponent(order.email || "")}`}
                className="ph-btn ph-btn-primary"
                style={{ padding: "10px 22px", fontSize: 14, fontWeight: 700 }}
              >
                Create account
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/account/login"
                className="ph-btn ph-btn-ghost"
                style={{ padding: "10px 20px", fontSize: 14 }}
              >
                Sign in
              </LocalizedClientLink>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <LocalizedClientLink
            href="/"
            className="ph-btn ph-btn-primary"
            style={{ padding: "12px 28px", fontSize: 15, fontWeight: 600 }}
          >
            Back to home
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/account/orders"
            className="ph-btn ph-btn-ghost"
            style={{ padding: "12px 24px", fontSize: 15 }}
          >
            View all orders →
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
