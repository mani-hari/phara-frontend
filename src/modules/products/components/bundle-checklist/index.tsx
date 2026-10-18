"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
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

/** Mobile only: a bar fixed to the bottom with the selection count and a "Select poojas" button that opens
 *  a bottom sheet with the checklist (the page itself has no checkboxes on phones). */
export function BundleMobileBar() {
  const { selected, total, money, added } = useBundle()
  const countryCode = useParams().countryCode as string
  const [open, setOpen] = useState(false)

  // Close the sheet once the items are in the cart; lock page scroll while it is open.
  useEffect(() => {
    if (added) setOpen(false)
  }, [added])
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const count = selected.length
  return (
    <>
      <div className="bundle-mobile-bar">
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="ph-body-sm" style={{ margin: 0, fontWeight: 700, color: "var(--ink)" }}>
            {added && !count ? "✓ Added to cart" : count ? `${count} selected · ${money(total)}` : "0 poojas selected"}
          </p>
        </div>
        {added && !count ? (
          <Link href={`/${countryCode}/cart`} className="ph-btn ph-btn-sindoor" style={{ whiteSpace: "nowrap" }}>
            View cart
          </Link>
        ) : (
          <button type="button" onClick={() => setOpen(true)} className="ph-btn ph-btn-sindoor" style={{ whiteSpace: "nowrap" }}>
            {count ? "Review & add" : "Select poojas"}
          </button>
        )}
      </div>

      {open && (
        <div className="bundle-sheet-root" role="dialog" aria-modal="true" aria-label="Choose your poojas">
          <button type="button" className="bundle-sheet-backdrop" aria-label="Close" onClick={() => setOpen(false)} />
          <div className="bundle-sheet">
            <div className="bundle-sheet-grip" aria-hidden />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 className="ph-h3" style={{ margin: 0 }}>
                Choose your poojas
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{ width: 40, height: 40, borderRadius: 999, border: "1px solid var(--ink-line)", background: "var(--paper)", fontSize: 18 }}
              >
                ✕
              </button>
            </div>
            <BundleCard />
          </div>
        </div>
      )}
    </>
  )
}
