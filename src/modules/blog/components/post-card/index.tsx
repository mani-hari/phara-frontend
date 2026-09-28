import Image from "next/image"
import Link from "next/link"

import { BlogPost, formatBlogDate, getPostEyebrow } from "@lib/data/blog"
import { localizeHref } from "@lib/util/localize-href"

type PostCardProps = {
  post: BlogPost
  countryCode: string
  /** Hide the excerpt (used for related-post rows). */
  compact?: boolean
}

export function PostHero({
  post,
  sizes,
  priority,
  className = "",
}: {
  post: BlogPost
  sizes: string
  priority?: boolean
  className?: string
}) {
  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ aspectRatio: "1200 / 630", borderRadius: "var(--r-md)" }}
    >
      {post.image ? (
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="ph-imgph absolute inset-0" aria-hidden="true" />
      )}
    </div>
  )
}

export default function PostCard({ post, countryCode, compact }: PostCardProps) {
  const eyebrow = getPostEyebrow(post)
  return (
    <article className="group flex h-full flex-col">
      <Link
        href={localizeHref(countryCode, `/blog/${post.slug}`)}
        className="block"
        tabIndex={-1}
        aria-hidden="true"
      >
        <PostHero
          post={post}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
        />
      </Link>
      {eyebrow && (
        <p className="ph-eyebrow ph-eyebrow-sindoor mt-5">{eyebrow.name}</p>
      )}
      <h3 className="ph-h4 mt-2" style={{ fontWeight: 400, fontSize: 21, lineHeight: 1.25 }}>
        <Link
          href={localizeHref(countryCode, `/blog/${post.slug}`)}
          className="transition-colors hover:text-[color:var(--sindoor)]"
        >
          {post.title}
        </Link>
      </h3>
      {!compact && post.excerpt && (
        <p
          className="ph-body mt-2"
          style={{
            color: "var(--ink-3)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {post.excerpt}
        </p>
      )}
      <p className="ph-body-sm mt-3" style={{ color: "var(--ink-4)" }}>
        {post.author} <span aria-hidden="true">·</span>{" "}
        <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
      </p>
    </article>
  )
}
