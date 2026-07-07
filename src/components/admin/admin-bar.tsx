"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect, useCallback } from "react"

// Cookie helpers (client-side only)
const getCookie = (name: string) =>
  document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1] ?? ""

const setCookie = (name: string, value: string, days = 1) => {
  document.cookie = `${name}=${value}; path=/; max-age=${days * 86400}; SameSite=Lax`
}

const REGIONS = [
  { code: "in", label: "India", currency: "INR ₹", flag: "🇮🇳" },
  { code: "us", label: "United States", currency: "USD $", flag: "🇺🇸" },
]

function Toggle({
  label,
  sub,
  value,
  onChange,
}: {
  label: string
  sub?: string
  value: boolean
  onChange: () => void
}) {
  return (
    <button
      onClick={onChange}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "10px 0",
        borderBottom: "1px solid rgba(250,246,238,0.08)",
        gap: 12,
      }}
    >
      <div style={{ textAlign: "left" }}>
        <div style={{ fontSize: 13, color: "rgba(250,246,238,0.9)", fontWeight: 500 }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: "rgba(250,246,238,0.4)", marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
      <div
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: value ? "var(--sindoor)" : "rgba(250,246,238,0.15)",
          position: "relative",
          flexShrink: 0,
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            left: value ? 19 : 3,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
          }}
        />
      </div>
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--sindoor)",
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function QuickLink({ href, label, external }: { href: string; label: string; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "9px 0",
        borderBottom: "1px solid rgba(250,246,238,0.08)",
        fontSize: 13,
        color: "rgba(250,246,238,0.8)",
        textDecoration: "none",
      }}
    >
      {label}
      <span style={{ fontSize: 10, color: "rgba(250,246,238,0.3)" }}>
        {external ? "↗" : "→"}
      </span>
    </a>
  )
}

