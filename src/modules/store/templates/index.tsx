import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="bg-[#fffdf9]" data-testid="category-container">
      <section className="border-t border-brand-200 bg-gradient-to-r from-[#2f241d] via-brand-900 to-[#6b3d1e] text-white">
        <div className="content-container px-20 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-200">
            Complete Catalog
          </p>
          <h1 className="mt-4 font-display text-[42px] leading-tight">
            Explore every puja, temple service, astrology reading, and sacred
            item
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-brand-100/90">
            This page is driven directly by the Medusa backend catalog. Prices
            are region-aware, and product cards use the actual backend images
            whenever they are available.
          </p>
        </div>
      </section>

      <section className="content-container px-20 py-12">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
              Live Products
            </p>
            <h2 className="mt-2 font-display text-[32px] text-grey-90">
              All services
            </h2>
          </div>
          <RefinementList sortBy={sort} />
        </div>

        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
          />
        </Suspense>
      </section>
    </div>
  )
}

export default StoreTemplate
