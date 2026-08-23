"use client"

import { useState } from "react"

// Shared across /manage/* internal tools.
export default function PasswordGate() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!password || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/manage/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(json.message || "Incorrect password.")
        return
      }
      window.location.reload()
    } catch {
      setError("Network error — please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: 360,
        margin: "80px auto",
        padding: "0 20px",
        textAlign: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Password required</h1>
      <p style={{ color: "#6b615c", fontSize: 14, marginBottom: 20 }}>
        This is an internal tool restricted to authorized staff.
      </p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Password"
        autoFocus
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 6,
          border: "1px solid #e7ded4",
          fontSize: 14,
          marginBottom: 12,
          boxSizing: "border-box",
        }}
      />
      <button
        type="button"
        onClick={submit}
        disabled={!password || loading}
        style={{
          width: "100%",
          padding: "10px 24px",
          borderRadius: 8,
          border: "none",
          background: password && !loading ? "#b6442e" : "#d9cfc4",
          color: "#fff",
          fontWeight: 600,
          cursor: password && !loading ? "pointer" : "not-allowed",
        }}
      >
        {loading ? "Checking…" : "Enter"}
      </button>
      {error && <p style={{ color: "#b6442e", fontSize: 13, marginTop: 12 }}>{error}</p>}
    </div>
  )
}
