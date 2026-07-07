"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateCartPujaDetails } from "@lib/data/cart"
import { localizeHref } from "@lib/util/localize-href"

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
  prayer: string
  name: string
  nakshatram: string
  rasi: string
  gothram: string
  starOpen: boolean
}

const EMPTY: Devotee = { prayer: "", name: "", nakshatram: "", rasi: "", gothram: "", starOpen: false }

type Props = {
  countryCode: string
  subtotal: number
  currency: string
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function CartCheckoutSection({ countryCode, subtotal, currency }: Props) {
  const [devotees, setDevotees] = useState<Devotee[]>([{ ...EMPTY }])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const update = (i: number, field: keyof Devotee, val: string | boolean) =>
    setDevotees((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: val } : d)))

  const addPerson = () => {
    if (devotees.length < 4) setDevotees((p) => [...p, { ...EMPTY }])
  }

  const removePerson = (i: number) => setDevotees((p) => p.filter((_, idx) => idx !== i))

  const handleProceed = () => {
    const valid = devotees.some((d) => d.name.trim())
    if (!valid) {
      setError("Please enter at least one name before proceeding.")
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
          sankalpam_notes: sankalpam_notes || undefined,
        })
        router.push(localizeHref(countryCode, "/checkout"))
      } catch {
        setError("Something went wrong. Please try again.")
      }
    })
  }

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: 20 }}>
        <h2 className="ph-h3" style={{ margin: 0, marginBottom: 4 }}>
          Who is it for?{" "}
          <span className="ph-body" style={{ color: "var(--ink-4)", fontFamily: "var(--sans)", fontSize: 14, fontWeight: 400 }}>
            (sankalpam)
          </span>
        </h2>
        <p className="ph-body-sm" style={{ color: "var(--ink-4)", margin: 0 }}>
          Tell us who this pooja is being performed for.
        </p>
      </div>

      {/* Per-person cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
        {devotees.map((d, i) => (
          <div
            key={i}
            style={{
              border: "1px solid var(--ink-line)",
              borderRadius: 12,
              padding: "16px 18px",
              background: "var(--paper)",
              position: "relative",
            }}
          >
            {devotees.length > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span className="ph-label" style={{ color: "var(--ink-4)" }}>Person {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removePerson(i)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-4)", fontSize: 12, padding: 0 }}
                >
                  Remove
                </button>
              </div>
            )}

            {/* Prayer */}
            <div style={{ marginBottom: 12 }}>
              <label className="ph-label" style={{ display: "block", marginBottom: 5, color: "var(--ink-3)" }}>
                What is your prayer?
              </label>
              <input
                className="ph-input"
                style={{ width: "100%", boxSizing: "border-box" }}
                placeholder="e.g. For my father's full recovery"
                value={d.prayer}
                onChange={(e) => update(i, "prayer", e.target.value)}
              />
            </div>

            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <label className="ph-label" style={{ display: "block", marginBottom: 5, color: "var(--ink-3)" }}>
                Who is it for? (name)
              </label>
              <input
                className="ph-input"
                style={{ width: "100%", boxSizing: "border-box" }}
                placeholder="e.g. Lakshmi Venkat"
                value={d.name}
                onChange={(e) => update(i, "name", e.target.value)}
              />
            </div>

            {/* Star details toggle — per person */}
            <div>
              <button
                type="button"
                onClick={() => update(i, "starOpen", !d.starOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "var(--ink-4)",
                  fontSize: 13,
                }}
              >
                <span style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: "1.5px solid var(--ink-line)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  flexShrink: 0,
                }}>
                  {d.starOpen ? "−" : "+"}
                </span>
                <span className="ph-body-sm">
                  <span style={{ fontWeight: 500, color: "var(--ink-3)" }}>Optional:</span>{" "}
                  Add star details
                </span>
              </button>

              {d.starOpen && (
                <div>
                  <p className="ph-body-sm" style={{ color: "var(--ink-4)", margin: "8px 0 12px", lineHeight: 1.5 }}>
                    Skip if you don&apos;t know — the pooja is fully valid with name alone.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    <div>
                      <label className="ph-label" style={{ display: "block", marginBottom: 4, color: "var(--ink-4)" }}>Nakshatram</label>
                      <select
                        className="ph-input"
                        style={{ width: "100%", fontSize: 13 }}
                        value={d.nakshatram}
                        onChange={(e) => update(i, "nakshatram", e.target.value)}
                      >
                        <option value="">Select…</option>
                        {NAKSHATRAMS.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="ph-label" style={{ display: "block", marginBottom: 4, color: "var(--ink-4)" }}>Rasi</label>
                      <select
                        className="ph-input"
                        style={{ width: "100%", fontSize: 13 }}
                        value={d.rasi}
                        onChange={(e) => update(i, "rasi", e.target.value)}
                      >
                        <option value="">Select…</option>
                        {RASIS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="ph-label" style={{ display: "block", marginBottom: 4, color: "var(--ink-4)" }}>Gothram</label>
                      <input
                        className="ph-input"
                        style={{ width: "100%", fontSize: 13 }}
                        placeholder="e.g. Bharadvaja"
                        value={d.gothram}
                        onChange={(e) => update(i, "gothram", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {devotees.length < 4 && (
        <button
          type="button"
          onClick={addPerson}
          className="ph-btn ph-btn-ghost"
          style={{ fontSize: 13, padding: "6px 14px", marginBottom: 20 }}
        >
          + Add another person
        </button>
      )}

      {/* Mobile-only total + button */}
      <div className="cart-mobile-checkout">
        <div style={{ borderTop: "1px solid var(--ink-line)", paddingTop: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="ph-body" style={{ color: "var(--ink-4)" }}>Total</span>
            <span className="ph-body ph-num" style={{ fontWeight: 700, fontSize: 20 }}>
              {formatPrice(subtotal, currency)}
            </span>
          </div>
        </div>
        <ProceedButton isPending={isPending} error={error} onClick={handleProceed} />
      </div>

      {/* Desktop button */}
      <div className="cart-desktop-checkout">
        <ProceedButton isPending={isPending} error={error} onClick={handleProceed} />
      </div>

      <style>{`
        .cart-mobile-checkout { display: block; }
        .cart-desktop-checkout { display: none; }
        @media (min-width: 1024px) {
          .cart-mobile-checkout { display: none; }
          .cart-desktop-checkout { display: block; }
        }
      `}</style>
    </div>
  )
}

function ProceedButton({ isPending, error, onClick }: { isPending: boolean; error: string | null; onClick: () => void }) {
  return (
    <>
      {error && (
        <p className="ph-body-sm" style={{ color: "var(--sindoor)", marginBottom: 10 }}>
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="ph-btn ph-btn-primary"
        style={{
          width: "100%",
          padding: "15px 24px",
          fontSize: 16,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? "Saving…" : <>Proceed to Checkout <span>→</span></>}
      </button>
      <p className="ph-body-sm" style={{ color: "var(--ink-4)", textAlign: "center", marginTop: 10 }}>
        ← Continue browsing
      </p>
    </>
  )
}
