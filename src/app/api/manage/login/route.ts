import { NextRequest, NextResponse } from "next/server"
import { checkCredentials, signedCookieValue, MANAGE_AUTH_COOKIE } from "@lib/manage-auth"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = String(body?.email || "").trim()
  const password = String(body?.password || "")

  if (!checkCredentials(email, password)) {
    return NextResponse.json({ ok: false, message: "Incorrect email or password." }, { status: 401 })
  }

  const value = signedCookieValue(email.toLowerCase())
  if (!value) {
    return NextResponse.json({ ok: false, message: "Server not configured." }, { status: 500 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(MANAGE_AUTH_COOKIE.name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // localhost is plain http
    sameSite: "lax",
    maxAge: MANAGE_AUTH_COOKIE.maxAge,
    path: "/",
  })
  return res
}
