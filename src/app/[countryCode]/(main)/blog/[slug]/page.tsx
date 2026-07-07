import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { getBlogPostBySlug, getBlogPostSlugs } from "@lib/data/blog"
import { markdownToHtml } from "@lib/util/markdown"
import { localizeHref } from "@lib/util/localize-href"
import { ArrowLeft, Clock3 } from "lucide-react"

export async function generateStaticParams() {
  const slugs = await getBlogPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await props.params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    return {}
  }

  return {
    title: `${post.title} | PariharaOnline Blog`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage(props: {
  params: Promise<{ countryCode: string; slug: string }>
}) {
  const { countryCode, slug } = await props.params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "PariharaOnline",
    },
  }

  return (
    <div className="bg-white pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <section className="bg-gradient-to-br from-brand-50 via-white to-warm-50 py-12">
        <div className="content-container max-w-4xl">
          <Link
            href={localizeHref(countryCode, "/blog")}
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all articles
          </Link>

          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-grey-90 sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-grey-60">
            {post.excerpt}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-grey-50">
            <span>By {post.author}</span>
            <span>{new Date(post.publishedAt).toLocaleDateString("en-US")}</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-4 w-4" />
              {post.readingTime} min read
            </span>
          </div>
        </div>
      </section>

      <article className="content-container max-w-3xl pt-12">
        <div
          dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
        />
      </article>
    </div>
  )
}
