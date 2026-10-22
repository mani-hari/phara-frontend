import { Dialog, Transition } from "@headlessui/react"
import { Button, clx } from "@medusajs/ui"
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"

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

  // Tapping the bar always opens a sheet (name, photo, price, options, quantity) with one Add button.
  const [sheet, setSheet] = useState(false)
  const wasAdding = useRef(false)
  useEffect(() => {
    if (wasAdding.current && !isAdding) setSheet(false) // close once the add has finished
    wasAdding.current = !!isAdding
  }, [isAdding])
  useEffect(() => {
    if (!sheet) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [sheet])
  void state; void open; void close; void isSimple

  const image = product.thumbnail || product.images?.[0]?.url || null
  const shortTitle = product.title.split(/\s[-–|/]\s|[(:]/)[0].trim()

  return (
    <>
      <div className={clx("lg:hidden inset-x-0 bottom-0 fixed z-50", { "pointer-events-none": !show })}>
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
          <div className="ph-sticky-buy ph-buybar" data-testid="mobile-actions">
            <div style={{ flex: 1, minWidth: 0 }}>
              <p data-testid="mobile-title" className="ph-buybar-title">{shortTitle}</p>
              {selectedPrice && <p className="ph-buybar-price">{selectedPrice.calculated_price}</p>}
            </div>
            <button type="button" onClick={() => setSheet(true)} className="ph-buybar-btn" data-testid="mobile-cart-button">
              {buttonText || "Add to cart"}
            </button>
          </div>
        </Transition>
      </div>

      {sheet && (
        <div className="bundle-sheet-root lg:hidden" role="dialog" aria-modal="true" aria-label={shortTitle}>
          <button type="button" className="bundle-sheet-backdrop" aria-label="Close" onClick={() => setSheet(false)} />
          <div className="bundle-sheet" data-testid="mobile-actions-modal">
            <div className="bundle-sheet-grip" aria-hidden />
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
              {image && (
                <div style={{ position: "relative", width: 64, height: 64, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "var(--paper-2)" }}>
                  <Image src={image} alt="" fill sizes="64px" className="object-cover" />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, lineHeight: 1.35, color: "var(--ink)" }}>{product.title}</p>
                {selectedPrice && <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 18, color: "var(--sindoor)" }}>{selectedPrice.calculated_price}</p>}
              </div>
              <button
                type="button"
                onClick={() => setSheet(false)}
                aria-label="Close"
                data-testid="close-modal-button"
                style={{ width: 40, height: 40, borderRadius: 999, border: "1px solid var(--ink-line)", background: "var(--paper)", flexShrink: 0 }}
              >
                ✕
              </button>
            </div>

            {(product.variants?.length ?? 0) > 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
                {(product.options || []).map((option) => (
                  <OptionSelect
                    key={option.id}
                    option={option}
                    current={options[option.id]}
                    updateOption={updateOptions}
                    title={option.title ?? ""}
                    disabled={optionsDisabled}
                  />
                ))}
              </div>
            )}

            {inStock && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span className="ph-label">Quantity</span>
                <QuantitySelector quantity={quantity} onChange={updateQuantity} max={maxQuantity} disabled={isAdding} data-testid="mobile-quantity-selector" />
              </div>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock || !variant || isAdding}
              className="ph-btn ph-btn-sindoor ph-btn-lg ph-btn-block"
              style={{ opacity: !inStock || !variant || isAdding ? 0.6 : 1 }}
            >
              {isAdding ? "Adding…" : !variant ? "Choose an option" : !inStock ? "Out of stock" : buttonText || "Add to cart"}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default MobileActions
