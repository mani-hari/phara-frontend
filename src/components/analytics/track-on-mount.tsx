"use client"

import { useEffect } from "react"
import { track } from "@lib/analytics"

/** Sends one GA event when the page mounts (e.g. view_item on product pages). Waits briefly for gtag to load. */
export default function TrackOnMount({ event, params }: { event: string; params: Record<string, unknown> }) {
  useEffect(() => {
    let tries = 0
    const t = setInterval(() => {
      if (typeof window.gtag === "function" || tries++ > 40) {
        clearInterval(t)
        track(event, params)
      }
    }, 250)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, JSON.stringify(params)])
  return null
}
