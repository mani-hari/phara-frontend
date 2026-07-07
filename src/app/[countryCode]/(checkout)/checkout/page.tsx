import { retrieveCart, listCartOptions } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import OnePageCheckout from "@modules/checkout/templates/one-page-checkout"
import { Metadata } from "next"
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

  return (
    <div
      style={{ background: "var(--paper)", minHeight: "calc(100vh - 64px)", paddingTop: 32, paddingBottom: 80 }}
    >
      <div className="content-container" data-testid="checkout-container">
        <OnePageCheckout
          cart={cart}
          customer={customer}
          availableShippingMethods={availableShippingMethods}
          countryCode={countryCode}
          isIndia={isIndia}
        />
      </div>
    </div>
  )
}
