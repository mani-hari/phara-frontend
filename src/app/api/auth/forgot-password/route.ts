import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

export async function POST(req: NextRequest) {
  let body: { email?: string }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const { email } = body

  if (!email) {
    return NextResponse.json(
      { error: "Email address is required." },
      { status: 400 }
    )
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (PUBLISHABLE_KEY) {
    headers["x-publishable-api-key"] = PUBLISHABLE_KEY
  }

  try {
    // Medusa v1: POST /store/customers/password-token
    // Medusa v2: POST /auth/customer/emailpass/reset-password (or similar)
    // We try v1 first — it's widely deployed and the response is always 204/200
    await fetch(`${BACKEND_URL}/store/customers/password-token`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email }),
    })
    // We intentionally ignore the Medusa response status here.
    // Always return ok=true so we never leak whether an email exists.
  } catch (err) {
    console.error("[forgot-password] Medusa error:", err)
    // Still return ok=true — the client shows a success state regardless.
  }

  return NextResponse.json({ ok: true })
}
