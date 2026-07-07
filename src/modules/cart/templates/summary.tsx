"use client"

import CartTotals from "@modules/common/components/cart-totals"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const formatPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount)

const CartSummary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const subtotal = cart.subtotal || 0
  const currency = cart.currency_code || "INR"
  const isINR = currency.toUpperCase() === "INR"

  return (
    <div
      className="ph-card"
      style={{
        border: "2px solid var(--sindoor)",
        background: "var(--paper)",
        padding: 20,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 className="ph-h4" style={{ margin: 0 }}>
          Order Summary
        </h2>
      </div>

      {/* Free shipping chip */}
      {isINR && (
        <div
          style={{
            background: "var(--gold-soft)",
            border: "1px solid var(--gold)",
            borderRadius: 20,
            padding: "6px 12px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 14 }}>🙏</span>
          <span
            className="ph-label"
            style={{ color: "var(--gold-2)", fontSize: 11, fontWeight: 600 }}
          >
            FREE prasadam delivery included
          </span>
        </div>
      )}

      {/* Line items */}
      <div style={{ marginBottom: 12 }}>
        {cart.items
          ?.sort(
            (a: HttpTypes.StoreCartLineItem, b: HttpTypes.StoreCartLineItem) =>
              (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
          )
          .map((item: HttpTypes.StoreCartLineItem) => {
            const title =
              item.product_title ||
              (item as any).product?.title ||
              item.title ||
              "Service"
            const lineTotal = (item.unit_price || 0) * (item.quantity || 1)
            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <span
                  className="ph-body-sm"
                  style={{ color: "var(--ink-3)", flex: 1, minWidth: 0 }}
                >
                  {item.quantity > 1 && (
                    <span className="ph-num" style={{ color: "var(--ink-4)" }}>
                      {item.quantity}×{" "}
                    </span>
                  )}
                  {title}
                </span>
                <span
                  className="ph-body-sm ph-num"
                  style={{ fontWeight: 600, color: "var(--ink)", flexShrink: 0 }}
                >
                  {formatPrice(lineTotal, currency)}
                </span>
              </div>
            )
          })}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--ink-line)", margin: "12px 0" }} />

      {/* Discount code */}
      <div style={{ marginBottom: 12 }}>
        <DiscountCode cart={cart} />
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--ink-line)", margin: "12px 0" }} />

      {/* Totals */}
      <CartTotals totals={cart} />

      {/* CTA */}
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
        style={{ display: "block", marginTop: 16 }}
      >
        <button
          className="ph-btn ph-btn-primary"
          style={{
            width: "100%",
            padding: "14px 20px",
            fontSize: 15,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span>Proceed to Checkout</span>
          <span style={{ fontSize: 18 }}>→</span>
        </button>
      </LocalizedClientLink>

      <p
        className="ph-body-sm"
        style={{
          color: "var(--ink-4)",
          textAlign: "center",
          marginTop: 10,
          fontFamily: "var(--sans)",
        }}
      >
        Your pooja will be booked immediately on payment
      </p>
    </div>
  )
}

export default CartSummary
