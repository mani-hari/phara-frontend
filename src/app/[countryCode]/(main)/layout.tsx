import { Metadata } from "next"
import { headers } from "next/headers"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { getExchangeRates, localCurrencyForCountry } from "@lib/geo/currency"
import { LocalCurrencyProvider } from "@lib/context/local-currency"
import { StoreCartShippingOption } from "@medusajs/types"
import AskPariharaOverlay from "@/components/chat/ask-parihara-overlay"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

// Render at request time so the build doesn't depend on Medusa being
// reachable from Vercel's build environment.
export const dynamic = "force-dynamic"

export default async function PageLayout(props: { children: React.ReactNode }) {
  // Soft-fail every Medusa call so the chrome (nav + footer + chat pill)
  // still renders if the backend is briefly unreachable.
  const customer = await retrieveCustomer().catch(() => null)
  const cart = await retrieveCart().catch(() => null)
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const opts = await listCartOptions().catch(() => null)
    shippingOptions = opts?.shipping_options ?? []
  }

  // IP-based local currency for the display-only "≈ €X" price hint (intl only).
  const ipCountry = headers().get("x-vercel-ip-country")
  const localCurrency = localCurrencyForCountry(ipCountry)
  let localRate: number | null = null
  if (localCurrency && localCurrency !== "USD" && localCurrency !== "INR") {
    const rates = await getExchangeRates().catch(() => null)
    localRate = rates?.[localCurrency] ?? null
  }

  return (
    <LocalCurrencyProvider currency={localCurrency} rate={localRate}>
      <Nav />
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}
      {props.children}
      <Footer />
      <AskPariharaOverlay />
    </LocalCurrencyProvider>
  )
}
