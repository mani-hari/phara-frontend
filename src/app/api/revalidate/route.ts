import { NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"

// On-demand storefront cache refresh. Triggered by the "Refresh storefront
// cache" button in Medusa admin (via the backend, which holds the secret).
// Clears the stable content tags so edited products/collections re-fetch
// from Medusa on the next request.
//
// Auth: send the shared secret as `x-revalidate-secret` header or `?secret=`.
// Set REVALIDATE_SECRET in the frontend env (Vercel) and the same value on the
// Medusa backend.
const TAGS = ["products", "collections", "categories"]

function authorized(req: NextRequest): boolean {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) return false
  const provided =
    req.headers.get("x-revalidate-secret") ||
    req.nextUrl.searchParams.get("secret")
  return provided === secret
}

async function handle(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  for (const tag of TAGS) {
    revalidateTag(tag)
  }
  return NextResponse.json({ revalidated: true, tags: TAGS })
}

export async function POST(req: NextRequest) {
  return handle(req)
}

// Allow GET too, so it can be triggered from a browser/curl with ?secret=
export async function GET(req: NextRequest) {
  return handle(req)
}
