"use client"

import { useState } from "react"
import type { PaymentResult } from "@/app/api/payments/search/route"

export default function PaymentStatusPage() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [orderNumber, setOrderNumber] = useState("")
  const [date, setDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<PaymentResult[] | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])

  const canSearch = !!(email.trim() || phone.trim() || orderNumber.trim())

  const handleSearch = async () => {
    if (!canSearch || loading) return
    setLoading(true)
    setError(null)
    setResults(null)
    setWarnings([])
    try {
      const res = await fetch("/api/payments/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, orderNumber, date }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setError(json.message || "Search failed. Please try again.")
        return
      }
      setResults(json.results)
      setWarnings(json.warnings || [])
    } catch {
      setError("Search failed — network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Payment Status Check</h1>
      <p style={{ color: "#6b615c", marginBottom: 28, fontSize: 14 }}>
        Internal tool — searches Razorpay and PayPal transactions from the last 30 days.
        Provide at least one of email, phone, or order number.
      </p>

      <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 600 }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@example.com"
            style={inputStyle}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 600 }}>
          Phone number
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            style={inputStyle}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 600 }}>
          Order number
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="order_xxxxxxxx or #12345"
            style={inputStyle}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 600 }}>
          Date (optional — narrows results within the 30-day window)
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

      {error && (
        <p style={{ color: "#b6442e", marginTop: 16, fontSize: 14 }}>{error}</p>
      )}

      {warnings.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: "10px 14px",
            background: "#fef2f0",
            border: "1px solid #fbc6be",
            borderRadius: 8,
          }}
        >
          {warnings.map((w, i) => (
            <p key={i} style={{ color: "#b6442e", fontSize: 13, margin: i === 0 ? 0 : "8px 0 0" }}>
              ⚠️ {w}
            </p>
          ))}
        </div>
      )}

      {results && results.length === 0 && (
        <p style={{ marginTop: 24, fontSize: 14, color: "#6b615c" }}>No results found.</p>
      )}

      {results && results.length > 0 && (
        <table style={{ width: "100%", marginTop: 24, borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #e7ded4" }}>
              <th style={thStyle}>Provider</th>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #e7ded4" }}>
                <td style={tdStyle}>{r.provider === "razorpay" ? "Razorpay" : "PayPal"}</td>
                <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 12 }}>{r.id}</td>
                <td style={tdStyle}>
                  {r.currency} {r.amount}
                </td>
                <td style={tdStyle}>{r.status}</td>
                <td style={tdStyle}>{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

const thStyle: React.CSSProperties = { padding: "8px 6px", fontWeight: 600 }
const tdStyle: React.CSSProperties = { padding: "8px 6px" }
