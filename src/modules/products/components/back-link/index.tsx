"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/** Small "← Back" above the title: returns to the previous page on this site, or to browsing when the
 *  visitor arrived from outside (Google, email), so it never sends them off-site. */
export default function BackLink({ fallback = "/collections/pujas-and-homams" }: { fallback?: string }) {
  const router = useRouter()
  const [internal, setInternal] = useState(false)
  useEffect(() => {
    try {
      setInternal(!!document.referrer && new URL(document.referrer).host === window.location.host && window.history.length > 1)
    } catch {}
  }, [])
  const style = { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--ink-3)", minHeight: 32 }
  return internal ? (
    <button type="button" onClick={() => router.back()} style={{ ...style, background: "none", border: 0, padding: 0, cursor: "pointer" }}>
      ← Back
    </button>
  ) : (
    <LocalizedClientLink href={fallback} style={style}>
      ← Browse all poojas
    </LocalizedClientLink>
  )
}
