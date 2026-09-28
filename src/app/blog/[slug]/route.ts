import { getBlogPostBySlug, getRelatedPosts } from "@lib/data/blog"
import { buildPostMarkdown, postUrl } from "@lib/util/blog-seo"

// Markdown twin of each post: GET /blog/<slug>.md
//
// App Router can't name a folder "[slug].md", so this catches /blog/<x> at the
// root and only answers when <x> ends in ".md". The middleware passes dotted
// paths through without the country rewrite, so .md requests land here, while
// normal post URLs (/blog/<slug>) are rewritten to /[countryCode]/blog/<slug>
// and never reach this handler.

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const raw = decodeURIComponent(params.slug)
  if (!raw.endsWith(".md")) {
    return new Response("Not found", { status: 404 })
  }
  const post = await getBlogPostBySlug(raw.slice(0, -3))
  if (!post) {
    return new Response("Not found", { status: 404 })
  }
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
