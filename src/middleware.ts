import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

// Ghost-URL redirect map: old slug → canonical slug (path relative to country prefix).
// Canonical product slugs now match the pariharaonline.com Shopify slugs exactly
// (Medusa product handles were renamed to match — see .slug-migration/). These
// entries are a safety net that 301s any lingering *old* internal-handle links to
// the canonical slug; the canonical slugs themselves resolve directly (no redirect).
const GHOST_REDIRECTS: Record<string, string> = {
  "/products/maha-ganapathi-homam": "/products/maha-ganapathy-homam",
  "/products/sudarshana-homam": "/products/sudarsana-homam",
  "/products/durga-saptashati-chanting": "/products/mantra-chanting-of-700-verses-of-durga-saptashati",
  "/products/astrology-health-report": "/products/astrology-health",
  "/products/career-astrology-analysis": "/products/career-astrology",
  "/products/kamakshi-amman-temple": "/products/kanchi-kamakshi",
  "/products/murugan-temple-palani": "/products/palani",
  "/products/abhishekam-ganesha": "/products/brahmavidyaganapati",
  "/products/rahu-ketu-dosha-parihara": "/products/rahu-ketu-dosha-parihara-pooja-sarpa-dosha-parihara-pooja-at-sri-kalahasti-temple",
  "/products/thila-homam-rameswaram": "/products/tila-homam-at-rameswaram",
  "/products/shirdi-sai-baba-udi": "/products/shirdi-sai-baba-udi-prasadham",
  "/products/garbarakshambigai-ghee": "/products/garbharakshambika-ghee",
  "/products/garbarakshambigai-oil": "/products/garbharakshambika-oil",
  "/products/shakti-samriddhi": "/products/shakti-samriddhi-pooja-for-feminine-prosperity-family-well-being",
  "/products/coconut-breaking-ritual": "/products/temple-coconut-breaking-online",
  "/products/annadhanam-food-donation": "/products/annadhanam-donate-food-to-homeless-children",
  "/products/ganesha-hanuman-kavach": "/products/ganesha-hanuman-shakti-kavach-the-shield-of-protection-and-victory",
  "/products/maha-shivaratri-2026": "/products/maha-shivaratri",
  "/products/navratri-special-package": "/products/navratri-poojas-online",
  "/products/diwali-lakshmi-homam": "/products/diwali-puja",
  "/products/jupiter-transit-guru-peyarchi": "/products/guru-jupiter-transit",
}

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

// India is the default — its pages are served at clean URLs (no prefix).
// All other regions get a /{countryCode}/ prefix (e.g. /us/).
const DEFAULT_COUNTRY = (process.env.NEXT_PUBLIC_DEFAULT_REGION || "in").toLowerCase()

// Fallback set of known country codes used when Medusa is unreachable so that
// /{cc}/... paths are still recognised and not accidentally rewritten.
const KNOWN_COUNTRY_CODES = new Set(["in", "us"])

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL || !PUBLISHABLE_API_KEY) {
    console.warn(
      "[middleware] Missing MEDUSA_BACKEND_URL or NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY — skipping region fetch."
    )
    return regionMapCache.regionMap
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    try {
      const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: { "x-publishable-api-key": PUBLISHABLE_API_KEY },
        next: { revalidate: 3600, tags: [`regions-${cacheId}`] },
        cache: "force-cache",
      }).then(async (response) => {
        const json = await response.json()
        if (!response.ok) throw new Error(json.message ?? `regions ${response.status}`)
        return json
      })

      if (!regions?.length) {
        console.warn("[middleware] Medusa returned no regions.")
        return regionMapCache.regionMap
      }

      regions.forEach((region: HttpTypes.StoreRegion) => {
        region.countries?.forEach((c) => {
          regionMapCache.regionMap.set(c.iso_2 ?? "", region)
        })
      })

      regionMapCache.regionMapUpdated = Date.now()
    } catch (err) {
      console.warn("[middleware] Region fetch failed:", err)
    }
  }

  return regionMapCache.regionMap
}

