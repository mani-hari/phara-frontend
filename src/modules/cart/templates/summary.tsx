"use client"

import { Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-xl font-bold text-grey-90">
        Order Summary
      </Heading>

      {/* Cart items summary */}
      <div className="flex flex-col gap-y-2">
        {cart.items?.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-grey-60 truncate mr-4">
              {(item as any).product_title || (item as any).title || "Service"}
            </span>
            <span className="text-grey-90 font-medium flex-shrink-0">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: cart.currency_code?.toUpperCase() || "INR",
              }).format((item.unit_price || 0) * (item.quantity || 1) / 100)}
            </span>
          </div>
        ))}
      </div>

      <Divider />
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />

      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
      >
        <button className="w-full py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors text-sm">
          Proceed to Checkout
        </button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
