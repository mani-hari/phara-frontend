"use client"

import { useState } from "react"

export type Address = {
  id?: string
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  province?: string
  countryCode: string
  postalCode?: string
  phone?: string
}

export type BookingFormData = {
  poojaPersonName: string
  nakshatra?: string
  gothram?: string
  address: Address
  useExistingAddressId?: string
}

type BookingFormCardProps = {
  cartItems: { title: string; priceInr: number | null; quantity: number }[]
  savedAddresses?: Address[]
  familyMembers?: string[]
  isLoggedIn?: boolean
  onSubmit: (data: BookingFormData) => void
  onSignInRequest?: () => void
}

const COUNTRY_OPTIONS = [
  { code: "in", label: "India" },
  { code: "us", label: "United States" },
  { code: "gb", label: "United Kingdom" },
  { code: "ca", label: "Canada" },
  { code: "au", label: "Australia" },
  { code: "sg", label: "Singapore" },
  { code: "ae", label: "United Arab Emirates" },
  { code: "de", label: "Germany" },
  { code: "fr", label: "France" },
  { code: "nl", label: "Netherlands" },
  { code: "nz", label: "New Zealand" },
  { code: "my", label: "Malaysia" },
]

export default function BookingFormCard({
  savedAddresses = [],
  familyMembers = [],
  isLoggedIn = false,
  onSubmit,
  onSignInRequest,
}: BookingFormCardProps) {
  const [poojaPersonName, setPoojaPersonName] = useState("")
  const [nakshatra, setNakshatra] = useState("")
  const [gothram, setGothram] = useState("")
  const [starDetailsOpen, setStarDetailsOpen] = useState(false)

  // Address section
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    savedAddresses.length > 0 ? (savedAddresses[0].id ?? "__new__") : "__new__"
  )
  const [newAddress, setNewAddress] = useState<Omit<Address, "id">>({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    countryCode: "in",
    postalCode: "",
    phone: "",
  })

  const showNewAddressForm =
    savedAddresses.length === 0 || selectedAddressId === "__new__"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!poojaPersonName.trim()) return

    let address: Address
    let useExistingAddressId: string | undefined

    if (!showNewAddressForm) {
      const saved = savedAddresses.find((a) => a.id === selectedAddressId)
      if (!saved) return
      address = saved
      useExistingAddressId = selectedAddressId
    } else {
      address = newAddress
    }

    onSubmit({
      poojaPersonName: poojaPersonName.trim(),
      nakshatra: nakshatra.trim() || undefined,
      gothram: gothram.trim() || undefined,
      address,
      useExistingAddressId,
    })
  }

  return (
    <div
      style={{
        background: "var(--cream)",
        border: "1px solid var(--ink-line)",
        borderRadius: 12,
        padding: "20px",
        boxShadow: "var(--shadow-sm)",
        maxWidth: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: "1px solid var(--ink-line)",
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--sindoor)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            color: "#fff",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          ✦
        </span>
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            fontFamily: "var(--serif)",
            color: "var(--ink)",
          }}
        >
          Booking Details
        </h3>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Who is this pooja for? */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--ink-3)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Who is this pooja for?
          </label>
          <input
            type="text"
            className="ph-input"
            placeholder="Full name"
            value={poojaPersonName}
            onChange={(e) => setPoojaPersonName(e.target.value)}
            required
            style={{ fontSize: 14 }}
          />

          {/* Quick-select family members */}
          {familyMembers.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginTop: 8,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "var(--ink-4)",
                  alignSelf: "center",
                  marginRight: 2,
                }}
              >
                Quick select:
              </span>
              {familyMembers.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setPoojaPersonName(name)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: `1px solid ${poojaPersonName === name ? "var(--sindoor)" : "var(--ink-line-2)"}`,
                    background:
                      poojaPersonName === name
                        ? "var(--sindoor-soft)"
                        : "transparent",
                    color:
                      poojaPersonName === name
                        ? "var(--sindoor)"
                        : "var(--ink-3)",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Optional star details (accordion) */}
        <div style={{ marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setStarDetailsOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontSize: 13,
              fontWeight: 500,
              color: "var(--ink-3)",
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>
              {starDetailsOpen ? "⊖" : "⊕"}
            </span>
            Optional: Add star details
          </button>

          {starDetailsOpen && (
            <div
              style={{
                marginTop: 12,
                padding: "14px",
                background: "var(--paper)",
                border: "1px solid var(--ink-line)",
                borderRadius: 8,
              }}
            >
              <div style={{ marginBottom: 10 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--ink-4)",
                    marginBottom: 5,
                  }}
                >
                  Nakshatra / Rashi
                </label>
                <input
                  type="text"
                  className="ph-input"
                  placeholder="e.g. Rohini, Makara"
                  value={nakshatra}
                  onChange={(e) => setNakshatra(e.target.value)}
                  style={{ fontSize: 13 }}
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--ink-4)",
                    marginBottom: 5,
                  }}
                >
                  Gothram
                </label>
                <input
                  type="text"
                  className="ph-input"
                  placeholder="e.g. Kashyapa"
                  value={gothram}
                  onChange={(e) => setGothram(e.target.value)}
                  style={{ fontSize: 13 }}
                />
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 11.5,
                  color: "var(--ink-4)",
                  fontStyle: "italic",
                  fontFamily: "var(--serif)",
                }}
              >
                If you don&apos;t know, we perform the pooja in God&apos;s name
              </p>
            </div>
          )}
        </div>

        {/* Section 3: Shipping address */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--ink-3)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Delivery address
            </label>

            {!isLoggedIn && onSignInRequest && (
              <button
                type="button"
                onClick={onSignInRequest}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11.5,
                  color: "var(--sindoor)",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Sign in to auto-fill
              </button>
            )}
          </div>

          {savedAddresses.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {savedAddresses.map((addr) => (
                <label
                  key={addr.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    padding: "10px 12px",
                    border: `1px solid ${selectedAddressId === addr.id ? "var(--sindoor)" : "var(--ink-line)"}`,
                    borderRadius: 8,
                    marginBottom: 6,
                    cursor: "pointer",
                    background:
                      selectedAddressId === addr.id
                        ? "rgba(182,68,46,0.04)"
                        : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    name="savedAddress"
                    value={addr.id}
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id ?? "__new__")}
                    style={{ marginTop: 2, accentColor: "var(--sindoor)" }}
                  />
                  <span style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.4 }}>
                    <strong>
                      {addr.firstName} {addr.lastName}
                    </strong>
                    {" · "}
                    {addr.city},{" "}
                    {addr.countryCode.toUpperCase()}
                    {addr.address1 && (
                      <span
                        style={{
                          display: "block",
                          fontSize: 11.5,
                          color: "var(--ink-4)",
                          marginTop: 1,
                        }}
                      >
                        {addr.address1}
                        {addr.address2 ? `, ${addr.address2}` : ""}
                      </span>
                    )}
                  </span>
                </label>
              ))}

              {/* New address option */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 12px",
                  border: `1px solid ${selectedAddressId === "__new__" ? "var(--sindoor)" : "var(--ink-line)"}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  background:
                    selectedAddressId === "__new__"
                      ? "rgba(182,68,46,0.04)"
                      : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <input
                  type="radio"
                  name="savedAddress"
                  value="__new__"
                  checked={selectedAddressId === "__new__"}
                  onChange={() => setSelectedAddressId("__new__")}
                  style={{ accentColor: "var(--sindoor)" }}
                />
                <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
                  Enter a new address
                </span>
              </label>
            </div>
          )}

          {/* New address form */}
          {showNewAddressForm && (
            <AddressForm address={newAddress} onChange={setNewAddress} />
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="ph-btn ph-btn-sindoor ph-btn-block"
          disabled={!poojaPersonName.trim()}
          style={{
            fontSize: 14,
            fontWeight: 600,
            opacity: !poojaPersonName.trim() ? 0.5 : 1,
            cursor: !poojaPersonName.trim() ? "not-allowed" : "pointer",
          }}
        >
          Continue to payment →
        </button>
      </form>
    </div>
  )
}

// ── Address form sub-component ─────────────────────────────────────────────

function AddressForm({
  address,
  onChange,
}: {
  address: Omit<Address, "id">
  onChange: (a: Omit<Address, "id">) => void
}) {
  const set = (field: keyof Omit<Address, "id">) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => onChange({ ...address, [field]: e.target.value })

  const inputStyle: React.CSSProperties = { fontSize: 13, marginTop: 0 }
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11.5,
    fontWeight: 500,
    color: "var(--ink-4)",
    marginBottom: 4,
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <label style={labelStyle}>First name *</label>
          <input
            type="text"
            className="ph-input"
            placeholder="First name"
            value={address.firstName}
            onChange={set("firstName")}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Last name *</label>
          <input
            type="text"
            className="ph-input"
            placeholder="Last name"
            value={address.lastName}
            onChange={set("lastName")}
            required
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Address *</label>
        <input
          type="text"
          className="ph-input"
          placeholder="Street address, flat/house no."
          value={address.address1}
          onChange={set("address1")}
          required
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Address line 2</label>
        <input
          type="text"
          className="ph-input"
          placeholder="Apt, suite, landmark (optional)"
          value={address.address2 ?? ""}
          onChange={set("address2")}
          style={inputStyle}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <label style={labelStyle}>City *</label>
          <input
            type="text"
            className="ph-input"
            placeholder="City"
            value={address.city}
            onChange={set("city")}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>State / Province</label>
          <input
            type="text"
            className="ph-input"
            placeholder="State"
            value={address.province ?? ""}
            onChange={set("province")}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <label style={labelStyle}>Country *</label>
          <select
            className="ph-input"
            value={address.countryCode}
            onChange={set("countryCode")}
            required
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Postal code</label>
          <input
            type="text"
            className="ph-input"
            placeholder="PIN / ZIP"
            value={address.postalCode ?? ""}
            onChange={set("postalCode")}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Phone</label>
        <input
          type="tel"
          className="ph-input"
          placeholder="+91 98765 43210"
          value={address.phone ?? ""}
          onChange={set("phone")}
          style={inputStyle}
        />
      </div>
    </div>
  )
}
