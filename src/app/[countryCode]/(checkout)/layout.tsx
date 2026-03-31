import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import { ChevronLeft } from "lucide-react"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Nav />
      <div className="bg-[#fff8f1] border-b border-brand-100">
        <div className="content-container px-20 py-6">
          <LocalizedClientLink
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-700"
            data-testid="back-to-cart-link"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to shopping cart
          </LocalizedClientLink>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
              Secure Checkout
            </p>
            <h1 className="mt-2 font-display text-[36px] leading-tight text-grey-90">
              Complete your puja booking
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-grey-50">
              Your devotee details, delivery address, and payment remain inside
              the PariharaOnline storefront all the way to order completion.
            </p>
          </div>
        </div>
      </div>
      <div className="relative bg-white" data-testid="checkout-container">
        {children}
      </div>
      <Footer />
    </>
  )
}
