// SEO / GEO helpers for the blog: absolute URLs, JSON-LD builders, and the
// markdown twin served at /blog/<slug>.md. Same canonical-domain convention
// as src/app/sitemap.ts and src/lib/util/json-ld.ts.

import type { BlogPost } from "@lib/data/blog"
import { resolveBlogAuthor } from "@lib/data/blog-authors"
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from "./json-ld"

export const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.pariharaonline.com"
).replace(/\/$/, "")

export const absoluteUrl = (url: string) =>
  url.startsWith("http") ? url : `${SITE}${url.startsWith("/") ? "" : "/"}${url}`

export const postUrl = (slug: string) => `${SITE}/blog/${slug}`
export const postMarkdownUrl = (slug: string) => `${SITE}/blog/${slug}.md`
export const authorUrl = (slug: string) => `${SITE}/blog/author/${slug}`
export const tagUrl = (slug: string) => `${SITE}/blog/tag/${slug}`

export const BLOG_TITLE = "PariharaOnline Blog"
export const BLOG_DESCRIPTION =
  "Stories, practice and festival notes from PariharaOnline: what Hindu rituals mean, how to keep them at home or abroad, and how to choose the right pooja."

const LOGO = {
  "@type": "ImageObject",
  url: `${SITE}/logo-2x.png`,
  width: 654,
  height: 164,
}

// No official social profiles are recorded anywhere in the codebase
// (src/lib/contact.ts, footer). Add them here when they exist.
const SAME_AS: string[] = []

export const organizationJsonLd = () => ({
  "@type": "Organization",
  "@id": `${SITE}/#organization`,
  name: "PariharaOnline",
  legalName: "Harkarma Enterprises LLP",
  url: SITE,
  logo: LOGO,
  ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
})

const personJsonLd = (post: BlogPost) => {
  const author = resolveBlogAuthor(post.authorSlug)
  return {
    "@type": author.slug === "editorial" ? "Organization" : "Person",
    name: author.name,
    url: authorUrl(author.slug),
    description: author.role,
  }
}

const withContext = (node: Record<string, unknown>) => ({
  "@context": "https://schema.org",
  ...node,
})

export function buildPostJsonLd(post: BlogPost) {
  const url = postUrl(post.slug)
  const article = {
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: post.title,
    description: post.description,
    ...(post.image ? { image: [absoluteUrl(post.image)] } : {}),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: personJsonLd(post),
    publisher: { "@id": `${SITE}/#organization` },
    keywords: [post.primaryKeyword, ...post.secondaryKeywords, ...post.tags]
      .filter(Boolean)
      .join(", "),
    ...(post.tags.length ? { articleSection: post.tags[0] } : {}),
    wordCount: post.content.split(/\s+/).filter(Boolean).length,
    inLanguage: "en",
    url,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: post.takeaways.length
        ? ["[data-speakable='headline']", "[data-speakable='takeaways']"]
        : ["[data-speakable='headline']"],
    },
  }

  const scripts: Record<string, unknown>[] = [
    withContext({ "@graph": [article, organizationJsonLd()] }),
    buildBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: post.title, url: `/blog/${post.slug}` },
    ]),
  ]
  if (post.faq.length) {
    scripts.push(
      buildFaqJsonLd(post.faq.map((f) => ({ question: f.q, answer: f.a })))
    )
  }
  return scripts
}

export function buildBlogIndexJsonLd(posts: BlogPost[]) {
  return [
    withContext({
      "@graph": [
        {
          "@type": "Blog",
          "@id": `${SITE}/blog#blog`,
          name: BLOG_TITLE,
          description: BLOG_DESCRIPTION,
          url: `${SITE}/blog`,
          inLanguage: "en",
          publisher: { "@id": `${SITE}/#organization` },
          blogPost: posts.slice(0, 24).map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: postUrl(p.slug),
            datePublished: p.publishedAt,
            dateModified: p.updatedAt,
            author: personJsonLd(p),
          })),
        },
        organizationJsonLd(),
      ],
    }),
    buildBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
    ]),
  ]
}

export function buildCollectionJsonLd(params: {
  name: string
  description: string
  path: string
  posts: BlogPost[]
}) {
  return [
    withContext({
      "@graph": [
        {
          "@type": "CollectionPage",
          name: params.name,
          description: params.description,
          url: absoluteUrl(params.path),
          isPartOf: { "@id": `${SITE}/blog#blog` },
          publisher: { "@id": `${SITE}/#organization` },
          hasPart: params.posts.slice(0, 24).map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: postUrl(p.slug),
          })),
        },
        organizationJsonLd(),
      ],
    }),
    buildBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: params.name, url: params.path },
    ]),
  ]
}

/** Serialise JSON-LD safely for a <script> tag. */
export const jsonLdString = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c")

// ---------------------------------------------------------------------------
// Markdown twin (/blog/<slug>.md)
// ---------------------------------------------------------------------------

const yamlString = (value: string) => JSON.stringify(value)

/** Make site-relative links absolute so the markdown stands alone. */
const absolutizeLinks = (markdown: string) =>
  markdown.replace(/\]\((\/[^\s)]*)\)/g, (_m, p: string) => `](${SITE}${p})`)

export function buildPostMarkdown(post: BlogPost, related: BlogPost[]) {
  const lines: string[] = [
    "---",
    `title: ${yamlString(post.title)}`,
    `description: ${yamlString(post.description)}`,
    `author: ${yamlString(post.author)}`,
    `published: ${post.publishedAt}`,
    `updated: ${post.updatedAt}`,
    `canonical: ${postUrl(post.slug)}`,
    `tags: [${post.tags.map(yamlString).join(", ")}]`,
    "---",
    "",
    `# ${post.title}`,
    "",
  ]
  if (post.takeaways.length) {
    lines.push("## In short", "", ...post.takeaways.map((t) => `- ${t}`), "")
  }
  // Legacy posts start with a "# " heading; keep a single H1.
  lines.push(absolutizeLinks(post.content.replace(/^# /gm, "## ")).trim(), "")
  if (post.faq.length) {
    lines.push("## Questions people ask", "")
    for (const f of post.faq) lines.push(`### ${f.q}`, "", f.a, "")
  }
  if (related.length) {
    lines.push(
      "## Related reading",
      "",
      ...related.map((r) => `- [${r.title}](${postUrl(r.slug)})`),
      ""
    )
  }
  lines.push(`Source: ${postUrl(post.slug)}`, "")
  return lines.join("\n")
}
