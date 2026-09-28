import { Metadata } from "next"
import Link from "next/link"

import {
  formatBlogDate,
  getBlogTags,
  getPostEyebrow,
  getPublishedBlogPosts,
  paginate,
  parsePageParam,
} from "@lib/data/blog"
import { resolveBlogAuthor } from "@lib/data/blog-authors"
import {
  BLOG_DESCRIPTION,
  BLOG_TITLE,
  buildBlogIndexJsonLd,
  jsonLdString,
} from "@lib/util/blog-seo"
import { localizeHref } from "@lib/util/localize-href"
import AuthorAvatar from "@modules/blog/components/author-avatar"
import BlogFilter from "@modules/blog/components/blog-filter"
import BlogPagination from "@modules/blog/components/blog-pagination"
import PostCard, { PostHero } from "@modules/blog/components/post-card"

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ page?: string | string[] }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const page = parsePageParam((await props.searchParams).page)
  const canonical = page > 1 ? `/blog?page=${page}` : "/blog"
  return {
    title: page > 1 ? `${BLOG_TITLE} — page ${page}` : BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    alternates: {
      canonical,
      types: { "application/rss+xml": "/blog/feed.xml" },
    },
    openGraph: {
      type: "website",
      siteName: "PariharaOnline",
      title: BLOG_TITLE,
      description: BLOG_DESCRIPTION,
      url: canonical,
    },
    twitter: { card: "summary_large_image", title: BLOG_TITLE, description: BLOG_DESCRIPTION },
  }
}

export default async function BlogIndexPage(props: Props) {
  const { countryCode } = await props.params
  const requestedPage = parsePageParam((await props.searchParams).page)
  const [posts, tags] = await Promise.all([getPublishedBlogPosts(), getBlogTags()])

  // Page 1 leads with the latest post as a feature; the grid holds the rest.
  const [featured, ...rest] = posts
  const { items, page, totalPages } = paginate(rest, requestedPage)
  const href = (path: string) => localizeHref(countryCode, path)
  const featuredAuthor = featured ? resolveBlogAuthor(featured.authorSlug) : null
  const featuredEyebrow = featured ? getPostEyebrow(featured) : null

  return (
    <div style={{ background: "var(--paper)" }} className="pb-24">
      {buildBlogIndexJsonLd(posts).map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(data) }}
        />
      ))}

      <header className="content-container max-w-[1120px] pt-12 sm:pt-16">
        <p className="ph-eyebrow ph-eyebrow-sindoor">PariharaOnline Blog</p>
        <h1 className="ph-h1 mt-3 max-w-[720px]">
          Stories, practice and the festival year
        </h1>
        <p className="ph-body-lg mt-4 max-w-[620px]" style={{ color: "var(--ink-3)" }}>
          What the old stories mean, how to keep a ritual in an ordinary week,
          and practical guides to poojas at home or far from it.
        </p>
        <div className="mt-8">
          <BlogFilter tags={tags} countryCode={countryCode} />
        </div>
      </header>

      {page === 1 && featured && featuredAuthor && (
        <section aria-label="Latest post" className="content-container mt-12 max-w-[1120px]">
          <article
            className="group grid items-center gap-8 pt-10 lg:grid-cols-[1.15fr_1fr] lg:gap-12"
            style={{ borderTop: "1px solid var(--ink-line)" }}
          >
            <Link href={href(`/blog/${featured.slug}`)} tabIndex={-1} aria-hidden="true">
              <PostHero post={featured} priority sizes="(max-width: 1024px) 100vw, 600px" />
            </Link>
            <div>
              <p className="ph-eyebrow">
                Latest
                {featuredEyebrow && (
                  <>
                    <span className="mx-2" aria-hidden="true">·</span>
                    <span className="ph-eyebrow-sindoor">{featuredEyebrow.name}</span>
                  </>
                )}
              </p>
              <h2 className="ph-h2 mt-3" style={{ fontWeight: 400, textWrap: "balance" }}>
                <Link href={href(`/blog/${featured.slug}`)} className="transition-colors hover:text-[color:var(--sindoor)]">
                  {featured.title}
                </Link>
              </h2>
              <p className="ph-body-lg mt-4" style={{ color: "var(--ink-3)" }}>
                {featured.excerpt}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <AuthorAvatar author={featuredAuthor} size={36} />
                <p className="ph-body-sm">
                  <span style={{ color: "var(--ink)", fontWeight: 500 }}>{featuredAuthor.name}</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <time dateTime={featured.publishedAt}>{formatBlogDate(featured.publishedAt)}</time>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  {featured.readingTime} min read
                </p>
              </div>
            </div>
          </article>
        </section>
      )}

      {items.length > 0 && (
        <section aria-label="All posts" className="content-container mt-16 max-w-[1120px]">
          <div
            className="grid gap-x-8 gap-y-14 pt-10 sm:grid-cols-2 lg:grid-cols-3"
            style={{ borderTop: "1px solid var(--ink-line)" }}
          >
            {items.map((post) => (
              <PostCard key={post.slug} post={post} countryCode={countryCode} />
            ))}
          </div>
          <BlogPagination basePath={href("/blog")} page={page} totalPages={totalPages} />
        </section>
      )}

      {!posts.length && (
        <p className="content-container mt-12 max-w-[1120px] ph-body">No posts yet.</p>
      )}
    </div>
  )
}
