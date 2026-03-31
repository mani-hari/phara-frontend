import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()
  const metadata = (cart.metadata || {}) as Record<string, unknown>
  const devoteeNames =
    typeof metadata.devotee_name === "string" ? metadata.devotee_name : ""
  const datePreference =
    typeof metadata.date_preference === "string" ? metadata.date_preference : ""
  const sankalpamNotes =
    typeof metadata.sankalpam_notes === "string" ? metadata.sankalpam_notes : ""

  return (
    <div className="content-container py-12">
      <div className="grid grid-cols-1 gap-10 small:grid-cols-[1fr_416px] small:gap-x-20">
        <div className="space-y-8">
          {(devoteeNames || datePreference || sankalpamNotes) && (
            <section className="rounded-2xl border border-brand-100 bg-[#fff8f1] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                Sankalpam Summary
              </p>
              {devoteeNames && (
                <p className="mt-3 text-sm text-grey-80">
                  <span className="font-semibold">Devotees:</span> {devoteeNames}
                </p>
              )}
              {datePreference && (
                <p className="mt-2 text-sm text-grey-80">
                  <span className="font-semibold">Preferred date:</span>{" "}
                  {datePreference}
                </p>
              )}
              {sankalpamNotes && (
                <p className="mt-2 text-sm leading-6 text-grey-80">
                  <span className="font-semibold">Prayer notes:</span>{" "}
                  {sankalpamNotes}
                </p>
              )}
            </section>
          )}

          <PaymentWrapper cart={cart}>
            <CheckoutForm cart={cart} customer={customer} />
          </PaymentWrapper>
        </div>
        <CheckoutSummary cart={cart} />
      </div>
    </div>
  )
}
