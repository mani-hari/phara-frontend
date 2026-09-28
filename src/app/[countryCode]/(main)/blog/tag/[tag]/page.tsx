import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import {
  getBlogTag,
  getBlogTags,
  getPostsByTag,
  parsePageParam,
} from "@lib/data/blog"
import { buildCollectionJsonLd } from "@lib/util/blog-seo"
import { localizeHref } from "@lib/util/localize-href"
import BlogFilter from "@modules/blog/components/blog-filter"
import BlogCollection from "@modules/blog/templates/blog-collection"

type Props = {
  params: Promise<{ countryCode: string; tag: string }>
  searchParams: Promise<{ page?: string | string[] }>
}

const describe = (name: string, count: number) =>
  `${count} ${count === 1 ? "post" : "posts"} on ${name} from the PariharaOnline blog: meaning, practice and practical guidance.`

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { tag: slug } = await props.params
  const tag = await getBlogTag(slug)
  if (!tag) return {}
  const page = parsePageParam((await props.searchParams).page)
  const path = `/blog/tag/${tag.slug}`
  const canonical = page > 1 ? `${path}?page=${page}` : path
  const title = `${tag.name} — PariharaOnline Blog`
  const description = describe(tag.name, tag.count)
  return {
    title: page > 1 ? `${title} (page ${page})` : title,
    description,
    alternates: { canonical },
    openGraph: { type: "website", siteName: "PariharaOnline", title, description, url: canonical },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function BlogTagPage(props: Props) {
  const { countryCode, tag: slug } = await props.params
  const page = parsePageParam((await props.searchParams).page)
  const [tag, tags, posts] = await Promise.all([
    getBlogTag(slug),
    getBlogTags(),
    getPostsByTag(slug),
  ])
  if (!tag || !posts.length) notFound()

  const path = `/blog/tag/${tag.slug}`
  return (
    <BlogCollection
      posts={posts}
      page={page}
      basePath={localizeHref(countryCode, path)}
      countryCode={countryCode}
      jsonLd={buildCollectionJsonLd({
        name: tag.name,
        description: describe(tag.name, tag.count),
        path,
        posts,
      })}
      header={
        <>
          <p className="ph-eyebrow">
            <Link href={localizeHref(countryCode, "/blog")} className="hover:text-[color:var(--ink)]">
              Blog
            </Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="ph-eyebrow-sindoor">Topic</span>
          </p>
          <h1 className="ph-h1 mt-3">{tag.name}</h1>
          <p className="ph-body-lg mt-3" style={{ color: "var(--ink-3)" }}>
            {tag.count} {tag.count === 1 ? "post" : "posts"}
          </p>
          <div className="mt-8">
            <BlogFilter tags={tags} countryCode={countryCode} active={tag.slug} />
          </div>
        </>
      }
    />
  )
}
