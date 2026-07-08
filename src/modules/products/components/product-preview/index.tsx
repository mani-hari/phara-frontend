import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
  imageHeight = 200,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  imageHeight?: number
}) {
  const { cheapestPrice } = getProductPrice({ product })

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        className="ph-card ph-lift"
        data-testid="product-wrapper"
        style={{ cursor: "pointer", overflow: "hidden" }}
      >
        <div
          style={{
            position: "relative",
            height: imageHeight,
            background:
              "radial-gradient(circle at 50% 30%, rgba(255,200,120,0.3), transparent 60%), var(--paper-2)",
            overflow: "hidden",
          }}
        >
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
          />
        </div>
        <div style={{ padding: "14px 16px 16px" }}>
          <p
            className="ph-body"
            data-testid="product-title"
            style={{
              fontWeight: 600,
              marginBottom: 6,
              color: "var(--ink)",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {product.title}
          </p>
          {cheapestPrice ? (
            <span
              className="ph-body-sm ph-num"
              style={{ color: "var(--sindoor)", fontWeight: 700 }}
              data-testid="price"
            >
              {cheapestPrice.calculated_price}
            </span>
          ) : (
            <span className="ph-body-sm" style={{ color: "var(--ink-4)" }}>
              Price on request
            </span>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
