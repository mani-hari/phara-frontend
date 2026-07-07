import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import PriceSubscript from "@modules/common/components/price-subscript"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {!variant && (
          <span
            style={{
              fontFamily: "var(--sans)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--ink-4)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            From
          </span>
        )}
        <span
          style={{
            fontFamily: "var(--sans)",
            fontSize: 30,
            fontWeight: 700,
            color: "var(--ink)",
            letterSpacing: "-0.02em",
            fontFeatureSettings: "'tnum' 1",
            lineHeight: 1,
          }}
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
        {selectedPrice.price_type === "sale" && (
          <>
            <span
              style={{
                fontFamily: "var(--sans)",
                fontSize: 16,
                color: "var(--ink-4)",
                textDecoration: "line-through",
                fontFeatureSettings: "'tnum' 1",
              }}
              data-testid="original-product-price"
              data-value={selectedPrice.original_price_number}
            >
              {selectedPrice.original_price}
            </span>
            <span
              style={{
                fontFamily: "var(--sans)",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--sindoor)",
                background: "rgba(182,68,46,0.08)",
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              -{selectedPrice.percentage_diff}%
            </span>
          </>
        )}
        <PriceSubscript
          amount={
            typeof selectedPrice.calculated_price_number === "number"
              ? selectedPrice.calculated_price_number / 100 // stored in minor units (cents)
              : undefined
          }
          currencyCode={(selectedPrice as any).currency_code}
        />
      </div>
    </div>
  )
}
