import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"
import { persistAuthToken } from "@lib/data/customer"

// Server-side completion of Google sign-in. The callback page POSTs the OAuth
// query params (code, state) here (same origin → no CORS); we exchange them
// with the Medusa backend server-to-server, create the customer on first login,
// refresh the token so it carries the customer id, and persist it into the
// httpOnly session cookie.
function decode(token: string): any {
  try {
    return JSON.parse(
      Buffer.from((token.split(".")[1] || "").replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
    )
  } catch {
    return {}
  }
}

export async function POST(req: NextRequest) {
  let query: Record<string, string> = {}
  try {
    query = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 })
  }

  try {
    let token = (await sdk.auth.callback("customer", "google", query)) as string
    if (!token) throw new Error("No session returned from Google.")

    // First login → no linked customer yet (empty actor_id). Create one, then
    // refresh the token so it carries the new customer id.
    if (!decode(token).actor_id) {
      const email = decode(token).email
      await sdk.store.customer.create(
        email ? { email } : ({} as any),
        {},
        { authorization: `Bearer ${token}` }
      )
      const refreshed: any = await sdk.client.fetch("/auth/token/refresh", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
      })
      token = refreshed?.token || token
    }

    await persistAuthToken(token)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Google sign-in could not be completed." },
      { status: 400 }
    )
  }
}
