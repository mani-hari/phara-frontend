import Link from "next/link"

import { BlogPost } from "@lib/data/blog"
import { localizeHref } from "@lib/util/localize-href"

type PostCardProps = {
  post: BlogPost
  countryCode: string
  compact?: boolean
}

export default function PostCard({ post, countryCode }: PostCardProps) {
  return (
    <Link
      href={localizeHref(countryCode, `/blog/${post.slug}`)}
      className="group block"
    >
      <article className="flex h-full flex-col border-t border-grey-10 pt-6">
        {post.tags[0] && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-600">
            {post.tags[0]}
          </span>
        )}
        <h3
          className="mt-3 font-serif text-[24px] leading-snug text-grey-90 transition-colors group-hover:text-brand-700"
        >
          {post.title}
        </h3>
        <p
          className="mt-3 text-sm leading-7 text-grey-60"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-5 text-xs text-grey-50">
          <span>{new Date(post.publishedAt).toLocaleDateString("en-US")}</span>
          <span className="text-grey-20">·</span>
          <span>{post.readingTime} min read</span>
        </div>
      </article>
    </Link>
  )
}
