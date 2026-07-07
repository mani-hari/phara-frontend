"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }

      setSent(true)
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--paper)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            className="ph-h2"
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
              marginBottom: "8px",
            }}
          >
            Forgot password?
          </h1>
          <p className="ph-body" style={{ color: "var(--ink-3)" }}>
            We'll send a reset link to your email address
          </p>
        </div>

        <div
          className="ph-card"
          style={{ padding: "32px", borderRadius: "16px" }}
        >
          {sent ? (
            /* Success state */
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "var(--sindoor-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--sindoor)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2
                className="ph-h3"
                style={{ fontFamily: "var(--serif)", marginBottom: "10px" }}
              >
                Check your email
              </h2>
              <p
                className="ph-body"
                style={{ color: "var(--ink-3)", marginBottom: "24px" }}
              >
                We've sent a password reset link to{" "}
                <strong style={{ color: "var(--ink)" }}>{email}</strong>
              </p>
              <p className="ph-body-sm" style={{ color: "var(--ink-4)" }}>
                Didn't receive it? Check your spam folder, or{" "}
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--sindoor)",
                    fontWeight: 500,
                    padding: 0,
                    fontSize: "inherit",
                  }}
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            /* Form state */
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fca5a5",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    marginBottom: "16px",
                    color: "#b91c1c",
                    fontSize: "14px",
                  }}
                >
                  {error}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="ph-body-sm"
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      color: "var(--ink-3)",
                      fontWeight: 500,
                    }}
                  >
                    Email address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    className="ph-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="ph-btn ph-btn-sindoor ph-btn-block"
                  disabled={loading}
                >
                  {loading ? "Sending…" : "Send reset link →"}
                </button>
              </div>
            </form>
          )}

          <p
            className="ph-body-sm"
            style={{
              textAlign: "center",
              marginTop: "20px",
              color: "var(--ink-3)",
            }}
          >
            <Link
              href="/account/signin"
              style={{
                color: "var(--sindoor)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              ← Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
