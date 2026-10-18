"use client"

import { addManyToCart } from "@lib/data/cart"
import { trackEcommerce } from "@lib/analytics"
import type { BundleItem } from "@lib/data/product-bundles"
import { convertToLocale } from "@lib/util/money"
import { useParams } from "next/navigation"
import { createContext, ReactNode, useContext, useState } from "react"

export type PricedBundleItem = BundleItem & { handle: string; amount: number; currency: string; image?: string | null }

type BundleState = {
  items: PricedBundleItem[]
  isOn: (variantId: string) => boolean
  toggle: (variantId: string, on?: boolean) => void
  selected: PricedBundleItem[]
  total: number
  money: (amount: number) => string
  adding: boolean
  error: string
  added: boolean
  /** Variant ids added to the cart from this page during this visit. */
  inCart: string[]
  addSelected: () => Promise<void>
}

const Ctx = createContext<BundleState | null>(null)

export function useBundle(): BundleState {
  const v = useContext(Ctx)
  if (!v) throw new Error("useBundle must be used inside <BundleProvider>")
  return v
}

/** Holds the bundle selection so the item sections, the side card and the mobile bar stay in sync. */
export function BundleProvider({ items, children }: { items: PricedBundleItem[]; children: ReactNode }) {
  const countryCode = useParams().countryCode as string
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState("")
  const [added, setAdded] = useState(false)
  const [inCart, setInCart] = useState<string[]>([])

  const selected = items.filter((i) => checked[i.variantId])
  const currency = items[0]?.currency || "usd"
  const total = selected.reduce((sum, i) => sum + i.amount, 0)

  const value: BundleState = {
    items,
    isOn: (id) => !!checked[id],
    toggle: (id, on) => {
      setAdded(false)
      setChecked((c) => ({ ...c, [id]: on ?? !c[id] }))
    },
    selected,
    total,
    money: (amount) => convertToLocale({ amount, currency_code: currency }),
    adding,
    error,
    added,
    inCart,
    addSelected: async () => {
      if (!selected.length) return
      setAdding(true)
      setError("")
      try {
        // One line per ticked item, in list order, added in a single server call.
        await addManyToCart({ variantIds: selected.map((i) => i.variantId), countryCode })
        if (typeof window !== "undefined") window.dispatchEvent(new Event("cart:updated"))
        trackEcommerce("add_to_cart", {
          currency,
          value: total,
          items: selected.map((i) => ({ item_id: i.productId, item_name: i.label, price: i.amount, quantity: 1 })),
        })
        setInCart((prev) => Array.from(new Set([...prev, ...selected.map((i) => i.variantId)])))
        setChecked({})
        setAdded(true)
      } catch (e) {
        console.error("bundle add to cart failed", e)
        setError("Sorry, something went wrong adding to your cart. Please try again or WhatsApp us.")
      } finally {
        setAdding(false)
      }
    },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
