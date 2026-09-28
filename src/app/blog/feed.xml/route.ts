import { statSync } from "fs"
import path from "path"

import { getPublishedBlogPosts } from "@lib/data/blog"
import { BLOG_DESCRIPTION, BLOG_TITLE, SITE, absoluteUrl, postUrl } from "@lib/util/blog-seo"

// Lives outside [countryCode]: the middleware passes dotted paths through
// without the country rewrite, so /blog/feed.xml resolves here.
//
// Regenerated at most hourly so drip-published (future-dated) posts join the
// feed on their IST day without a deploy.
export const revalidate = 3600

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")

const fileSize = (publicPath: string) => {
  try {
    return statSync(path.join(process.cwd(), "public", "blog", path.basename(publicPath))).size
  } catch {
    return 0
  }
}

const rfc822 = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`).toUTCString()

export async function GET() {
  const posts = await getPublishedBlogPosts(50)
  const items = posts
    .map((post) => {
      const url = postUrl(post.slug)
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${rfc822(post.publishedAt)}</pubDate>`,
        `      <dc:creator>${escapeXml(post.author)}</dc:creator>`,
        ...post.tags.map((t) => `      <category>${escapeXml(t)}</category>`),
        `      <description>${escapeXml(post.description)}</description>`,
        ...(post.image
          ? [`      <enclosure url="${absoluteUrl(post.image)}" type="image/webp" length="${fileSize(post.image)}" />`]
          : []),
        "    </item>",
      ].join("\n")
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(BLOG_TITLE)}</title>
    <link>${SITE}/blog</link>
    <description>${escapeXml(BLOG_DESCRIPTION)}</description>
    <language>en</language>
    <atom:link href="${SITE}/blog/feed.xml" rel="self" type="application/rss+xml" />
${posts[0] ? `    <lastBuildDate>${rfc822(posts[0].updatedAt)}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
