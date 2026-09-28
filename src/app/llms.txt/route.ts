import { getPublishedBlogPosts } from "@lib/data/blog"
import { postMarkdownUrl } from "@lib/util/blog-seo"
// Hand-written site overview (was public/llms.txt). Imported as a raw string
// via the `.md` asset/source rule in next.config.js; edit it there.
import base from "@lib/llms-base.md"

// /llms.txt = the static overview + a generated "## Blog" section listing
// every published post's markdown twin. The middleware matcher excludes
// llms.txt, so this route is reached directly.

const oneLine = (value: string) => value.replace(/\s+/g, " ").trim()

export async function GET() {
  const posts = await getPublishedBlogPosts()
  const blog = posts.length
    ? [
        "## Blog",
        "Articles on Hindu rituals, festivals, practice and booking poojas. Each link is the clean-markdown version of the post.",
        ...posts.map(
          (p) => `- [${oneLine(p.title)}](${postMarkdownUrl(p.slug)}): ${oneLine(p.description)}`
        ),
      ].join("\n")
    : ""

  const body = `${base.trimEnd()}\n${blog ? `\n${blog}\n` : ""}`
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
