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

  let availableShippingMethods: any[] = []
  try {
    const { shipping_options } = await listCartOptions()
    availableShippingMethods = shipping_options || []
  } catch {
    // no shipping options
  }

  const isIndia = countryCode === "in"

  // IP-based country (set by Vercel in prod; absent locally). Used to
  // pre-select the delivery country instead of the region's first country.
  const ipCountry =
    headers().get("x-vercel-ip-country")?.toLowerCase() || null

  // Every served country across all regions (India→INR, rest→USD), so the
  // checkout country autosuggest can offer any country and switch region.
  const regions = await listRegions().catch(() => [])
  const allCountries = (regions || [])
    .flatMap((r: any) =>
      (r.countries || []).map((c: any) => ({
        iso_2: c.iso_2 || "",
        name: c.display_name || c.name || (c.iso_2 || "").toUpperCase(),
        region_id: r.id,
      }))
    )
    .filter((c: any) => c.iso_2)

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
            countryCode={countryCode}
            isIndia={isIndia}
            ipCountry={ipCountry}
            allCountries={allCountries}
          />
        </div>
      </div>
    </div>
  )
}
