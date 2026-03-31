import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-2">
        <h1
          className="text-2xl sm:text-3xl font-bold text-grey-90 leading-tight"
          data-testid="product-title"
        >
          {product.title}
        </h1>
      </div>
    </div>
  )
}

export default ProductInfo
