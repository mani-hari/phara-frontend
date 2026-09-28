import { getBlogPostBySlug, getRelatedPosts, withLiveLinks } from "@lib/data/blog"
import { buildPostMarkdown, postUrl } from "@lib/util/blog-seo"

// Markdown twin of each post: GET /blog/<slug>.md
//
// App Router can't name a folder "[slug].md", so this catches /blog/<x> at the
// root and only answers when <x> ends in ".md". The middleware passes dotted
// paths through without the country rewrite, so .md requests land here, while
// normal post URLs (/blog/<slug>) are rewritten to /[countryCode]/blog/<slug>
// and never reach this handler.
//
// Drip publishing: future-dated posts 404 here too (getBlogPostBySlug), and
// links to not-yet-live posts are flattened to text. Revalidated hourly.

export const revalidate = 3600

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const raw = decodeURIComponent(params.slug)
  if (!raw.endsWith(".md")) {
    return new Response("Not found", { status: 404 })
  }
  const found = await getBlogPostBySlug(raw.slice(0, -3))
  if (!found) {
    return new Response("Not found", { status: 404 })
  }
  const post = await withLiveLinks(found)
  const related = await getRelatedPosts(post)
  return new Response(buildPostMarkdown(post, related), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      // The HTML page is canonical; this twin is for agents and readers.
      Link: `<${postUrl(post.slug)}>; rel="canonical"`,
    },
  })
}
