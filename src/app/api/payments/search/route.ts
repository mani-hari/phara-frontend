import { NextRequest, NextResponse } from "next/server"

// Internal support tool — see /manage/paymentstatus. Given an email, phone,
// order number, and/or date, searches BOTH Razorpay and PayPal's own
// transaction history (last 30 days) for matches, since a customer's payment
// may have gone through either gateway and we won't know which without
// asking. Neither provider's API supports filtering by email/phone server
// side (Razorpay: no such param at all; PayPal: same, plus requires a
// separate OAuth token fetch) — so both are fetched in full for the window
// and filtered here, in this route, after fetching.
//
// NOT YET AUTH-GATED — Mani's explicit instruction was to ship the search
// tool now and add OAuth (restricted to pariharaonline@gmail.com) as a
// follow-up. Until that lands, this endpoint is reachable by anyone who
// knows the URL and returns real order amounts/statuses for whatever
// email/phone is searched. The rate limit below slows down bulk scraping but
// does not prevent a single targeted lookup of someone else's data — that
// gap only closes once OAuth ships.
export const dynamic = "force-dynamic"

// ---------------------------------------------------------------------------
// Rate limiting — in-memory, per-IP, 1 request per 2 seconds.
// Caveat: this is a Node.js serverless function on Vercel, not a persistent
// server — under real concurrent traffic across multiple cold-started
// instances this map won't be perfectly shared, so it's "good enough to
// deter a casual bot hammering this one URL," not a hard guarantee. A proper
// distributed limiter (Vercel KV / Upstash) would need a new service +
// credentials, out of scope for "keep it simple" — worth upgrading if this
// tool ever gets meaningfully public traffic before OAuth ships.
// ---------------------------------------------------------------------------
const RATE_LIMIT_MS = 2000
const lastRequestAt = new Map<string, number>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const last = lastRequestAt.get(ip)
  lastRequestAt.set(ip, now)
  // Opportunistic cleanup so this map doesn't grow unbounded over the life
  // of a long-lived instance.
  if (lastRequestAt.size > 5000) {
    const cutoff = now - 60_000
    for (const [k, v] of lastRequestAt) {
      if (v < cutoff) lastRequestAt.delete(k)
    }
  }
  return last !== undefined && now - last < RATE_LIMIT_MS
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

// ---------------------------------------------------------------------------
// Shared search types
// ---------------------------------------------------------------------------
export interface PaymentSearchQuery {
  email?: string
  phone?: string
  orderNumber?: string
  date?: string // YYYY-MM-DD, optional narrowing within the 30-day window
}

export interface PaymentResult {
  provider: "razorpay" | "paypal"
  id: string
  amount: string
  currency: string
  status: string
  createdAt: string // ISO
  email?: string
  phone?: string
}

function normalize(s: string | undefined | null): string {
  return (s || "").trim().toLowerCase()
}

function digitsOnly(s: string | undefined | null): string {
  return (s || "").replace(/\D/g, "")
}

function matchesQuery(
  query: PaymentSearchQuery,
  candidate: { email?: string | null; phone?: string | null; orderRef?: string | null; createdAt: Date }
): boolean {
  const qEmail = normalize(query.email)
  const qPhone = digitsOnly(query.phone)
  const qOrder = normalize(query.orderNumber)

  const hasAnyCriterion = !!(qEmail || qPhone || qOrder)
  if (!hasAnyCriterion) return false // caller already validates this, defense in depth

  let matched = false
  if (qEmail && normalize(candidate.email) === qEmail) matched = true
  if (!matched && qPhone && digitsOnly(candidate.phone).endsWith(qPhone)) matched = true
  if (!matched && qOrder && normalize(candidate.orderRef).includes(qOrder)) matched = true
  if (!matched) return false

  if (query.date) {
    const wanted = query.date // YYYY-MM-DD
    const actual = candidate.createdAt.toISOString().slice(0, 10)
    if (wanted !== actual) return false
  }

  return true
}

// ---------------------------------------------------------------------------
// Razorpay — GET /v1/payments?from&to&count&skip, Basic auth. No email/phone/
// order filter exists server-side (confirmed against Razorpay's own docs and
// an open feature request asking for exactly this) — paginate the whole
// window and filter above.
// ---------------------------------------------------------------------------
async function searchRazorpay(
  query: PaymentSearchQuery,
  fromUnix: number,
  toUnix: number
): Promise<PaymentResult[]> {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) return []

  const auth = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64")
  const results: PaymentResult[] = []
  const PAGE_SIZE = 100
  const MAX_PAGES = 20 // safety cap: 2,000 payments in 30 days is generous headroom

  for (let page = 0; page < MAX_PAGES; page++) {
    const skip = page * PAGE_SIZE
    const res = await fetch(
      `https://api.razorpay.com/v1/payments?from=${fromUnix}&to=${toUnix}&count=${PAGE_SIZE}&skip=${skip}`,
      { headers: { Authorization: auth } }
    )
    if (!res.ok) break
    const json: any = await res.json()
    const items: any[] = json?.items || []
    if (items.length === 0) break

    for (const p of items) {
      const createdAt = new Date((p.created_at || 0) * 1000)
      if (
        matchesQuery(query, {
          email: p.email,
          phone: p.contact,
          orderRef: p.order_id,
          createdAt,
        })
      ) {
        results.push({
          provider: "razorpay",
          id: p.id,
          amount: (Number(p.amount || 0) / 100).toFixed(2),
          currency: p.currency || "INR",
          status: p.status || "unknown",
          createdAt: createdAt.toISOString(),
          email: p.email,
          phone: p.contact,
        })
      }
    }

    if (items.length < PAGE_SIZE) break
  }

  return results
}

