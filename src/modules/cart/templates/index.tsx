import { HttpTypes } from "@medusajs/types"
import CartItemsV3 from "./items-v3"
import CartCheckoutSection from "../components/checkout-section"
import EmptyCartMessage from "../components/empty-cart-message"
import { convertToLocale } from "@lib/util/money"

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat(currency.toUpperCase() === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount)
}

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  if (!cart?.items?.length) {
    return (
      <div style={{ background: "var(--paper)", minHeight: "60vh", paddingTop: 48 }}>
        <div className="content-container">
          <EmptyCartMessage />
        </div>
      </div>
    )
  }

  const currency = cart.currency_code || "inr"
  const subtotal = cart.subtotal || 0
  const total = cart.total || subtotal

  return (
    <div style={{ background: "var(--paper)", minHeight: "60vh", paddingTop: 32, paddingBottom: 80 }}>
      <div className="content-container" data-testid="cart-container">

        {/* Page title */}
        <h1 style={{ marginBottom: 28, fontFamily: "var(--sans)", fontSize: 28, fontWeight: 700, color: "var(--ink)", lineHeight: 1.15 }}>
          Complete your order
        </h1>

        <div className="cart-layout">
          {/* ── Left / main column ───────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Items */}
            <CartItemsV3 cart={cart} />

            {/* Who is it for (sankalpam) */}
            <div
              style={{
                background: "var(--paper)",
                border: "1px solid var(--ink-line)",
                borderRadius: 14,
                padding: "22px 22px 24px",
              }}
            >
              <CartCheckoutSection
                countryCode={(cart as any).region?.countries?.[0]?.iso_2 || "in"}
                subtotal={total}
                currency={currency.toUpperCase()}
              />
            </div>
          </div>

          {/* ── Right / summary column (desktop only) ─────────── */}
          <div className="cart-summary-col">
            <div style={{ position: "sticky", top: 80 }}>
              <div
                style={{
                  border: "1px solid var(--ink-line)",
                  borderRadius: 14,
                  overflow: "hidden",
                  background: "var(--paper)",
                }}
              >
                {/* Summary header */}
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--ink-line)" }}>
                  <h3 className="ph-h4" style={{ margin: 0 }}>Order Summary</h3>
                </div>

                {/* Line items */}
                <div style={{ padding: "14px 20px" }}>
                  {(cart.items || [])
                    .sort((a, b) => ((a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1))
                    .map((item) => {
                      const title = item.product_title || (item as any).product?.title || item.title || "Service"
                      const lineTotal = (item.unit_price || 0) * (item.quantity || 1)
                      return (
                        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                          <span className="ph-body-sm" style={{ color: "var(--ink-3)", flex: 1, lineHeight: 1.4 }}>
                            {item.quantity > 1 && (
                              <span className="ph-num" style={{ color: "var(--ink-4)" }}>{item.quantity}× </span>
                            )}
                            {title}
                          </span>
                          <span className="ph-body-sm ph-num" style={{ fontWeight: 600, flexShrink: 0 }}>
                            {formatPrice(lineTotal, currency)}
                          </span>
                        </div>
                      )
                    })}
                </div>

                {/* Totals */}
                <div style={{ padding: "14px 20px", borderTop: "1px solid var(--ink-line)" }}>
                  {subtotal !== total && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span className="ph-body-sm" style={{ color: "var(--ink-4)" }}>Subtotal</span>
                      <span className="ph-body-sm ph-num">{formatPrice(subtotal, currency)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span className="ph-body" style={{ fontWeight: 700 }}>Total</span>
                    <span className="ph-body ph-num" style={{ fontWeight: 700, fontSize: 18 }}>
                      {formatPrice(total, currency)}
                    </span>
                  </div>
                </div>

                {/* Trust + payment logos */}
                <div style={{ padding: "12px 20px", borderTop: "1px solid var(--ink-line)", background: "#fafaf8" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                    {(currency.toUpperCase() === "INR"
                      ? ["UPI", "Visa", "MC"]
                      : ["PayPal", "Visa", "MC", "UPI"]
                    ).map((logo) => (
                      <span key={logo} className="ph-label ph-num" style={{ fontSize: 9, fontWeight: 700, padding: "3px 7px", border: "1px solid var(--ink-line)", borderRadius: 4, color: "var(--ink-3)", background: "var(--paper)" }}>
                        {logo}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    {["🔒 SSL", "↩ Refund", "🎥 Video"].map((t) => (
                      <span key={t} className="ph-label" style={{ fontSize: 10, color: "var(--ink-4)" }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cart-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .cart-summary-col {
          display: none;
        }
        @media (min-width: 1024px) {
          .cart-layout {
            display: grid;
            grid-template-columns: 1fr 340px;
            gap: 32px;
          }
          .cart-summary-col {
            display: block;
          }
        }
      `}</style>
    </div>
  )
}

export default CartTemplate
