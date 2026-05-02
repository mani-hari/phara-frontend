import { Metadata } from "next"

import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import HomeV3 from "@modules/home/templates/home-v3"

export const metadata: Metadata = {
  title: "PariharaOnline - Ancient Rituals, Modern Convenience",
  description:
    "Book authentic Hindu temple pujas, homams, and astrology services online. Sacred prasad delivered worldwide from renowned temples across India.",
}

// Render at request time so the build doesn't depend on Medusa being
// reachable from Vercel's build environment.
export const dynamic = "force-dynamic"

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  // Soft-fail Medusa so the home renders even when the backend is briefly
  // unreachable. Featured-product cards just show empty if the catalog
  // can't be loaded.
  const [region, productsResponse] = await Promise.all([
    getRegion(countryCode).catch(() => null),
    listProducts({ countryCode, queryParams: { limit: 100 } }).catch(() => ({
      response: { products: [] as any[] },
    })),
  ])

  const products = productsResponse?.response?.products ?? []

  const homepageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PariharaOnline",
    url: "https://pariharaonline.com",
    description:
      "Book authentic Hindu temple pujas, homams, and astrology services online. Sacred prasad delivered worldwide.",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
      />
      <HomeV3 countryCode={countryCode} products={products} region={region as any} />
    </>
  )
}
