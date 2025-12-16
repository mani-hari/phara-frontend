"use client"

import { addToCart, PujaDetailsMetadata } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import PujaDetailsForm, { PujaDetails } from "@modules/puja/components/puja-details-form"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  showPujaDetails?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

const initialPujaDetails: PujaDetails = {
  devotee_name: "",
  nakshatram: "",
  rasi: "",
  gothram: "",
  date_preference: "",
  sankalpam_notes: "",
}

export default function ProductActions({
  product,
  disabled,
  showPujaDetails = true,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [pujaDetails, setPujaDetails] = useState<PujaDetails>(initialPujaDetails)
  const [showPujaForm, setShowPujaForm] = useState(false)
  const countryCode = useParams().countryCode as string

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // Check if puja details are valid (devotee name is required)
  const isPujaDetailsValid = !showPujaDetails || !showPujaForm || pujaDetails.devotee_name.trim() !== ""

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    // If puja form is shown but devotee name is empty, show the form
    if (showPujaDetails && !showPujaForm) {
      setShowPujaForm(true)
      return
    }

    // Validate puja details if form is shown
    if (showPujaDetails && showPujaForm && !pujaDetails.devotee_name.trim()) {
      return
    }

    setIsAdding(true)

    // Prepare metadata for puja details
    const metadata: PujaDetailsMetadata | undefined = showPujaDetails && showPujaForm ? {
      devotee_name: pujaDetails.devotee_name,
      nakshatram: pujaDetails.nakshatram || undefined,
      rasi: pujaDetails.rasi || undefined,
      gothram: pujaDetails.gothram || undefined,
      date_preference: pujaDetails.date_preference || undefined,
      sankalpam_notes: pujaDetails.sankalpam_notes || undefined,
    } : undefined

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
      metadata,
    })

    // Reset form after adding to cart
    setPujaDetails(initialPujaDetails)
    setShowPujaForm(false)
    setIsAdding(false)
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        {/* Puja Details Form */}
        {showPujaDetails && showPujaForm && (
          <div className="my-4">
            <PujaDetailsForm
              value={pujaDetails}
              onChange={setPujaDetails}
              disabled={isAdding}
            />
          </div>
        )}

        <Button
          onClick={handleAddToCart}
          disabled={
            !inStock ||
            !selectedVariant ||
            !!disabled ||
            isAdding ||
            !isValidVariant ||
            (showPujaForm && !isPujaDetailsValid)
          }
          variant="primary"
          className="w-full h-10"
          isLoading={isAdding}
          data-testid="add-product-button"
        >
          {!selectedVariant && !options
            ? "Select variant"
            : !inStock || !isValidVariant
            ? "Out of stock"
            : showPujaDetails && !showPujaForm
            ? "Add Puja Details"
            : "Add to cart"}
        </Button>

        {showPujaDetails && showPujaForm && (
          <Button
            variant="secondary"
            className="w-full h-10"
            onClick={() => setShowPujaForm(false)}
            disabled={isAdding}
          >
            Skip Puja Details
          </Button>
        )}

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
