// ─────────────────────────────────────────────────────────────────────────────
// Site analytics IDs — SINGLE SOURCE OF TRUTH.
//
// To change either tag, edit the fallback string here (or, for env-based
// control, set NEXT_PUBLIC_GA4_ID / NEXT_PUBLIC_CLARITY_ID in Vercel and it
// overrides the value below). These IDs are public by design (they ship to the
// browser), so hardcoding them here is safe and means analytics works on every
// deploy with no extra env setup.
//
// GA4  = Google Analytics 4 Measurement ID (looks like "G-XXXXXXXXXX")
// CLARITY = Microsoft Clarity project ID (the "…/tag/<id>" value)
// Set either to "" to disable that tag entirely.
// ─────────────────────────────────────────────────────────────────────────────

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "G-78BCF56K29"
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "xiyhxkfax5"

type GaItem = { item_id: string; item_name: string; price?: number; quantity?: number; item_variant?: string }

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function track(event: string, params: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return
  try {
    window.gtag("event", event, params)
  } catch {
    // never let analytics break the page
  }
}

export function trackEcommerce(
  event: "add_to_cart" | "begin_checkout" | "purchase" | "view_item" | "add_shipping_info" | "add_payment_info",
  data: { currency: string; value: number; items: GaItem[]; transaction_id?: string; shipping?: number }
) {
  track(event, { ...data, currency: data.currency.toUpperCase() })
}

/** The visitor's GA client and session ids (for the server-side purchase backup: stored on the cart, sent by
 *  Medusa when the order is placed, so a sale still counts if the buyer never reaches the confirmation page). */
export function gaIds(): Promise<{ client_id?: string; session_id?: string }> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof window.gtag !== "function" || !GA4_ID) return resolve({})
    const out: { client_id?: string; session_id?: string } = {}
    let left = 2
    const done = () => --left === 0 && resolve(out)
    try {
      window.gtag("get", GA4_ID, "client_id", (v: string) => ((out.client_id = v), done()))
      window.gtag("get", GA4_ID, "session_id", (v: string) => ((out.session_id = String(v)), done()))
    } catch {
      resolve(out)
    }
    setTimeout(() => resolve(out), 1500)
  })
}

/** Adds share tracking to a link we ask people to forward (WhatsApp blessings, darshan shares), so the visits it
 *  brings show up in GA as shares instead of "direct". */
export function withShareUtm(url: string, campaign: string, source = "whatsapp") {
  try {
    const u = new URL(url)
    u.searchParams.set("utm_source", source)
    u.searchParams.set("utm_medium", "share")
    u.searchParams.set("utm_campaign", campaign)
    return u.toString()
  } catch {
    return url
  }
}
