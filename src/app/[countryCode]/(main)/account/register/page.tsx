"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"

const FACEBOOK_ENABLED = !!(process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || false)

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}
    if (!firstName.trim()) errs.firstName = "First name is required."
    if (!lastName.trim()) errs.lastName = "Last name is required."
    if (!email.trim()) errs.email = "Email is required."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email address."
    if (!password) errs.password = "Password is required."
    else if (password.length < 8)
      errs.password = "Password must be at least 8 characters."
    if (!confirmPassword) errs.confirmPassword = "Please confirm your password."
    else if (password !== confirmPassword)
      errs.confirmPassword = "Passwords do not match."
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phone: phone || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.")
        setLoading(false)
        return
      }

      // Auto sign-in after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
        redirect: false,
      })

      if (result?.url) {
        window.location.href = result.url
      } else {
        window.location.href = "/"
      }
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
      <div style={{ width: "100%", maxWidth: "460px" }}>
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
            Create your account
          </h1>
          <p className="ph-body" style={{ color: "var(--ink-3)" }}>
            Join PariharaOnline for pooja history, saved addresses, and more
          </p>
        </div>

        <div
          className="ph-card"
          style={{ padding: "32px", borderRadius: "16px" }}
        >
          {/* SSO options */}
          <p
            className="ph-body-sm"
            style={{
              textAlign: "center",
              color: "var(--ink-4)",
              marginBottom: "12px",
            }}
          >
            Or continue with
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <button
              type="button"
              className="ph-btn ph-btn-ghost ph-btn-block"
              onClick={() => signIn("google", { callbackUrl: "/" })}
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

            {FACEBOOK_ENABLED && (
              <button
                type="button"
                className="ph-btn ph-btn-block"
                onClick={() => signIn("facebook", { callbackUrl: "/" })}
                style={{
                  background: "#1877F2",
                  color: "#fff",
                  border: "none",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.095 10.125 24v-8.437H7.078v-3.49h3.047V9.428c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.095 24 18.1 24 12.073Z" />
                </svg>
                Continue with Facebook
              </button>
            )}
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
              or fill in your details
            </span>
            <div
              style={{ flex: 1, height: "1px", background: "var(--ink-line)" }}
            />
          </div>

          {/* Global error */}
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

          {/* Registration form */}
          <form onSubmit={handleSubmit} noValidate>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {/* First + Last name */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    htmlFor="firstName"
                    className="ph-body-sm"
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      color: "var(--ink-3)",
                      fontWeight: 500,
                    }}
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    className="ph-input"
                    placeholder="Arjun"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  {fieldErrors.firstName && (
                    <p
                      style={{
                        color: "#b91c1c",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="ph-body-sm"
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      color: "var(--ink-3)",
                      fontWeight: 500,
                    }}
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    className="ph-input"
                    placeholder="Sharma"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  {fieldErrors.lastName && (
                    <p
                      style={{
                        color: "#b91c1c",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="reg-email"
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
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  className="ph-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {fieldErrors.email && (
                  <p
                    style={{
                      color: "#b91c1c",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="reg-password"
                  className="ph-body-sm"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "var(--ink-3)",
                    fontWeight: 500,
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="reg-password"
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
                {fieldErrors.password && (
                  <p
                    style={{
                      color: "#b91c1c",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="ph-body-sm"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "var(--ink-3)",
                    fontWeight: 500,
                  }}
                >
                  Confirm password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="confirmPassword"
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
                {fieldErrors.confirmPassword && (
                  <p
                    style={{
                      color: "#b91c1c",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Phone (optional) */}
              <div>
                <label
                  htmlFor="phone"
                  className="ph-body-sm"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "var(--ink-3)",
                    fontWeight: 500,
                  }}
                >
                  Phone{" "}
                  <span style={{ color: "var(--ink-4)", fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  className="ph-input"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="ph-btn ph-btn-sindoor ph-btn-block"
                disabled={loading}
                style={{ marginTop: "4px" }}
              >
                {loading ? "Creating account…" : "Create account →"}
              </button>
            </div>
          </form>

          <p
            className="ph-body-sm"
            style={{
              textAlign: "center",
              marginTop: "20px",
              color: "var(--ink-3)",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/account/signin"
              style={{
                color: "var(--sindoor)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Sign in
            </Link>
          </p>
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
