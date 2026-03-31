import { HttpTypes } from "@medusajs/types"
import { listProducts } from "@lib/data/products"
import ProductPreview from "@modules/products/components/product-preview"
import { ArrowRight, TrendingUp } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type PopularThisMonthProps = {
  region: HttpTypes.StoreRegion
  featuredProductIds?: string[]
}

export default async function PopularThisMonth({
  region,
  featuredProductIds = [],
}: PopularThisMonthProps) {
  // Fetch all products
  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      limit: 20,
    },
  })

  if (!products || products.length === 0) return null

  // Filter out products that are already in featured collections
  let popular = featuredProductIds.length > 0
    ? products.filter((p) => !featuredProductIds.includes(p.id))
    : products

  // If no non-featured products, show all products
  if (popular.length === 0) {
    popular = products
  }

  // Take up to 4 products
  const displayProducts = popular.slice(0, 4)

  if (displayProducts.length === 0) return null

  return (
    <section className="py-16 sm:py-20 bg-grey-5">
      <div className="content-container">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-brand-600" />
              <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
                Trending Now
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-grey-90">
              Pujas & Homams Popular This Month
            </h2>
          </div>
          <LocalizedClientLink
            href="/store"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </LocalizedClientLink>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayProducts.map((product) => (
            <div key={product.id}>
              <ProductPreview product={product} region={region} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
