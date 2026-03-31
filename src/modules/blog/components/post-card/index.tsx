import Link from "next/link"

import { BlogPost } from "@lib/data/blog"
import { ArrowRight, Clock3 } from "lucide-react"

type PostCardProps = {
  post: BlogPost
  countryCode: string
  compact?: boolean
}

export default function PostCard({
  post,
  countryCode,
  compact = false,
}: PostCardProps) {
  return (
    <article className="group h-full rounded-[28px] border border-grey-10 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition-transform duration-300 hover:-translate-y-1">
      <div className="mb-4 flex flex-wrap gap-2">
        {post.tags.slice(0, compact ? 2 : 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mb-3 flex items-center gap-3 text-sm text-grey-50">
        <span>{new Date(post.publishedAt).toLocaleDateString("en-US")}</span>
        <span className="text-grey-20">•</span>
        <span className="inline-flex items-center gap-1">
          <Clock3 className="h-4 w-4" />
          {post.readingTime} min read
        </span>
      </div>

      <h3 className="text-xl font-semibold leading-tight text-grey-90">
        {post.title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-grey-60">{post.excerpt}</p>

      {!compact && (
        <p className="mt-4 text-sm font-medium text-grey-50">
          By {post.author}
        </p>
      )}

      <Link
        href={`/${countryCode}/blog/${post.slug}`}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
      >
        Read article
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  )
}
