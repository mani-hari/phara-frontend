"use client"

import { useState } from "react"
import type { PaymentResult, PaymentStatusCategory } from "@/app/api/payments/search/route"

interface SearchResponse {
  ok: boolean
  razorpayResults?: PaymentResult[]
  paypalResults?: PaymentResult[]
  searchWindowDays?: number
  warnings?: string[]
  message?: string
}

const STATUS_STYLES: Record<PaymentStatusCategory, { bg: string; color: string; icon: string | null }> = {
  success: { bg: "#e3f5e9", color: "#1e7e34", icon: "✓" },
  failure: { bg: "#fdecea", color: "#c0392b", icon: "✕" },
  other: { bg: "#fff6d9", color: "#8a6d00", icon: null },
}

function StatusPill({ category, label }: { category: PaymentStatusCategory; label: string }) {
  const s = STATUS_STYLES[category]
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "7px 16px",
        borderRadius: 999,
        background: s.bg,
        color: s.color,
        fontWeight: 700,
        fontSize: 16,
        lineHeight: 1.2,
      }}
    >
      {s.icon && <span style={{ fontSize: 17 }}>{s.icon}</span>}
      {label}
    </span>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: "#8b8073", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>
        {label}
      </div>
      <div style={{ fontSize: 16, color: "#2c241d", fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-word" }}>
        {value}
      </div>
    </div>
  )
}

function ResultCard({ r }: { r: PaymentResult }) {
  return (
    <div style={{ padding: "20px 0", borderBottom: "1px solid #e7ded4" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <StatusPill category={r.statusCategory} label={r.statusLabel} />
        <span style={{ fontSize: 24, fontWeight: 700, color: "#2c241d" }}>
          {r.currency} {r.amount}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "14px 28px" }}>
        <Field label="Payment ID" value={r.id} mono />
        {r.orderRef && <Field label="Order Ref" value={r.orderRef} mono />}
        <Field label="Date & Time" value={new Date(r.createdAt).toLocaleString()} />
        {r.email && <Field label="Email" value={r.email} />}
        {r.phone && <Field label="Phone" value={r.phone} />}
        {Object.entries(r.meta).map(([k, v]) => (
          <Field key={k} label={k} value={v} />
        ))}
      </div>
    </div>
  )
}

function ProviderSection({
  title,
  results,
  warning,
}: {
  title: string
  results: PaymentResult[]
  warning?: string
}) {
  return (
    <div style={{ marginTop: 40 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14, color: "#2c241d" }}>{title}</h2>
      {warning && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fef2f0",
            border: "1px solid #fbc6be",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <p style={{ color: "#b6442e", fontSize: 14, margin: 0 }}>⚠️ {warning}</p>
        </div>
      )}
      {results.length === 0 ? (
        <p style={{ fontSize: 15, color: "#6b615c" }}>No results found.</p>
      ) : (
        results.map((r) => <ResultCard key={r.id} r={r} />)
      )}
    </div>
  )
}

export default function PaymentStatusForm() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [orderNumber, setOrderNumber] = useState("")
  const [date, setDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<SearchResponse | null>(null)

  const canSearch = !!(email.trim() || phone.trim() || orderNumber.trim())
  const windowDays = response?.searchWindowDays ?? 30

  const handleSearch = async () => {
    if (!canSearch || loading) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const res = await fetch("/api/payments/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, orderNumber, date }),
      })
      const json: SearchResponse = await res.json()
      if (!res.ok || !json.ok) {
        setError(json.message || "Search failed. Please try again.")
        return
      }
      setResponse(json)
    } catch {
      setError("Search failed — network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setEmail("")
    setPhone("")
    setOrderNumber("")
    setDate("")
    setResponse(null)
    setError(null)
  }

  const logout = async () => {
    await fetch("/api/manage/logout", { method: "POST" }).catch(() => {})
    window.location.reload()
  }

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 20px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Payment Status Check</h1>
      <p style={{ color: "#6b615c", marginBottom: 28, fontSize: 14 }}>
        Internal tool — searches Razorpay and PayPal transactions from the last {windowDays} days.
        Provide at least one of email, phone, or order number.
      </p>

      <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 600 }}>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 600 }}>
          Phone number
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 600 }}>
          Order number
          <input type="text" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} style={inputStyle} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 600 }}>
          Date (optional — narrows results within the {windowDays}-day window)
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
        </label>
      </div>

      <button
        type="button"
        onClick={handleSearch}
        disabled={!canSearch || loading}
        style={{
          padding: "10px 24px",
          borderRadius: 8,
          border: "none",
          background: canSearch && !loading ? "#b6442e" : "#d9cfc4",
          color: "#fff",
          fontWeight: 600,
          cursor: canSearch && !loading ? "pointer" : "not-allowed",
        }}
      >
        {loading ? "Searching…" : "Search"}
      </button>

      {error && <p style={{ color: "#b6442e", marginTop: 16, fontSize: 14 }}>{error}</p>}

      {response && (
        <>
          <ProviderSection title="Payment in Razorpay" results={response.razorpayResults || []} />
          <ProviderSection
            title="Payment in Paypal"
            results={response.paypalResults || []}
            warning={response.warnings?.[0]}
          />

          <div
            style={{
              marginTop: 40,
              paddingTop: 24,
              borderTop: "1px solid #e7ded4",
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "10px 24px",
                borderRadius: 8,
                border: "none",
                background: "#b6442e",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try a different order
            </button>
            <button
              type="button"
              onClick={logout}
              style={{
                background: "none",
                border: "none",
                color: "#6b615c",
                fontSize: 14,
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #e7ded4",
  fontSize: 14,
}
