"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addToCart } from "@lib/data/cart"
import { localizeHref } from "@lib/util/localize-href"

// Region-aware add-to-cart used inline on the pregnancy landing page, so buyers
// never have to leave for the product page. Uses the same server action the
// product pages use (respects the visitor's region/currency). Devotee/sankalpam
// details are collected in the cart.
export default function BuyButtons({
  variantId,
  countryCode,
}: {
  variantId?: string
  countryCode: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [mode, setMode] = useState<"add" | "buy" | null>(null)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!variantId) {
    return (
      <p className="text-sm text-grey-50">
        Currently unavailable —{" "}
        <a href={localizeHref(countryCode, "/contact")} className="text-brand-600 underline">
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
        await addToCart({ variantId, quantity: 1, countryCode })
        if (goToCart) {
          router.push(localizeHref(countryCode, "/cart"))
          return
        }
        setAdded(true)
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
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => run(false)}
          disabled={pending}
          className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {added ? "Added to cart ✓" : pending && mode === "add" ? "Adding…" : "Add to cart"}
        </button>
        <button
          type="button"
          onClick={() => run(true)}
          disabled={pending}
          className="rounded-lg border border-brand-600 px-6 py-3 font-semibold text-brand-600 transition-colors hover:bg-brand-50 disabled:opacity-60"
        >
          {pending && mode === "buy" ? "…" : "Buy now"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
