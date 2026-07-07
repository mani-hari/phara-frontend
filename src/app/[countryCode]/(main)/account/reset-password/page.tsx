"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const emailParam = searchParams.get("email") ?? ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // If no token is present show an informative message rather than a broken form
  if (!token) {
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
        <div style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
          <div className="ph-card" style={{ padding: "32px", borderRadius: "16px" }}>
            <h2
              className="ph-h3"
              style={{ fontFamily: "var(--serif)", marginBottom: "12px" }}
            >
              Invalid or expired link
            </h2>
            <p className="ph-body" style={{ color: "var(--ink-3)", marginBottom: "24px" }}>
              This password reset link is invalid or has expired. Please request
              a new one.
            </p>
            <Link
              href="/account/forgot-password"
              className="ph-btn ph-btn-sindoor"
            >
              Request new link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!password) {
      setError("Please enter a new password.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, email: emailParam }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error ?? "Could not reset password. The link may have expired.")
        return
      }

      setSuccess(true)
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
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            className="ph-h2"
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
              marginBottom: "8px",
            }}
          >
            Set new password
          </h1>
          <p className="ph-body" style={{ color: "var(--ink-3)" }}>
            Choose a strong password for your account
          </p>
        </div>

        <div
          className="ph-card"
          style={{ padding: "32px", borderRadius: "16px" }}
        >
          {success ? (
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
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2
                className="ph-h3"
                style={{ fontFamily: "var(--serif)", marginBottom: "10px" }}
              >
                Password updated!
              </h2>
              <p
                className="ph-body"
                style={{ color: "var(--ink-3)", marginBottom: "24px" }}
              >
                Your password has been changed successfully.
              </p>
              <Link href="/account/signin" className="ph-btn ph-btn-sindoor">
                Sign in →
              </Link>
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
                {/* New password */}
                <div>
                  <label
                    htmlFor="new-password"
                    className="ph-body-sm"
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      color: "var(--ink-3)",
                      fontWeight: 500,
                    }}
                  >
                    New password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="ph-input"
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: "44px" }}
                    />
                    <TogglePasswordButton
                      show={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                    />
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="confirm-new-password"
                    className="ph-body-sm"
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      color: "var(--ink-3)",
                      fontWeight: 500,
                    }}
                  >
                    Confirm new password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="confirm-new-password"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      className="ph-input"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ paddingRight: "44px" }}
                    />
                    <TogglePasswordButton
                      show={showConfirm}
                      onToggle={() => setShowConfirm((v) => !v)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="ph-btn ph-btn-sindoor ph-btn-block"
                  disabled={loading}
                >
                  {loading ? "Updating…" : "Update password →"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function TogglePasswordButton({
  show,
  onToggle,
}: {
  show: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
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
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? (
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
  )
}
