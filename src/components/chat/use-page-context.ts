"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

type VisitedPage = { url: string; title: string; ts: number }
type CartItem = { title: string; quantity: number; priceInr: number }

export type PageContext = {
  currentUrl: string
  currentTitle: string
  visitedPages: VisitedPage[]
  cartItems: CartItem[]
}

const SESSION_KEY = "ph_visited_pages"
const MAX_PAGES = 10

function getSessionPages(): VisitedPage[] {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "[]")
  } catch {
    return []
  }
}

function saveSessionPages(pages: VisitedPage[]) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(pages.slice(-MAX_PAGES)))
  } catch {}
}

async function fetchCartItems(): Promise<CartItem[]> {
  try {
    const cartId = document.cookie
      .split("; ")
      .find((c) => c.startsWith("_medusa_cart_id="))
      ?.split("=")[1]
    if (!cartId) return []

    const backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://pariharaonline.medusajs.app"
    const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

    const res = await fetch(`${backendUrl}/store/carts/${cartId}?fields=items,items.title,items.quantity,items.unit_price`, {
      headers: { "x-publishable-api-key": pubKey },
    })
    if (!res.ok) return []
    const { cart } = await res.json()
    return (cart?.items || []).map((item: any) => ({
      title: item.product_title || item.title || "Service",
      quantity: item.quantity,
      priceInr: Math.round(item.unit_price || 0),
    }))
  } catch {
    return []
  }
}

export function usePageContext(): PageContext {
  const pathname = usePathname()
  const [context, setContext] = useState<PageContext>({
    currentUrl: "",
    currentTitle: "",
    visitedPages: [],
    cartItems: [],
  })
  const cartFetched = useRef(false)

  useEffect(() => {
    const url = window.location.href
    const title = document.title.replace(" | PariharaOnline", "").trim()

    // Update session history
    const pages = getSessionPages()
    const last = pages[pages.length - 1]
    if (!last || last.url !== url) {
      pages.push({ url, title, ts: Date.now() })
      saveSessionPages(pages)
    }

    const fetch = async () => {
      const cartItems = cartFetched.current ? context.cartItems : await fetchCartItems()
      cartFetched.current = true
      setContext({ currentUrl: url, currentTitle: title, visitedPages: pages, cartItems })
    }
    fetch()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return context
}

export function getOrCreateSessionId(): string {
  const key = "ph_chat_session"
  try {
    let id = sessionStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(key, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}
