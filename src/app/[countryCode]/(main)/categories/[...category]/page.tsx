import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { buildBreadcrumbJsonLd } from "@lib/util/json-ld"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

// Render at request time so the build doesn't depend on Medusa being
// reachable from Vercel's build environment.
export const dynamic = "force-dynamic"

export async function generateStaticParams() {
  try {
    const product_categories = await listCategories()
    if (!product_categories) return []

    const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    const categoryHandles = product_categories.map(
      (category: any) => category.handle
    )

    return (
      countryCodes
        ?.map((countryCode: string | undefined) =>
          categoryHandles.map((handle: any) => ({
            countryCode,
            category: [handle],
          }))
        )
        .flat() ?? []
    )
  } catch (error) {
    console.warn("[categories] generateStaticParams failed; falling back to on-demand:", error)
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)

    const title = productCategory.name + " | Medusa Store"

    const description = productCategory.description ?? `${title} category.`

    return {
      title: `${title} | Medusa Store`,
      description,
      alternates: {
        canonical: `/categories/${params.category.join("/")}`,
      },
      openGraph: { url: `/categories/${params.category.join("/")}` },
    }
  } catch (error) {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  // Best-effort ancestry from parent_category chain, when populated.
  const ancestors: { name: string; url: string }[] = []
  let ancestor = productCategory.parent_category
  while (ancestor) {
    ancestors.unshift({ name: ancestor.name, url: `/categories/${ancestor.handle}` })
    ancestor = ancestor.parent_category
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    ...ancestors,
    { name: productCategory.name, url: `/categories/${params.category.join("/")}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryTemplate
        category={productCategory}
        sortBy={sortBy}
        page={page}
        countryCode={params.countryCode}
      />
    </>
  )
}
