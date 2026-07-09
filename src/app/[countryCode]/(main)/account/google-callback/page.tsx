"use client"

import { useEffect, useState } from "react"

// Google redirects the browser here after consent. We hand the OAuth query
// params to our own same-origin API route, which completes the exchange with
// the Medusa backend server-side (no browser→backend CORS) and sets the session
// cookie. Then we land the user on their account.
export default function GoogleCallbackPage() {
  const [error, setError] = useState("")

  useEffect(() => {
    const query = Object.fromEntries(new URLSearchParams(window.location.search))
    fetch("/api/auth/google/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          window.location.href = "/account"
        } else {
          setError(d.error || "Google sign-in could not be completed.")
        }
      })
      .catch((e) => setError(e?.message || "Google sign-in could not be completed."))
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
