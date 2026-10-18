"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

/** Clear "added" confirmation (the nav cart dropdown is easy to miss on a phone). */
export default function AddedToast({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div role="status" className="ph-added-toast">
      <span>✓ Added to your cart</span>
      <LocalizedClientLink href="/cart" style={{ color: "#fff", fontWeight: 700, textDecoration: "underline" }}>
        View cart
      </LocalizedClientLink>
    </div>
  )
}
