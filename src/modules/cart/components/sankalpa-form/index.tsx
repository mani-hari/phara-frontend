"use client"

import { updateCartPujaDetails } from "@lib/data/cart"
import { useState, useTransition } from "react"

const NAKSHATRAMS = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu",
  "Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta",
  "Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha",
  "Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada",
  "Uttara Bhadrapada","Revati",
]

const RASIS = [
  "Mesha (Aries)","Vrishabha (Taurus)","Mithuna (Gemini)","Karka (Cancer)",
  "Simha (Leo)","Kanya (Virgo)","Tula (Libra)","Vrischika (Scorpio)",
  "Dhanu (Sagittarius)","Makara (Capricorn)","Kumbha (Aquarius)","Meena (Pisces)",
]

type Devotee = {
  name: string
  prayer: string
  nakshatram: string
  rasi: string
  gothram: string
}

const EMPTY_DEVOTEE: Devotee = { name: "", prayer: "", nakshatram: "", rasi: "", gothram: "" }

export default function SankalpForm() {
  const [devotees, setDevotees] = useState<Devotee[]>([{ ...EMPTY_DEVOTEE }])
  const [datePreference, setDatePreference] = useState("")
  const [starOpen, setStarOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const update = (i: number, field: keyof Devotee, val: string) => {
    setSaved(false)
    setDevotees((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: val } : d)))
  }

  const addDevotee = () => {
    if (devotees.length < 4) setDevotees((prev) => [...prev, { ...EMPTY_DEVOTEE }])
  }

  const removeDevotee = (i: number) =>
    setDevotees((prev) => prev.filter((_, idx) => idx !== i))

  const handleSave = () => {
    const valid = devotees.some((d) => d.name.trim())
    if (!valid) {
      setError("Please enter at least one devotee name.")
      return
    }
    setError(null)

    const sankalpam_notes = devotees
      .filter((d) => d.name.trim() && d.prayer.trim())
      .map((d) => `${d.name.trim()}: ${d.prayer.trim()}`)
      .join("; ")

    startTransition(async () => {
      try {
        await updateCartPujaDetails({
          devotees: devotees
            .filter((d) => d.name.trim())
            .map((d) => ({
              name: d.name.trim(),
              nakshatram: d.nakshatram || undefined,
              rasi: d.rasi || undefined,
              gothram: d.gothram || undefined,
            })),
          date_preference: datePreference || undefined,
          sankalpam_notes: sankalpam_notes || undefined,
        })
        setSaved(true)
      } catch {
        setError("Failed to save. Please try again.")
      }
    })
  }

  return (
    <div
      className="ph-card"
      style={{
        border: "2px solid var(--sindoor)",
        background: "var(--paper)",
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "var(--sindoor-soft)",
          borderBottom: "1px solid var(--sindoor)",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "var(--sindoor)",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            2
          </span>
          <span className="ph-h4" style={{ margin: 0 }}>
            Who is this pooja for?
          </span>
        </div>
        <span
          className="ph-label ph-num"
          style={{ color: "var(--sindoor)", fontSize: 11, fontWeight: 600 }}
        >
          Required · 30 seconds
        </span>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        {devotees.map((d, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            {devotees.length > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <span className="ph-label" style={{ color: "var(--ink-3)" }}>
                  Devotee {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeDevotee(i)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--ink-4)",
                    fontSize: 13,
                    padding: 0,
                  }}
                >
                  Remove
                </button>
              </div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <label
                  className="ph-label"
                  style={{ display: "block", marginBottom: 5, color: "var(--ink-3)" }}
                >
                  Name *
                </label>
                <input
                  className="ph-input"
                  style={{ width: "100%" }}
                  placeholder="e.g. Lakshmi Venkat"
                  value={d.name}
                  onChange={(e) => update(i, "name", e.target.value)}
                />
              </div>
              <div>
                <label
                  className="ph-label"
                  style={{ display: "block", marginBottom: 5, color: "var(--ink-3)" }}
                >
                  Prayer / intention
                </label>
                <input
                  className="ph-input"
                  style={{ width: "100%" }}
                  placeholder="e.g. For my father's health"
                  value={d.prayer}
                  onChange={(e) => update(i, "prayer", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        {devotees.length < 4 && (
          <button
            type="button"
            onClick={addDevotee}
            className="ph-btn ph-btn-ghost"
            style={{ fontSize: 13, padding: "6px 14px", marginBottom: 16 }}
          >
            + Add another devotee
          </button>
        )}

        {/* Date preference */}
        <div style={{ marginBottom: 16 }}>
          <label
            className="ph-label"
            style={{ display: "block", marginBottom: 5, color: "var(--ink-3)" }}
          >
            Preferred date
            <span style={{ fontWeight: 400, marginLeft: 6, color: "var(--ink-4)" }}>
              Optional
            </span>
          </label>
          <input
            className="ph-input"
            type="date"
            style={{ width: "100%", maxWidth: 240 }}
            value={datePreference}
            onChange={(e) => { setDatePreference(e.target.value); setSaved(false) }}
          />
        </div>
      </div>

      {/* Star details — optional expand */}
      <div style={{ borderTop: "1px solid var(--ink-line)", margin: "0 20px" }} />
      <div style={{ padding: "0 20px" }}>
        <button
          type="button"
          onClick={() => setStarOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "14px 0",
            width: "100%",
            textAlign: "left",
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: "1.5px solid var(--gold)",
              color: "var(--gold-2)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {starOpen ? "−" : "+"}
          </span>
          <span>
            <span className="ph-body" style={{ fontWeight: 500 }}>
              Add star details
            </span>{" "}
            <span className="ph-body-sm" style={{ color: "var(--ink-4)" }}>
              Optional · skip if you don&apos;t know
            </span>
          </span>
        </button>

        {starOpen && (
          <div style={{ paddingBottom: 8 }}>
            <p
              className="ph-body-sm"
              style={{ color: "var(--ink-3)", marginBottom: 16, lineHeight: 1.6 }}
            >
              Don&apos;t worry if you don&apos;t know any of these — the pooja is fully
              valid with name alone.{" "}
              <span
                style={{
                  background: "var(--gold-soft)",
                  color: "var(--gold-2)",
                  padding: "2px 8px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "var(--sans)",
                }}
              >
                We can find them for free →
              </span>
            </p>

            {devotees.map((d, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                  marginBottom: devotees.length > 1 && i < devotees.length - 1 ? 16 : 0,
                }}
              >
                {devotees.length > 1 && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span className="ph-label" style={{ color: "var(--ink-4)" }}>
                      {d.name || `Devotee ${i + 1}`}
                    </span>
                  </div>
                )}
                <div>
                  <label className="ph-label" style={{ display: "block", marginBottom: 5, color: "var(--ink-3)" }}>
                    Nakshatram
                  </label>
                  <select
                    className="ph-input"
                    style={{ width: "100%" }}
                    value={d.nakshatram}
                    onChange={(e) => update(i, "nakshatram", e.target.value)}
                  >
                    <option value="">Select…</option>
                    {NAKSHATRAMS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="ph-label" style={{ display: "block", marginBottom: 5, color: "var(--ink-3)" }}>
                    Rasi
                  </label>
                  <select
                    className="ph-input"
                    style={{ width: "100%" }}
                    value={d.rasi}
                    onChange={(e) => update(i, "rasi", e.target.value)}
                  >
                    <option value="">Select…</option>
                    {RASIS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="ph-label" style={{ display: "block", marginBottom: 5, color: "var(--ink-3)" }}>
                    Gothram
                  </label>
                  <input
                    className="ph-input"
                    style={{ width: "100%" }}
                    placeholder="e.g. Bharadvaja"
                    value={d.gothram}
                    onChange={(e) => update(i, "gothram", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save action */}
      <div
        style={{
          borderTop: "1px solid var(--ink-line)",
          margin: "0 20px",
          padding: "16px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {error && (
          <span className="ph-body-sm" style={{ color: "var(--sindoor)", flex: 1 }}>
            {error}
          </span>
        )}
        {saved && !error && (
          <span className="ph-body-sm" style={{ color: "#2d6a4f", flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
            <span>✓</span> Sankalpa saved
          </span>
        )}
        {!saved && !error && <span style={{ flex: 1 }} />}
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="ph-btn ph-btn-sindoor"
          style={{ padding: "10px 24px", fontSize: 14, fontWeight: 600, opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? "Saving…" : "Save Sankalpa"}
        </button>
      </div>
    </div>
  )
}
