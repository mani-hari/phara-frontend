import { BlogPost, paginate } from "@lib/data/blog"
import { jsonLdString } from "@lib/util/blog-seo"
import BlogPagination from "@modules/blog/components/blog-pagination"
import PostCard from "@modules/blog/components/post-card"

/** Shared layout for tag and author pages: header slot + paginated grid. */
export default function BlogCollection({
  header,
  posts,
  page: requestedPage,
  basePath,
  countryCode,
  jsonLd,
}: {
  header: React.ReactNode
  posts: BlogPost[]
  page: number
  /** Localized path used for pagination links. */
  basePath: string
  countryCode: string
  jsonLd: unknown[]
}) {
  const { items, page, totalPages } = paginate(posts, requestedPage)
  return (
    <div style={{ background: "var(--paper)" }} className="pb-24">
      {jsonLd.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(data) }}
        />
      ))}
      <header className="content-container max-w-[1120px] pt-12 sm:pt-16">{header}</header>
      <section className="content-container mt-12 max-w-[1120px]">
        <div
          className="grid gap-x-8 gap-y-14 pt-10 sm:grid-cols-2 lg:grid-cols-3"
          style={{ borderTop: "1px solid var(--ink-line)" }}
        >
          {items.map((post) => (
            <PostCard key={post.slug} post={post} countryCode={countryCode} />
          ))}
        </div>
        {!items.length && (
          <p className="ph-body" style={{ color: "var(--ink-3)" }}>
            No posts here yet.
          </p>
        )}
        <BlogPagination basePath={basePath} page={page} totalPages={totalPages} />
      </section>
    </div>
  )
}
