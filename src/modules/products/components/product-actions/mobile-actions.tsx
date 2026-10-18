import { Dialog, Transition } from "@headlessui/react"
import { Button, clx } from "@medusajs/ui"
import React, { Fragment, useMemo } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import ChevronDown from "@modules/common/icons/chevron-down"
import X from "@modules/common/icons/x"

import { getProductPrice } from "@lib/util/get-product-price"
import OptionSelect from "./option-select"
import { HttpTypes } from "@medusajs/types"
import { isSimpleProduct } from "@lib/util/product"
import QuantitySelector from "@modules/common/components/quantity-selector"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  options: Record<string, string | undefined>
  updateOptions: (title: string, value: string) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
  buttonText?: string
  quantity: number
  updateQuantity: (quantity: number) => void
  maxQuantity?: number
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  variant,
  options,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
  buttonText,
  quantity,
  updateQuantity,
  maxQuantity,
}) => {
  const { state, open, close } = useToggleState()

  const price = getProductPrice({
    product: product,
    variantId: variant?.id,
  })

  const selectedPrice = useMemo(() => {
    if (!price) {
      return null
    }
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  const isSimple = isSimpleProduct(product)

  return (
    <>
      <div
        className={clx("lg:hidden inset-x-0 bottom-0 fixed z-50", {
          "pointer-events-none": !show,
        })}
      >
        <Transition
          as={Fragment}
          show={show}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="ph-sticky-buy"
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 16px calc(10px + env(safe-area-inset-bottom))",
              background: "var(--paper)", borderTop: "1px solid var(--ink-line)", boxShadow: "0 -6px 20px rgba(0,0,0,0.06)",
            }}
            data-testid="mobile-actions"
          >
            {/* One slim row: what + price on the left, the action on the right (quantity lives in the card above). */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p data-testid="mobile-title" style={{ margin: 0, fontSize: 13, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {product.title}
              </p>
              {selectedPrice && (
                <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>
                  {selectedPrice.calculated_price}
                  {quantity > 1 ? <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-4)" }}> × {quantity}</span> : null}
                </p>
              )}
            </div>
            {!isSimple && !variant && (
              <button
                type="button"
                onClick={open}
                data-testid="mobile-actions-button"
                style={{ padding: "12px 14px", borderRadius: 999, border: "1px solid var(--ink-line)", background: "var(--paper)", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" }}
              >
                Choose option
              </button>
            )}
            {(isSimple || variant) && (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock || !variant || isAdding}
                data-testid="mobile-cart-button"
                className="ph-btn ph-btn-sindoor"
                style={{ whiteSpace: "nowrap", opacity: !inStock || !variant || isAdding ? 0.6 : 1 }}
              >
                {isAdding ? "Adding…" : !inStock ? "Out of stock" : buttonText || "Add to cart"}
              </button>
            )}
          </div>
        </Transition>
      </div>
      <Transition appear show={state} as={Fragment}>
        <Dialog as="div" className="relative z-[75]" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-700 bg-opacity-75 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed bottom-0 inset-x-0">
            <div className="flex min-h-full h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel
                  className="w-full h-full transform overflow-hidden text-left flex flex-col gap-y-3"
                  data-testid="mobile-actions-modal"
                >
                  <div className="w-full flex justify-end pr-6">
                    <button
                      onClick={close}
                      className="w-12 h-12 rounded-full flex justify-center items-center"
                      style={{ background: "var(--paper)", color: "var(--ink)" }}
                      data-testid="close-modal-button"
                    >
                      <X />
                    </button>
                  </div>
                  <div className="px-6 py-12" style={{ background: "var(--paper)" }}>
                    {(product.variants?.length ?? 0) > 1 && (
                      <div className="flex flex-col gap-y-6">
                        {(product.options || []).map((option) => {
                          return (
                            <div key={option.id}>
                              <OptionSelect
                                option={option}
                                current={options[option.id]}
                                updateOption={updateOptions}
                                title={option.title ?? ""}
                                disabled={optionsDisabled}
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileActions
