import { NextRequest, NextResponse } from "next/server"
import { searchProducts } from "@lib/search/query"

export const dynamic = "force-dynamic"
export const maxDuration = 15

// GET /api/search?q=...&countryCode=in&limit=12
// countryCode is accepted for API symmetry; the index is region-independent
// (prices are resolved per region by the /search page, not here).
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? ""
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 12)
  const res = await searchProducts(q, { limit })
  return NextResponse.json(res, {
    headers: { "Cache-Control": "private, no-store" },
  })
}
