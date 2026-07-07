"use client"

import { useRef, useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"

export default function SignInButton() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  if (status === "loading") {
    return <div style={{ width: 64, height: 34 }} />
  }

  const dropdownStyle: React.CSSProperties = {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    background: "var(--paper)",
    border: "1px solid var(--ink-line)",
    borderRadius: 12,
    padding: 14,
    minWidth: 220,
    boxShadow: "0 8px 32px rgba(26,20,16,0.14)",
    zIndex: 200,
    animation: "phFadeSlide 0.15s ease",
  }

  if (session?.user) {
    const initials =
      (session.user.name?.[0] ?? session.user.email?.[0] ?? "U").toUpperCase()
    const firstName = session.user.name?.split(" ")[0] ?? "Account"

    return (
      <div ref={ref} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="hidden small:inline-flex items-center ph-btn ph-btn-ghost"
          style={{ padding: "6px 12px", fontSize: 13, gap: 7 }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--sindoor)",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </span>
          {firstName}
        </button>

        {open && (
          <div style={dropdownStyle}>
            <p
              style={{
                fontSize: 12,
                color: "var(--ink-4)",
                marginBottom: 10,
                paddingBottom: 10,
                borderBottom: "1px solid var(--ink-line)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {session.user.email}
            </p>
            {[
              { label: "My Account", href: "/account" },
              { label: "My Orders", href: "/account/@dashboard/orders" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  padding: "8px 10px",
                  fontSize: 13,
                  color: "var(--ink)",
                  borderRadius: 7,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.background =
                    "rgba(26,20,16,0.05)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.background = "")
                }
              >
                {label}
              </a>
            ))}
            <div style={{ borderTop: "1px solid var(--ink-line)", marginTop: 8, paddingTop: 8 }}>
              <button
                type="button"
                onClick={() => signOut()}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  fontSize: 13,
                  color: "var(--ink-4)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 7,
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        )}
        <style>{`@keyframes phFadeSlide { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:none } }`}</style>
      </div>
    )
  }

  // Guest state
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="hidden small:inline-flex ph-btn ph-btn-ghost"
        style={{ padding: "8px 16px", fontSize: 13 }}
      >
        Sign in
      </button>

      {open && (
        <div style={dropdownStyle}>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--ink)",
              marginBottom: 14,
            }}
          >
            Welcome back
          </p>

          {/* Google SSO */}
          <button
            type="button"
            onClick={() => signIn("google")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              background: "#fff",
              border: "1px solid var(--ink-line)",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 8,
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.borderColor = "#4285F4")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ink-line)")
            }
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "var(--ink-4)",
              marginTop: 10,
            }}
          >
            <a
              href="/account/signin"
              onClick={() => setOpen(false)}
              style={{ color: "var(--sindoor)", textDecoration: "none" }}
            >
              Sign in with email →
            </a>
            {" · "}
            <a
              href="/account/register"
              onClick={() => setOpen(false)}
              style={{ color: "var(--ink-4)", textDecoration: "none" }}
            >
              Register
            </a>
          </div>
        </div>
      )}
      <style>{`@keyframes phFadeSlide { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:none } }`}</style>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
