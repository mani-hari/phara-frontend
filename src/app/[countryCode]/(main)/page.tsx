import { Metadata } from "next"

import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import MockHomepage from "@modules/home/templates/mock-homepage"

export const metadata: Metadata = {
  title: "PariharaOnline - Ancient Rituals, Modern Convenience",
  description:
    "Book authentic Hindu temple pujas, homams, and astrology services online. Sacred prasad delivered worldwide from renowned temples across India.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: {
      limit: 100,
    },
  })

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
      <MockHomepage countryCode={countryCode} products={products} region={region} />
    </>
  )
}
