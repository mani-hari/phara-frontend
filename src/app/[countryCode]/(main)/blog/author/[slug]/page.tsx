import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { getPostsByAuthor, parsePageParam } from "@lib/data/blog"
import { getBlogAuthor } from "@lib/data/blog-authors"
import { absoluteUrl, buildCollectionJsonLd } from "@lib/util/blog-seo"
import { localizeHref } from "@lib/util/localize-href"
import AuthorAvatar from "@modules/blog/components/author-avatar"
import BlogCollection from "@modules/blog/templates/blog-collection"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
  searchParams: Promise<{ page?: string | string[] }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const author = getBlogAuthor(slug)
  if (!author) return {}
  const page = parsePageParam((await props.searchParams).page)
  const path = `/blog/author/${author.slug}`
  const canonical = page > 1 ? `${path}?page=${page}` : path
  const title = `${author.name} — PariharaOnline Blog`
  const hasPosts = (await getPostsByAuthor(author.slug)).length > 0
  return {
    // Keep empty author pages out of the index until their first post ships.
    ...(hasPosts ? {} : { robots: { index: false, follow: true } }),
    title: page > 1 ? `${title} (page ${page})` : title,
    description: author.bio,
    alternates: { canonical },
    openGraph: { type: "profile", siteName: "PariharaOnline", title, description: author.bio, url: canonical },
    twitter: { card: "summary", title, description: author.bio },
  }
}

export default async function BlogAuthorPage(props: Props) {
  const { countryCode, slug } = await props.params
  const author = getBlogAuthor(slug)
  if (!author) notFound()
  const page = parsePageParam((await props.searchParams).page)
  const posts = await getPostsByAuthor(author.slug)
  const path = `/blog/author/${author.slug}`

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": author.slug === "editorial" ? "Organization" : "Person",
    name: author.name,
    description: author.bio,
    url: absoluteUrl(path),
    worksFor: { "@type": "Organization", name: "PariharaOnline", url: absoluteUrl("/") },
  }

  return (
    <BlogCollection
      posts={posts}
      page={page}
      basePath={localizeHref(countryCode, path)}
      countryCode={countryCode}
      jsonLd={[
        personJsonLd,
        ...buildCollectionJsonLd({ name: author.name, description: author.bio, path, posts }),
      ]}
      header={
        <>
          <p className="ph-eyebrow">
            <Link href={localizeHref(countryCode, "/blog")} className="hover:text-[color:var(--ink)]">
              Blog
            </Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="ph-eyebrow-sindoor">Author</span>
          </p>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
            <AuthorAvatar author={author} size={88} />
            <div className="max-w-[640px]">
              <h1 className="ph-h1">{author.name}</h1>
              <p className="ph-body-lg mt-2" style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
                {author.role}
              </p>
              <p className="ph-body-lg mt-4" style={{ color: "var(--ink-2)" }}>
                {author.bio}
              </p>
              <p className="ph-body-sm mt-4">
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </p>
            </div>
          </div>
        </>
      }
    />
  )
}
