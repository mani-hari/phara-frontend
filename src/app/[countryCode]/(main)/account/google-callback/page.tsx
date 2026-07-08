"use client"

import { useEffect, useState } from "react"
import { sdk } from "@lib/config"
import { persistAuthToken } from "@lib/data/customer"

// Google redirects here after consent (this exact path is the OAuth redirect
// URI + the backend's GOOGLE_CALLBACK_URL). We validate the callback with the
// Medusa backend, create the customer on first login, then persist the session
// token into the httpOnly cookie the rest of the app reads.
function decode(token: string): any {
  try {
    return JSON.parse(atob((token.split(".")[1] || "").replace(/-/g, "+").replace(/_/g, "/")))
  } catch {
    return {}
  }
}

export default function GoogleCallbackPage() {
  const [error, setError] = useState("")

  useEffect(() => {
    ;(async () => {
      const query = Object.fromEntries(new URLSearchParams(window.location.search))
      try {
        let token = (await sdk.auth.callback("customer", "google", query)) as string
        if (!token) throw new Error("No session returned from Google.")

        // First-time login has no linked customer yet (empty actor_id) — create
        // one, then refresh the token so it carries the new customer id.
        if (!decode(token).actor_id) {
          const email = decode(token).email
          await sdk.store.customer.create(
            email ? { email } : ({} as any),
            {},
            { authorization: `Bearer ${token}` }
          )
          token = (await sdk.auth.refresh()) as string
        }

        await persistAuthToken(token)
        window.location.href = "/account"
      } catch (e: any) {
        setError(e?.message || "Google sign-in failed. Please try again.")
      }
    })()
  }, [])

  return (
    <div
      style={{
        minHeight: "60vh",
        background: "var(--paper)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
        textAlign: "center",
      }}
    >
      {error ? (
        <div style={{ maxWidth: 420 }}>
          <p className="ph-body" style={{ color: "var(--sindoor)", marginBottom: 12 }}>
            {error}
          </p>
          <a href="/account/signin" className="ph-btn ph-btn-ghost">
            Back to sign in
          </a>
        </div>
      ) : (
        <p className="ph-body" style={{ color: "var(--ink-3)" }}>
          Signing you in…
        </p>
      )}
    </div>
  )
}
