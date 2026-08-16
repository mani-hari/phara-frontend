"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addToCart } from "@lib/data/cart"
import { localizeHref } from "@lib/util/localize-href"
import QuantitySelector from "@modules/common/components/quantity-selector"

// Region-aware add-to-cart used inline on this landing page, mirroring the
// pattern on the pregnancy-poojas hub page but with a real quantity control
// (MAN-24) since the FAQ already tells devotees to "increase the quantity
// for additional devotees" — this page is where that instruction is acted on.
export default function BuyButtons({
  variantId,
  countryCode,
  maxQuantity,
}: {
  variantId?: string
  countryCode: string
  maxQuantity?: number
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [mode, setMode] = useState<"add" | "buy" | null>(null)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  if (!variantId) {
    return (
      <p className="ph-body-sm" style={{ color: "var(--ink-4)" }}>
        Currently unavailable —{" "}
        <a href={localizeHref(countryCode, "/contact")} style={{ color: "var(--sindoor)" }}>
          contact us
        </a>
        .
      </p>
    )
  }

  const run = (goToCart: boolean) => {
    setError(null)
    setMode(goToCart ? "buy" : "add")
    startTransition(async () => {
      try {
        await addToCart({ variantId, quantity, countryCode })
        if (goToCart) {
          router.push(localizeHref(countryCode, "/cart"))
          return
        }
        setAdded(true)
        setQuantity(1)
        setTimeout(() => setAdded(false), 2500)
      } catch {
        setError("Something went wrong. Please try again.")
      } finally {
        setMode(null)
      }
    })
  }

  return (
    <div>
      <div className="flex items-center gap-x-3" style={{ marginBottom: 16 }}>
        <span className="ph-label">Quantity</span>
        <QuantitySelector
          quantity={quantity}
          onChange={setQuantity}
          max={maxQuantity}
          disabled={pending}
          data-testid="rahu-ketu-quantity-selector"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => run(false)}
          disabled={pending}
          className="ph-btn ph-btn-sindoor ph-btn-lg"
        >
          {added ? "Added to cart ✓" : pending && mode === "add" ? "Adding…" : "Add to cart"}
        </button>
        <button
          type="button"
          onClick={() => run(true)}
          disabled={pending}
          className="ph-btn ph-btn-ghost ph-btn-lg"
        >
          {pending && mode === "buy" ? "…" : "Buy now"}
        </button>
      </div>
      {error && (
        <p className="ph-body-sm" style={{ color: "var(--sindoor)", marginTop: 8 }}>
          {error}
        </p>
      )}
    </div>
  )
}
