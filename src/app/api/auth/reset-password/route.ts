import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

export async function POST(req: NextRequest) {
  let body: { token?: string; password?: string; email?: string }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const { token, password, email } = body

  if (!token || !password) {
    return NextResponse.json(
      { error: "Token and new password are required." },
      { status: 400 }
    )
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
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
    // Medusa v1: POST /store/customers/reset-password
    const res = await fetch(`${BACKEND_URL}/store/customers/reset-password`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        token,
        password,
        ...(email ? { email } : {}),
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      const message =
        data?.message ??
        data?.error ??
        "Could not reset password. The token may be invalid or expired."
      return NextResponse.json({ error: message }, { status: res.status })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[reset-password] Medusa error:", err)
    return NextResponse.json(
      { error: "Could not reach the backend. Please try again later." },
      { status: 502 }
    )
  }
}
