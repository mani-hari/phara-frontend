// Server-only: reads Vercel's IP-geolocation headers (same headers already
// used in checkout/page.tsx and (main)/layout.tsx for region detection) to
// suggest which language pill to show second in the switcher. NEVER used to
// auto-select or auto-redirect — English stays the default view regardless.
// On localhost (no Vercel edge network) these headers are simply absent, so
// this falls back to no hint / standard pill order — expected and fine for
// local testing; the hinting only becomes visible once deployed to Vercel.
import { headers } from "next/headers"
import { hintedLangForRegion, type LangCode } from "./languages"

export function getHintedLang(): LangCode | null {
  try {
    const h = headers()
    const country = h.get("x-vercel-ip-country")
    const region = h.get("x-vercel-ip-country-region")
    return hintedLangForRegion(country, region)
  } catch {
    return null
  }
}
