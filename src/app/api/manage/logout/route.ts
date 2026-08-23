import { NextResponse } from "next/server"
import { MANAGE_AUTH_COOKIE } from "@lib/manage-auth"

export const dynamic = "force-dynamic"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(MANAGE_AUTH_COOKIE.name, "", { maxAge: 0, path: "/" })
  return res
}
