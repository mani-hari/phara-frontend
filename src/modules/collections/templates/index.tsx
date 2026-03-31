import { Suspense } from "react"

import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const collectionPageCopy: Record<
  string,
  { eyebrow: string; title: string; description: string; popularLabel: string }
> = {
  "pujas-and-homams": {
    eyebrow: "Sacred Rituals",
    title: "Pujas & Homams for Specific Life Needs",
    description:
      "Choose from our real Medusa catalog of pujas and homams for prosperity, protection, family wellbeing, education, and planetary relief.",
    popularLabel: "Popular Pujas",
  },
  "astrology-services": {
    eyebrow: "Jyotish Guidance",
    title: "Astrology Services Backed by Traditional Practice",
    description:
      "Consultation reports and focused astrology services with region-aware pricing pulled directly from Medusa.",
    popularLabel: "Popular Readings",
  },
}

const needGroups = [
  {
    title: "Prosperity & Growth",
    keywords: ["lakshmi", "career", "prosperity", "business", "ganapathi"],
  },
  {
    title: "Protection & Relief",
    keywords: ["sudarshana", "mrityunjaya", "rahu", "ketu", "navagraha"],
  },
  {
    title: "Family, Marriage & Health",
    keywords: ["swayamvara", "ayushya", "dhanwantari", "pregnancy", "saraswati"],
  },
]

export default async function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products: collectionProducts },
  } = await listProducts({
    countryCode,
    queryParams: {
      collection_id: [collection.id],
      limit: 24,
    },
  })

  const copy = collectionPageCopy[collection.handle || ""] || {
    eyebrow: "PariharaOnline Catalog",
    title: collection.title,
    description:
      collection.metadata?.description?.toString() ||
      `${collection.title} available to book online through PariharaOnline.`,
    popularLabel: "Popular in this collection",
  }

  const popularProducts = collectionProducts.slice(0, 3)

  const groupedProducts =
    collection.handle === "pujas-and-homams"
      ? needGroups
          .map((group) => ({
            ...group,
            products: collectionProducts
              .filter((product) =>
                group.keywords.some((keyword) =>
                  product.title.toLowerCase().includes(keyword)
                )
              )
              .slice(0, 3),
          }))
          .filter((group) => group.products.length > 0)
      : []

  return (
    <div className="bg-[#fffdf9]" data-testid="category-container">
      <section className="border-t border-brand-200 bg-gradient-to-r from-[#2f241d] via-brand-900 to-[#6b3d1e] text-white">
        <div className="content-container px-20 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-200">
            {copy.eyebrow}
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="font-display text-[42px] leading-tight">
                {copy.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-100/90">
                {copy.description}
              </p>
            </div>
            <LocalizedClientLink
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Need help choosing a puja?
            </LocalizedClientLink>
          </div>
        </div>
      </section>

      <section className="content-container px-20 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
              Curated Picks
            </p>
            <h2 className="mt-2 font-display text-[32px] text-grey-90">
              {copy.popularLabel}
            </h2>
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {popularProducts.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} />
            </li>
          ))}
        </ul>
      </section>

      {groupedProducts.length > 0 && (
        <section className="content-container px-20 pb-8">
          <div className="rounded-[28px] border border-brand-100 bg-white p-8">
            <h2 className="font-display text-[30px] text-grey-90">
              Browse pujas based on your need
            </h2>
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              {groupedProducts.map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
                    {group.title}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {group.products.map((product) => (
                      <li key={product.id}>
                        <LocalizedClientLink
                          href={`/products/${product.handle}`}
                          className="block rounded-xl border border-grey-10 bg-[#fff8f1] px-4 py-3 text-sm font-medium text-grey-80 transition-colors hover:border-brand-200 hover:text-brand-800"
                        >
                          {product.title}
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="content-container px-20 py-12">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
              Full Collection
            </p>
            <h2 className="mt-2 font-display text-[32px] text-grey-90">
              Explore every service in {collection.title}
            </h2>
          </div>
          <RefinementList sortBy={sort} data-testid="sort-by-container" />
        </div>

        <Suspense
          fallback={
            <SkeletonProductGrid numberOfProducts={collection.products?.length} />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            collectionId={collection.id}
            countryCode={countryCode}
          />
        </Suspense>
      </section>
    </div>
  )
}
