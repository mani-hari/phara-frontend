"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useBundle } from "./context"

export { BundleProvider } from "./context"
export type { PricedBundleItem } from "./context"

const btn = "ph-btn ph-btn-sindoor ph-btn-lg ph-btn-block"

function AddedNote() {
  const { added } = useBundle()
  const countryCode = useParams().countryCode as string
  if (!added) return null
  return (
    <p className="ph-body-sm" style={{ margin: 0, color: "var(--ink-2)" }}>
      ✓ Added to your cart.{" "}
      <Link href={`/${countryCode}/cart`} style={{ color: "var(--sindoor)", fontWeight: 600 }}>
        Go to cart →
      </Link>
    </p>
  )
}

/** The booking card: checklist, total and Add button. Sticky on desktop (see the spread template). */
export function BundleCard() {
  const { items, isOn, toggle, selected, total, money, adding, error, addSelected } = useBundle()
  if (!items.length) return null
  return (
    <div className="flex flex-col gap-y-3" data-testid="bundle-checklist">
      <p className="ph-label" style={{ margin: 0 }}>
        Choose one or more
      </p>
      <div className="flex flex-col gap-y-2">
        {items.map((item) => {
          const on = isOn(item.variantId)
          return (
            <label
              key={item.variantId}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "11px 13px",
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
                onChange={(e) => toggle(item.variantId, e.target.checked)}
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
        onClick={addSelected}
        disabled={!selected.length || adding}
        className={btn}
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
      <AddedNote />
      {error && (
        <p className="ph-body-sm" style={{ margin: 0, color: "var(--sindoor)" }}>
          {error}
        </p>
      )}
    </div>
  )
}

/** "Add to my bundle" button inside an item's story section; mirrors the card's checkbox. */
export function BundleItemToggle({ variantId }: { variantId: string }) {
  const { items, isOn, toggle, money, adding } = useBundle()
  const item = items.find((i) => i.variantId === variantId)
  if (!item) return null
  const on = isOn(variantId)
  return (
    <button
      type="button"
      disabled={adding}
      onClick={() => toggle(variantId)}
      aria-pressed={on}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        borderRadius: 999,
        border: "1.5px solid var(--sindoor)",
        background: on ? "var(--sindoor)" : "transparent",
        color: on ? "#fff" : "var(--sindoor)",
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      {on ? "✓ Added to your selection" : `+ Add to my selection · ${money(item.amount)}`}
    </button>
  )
}

/** Mobile only: a bar fixed to the bottom with the running total and the Add button. */
export function BundleMobileBar() {
  const { selected, total, money, adding, addSelected, added } = useBundle()
  return (
    <div className="bundle-mobile-bar">
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="ph-body-sm" style={{ margin: 0, fontWeight: 700, color: "var(--ink)" }}>
          {selected.length ? `${selected.length} selected · ${money(total)}` : added ? "✓ Added to cart" : "Tick the poojas you want"}
        </p>
      </div>
      <button
        type="button"
        onClick={addSelected}
        disabled={!selected.length || adding}
        className="ph-btn ph-btn-sindoor"
        style={{ opacity: !selected.length || adding ? 0.6 : 1, whiteSpace: "nowrap" }}
      >
        {adding ? "Adding…" : "Add to cart"}
      </button>
    </div>
  )
}
