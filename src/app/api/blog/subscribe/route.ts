import { NextRequest, NextResponse } from "next/server"

// POST /api/blog/subscribe { email, source: "blog", ref: <slug> | "blog-home" }
// Forwards to the Medusa backend's public /store/email-consent endpoint (the
// same one checkout uses), tagged source "blog". Errors are never passed
// through verbatim: the reader sees one of the short messages below.
export const dynamic = "force-dynamic"

const BACKEND_URL = (
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"
).replace(/\/$/, "")
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ALLOWED_SOURCES = new Set(["blog", "footer"])

// Light in-memory, per-IP limit (same caveats as /api/payments/search: per
// instance, not distributed; enough to deter a casual bot).
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k)
    }
  }
  return recent.length > MAX_PER_WINDOW
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

const fail = (status: number, error: string) =>
  NextResponse.json({ ok: false, error }, { status })

export async function POST(req: NextRequest) {
  if (isRateLimited(getClientIp(req))) {
    return fail(429, "Too many attempts. Please try again in a minute.")
  }

  let body: { email?: unknown; source?: unknown; ref?: unknown }
  try {
    body = await req.json()
  } catch {
    return fail(400, "Please enter a valid email address.")
  }

  const email = String(body.email ?? "").trim().toLowerCase()
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return fail(400, "Please enter a valid email address.")
  }
  const source = ALLOWED_SOURCES.has(String(body.source)) ? String(body.source) : "blog"
  const ref = String(body.ref ?? "").slice(0, 120)

  try {
    const res = await fetch(`${BACKEND_URL}/store/email-consent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ email, source }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    })
    if (res.status === 400) return fail(400, "Please enter a valid email address.")
    if (!res.ok) {
      console.error(`[blog-subscribe] backend responded ${res.status} (ref=${ref})`)
      return fail(502, "We couldn't sign you up just now. Please try again shortly.")
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(`[blog-subscribe] backend unreachable (ref=${ref}):`, (e as Error)?.message)
    return fail(502, "We couldn't sign you up just now. Please try again shortly.")
  }
}
