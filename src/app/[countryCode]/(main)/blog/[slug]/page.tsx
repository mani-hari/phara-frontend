import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import {
  formatBlogDate,
  getBlogPostBySlug,
  getBlogPostSlugs,
  getPostEyebrow,
  getRelatedPosts,
  tagSlug,
} from "@lib/data/blog"
import { resolveBlogAuthor } from "@lib/data/blog-authors"
import {
  absoluteUrl,
  buildPostJsonLd,
  jsonLdString,
} from "@lib/util/blog-seo"
import { localizeHref } from "@lib/util/localize-href"
import { renderArticleMarkdown, renderInlineMarkdown } from "@lib/util/markdown"
import AuthorAvatar from "@modules/blog/components/author-avatar"
import AuthorCard from "@modules/blog/components/author-card"
import PostCard, { PostHero } from "@modules/blog/components/post-card"
import RelevantProducts from "@modules/blog/components/relevant-products"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getBlogPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    return {}
  }

  const url = `/blog/${slug}`
  const images = post.image
    ? [{ url: post.image, width: 1200, height: 630, alt: post.imageAlt }]
    : undefined

  return {
    // Root layout template appends " | PariharaOnline".
    title: post.title,
    description: post.description,
    keywords: [post.primaryKeyword, ...post.secondaryKeywords].filter(
      (k): k is string => !!k
    ),
    authors: [{ name: post.author, url: `/blog/author/${post.authorSlug}` }],
    alternates: {
      canonical: url,
      types: { "text/markdown": `${url}.md` },
    },
    openGraph: {
      type: "article",
      siteName: "PariharaOnline",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [absoluteUrl(`/blog/author/${post.authorSlug}`)],
      tags: post.tags,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      ...(post.image ? { images: [post.image] } : {}),
    },
    ...(post.draft ? { robots: { index: false, follow: false } } : {}),
  }
}