// ---------------------------------------------------------------------------
// PayPal — OAuth2 client-credentials token, then GET
// /v1/reporting/transactions?start_date&end_date&fields=all (max 31-day
// range, 30 fits). No payer-email filter param exists server-side either —
// same fetch-then-filter approach as Razorpay.
// ---------------------------------------------------------------------------
async function getPaypalAccessToken(base: string, clientId: string, clientSecret: string): Promise<string | null> {
  const auth = "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })
  if (!res.ok) return null
  const json: any = await res.json()
  return json?.access_token || null
}

interface PaypalSearchOutcome {
  results: PaymentResult[]
  // Set when the search could NOT actually run (missing config, auth
  // failure, permission error, etc.) — surfaced to the UI so "no results"
  // is never confused with "the search didn't work." An empty `results`
  // array with no warning means the search genuinely ran and found nothing.
  warning?: string
}

async function searchPaypal(
  query: PaymentSearchQuery,
  startDate: Date,
  endDate: Date
): Promise<PaypalSearchOutcome> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return { results: [], warning: "PayPal search skipped: credentials not configured." }
  }

  const isSandbox = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX === "true"
  const base = isSandbox ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com"

  const token = await getPaypalAccessToken(base, clientId, clientSecret)
  if (!token) {
    return { results: [], warning: "PayPal search failed: could not authenticate with PayPal." }
  }

  const results: PaymentResult[] = []
  const PAGE_SIZE = 100
  const MAX_PAGES = 20

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = new URL(`${base}/v1/reporting/transactions`)
    url.searchParams.set("start_date", startDate.toISOString())
    url.searchParams.set("end_date", endDate.toISOString())
    url.searchParams.set("fields", "all")
    url.searchParams.set("page_size", String(PAGE_SIZE))
    url.searchParams.set("page", String(page))

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      if (res.status === 403 || body?.name === "NOT_AUTHORIZED") {
        return {
          results,
          warning:
            "PayPal search DID NOT RUN — the PayPal app is missing the \"Transaction Search\" permission " +
            "(403 NOT_AUTHORIZED). This must be enabled for this app in the PayPal Developer Dashboard before " +
            "PayPal results can ever appear here. Do not treat an empty PayPal result as \"no PayPal payment\" " +
            "until this is fixed.",
        }
      }
      return { results, warning: `PayPal search failed: HTTP ${res.status}.` }
    }
    const json: any = await res.json()
    const details: any[] = json?.transaction_details || []
    if (details.length === 0) break

    for (const d of details) {
      const info = d.transaction_info || {}
      const payer = d.payer_info || {}
      const createdAt = info.transaction_initiation_date ? new Date(info.transaction_initiation_date) : new Date(0)
      if (
        matchesQuery(query, {
          email: payer.email_address,
          phone: payer.phone_number?.national_number,
          orderRef: info.transaction_id || info.paypal_reference_id,
          createdAt,
        })
      ) {
        results.push({
          provider: "paypal",
          id: info.transaction_id || "unknown",
          amount: info.transaction_amount?.value || "0.00",
          currency: info.transaction_amount?.currency_code || "USD",
          status: info.transaction_status || "unknown",
          createdAt: createdAt.toISOString(),
          email: payer.email_address,
          phone: payer.phone_number?.national_number,
        })
      }
    }

    const totalPages = json?.total_pages || 1
    if (page >= totalPages) break
  }

  return { results }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, message: "Too many requests — please wait a moment and try again." },
      { status: 429 }
    )
  }

  const body = (await req.json().catch(() => ({}))) as PaymentSearchQuery
  const email = body.email?.trim() || undefined
  const phone = body.phone?.trim() || undefined
  const orderNumber = body.orderNumber?.trim() || undefined
  const date = body.date?.trim() || undefined

  if (!email && !phone && !orderNumber) {
    return NextResponse.json(
      { ok: false, message: "Provide at least an email, phone number, or order number." },
      { status: 400 }
    )
  }

  const query: PaymentSearchQuery = { email, phone, orderNumber, date }

  // Search window: last 30 days, ending now — a provided `date` only
  // narrows results WITHIN this window (matched exactly against that
  // calendar date), it doesn't move the window, so both providers' API
  // constraints (PayPal's 31-day max range) are always respected.
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [razorpayResults, paypalOutcome] = await Promise.all([
    searchRazorpay(query, Math.floor(thirtyDaysAgo.getTime() / 1000), Math.floor(now.getTime() / 1000)),
    searchPaypal(query, thirtyDaysAgo, now),
  ])

  const results = [...razorpayResults, ...paypalOutcome.results].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return NextResponse.json({
    ok: true,
    results,
    warnings: paypalOutcome.warning ? [paypalOutcome.warning] : [],
  })
}