export default function AdminBar() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [region, setRegion] = useState("us")
  const [showHandles, setShowHandles] = useState(false)
  const [showPriceRaw, setShowPriceRaw] = useState(false)
  const [showBorders, setShowBorders] = useState(false)
  const [currentPath, setCurrentPath] = useState("")

  useEffect(() => {
    setRegion(getCookie("admin_region_override") || "us")
    setShowHandles(getCookie("admin_show_handles") === "1")
    setShowPriceRaw(getCookie("admin_show_price_raw") === "1")
    setCurrentPath(window.location.pathname)

    // Apply persisted debug classes
    if (getCookie("admin_show_handles") === "1")
      document.body.classList.add("admin-show-handles")
    if (getCookie("admin_show_price_raw") === "1")
      document.body.classList.add("admin-show-price-raw")
  }, [])

  const applyRegion = useCallback(
    (code: string) => {
      setCookie("admin_region_override", code)
      setRegion(code)
      // Replace the country-code segment in the URL and reload
      const newPath = window.location.pathname.replace(/^\/[a-z]{2}(\/|$)/, `/${code}$1`)
      window.location.href = newPath + window.location.search
    },
    []
  )

  const toggleHandles = () => {
    const next = !showHandles
    setCookie("admin_show_handles", next ? "1" : "0")
    setShowHandles(next)
    document.body.classList.toggle("admin-show-handles", next)
  }

  const togglePriceRaw = () => {
    const next = !showPriceRaw
    setCookie("admin_show_price_raw", next ? "1" : "0")
    setShowPriceRaw(next)
    document.body.classList.toggle("admin-show-price-raw", next)
  }

  const toggleBorders = () => {
    const next = !showBorders
    setShowBorders(next)
    document.body.classList.toggle("admin-show-borders", next)
  }

  const clearAdminSession = () => {
    setCookie("admin_region_override", "", 0)
    setCookie("admin_show_handles", "", 0)
    setCookie("admin_show_price_raw", "", 0)
    signOut({ callbackUrl: "/" })
  }

  if (!session) return null

  return (
    <>
      {/* Floating gear trigger */}
      <button
        onClick={() => setOpen(true)}
        title="Admin Panel"
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 9000,
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "var(--sindoor)",
          color: "#fff",
          border: "2px solid rgba(255,255,255,0.3)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          boxShadow: "0 2px 16px rgba(182,68,46,0.4)",
        }}
      >
        ⚙
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 9001,
          }}
        />
      )}

      {/* Side drawer */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 300,
          background: "#1a1410",
          color: "#faf6ee",
          zIndex: 9002,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowY: "auto",
          padding: "20px 20px 32px",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 28,
            paddingBottom: 16,
            borderBottom: "1px solid rgba(250,246,238,0.1)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "var(--sindoor)",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              ✦ Admin Mode
            </div>
            <div style={{ fontSize: 12, color: "rgba(250,246,238,0.5)" }}>
              {session.user?.name}
            </div>
            <div style={{ fontSize: 11, color: "rgba(250,246,238,0.35)" }}>
              {session.user?.email}
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(250,246,238,0.4)",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Region / currency override */}
        <Section title="View as Region">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {REGIONS.map((r) => (
              <button
                key={r.code}
                onClick={() => applyRegion(r.code)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `1.5px solid ${region === r.code ? "var(--sindoor)" : "rgba(250,246,238,0.1)"}`,
                  background: region === r.code ? "rgba(182,68,46,0.15)" : "rgba(250,246,238,0.04)",
                  cursor: "pointer",
                  color: region === r.code ? "#faf6ee" : "rgba(250,246,238,0.6)",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 20 }}>{r.flag}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.label}</div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>{r.currency}</div>
                </div>
                {region === r.code && (
                  <span style={{ marginLeft: "auto", color: "var(--sindoor)", fontSize: 14 }}>
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
          <p
            style={{
              fontSize: 11,
              color: "rgba(250,246,238,0.3)",
              marginTop: 8,
              lineHeight: 1.5,
            }}
          >
            Overrides IP-based region detection. Reloads the page.
          </p>
        </Section>

        {/* Debug overlays */}
        <Section title="Debug Overlays">
          <Toggle
            label="Show product handles &amp; IDs"
            sub="Adds handle + variant ID below each product title"
            value={showHandles}
            onChange={toggleHandles}
          />
          <Toggle
            label="Show raw prices (paise/cents)"
            sub="Shows unformatted Medusa amounts"
            value={showPriceRaw}
            onChange={togglePriceRaw}
          />
          <Toggle
            label="Component borders"
            sub="Outlines layout sections in red"
            value={showBorders}
            onChange={toggleBorders}
          />
        </Section>

        {/* Quick links */}
        <Section title="Quick Links">
          <QuickLink
            href="https://pariharaonline.medusajs.app/app"
            label="Medusa Admin"
            external
          />
          <QuickLink href="/us/admin" label="Admin Dashboard" />
          <QuickLink href="/us/ask-parihara" label="Ask Parihara" />
          <QuickLink href="/us/store" label="Store (all products)" />
        </Section>

        {/* Page info */}
        <Section title="Current Page">
          <div
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 11,
              color: "rgba(250,246,238,0.45)",
              wordBreak: "break-all",
              background: "rgba(250,246,238,0.04)",
              borderRadius: 6,
              padding: "8px 10px",
            }}
          >
            {currentPath || "—"}
          </div>
        </Section>

        {/* Sign out */}
        <button
          onClick={clearAdminSession}
          style={{
            width: "100%",
            padding: "11px",
            borderRadius: 8,
            border: "1px solid rgba(250,246,238,0.15)",
            background: "none",
            color: "rgba(250,246,238,0.5)",
            cursor: "pointer",
            fontSize: 13,
            marginTop: 8,
          }}
        >
          Sign out of admin
        </button>
      </aside>

      {/* Global debug CSS injected into the page */}
      <style>{`
        .admin-show-handles [data-testid="product-title"]::after {
          content: attr(data-handle);
          display: block;
          font-size: 10px;
          font-family: monospace;
          color: #b6442e;
          opacity: 0.8;
          font-style: normal;
        }
        .admin-show-borders * {
          outline: 1px solid rgba(255, 0, 0, 0.15) !important;
        }
      `}</style>
    </>
  )
}