export default async function BlogPostPage(props: Props) {
  const { countryCode, slug } = await props.params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const author = resolveBlogAuthor(post.authorSlug)
  const eyebrow = getPostEyebrow(post)
  const related = await getRelatedPosts(post)
  const body = renderArticleMarkdown(post.content)
  const href = (path: string) => localizeHref(countryCode, path)

  return (
    <div style={{ background: "var(--paper)" }} className="pb-24">
      {buildPostJsonLd(post).map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(data) }}
        />
      ))}

      <article>
        {/* Header ------------------------------------------------------- */}
        <header className="content-container max-w-[760px] pt-10 sm:pt-14">
          <nav aria-label="Breadcrumb" className="ph-body-sm" style={{ color: "var(--ink-4)" }}>
            <Link href={href("/blog")} className="hover:text-[color:var(--ink)]">
              Blog
            </Link>
            {eyebrow && (
              <>
                <span aria-hidden="true" className="mx-2">/</span>
                <Link
                  href={href(`/blog/tag/${eyebrow.slug}`)}
                  className="ph-eyebrow ph-eyebrow-sindoor hover:underline"
                >
                  {eyebrow.name}
                </Link>
              </>
            )}
          </nav>

          <h1 className="ph-h1 mt-5" data-speakable="headline" style={{ textWrap: "balance" }}>
            {post.title}
          </h1>
          {post.description && (
            <p className="ph-body-lg mt-4" style={{ color: "var(--ink-3)", fontSize: 18 }}>
              {post.description}
            </p>
          )}

          <div className="mt-7 flex items-center gap-3">
            <AuthorAvatar author={author} size={44} />
            <div className="min-w-0">
              <p className="ph-body" style={{ fontWeight: 600, color: "var(--ink)" }}>
                <Link href={href(`/blog/author/${author.slug}`)} className="hover:text-[color:var(--sindoor)]">
                  {author.name}
                </Link>
              </p>
              <p className="ph-body-sm" style={{ color: "var(--ink-4)" }}>
                <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
                {post.updatedAt !== post.publishedAt && (
                  <>
                    {" "}· Updated{" "}
                    <time dateTime={post.updatedAt}>{formatBlogDate(post.updatedAt)}</time>
                  </>
                )}
                {" "}· {post.readingTime} min read
              </p>
            </div>
          </div>
        </header>

        {post.image && (
          <div className="content-container mt-9 max-w-[1040px]">
            <PostHero
              post={post}
              priority
              sizes="(max-width: 1088px) 100vw, 1040px"
            />
          </div>
        )}

        <div className="content-container max-w-[760px]">
          {post.takeaways.length > 0 && (
            <section
              aria-label="In short"
              data-speakable="takeaways"
              className="mt-9 py-5 pl-5 pr-4 sm:pl-6"
              style={{
                background: "var(--cream)",
                borderLeft: "2px solid var(--gold)",
                borderRadius: "0 var(--r-md) var(--r-md) 0",
              }}
            >
              <p className="ph-eyebrow ph-eyebrow-gold">In short</p>
              <div className="mt-2 space-y-2">
                {post.takeaways.map((t, i) => (
                  <p
                    key={i}
                    className="ph-body-lg"
                    style={{ color: "var(--ink)" }}
                    dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(t) }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Body ------------------------------------------------------- */}
          <div
            className="ph-article mt-10"
            dangerouslySetInnerHTML={{ __html: body.before }}
          />
          <Suspense fallback={null}>
            <RelevantProducts products={post.products} countryCode={countryCode} />
          </Suspense>
          {body.after && (
            <div
              className="ph-article ph-article-cont"
              dangerouslySetInnerHTML={{ __html: body.after }}
            />
          )}

          {post.tags.length > 0 && (
            <ul aria-label="Tags" className="mt-12 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link href={href(`/blog/tag/${tagSlug(tag)}`)} className="ph-chip hover:border-[color:var(--ink)]">
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* FAQ -------------------------------------------------------- */}
          {post.faq.length > 0 && (
            <section aria-labelledby="questions-people-ask" className="mt-16">
              <h2 id="questions-people-ask" className="ph-h3" style={{ fontWeight: 400, fontSize: 28 }}>
                Questions people ask
              </h2>
              <div className="mt-4">
                {post.faq.map((f, i) => (
                  <div
                    key={i}
                    className="py-5"
                    style={{ borderTop: "1px solid var(--ink-line)" }}
                  >
                    <h3 className="ph-h4" style={{ fontWeight: 400, fontSize: 20 }}>
                      {f.q}
                    </h3>
                    <p className="ph-body-lg mt-2" style={{ color: "var(--ink-3)", lineHeight: 1.65 }}>
                      {f.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-14">
            <AuthorCard author={author} countryCode={countryCode}>
              <a
                href={`/blog/${post.slug}.md`}
                type="text/markdown"
                style={{ color: "var(--ink-3)" }}
                className="underline decoration-[color:var(--ink-line-2)] underline-offset-4 hover:text-[color:var(--ink)]"
              >
                Download as Markdown
              </a>
            </AuthorCard>
          </div>
        </div>
      </article>

      {/* Related -------------------------------------------------------- */}
      {related.length > 0 && (
        <section aria-labelledby="keep-reading" className="content-container mt-20 max-w-[1120px]">
          <p className="ph-eyebrow">Keep reading</p>
          <h2 id="keep-reading" className="ph-h3 mt-2" style={{ fontWeight: 400 }}>
            Related posts
          </h2>
          <div
            className={`mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 ${
              related.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
            }`}
          >
            {related.map((p) => (
              <PostCard key={p.slug} post={p} countryCode={countryCode} compact />
            ))}
          </div>
        </section>
      )}

      <div className="content-container mt-16 max-w-[1120px] text-center">
        <Link href={href("/blog")} className="ph-btn ph-btn-ghost">
          Browse all posts
        </Link>
      </div>
    </div>
  )
}
