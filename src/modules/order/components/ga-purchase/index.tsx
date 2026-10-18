"use client"

import { trackEcommerce } from "@lib/analytics"
import { useEffect } from "react"

type Item = { id: string; name: string; price: number; quantity: number; variant?: string }

/** Sends the GA4 purchase event once per order (the confirmed page can be revisited or refreshed). */
export default function GaPurchase(props: { orderId: string; currency: string; value: number; shipping: number; items: Item[] }) {
  useEffect(() => {
    const key = `ga_purchase_${props.orderId}`
    try {
      if (localStorage.getItem(key)) return
    } catch {}
    const send = () => {
      trackEcommerce("purchase", {
        transaction_id: props.orderId,
        currency: props.currency,
        value: props.value,
        shipping: props.shipping,
        items: props.items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity, item_variant: i.variant })),
      })
      try {
        localStorage.setItem(key, "1")
      } catch {}
    }
    // gtag may still be loading (afterInteractive); retry briefly.
    let tries = 0
    const t = setInterval(() => {
      if (typeof window.gtag === "function" || tries++ > 20) {
        clearInterval(t)
        if (typeof window.gtag === "function") send()
      }
    }, 250)
    return () => clearInterval(t)
  }, [props])
  return null
}
