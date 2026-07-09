import { NextResponse } from "next/server"
import { sdk } from "@lib/config"

// Never cache — each call must mint a FRESH OAuth state. Without this, Next
// statically caches the GET response and serves one stale (expired) state to
// everyone, which the callback then rejects with "No state provided".
export const dynamic = "force-dynamic"
export const revalidate = 0

// Same-origin proxy that starts Google sign-in. The browser calls THIS route
// (same origin → no CORS); we call the Medusa backend server-to-server (also no
// CORS) to get the Google consent URL, and hand it back for the client to
// redirect to. Avoids the browser ever calling the backend's /auth route
// directly (which was failing with "Failed to fetch").
export async function GET() {
  try {
    const result: any = await sdk.auth.login("customer", "google", {})
    const location =
      result && typeof result === "object" ? result.location : null
    if (!location) {
      return NextResponse.json(
        { error: "Google sign-in is not configured." },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { location },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    )
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Could not start Google sign-in." },
      { status: 500 }
    )
  }
}
