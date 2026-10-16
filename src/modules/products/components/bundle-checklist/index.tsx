"use client"

import { addManyToCart } from "@lib/data/cart"
import type { BundleItem } from "@lib/data/product-bundles"
import { convertToLocale } from "@lib/util/money"
import { useParams } from "next/navigation"
import { useState } from "react"

export type PricedBundleItem = BundleItem & { handle: string; amount: number; currency: string }

export default function BundleChecklist({ items, buttonClassName }: { items: PricedBundleItem[]; buttonClassName?: string }) {
  const countryCode = useParams().countryCode as string
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState("")

  const selected = items.filter((i) => checked[i.variantId])
  const currency = items[0]?.currency || "usd"
  const total = selected.reduce((sum, i) => sum + i.amount, 0)
  const money = (amount: number) => convertToLocale({ amount, currency_code: currency })

  if (!items.length) return null

  const handleAdd = async () => {
    if (!selected.length) return
    setAdding(true)
    setError("")
    try {
      // One line per ticked item, in list order, added in a single server call.
      await addManyToCart({ variantIds: selected.map((i) => i.variantId), countryCode })
      if (typeof window !== "undefined") window.dispatchEvent(new Event("cart:updated"))
      setChecked({})
    } catch (e) {
      console.error("bundle add to cart failed", e)
      setError("Sorry, something went wrong adding to your cart. Please try again or WhatsApp us.")
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="flex flex-col gap-y-3" data-testid="bundle-checklist">
      <p className="ph-label" style={{ margin: 0 }}>
        Choose one or more
      </p>
      <div className="flex flex-col gap-y-2">
        {items.map((item) => {
          const on = !!checked[item.variantId]
          return (
            <label
              key={item.variantId}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 10,
                border: `1.5px solid ${on ? "var(--sindoor)" : "var(--ink-line)"}`,
                background: on ? "var(--paper-2)" : "transparent",
                cursor: adding ? "default" : "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={on}
                disabled={adding}
                onChange={(e) => setChecked((c) => ({ ...c, [item.variantId]: e.target.checked }))}
                style={{ marginTop: 3, width: 18, height: 18, accentColor: "var(--sindoor)", flexShrink: 0 }}
              />
              <span className="ph-body-sm" style={{ flex: 1, lineHeight: 1.45, color: "var(--ink)" }}>
                {item.label}
              </span>
              <span className="ph-body-sm" style={{ fontWeight: 700, whiteSpace: "nowrap", color: "var(--ink)" }}>
                {money(item.amount)}
              </span>
            </label>
          )
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
        <span className="ph-label">Total</span>
        <span className="ph-h3" style={{ margin: 0 }}>
          {selected.length ? money(total) : "—"}
        </span>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!selected.length || adding}
        className={buttonClassName || "ph-btn ph-btn-sindoor ph-btn-lg ph-btn-block"}
        style={{ opacity: !selected.length || adding ? 0.6 : 1 }}
        data-testid="bundle-add-button"
      >
        {adding ? "Adding…" : selected.length > 1 ? `Add ${selected.length} poojas to cart` : "Add Pooja to Cart"}
      </button>
      {!selected.length && (
        <p className="ph-body-sm" style={{ margin: 0, color: "var(--ink-3)" }}>
          Tick at least one pooja or homam.
        </p>
      )}
      {error && (
        <p className="ph-body-sm" style={{ margin: 0, color: "var(--sindoor)" }}>
          {error}
        </p>
      )}
    </div>
  )
}
