import { NextRequest, NextResponse } from "next/server"
import { getPublishedBlogPosts } from "@lib/data/blog"
import { postUrl, postMarkdownUrl, SITE } from "@lib/util/blog-seo"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// IndexNow key: hosted verbatim at public/<key>.txt per the protocol
// (https://www.indexnow.org). Not a secret — the key file is public by
// design, it just proves we control the host. Ping Bing/Yandex/Seznam/Naver
// with every currently-published blog URL (page + markdown twin) once a day
// via Vercel Cron (vercel.json), so newly drip-published posts get pushed
// the same day instead of waiting on the next organic crawl.
const INDEXNOW_KEY = "c19d6c00f7142b246af7427e6b8ab828"
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"

// Same auth pattern as /api/search/reindex.
function authorized(req: NextRequest): boolean {
  const revalidate = process.env.REVALIDATE_SECRET
  if (revalidate && req.headers.get("x-revalidate-secret") === revalidate) return true
  const cron = process.env.CRON_SECRET
  if (cron && req.headers.get("authorization") === `Bearer ${cron}`) return true
  return false
}

async function handle(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  try {
    const posts = await getPublishedBlogPosts()
    const urlList = posts.flatMap((p) => [postUrl(p.slug), postMarkdownUrl(p.slug)])
    urlList.push(`${SITE}/blog`, `${SITE}/sitemap.xml`, `${SITE}/llms.txt`)

    const host = new URL(SITE).host
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
    })

    const bodyText = await res.text()
    if (!res.ok) {
      console.error("[indexnow] submit failed:", res.status, bodyText)
      return NextResponse.json(
        { ok: false, status: res.status, body: bodyText, submitted: urlList.length },
        { status: 502 }
      )
    }
    return NextResponse.json({ ok: true, status: res.status, submitted: urlList.length })
  } catch (err) {
    console.error("[indexnow] failed:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "indexnow submit failed" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  return handle(req)
}

export async function GET(req: NextRequest) {
  return handle(req)
}
