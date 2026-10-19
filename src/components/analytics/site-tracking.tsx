"use client"

import { useEffect } from "react"
import { track } from "@lib/analytics"

// Site-wide click tracking for the ways people reach a person, which are leads for this business:
// WhatsApp, phone and email links anywhere on the site (header, footer, product pages, checkout help, chat).
// One listener, so new links are covered automatically. Event: contact_click { method, link_location, page }.
export default function SiteTracking() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a") as HTMLAnchorElement | null
      if (!a?.href) return
      const href = a.href
      const method = /wa\.me|api\.whatsapp\.com|whatsapp:/.test(href)
        ? "whatsapp"
        : href.startsWith("tel:")
          ? "phone"
          : href.startsWith("mailto:")
            ? "email"
            : null
      if (!method) return
      const loc = (a.closest("[data-track-loc]") as HTMLElement | null)?.dataset.trackLoc
      const area = loc || (a.closest("footer") ? "footer" : a.closest("header") ? "header" : "page")
      track("contact_click", { method, link_location: area, page: window.location.pathname })
    }
    document.addEventListener("click", onClick, { capture: true })
    return () => document.removeEventListener("click", onClick, { capture: true })
  }, [])
  return null
}
