import { Metadata } from "next"
import Link from "next/link"

import { getPublishedBlogPosts } from "@lib/data/blog"
import PostCard from "@modules/blog/components/post-card"
import { localizeHref } from "@lib/util/localize-href"
import { ArrowRight, BookOpenText, PencilLine } from "lucide-react"

export const metadata: Metadata = {
  title: "PariharaOnline Blog",
  description:
    "Guides on pujas, astrology, prasad delivery, and how to choose the right spiritual remedy for life events.",
}

export default async function BlogIndexPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const posts = await getPublishedBlogPosts()
  const [featuredPost, ...otherPosts] = posts

  return (
    <div className="bg-white pb-20">
      <section className="bg-gradient-to-br from-brand-50 via-white to-warm-50 py-14 sm:py-18">
        <div className="content-container">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm">
            <BookOpenText className="h-4 w-4" />
            Learn & Explore
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-grey-90 sm:text-5xl">
            Articles that help devotees make informed spiritual choices
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-grey-60">
            A lightweight editorial space for puja guidance, astrology
            explanations, ritual preparation, and practical answers to common
            devotional questions.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={localizeHref(countryCode, "/blog/editor")}
              className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-5 py-3 text-sm font-semibold text-brand-700 hover:border-brand-300"
            >
              <PencilLine className="h-4 w-4" />
              Open markdown editor
            </Link>
            <Link
              href={localizeHref(countryCode, "/store")}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Browse services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {featuredPost && (
        <section className="content-container pt-12">
          <div className="grid gap-8 rounded-[36px] border border-grey-10 bg-[linear-gradient(135deg,#fffaf0_0%,#ffffff_55%,#fff7ed_100%)] p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)] lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
                Featured article
              </p>
              <h2 className="mt-3 text-3xl font-bold text-grey-90">
                {featuredPost.title}
              </h2>
              <p className="mt-4 text-base leading-8 text-grey-60">
                {featuredPost.excerpt}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {featuredPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href={localizeHref(countryCode, `/blog/${featuredPost.slug}`)}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Read article
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-[28px] bg-white/90 p-6">
              <p className="text-sm text-grey-50">
                {new Date(featuredPost.publishedAt).toLocaleDateString("en-US")}
              </p>
              <p className="mt-2 text-sm font-medium text-grey-70">
                By {featuredPost.author}
              </p>
              <p className="mt-4 text-sm leading-7 text-grey-60">
                Estimated reading time: {featuredPost.readingTime} minutes
              </p>
            </div>
          </div>
        </section>
      )}

      {otherPosts.length > 0 && (
        <section className="content-container pt-12">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {otherPosts.map((post) => (
              <PostCard
                key={post.slug}
                post={post}
                countryCode={countryCode}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
