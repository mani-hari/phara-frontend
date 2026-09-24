import { NextRequest, NextResponse } from "next/server"
import { reindexProducts } from "@lib/search/indexer"

export const dynamic = "force-dynamic"
// Typical run is <20s; raise if the Vercel plan allows and the catalog grows.
export const maxDuration = 60

// Rebuild the product search index.
// - Manual / Medusa hook: POST with header `x-revalidate-secret: $REVALIDATE_SECRET`
// - Vercel Cron (vercel.json): GET with `Authorization: Bearer $CRON_SECRET`
//   (Vercel sends this automatically when CRON_SECRET is set on the project).
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
    const result = await reindexProducts()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("[search] reindex failed:", err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "reindex failed" },
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