/**
 * Returns true if the given URL segment is a recognised country code.
 * Falls back to KNOWN_COUNTRY_CODES when Medusa is unreachable.
 */
function isCountryCode(
  segment: string | undefined,
  regionMap: Map<string, HttpTypes.StoreRegion>
): boolean {
  if (!segment) return false
  return regionMap.has(segment) || KNOWN_COUNTRY_CODES.has(segment)
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname, search } = request.nextUrl
    const segments = pathname.split("/") // ["", firstSeg, ...]
    const firstSegment = segments[1]?.toLowerCase()

    const cacheIdCookie = request.cookies.get("_medusa_cache_id")
    const cacheId = cacheIdCookie?.value || crypto.randomUUID()

    const regionMap = await getRegionMap(cacheId)

    // Whether the URL already carries a country-code prefix
    const hasPrefix = isCountryCode(firstSegment, regionMap)

    // The path without the country prefix (used for ghost-redirect lookup)
    const cleanPath = hasPrefix
      ? "/" + segments.slice(2).join("/") || "/"
      : pathname

    // ── Ghost URL redirects ────────────────────────────────────────────────
    // Always redirect to the canonical clean-URL form for the current country.
    const effectiveCC = hasPrefix ? firstSegment : DEFAULT_COUNTRY
    const ghostTarget = GHOST_REDIRECTS[cleanPath]
    if (ghostTarget) {
      const target =
        effectiveCC === DEFAULT_COUNTRY
          ? ghostTarget
          : `/${effectiveCC}${ghostTarget}`
      return NextResponse.redirect(new URL(target, request.url), 301)
    }

    // ── Static asset pass-through ──────────────────────────────────────────
    if (pathname.includes(".")) return NextResponse.next()

    // ── URL has the DEFAULT country prefix → redirect to clean URL ─────────
    // e.g. /in/products/... → /products/...  (canonical)
    if (hasPrefix && firstSegment === DEFAULT_COUNTRY) {
      return NextResponse.redirect(
        new URL(cleanPath + search, request.url),
        301
      )
    }

    // ── URL has a non-default country prefix → pass through ────────────────
    // e.g. /us/products/... is fine as-is
    if (hasPrefix) {
      const response = NextResponse.next()
      if (!cacheIdCookie) {
        response.cookies.set("_medusa_cache_id", cacheId, { maxAge: 60 * 60 * 24 })
      }
      return response
    }

    // ── No country prefix — determine which country this visitor is in ──────
    // Admin override (a preview toggle) is honored ONLY for a logged-in
    // session. This prevents a stale/leaked admin_region_override cookie from
    // forcing the wrong region — e.g. INR for a logged-out US customer, which
    // would silently mis-price the whole catalog. Logged-out visitors always
    // get IP-based detection.
    const isAuthed = !!request.cookies.get("_medusa_jwt")?.value
    const adminOverride = request.cookies
      .get("admin_region_override")
      ?.value?.toLowerCase()

    let targetCountry = DEFAULT_COUNTRY

    if (adminOverride && isAuthed && isCountryCode(adminOverride, regionMap)) {
      targetCountry = adminOverride
    } else {
      const vercelCC = request.headers
        .get("x-vercel-ip-country")
        ?.toLowerCase()
      if (vercelCC && regionMap.has(vercelCC)) {
        targetCountry = vercelCC
      }
    }

    if (targetCountry === DEFAULT_COUNTRY) {
      // India (default): rewrite to /in/... internally — URL stays clean
      const rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = `/${DEFAULT_COUNTRY}${pathname}`
      const response = NextResponse.rewrite(rewriteUrl)
      if (!cacheIdCookie) {
        response.cookies.set("_medusa_cache_id", cacheId, { maxAge: 60 * 60 * 24 })
      }
      return response
    }

    // Non-default country (e.g. US): redirect to /{cc}/...
    return NextResponse.redirect(
      new URL(`/${targetCountry}${pathname}${search}`, request.url),
      307
    )
  } catch (err) {
    console.warn("[middleware] Unexpected failure, passing request through:", err)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
