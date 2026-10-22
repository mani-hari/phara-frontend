import { og } from "@lib/util/og"
import { seoFor } from "@lib/data/seo-overrides"
import { Metadata } from "next"

import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import HomeV3, { type HomeBlogPost } from "@modules/home/templates/home-v3"
import { getPublishedBlogPosts } from "@lib/data/blog"

const SEO_HOME = seoFor("/")!
export const metadata: Metadata = {
  title: { absolute: SEO_HOME.title },
  description: SEO_HOME.description,
  alternates: { canonical: "/" },
  openGraph: og({ url: "/", title: SEO_HOME.title, description: SEO_HOME.description }),
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
  // Latest published blog posts (scheduled posts appear on their publish day).
  const posts: HomeBlogPost[] = (await getPublishedBlogPosts(3).catch(() => [])).map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    publishedAt: p.publishedAt,
    image: p.image,
    imageAlt: p.imageAlt,
    readingTime: p.readingTime,
  }))

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
      <HomeV3 countryCode={countryCode} products={products} region={region as any} posts={posts} />
    </>
  )
}
