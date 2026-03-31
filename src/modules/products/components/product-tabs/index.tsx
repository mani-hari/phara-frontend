"use client"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "About This Service",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Delivery & Prasad",
      component: <DeliveryInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-small-regular py-8">
      <div className="flex flex-col gap-y-4">
        {product.description && (
          <div>
            <p className="text-grey-60 leading-relaxed">{product.description}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-2">
          {product.type && (
            <div>
              <span className="font-semibold text-grey-90 text-xs uppercase tracking-wide">Service Type</span>
              <p className="text-grey-60 mt-1">{product.type.value}</p>
            </div>
          )}
          {product.collection && (
            <div>
              <span className="font-semibold text-grey-90 text-xs uppercase tracking-wide">Category</span>
              <p className="text-grey-60 mt-1">{product.collection.title}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const DeliveryInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-6">
        <div className="flex items-start gap-x-3">
          <span className="text-brand-600 text-lg">🙏</span>
          <div>
            <span className="font-semibold text-grey-90">Puja Completion</span>
            <p className="text-grey-50 max-w-sm mt-1">
              Most pujas and homams are completed within 7 days of ordering. Tentative dates provided within 1-2 business days via email.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <span className="text-brand-600 text-lg">📦</span>
          <div>
            <span className="font-semibold text-grey-90">Prasad Delivery</span>
            <p className="text-grey-50 max-w-sm mt-1">
              Sacred prasad is shipped after the ritual via Speed Post (India) or EMS (International) with tracking information.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <span className="text-brand-600 text-lg">🎥</span>
          <div>
            <span className="font-semibold text-grey-90">Video Evidence</span>
            <p className="text-grey-50 max-w-sm mt-1">
              For homams (fire rituals), video evidence of the ritual is provided so you can witness the sacred ceremony.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <span className="text-brand-600 text-lg">↩️</span>
          <div>
            <span className="font-semibold text-grey-90">Cancellation</span>
            <p className="text-grey-50 max-w-sm mt-1">
              Full refund if cancelled before the puja is performed. See our refund policy for complete details.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
