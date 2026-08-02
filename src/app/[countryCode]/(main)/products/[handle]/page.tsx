import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import { getProductPrice } from "@lib/util/get-product-price"
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  extractHowToFromDescription,
} from "@lib/util/json-ld"
import { PRODUCT_FAQ_CONTENT } from "@lib/data/product-faq-content"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

// Render at request time so the build doesn't depend on Medusa being
// reachable from Vercel's build environment.
export const dynamic = "force-dynamic"

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        }))
      )
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
): HttpTypes.StoreProductImage[] {
  const allImages = product?.images ?? []

  if (!selectedVariantId || !product?.variants) {
    return allImages
  }

  const variant = product.variants.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images?.length) {
    return allImages
  }

  const imageIdsMap = new Map(variant.images.map((i) => [i.id, true]))
  return allImages.filter((i) => imageIdsMap.has(i.id))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  return {
    title: product.title,
    description: product.description || `${product.title} - Book authentic temple services at PariharaOnline`,
    // Canonical is the prefix-free URL so regional variants (/us, /fr, …)
    // all consolidate to https://www.pariharaonline.com/products/<handle>.
    alternates: { canonical: `/products/${handle}` },
    openGraph: {
      title: `${product.title} | PariharaOnline`,
      description: product.description || `${product.title} - Book authentic temple services at PariharaOnline`,
      url: `/products/${handle}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: params.handle },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  const images = getImagesForVariant(pricedProduct, selectedVariantId)

  const { cheapestPrice } = getProductPrice({ product: pricedProduct })

  const productPath = `/products/${params.handle}`

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pricedProduct.title,
    description: pricedProduct.description || pricedProduct.title,
    image: pricedProduct.thumbnail || undefined,
    sku: pricedProduct.id,
    url: productPath,
    ...(pricedProduct.collection?.title && {
      category: pricedProduct.collection.title,
    }),
    brand: {
      "@type": "Brand",
      name: "PariharaOnline",
    },
    // No aggregateRating/review markup — the site has no review system yet
    // and we don't fabricate ratings (MAN-18).
    ...(cheapestPrice && {
      offers: {
        "@type": "Offer",
        url: productPath,
        price: cheapestPrice.calculated_price_number,
        priceCurrency: cheapestPrice.currency_code?.toUpperCase(),
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: "PariharaOnline",
        },
      },
    }),
  }

  // BreadcrumbList — mirrors the visible breadcrumb rendered in
  // ProductTemplate (Home > Collection > Product).
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    pricedProduct.collection
      ? {
          name: pricedProduct.collection.title,
          url: `/collections/${pricedProduct.collection.handle}`,
        }
      : { name: "Store", url: "/store" },
    { name: pricedProduct.title, url: productPath },
  ])

  // HowTo — parsed from the real "How the homam/pooja is performed" section
  // of the product description, when present. Never fabricated.
  const howToJsonLd = extractHowToFromDescription({
    title: pricedProduct.title,
    description: pricedProduct.description,
    url: productPath,
  })

  // FAQPage — only for the hand-curated hero product pages (real Q&A).
  const faqEntries = PRODUCT_FAQ_CONTENT[params.handle]
  const faqJsonLd = faqEntries ? buildFaqJsonLd(faqEntries) : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {howToJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
        images={images}
        faqEntries={faqEntries}
      />
    </>
  )
}
