"use client"

import { updateLineItem, deleteLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type Props = {
  cart: HttpTypes.StoreCart
}

const formatPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount / 100)

function CartItemRow({
  item,
  currencyCode,
}: {
  item: HttpTypes.StoreCartLineItem
  currencyCode: string
}) {
  const [updating, setUpdating] = useState(false)

  const productTitle =
    item.product_title ||
    (item as any).product?.title ||
    item.variant?.product?.title ||
    item.title ||
    "Service"

  const productHandle =
    item.product_handle ||
    (item as any).product?.handle ||
    item.variant?.product?.handle ||
    ""

  const thumbnailUrl =
    item.thumbnail ||
    (item as any).product?.thumbnail ||
    item.variant?.product?.thumbnail ||
    item.variant?.product?.images?.[0]?.url ||
    null

  const lineTotal = (item.unit_price || 0) * (item.quantity || 1)

  const handleQty = async (qty: number) => {
    setUpdating(true)
    await updateLineItem({ lineId: item.id, quantity: qty }).finally(() =>
      setUpdating(false)
    )
  }

  const handleRemove = async () => {
    setUpdating(true)
    await deleteLineItem(item.id).finally(() => setUpdating(false))
  }

  return (
    <div
      data-testid="product-row"
      style={{
        display: "flex",
        gap: 16,
        padding: "16px 0",
        borderBottom: "1px solid var(--ink-line)",
        opacity: updating ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {/* Thumbnail */}
      <LocalizedClientLink href={`/products/${productHandle}`} style={{ flexShrink: 0 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid var(--ink-line)",
            background: "var(--sindoor-soft)",
          }}
        >
          <Thumbnail
            thumbnail={thumbnailUrl}
            images={item.variant?.product?.images}
            size="square"
          />
        </div>
      </LocalizedClientLink>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <LocalizedClientLink href={`/products/${productHandle}`}>
          <p
            className="ph-body"
            data-testid="product-title"
            style={{ fontWeight: 600, marginBottom: 4, color: "var(--ink)" }}
          >
            {productTitle}
          </p>
        </LocalizedClientLink>

        {item.variant?.title && item.variant.title !== "Default Variant" && (
          <p className="ph-body-sm" style={{ color: "var(--ink-4)", marginBottom: 6 }}>
            {item.variant.title}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
          {/* Qty selector */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid var(--ink-line)",
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => item.quantity > 1 && handleQty(item.quantity - 1)}
              disabled={updating || item.quantity <= 1}
              style={{
                width: 28,
                height: 28,
                background: "none",
                border: "none",
                cursor: item.quantity > 1 ? "pointer" : "default",
                color: "var(--ink-3)",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              −
            </button>
            <span
              className="ph-num"
              style={{
                minWidth: 24,
                textAlign: "center",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ink)",
              }}
            >
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => handleQty(item.quantity + 1)}
              disabled={updating}
              style={{
                width: 28,
                height: 28,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--ink-3)",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={updating}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--ink-4)",
              fontSize: 12,
              padding: 0,
              textDecoration: "underline",
            }}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Price */}
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <p className="ph-body ph-num" style={{ fontWeight: 700, color: "var(--ink)" }}>
          {formatPrice(lineTotal, currencyCode)}
        </p>
        {item.quantity > 1 && (
          <p className="ph-body-sm ph-num" style={{ color: "var(--ink-4)", marginTop: 2 }}>
            {formatPrice(item.unit_price || 0, currencyCode)} each
          </p>
        )}
      </div>
    </div>
  )
}

export default function CartItemsV3({ cart }: Props) {
  const items = cart.items || []
  const sorted = [...items].sort((a, b) =>
    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
  )

  return (
    <div
      className="ph-card"
      style={{
        border: "1px solid var(--ink-line)",
        background: "var(--paper)",
        padding: "0 20px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 0",
          borderBottom: "1px solid var(--ink-line)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "var(--ink)",
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          ✓
        </span>
        <span className="ph-h4" style={{ margin: 0 }}>
          {sorted.length} {sorted.length === 1 ? "item" : "items"} in your cart
        </span>
      </div>

      {/* Items */}
      <div data-testid="items-table">
        {sorted.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            currencyCode={cart.currency_code || "INR"}
          />
        ))}
      </div>

      {/* Continue shopping */}
      <div style={{ padding: "14px 0" }}>
        <LocalizedClientLink
          href="/collections/pujas-and-homams"
          className="ph-body-sm"
          style={{ color: "var(--sindoor)", fontWeight: 500 }}
        >
          ← Continue browsing poojas
        </LocalizedClientLink>
      </div>
    </div>
  )
}
