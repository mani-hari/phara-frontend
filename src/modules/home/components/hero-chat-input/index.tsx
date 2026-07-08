"use client"

import { useState, KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { localizeHref } from "@lib/util/localize-href"

const CHIPS = [
  "My daughter's marriage is delayed",
  "We've been trying to conceive",
  "For my father's recovery from a stroke",
  "Saturn return remedies",
]

export default function HeroChatInput({ countryCode = "in" }: { countryCode?: string }) {
  const [value, setValue] = useState("")
  const router = useRouter()

  const navigate = (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    router.push(localizeHref(countryCode, `/ask-parihara?q=${encodeURIComponent(trimmed)}`))
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      navigate(value)
    }
  }

  return (
    <div>
      {/* Input card */}
      <div
        className="ph-card"
        style={{
          padding: "14px 16px",
          boxShadow: "0 4px 24px rgba(26,20,16,0.08)",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--sindoor)",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            ✦
          </span>
          <textarea
            rows={2}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="What are you wishing or praying for today?"
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: 15,
              fontFamily: "var(--sans)",
              color: "var(--ink)",
              minWidth: 0,
              resize: "none",
              lineHeight: 1.55,
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <button
            type="button"
            onClick={() => navigate(value)}
            className="ph-btn ph-btn-sindoor"
            style={{ fontSize: 14, padding: "8px 18px" }}
          >
            Ask →
          </button>
        </div>
      </div>

      {/* Suggestion chips */}
      <p
        style={{
          textAlign: "center",
          marginTop: 18,
          marginBottom: 0,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--ink-4)",
          fontFamily: "var(--sans)",
        }}
      >
        Suggested questions
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginTop: 10,
        }}
      >
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => navigate(chip)}
            style={{
              padding: "7px 14px",
              background: "rgba(139, 90, 43, 0.08)",
              border: "1px solid rgba(139, 90, 43, 0.2)",
              borderRadius: 999,
              cursor: "pointer",
              fontSize: 13,
              color: "var(--ink-2)",
              fontFamily: "var(--sans)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(139, 90, 43, 0.16)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(139, 90, 43, 0.08)")
            }
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  )
}
