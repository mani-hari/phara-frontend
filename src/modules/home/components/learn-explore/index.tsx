import Link from "next/link"

import { BlogPost } from "@lib/data/blog"
import PostCard from "@modules/blog/components/post-card"
import { localizeHref } from "@lib/util/localize-href"
import { ArrowRight, BookOpenText } from "lucide-react"

type LearnExploreProps = {
  posts: BlogPost[]
  countryCode: string
}

export default function LearnExplore({
  posts,
  countryCode,
}: LearnExploreProps) {
  if (!posts.length) {
    return null
  }

  return (
    <section className="bg-[linear-gradient(180deg,#fffdf8_0%,#ffffff_100%)] py-16 sm:py-20">
      <div className="content-container">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2">
              <BookOpenText className="h-5 w-5 text-brand-600" />
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
                Learn & Explore
              </span>
            </div>
            <h2 className="text-2xl font-bold text-grey-90 sm:text-3xl">
              Practical guidance rooted in tradition
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-grey-60 sm:text-base">
              Articles that explain rituals, astrology, prasad delivery, and
              how to choose the right seva for a real life need.
            </p>
          </div>

          <Link
            href={localizeHref(countryCode, "/blog")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            View all articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard
              key={post.slug}
              post={post}
              countryCode={countryCode}
              compact
            />
          ))}
        </div>
      </div>
    </section>
  )
}
