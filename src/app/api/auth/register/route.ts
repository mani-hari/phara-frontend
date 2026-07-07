import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

export async function POST(req: NextRequest) {
  let body: {
    firstName?: string
    lastName?: string
    email?: string
    password?: string
    phone?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const { firstName, lastName, email, password, phone } = body

  // Basic server-side validation
  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json(
      { error: "First name, last name, email, and password are required." },
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
    const res = await fetch(`${BACKEND_URL}/store/customers`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        ...(phone ? { phone } : {}),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      // Surface the Medusa error message when available
      const message =
        data?.message ??
        data?.error ??
        "Registration failed. This email may already be registered."
      return NextResponse.json({ error: message }, { status: res.status })
    }

    return NextResponse.json({ ok: true, email })
  } catch (err) {
    console.error("[register] Medusa error:", err)
    return NextResponse.json(
      { error: "Could not reach the backend. Please try again later." },
      { status: 502 }
    )
  }
}
