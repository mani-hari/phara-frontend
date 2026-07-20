import { retrieveCart, listCartOptions } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { listRegions } from "@lib/data/regions"
import OnePageCheckout from "@modules/checkout/templates/one-page-checkout"
import { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout({
  params,
}: {
  params: { countryCode: string }
}) {
  const { countryCode } = params
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  // Countries served by the cart's current region. Medusa returns EVERY zone's
  // shipping options when the cart has no shipping address yet, so keep only
  // those whose service zone serves a country in this region (India-only
  // options don't show on a USD cart and vice-versa).
  const regions = await listRegions().catch(() => [])
  const regionCountries = new Set(
    (
      (regions || []).find((r: any) => r.id === cart.region_id)?.countries || []
    ).map((c: any) => c.iso_2)
  )

  // Every country served across ALL regions (India + International), de-duped.
  // The checkout delivery-country selector shows this full union so a buyer can
  // pick a destination outside their own billing region (e.g. an INR visitor
  // shipping abroad, or a USD visitor shipping to India). Whether the picked
  // country is in the cart's own region decides native vs escape-hatch handling
  // in the checkout — currency is NEVER changed by it. See docs/ARCHITECTURE.md.
  const allCountriesMap = new Map<string, { iso_2: string; name: string }>()
  for (const r of regions || []) {
    for (const c of (r as any).countries || []) {
      const iso = (c.iso_2 || "").toLowerCase()
      if (iso && !allCountriesMap.has(iso)) {
        allCountriesMap.set(iso, { iso_2: iso, name: c.display_name || c.name || iso.toUpperCase() })
      }
    }
  }
  const allCountries = Array.from(allCountriesMap.values())

  let availableShippingMethods: any[] = []
  try {
    const { shipping_options } = await listCartOptions()
    availableShippingMethods = (shipping_options || []).filter((o: any) => {
      const geos = o.service_zone?.geo_zones || []
      return (
        geos.length === 0 ||
        geos.some((g: any) => regionCountries.has(g.country_code))
      )
    })
  } catch {
    // no shipping options
  }

  const isIndia = countryCode === "in"

  // IP-based country (set by Vercel in prod; absent locally). Used to
  // pre-select the delivery country instead of the region's first country.
  const ipCountry =
    headers().get("x-vercel-ip-country")?.toLowerCase() || null

  return (
    <div
      style={{ background: "var(--paper)", minHeight: "calc(100vh - 64px)", paddingTop: 32, paddingBottom: 80 }}
    >
      <div className="content-container" data-testid="checkout-container">
        {/* Centered, comfortable max-width so the two columns sit centered with
            generous side margins instead of spanning the full 1440px container. */}
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "clamp(30px, 4vw, 40px)",
              color: "var(--ink)",
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            Quick Checkout
          </h1>
          <OnePageCheckout
            cart={cart}
            customer={customer}
            availableShippingMethods={availableShippingMethods}
            allCountries={allCountries}
            countryCode={countryCode}
            isIndia={isIndia}
            ipCountry={ipCountry}
          />
        </div>
      </div>
    </div>
  )
}
