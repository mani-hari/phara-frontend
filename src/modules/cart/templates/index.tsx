import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import PujaCartDetails from "../components/puja-cart-details"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="py-8 sm:py-12 bg-grey-5 min-h-[60vh]">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <>
            {/* Header */}
            <h1 className="text-2xl sm:text-3xl font-bold text-grey-90 mb-8">
              Your Cart ({cart.items.length}{" "}
              {cart.items.length === 1 ? "item" : "items"})
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
              {/* Left: Cart Items */}
              <div className="flex flex-col gap-y-4">
                {!customer && (
                  <>
                    <SignInPrompt />
                    <Divider />
                  </>
                )}
                <div className="bg-white rounded-xl border border-grey-10 p-6">
                  <ItemsTemplate cart={cart} />
                </div>
                <PujaCartDetails cart={cart} />
              </div>

              {/* Right: Summary */}
              <div className="relative">
                <div className="flex flex-col gap-y-6 lg:sticky lg:top-20">
                  <div className="bg-white rounded-xl border border-grey-10 p-6">
                    <Summary cart={cart as any} />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
