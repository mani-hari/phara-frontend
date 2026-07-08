import { Metadata } from "next"
import Link from "next/link"

import { getPublishedBlogPosts } from "@lib/data/blog"
import PostCard from "@modules/blog/components/post-card"
import { localizeHref } from "@lib/util/localize-href"
import { ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "PariharaOnline Blog",
  description:
    "Guides on pujas, astrology, prasad delivery, and how to choose the right spiritual remedy for life events.",
}

const BLOG_FAQS = [
  {
    q: "How does an online pooja work?",
    a: "You book the pooja and share the sankalpam details (name, nakshatra, gothram). Our priests perform it in your name, and you receive prasadam along with a short video clip.",
  },
  {
    q: "Will I receive prasadam?",
    a: "Yes — temple-blessed prasadam is couriered worldwide, or you can choose to have it donated at the temple.",
  },
  {
    q: "When do I get the video?",
    a: "Video clips of your homam or pooja are sent within 24–48 hours of the ritual.",
  },
]

export default async function BlogIndexPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const posts = await getPublishedBlogPosts()
  const [featuredPost, ...otherPosts] = posts

  return (
    <div className="bg-white pb-24">
      {featuredPost && (
        <section className="content-container pt-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
            Featured article
          </p>
          <div className="mt-5 grid gap-10 border-t border-grey-10 pt-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              {featuredPost.tags[0] && (
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-600">
                  {featuredPost.tags[0]}
                </span>
              )}
              <h1 className="mt-3 font-serif text-[40px] leading-[1.1] text-grey-90">
                {featuredPost.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-grey-60">
                {featuredPost.excerpt}
              </p>
              <Link
                href={localizeHref(countryCode, `/blog/${featuredPost.slug}`)}
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
              >
                Read article
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex flex-col justify-center gap-2 text-sm text-grey-50 lg:border-l lg:border-grey-10 lg:pl-8">
              <span>
                {new Date(featuredPost.publishedAt).toLocaleDateString("en-US")}
              </span>
              <span>By {featuredPost.author}</span>
              <span>{featuredPost.readingTime} min read</span>
            </div>
          </div>
        </section>
      )}

      {otherPosts.length > 0 && (
        <section className="content-container pt-16">
          <h2 className="border-t border-grey-10 pt-8 font-serif text-[26px] text-grey-90">
            More articles
          </h2>
          <div className="mt-8 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {otherPosts.map((post) => (
              <PostCard key={post.slug} post={post} countryCode={countryCode} />
            ))}
          </div>
        </section>
      )}

      {/* FAQ teaser */}
      <section className="content-container pt-16">
        <div className="border-t border-grey-10 pt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
            Good to know
          </p>
          <h2 className="mt-2 font-serif text-[28px] text-grey-90">
            Frequently asked questions
          </h2>
          <div className="mt-6 max-w-3xl divide-y divide-grey-10 border-y border-grey-10">
            {BLOG_FAQS.map((f) => (
              <details key={f.q} className="py-4">
                <summary className="cursor-pointer text-base font-semibold text-grey-90">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm leading-7 text-grey-60">{f.a}</p>
              </details>
            ))}
          </div>
          <Link
            href={localizeHref(countryCode, "/faq")}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
          >
            Read all FAQs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
