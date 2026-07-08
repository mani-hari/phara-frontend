"use client"

import { useState } from "react"
import Link from "next/link"
import { sdk } from "@lib/config"
import { login, persistAuthToken } from "@lib/data/customer"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")
    if (!email || !password) {
      setFormError("Please enter your email and password.")
      return
    }
    setLoading(true)
    const fd = new FormData()
    fd.set("email", email)
    fd.set("password", password)
    const err = await login(null, fd)
    setLoading(false)
    if (err) {
      setFormError("Incorrect email or password.")
    } else {
      window.location.href = "/account"
    }
  }

  // Google via Medusa: kick off the OAuth redirect; the backend sends the user
  // to /account/google-callback afterwards.
  async function handleGoogle() {
    setFormError("")
    try {
      const result: any = await sdk.auth.login("customer", "google", {})
      if (result && typeof result === "object" && result.location) {
        window.location.href = result.location
        return
      }
      if (typeof result === "string") {
        await persistAuthToken(result)
        window.location.href = "/account"
      }
    } catch (e: any) {
      // Surface the underlying error to aid diagnosis (usually a CORS/network
      // failure reaching the Medusa backend's /auth route, or the Google
      // provider not being configured on the backend).
      console.error("Google sign-in init failed:", e)
      setFormError(
        e?.message
          ? `Could not start Google sign-in: ${e.message}`
          : "Could not start Google sign-in. Please try again."
      )
    }
  }

  const displayError = formError

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
            Welcome back
          </h1>
          <p className="ph-body" style={{ color: "var(--ink-3)" }}>
            Sign in to access your pooja history and saved addresses
          </p>
        </div>

        {/* Card */}
        <div
          className="ph-card"
          style={{ padding: "32px", borderRadius: "16px" }}
        >
          {/* SSO Buttons */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {/* Google */}
            <button
              type="button"
              className="ph-btn ph-btn-ghost ph-btn-block"
              onClick={handleGoogle}
              style={{ justifyContent: "center", gap: "10px" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "24px 0",
            }}
          >
            <div
              style={{ flex: 1, height: "1px", background: "var(--ink-line)" }}
            />
            <span
              className="ph-body-sm"
              style={{ color: "var(--ink-4)", whiteSpace: "nowrap" }}
            >
              or
            </span>
            <div
              style={{ flex: 1, height: "1px", background: "var(--ink-line)" }}
            />
          </div>

          {/* Error */}
          {displayError && (
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
              {displayError}
            </div>
          )}

          {/* Credentials form */}
          <form onSubmit={handleSubmit} noValidate>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label
                  htmlFor="email"
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
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="ph-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <label
                    htmlFor="password"
                    className="ph-body-sm"
                    style={{
                      color: "var(--ink-3)",
                      fontWeight: 500,
                    }}
                  >
                    Password
                  </label>
                  <Link
                    href="/account/forgot-password"
                    className="ph-body-sm"
                    style={{ color: "var(--sindoor)", textDecoration: "none" }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="ph-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--ink-4)",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="ph-btn ph-btn-sindoor ph-btn-block"
                disabled={loading}
                style={{ marginTop: "4px" }}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </div>
          </form>

          {/* Register link */}
          <p
            className="ph-body-sm"
            style={{
              textAlign: "center",
              marginTop: "20px",
              color: "var(--ink-3)",
            }}
          >
            New to PariharaOnline?{" "}
            <Link
              href="/account/register"
              style={{ color: "var(--sindoor)", textDecoration: "none", fontWeight: 500 }}
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
