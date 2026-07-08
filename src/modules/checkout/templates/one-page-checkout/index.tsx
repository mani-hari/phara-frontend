"use client"

import { useState, useTransition, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import {
  saveAddressesForCheckout,
  setShippingMethod,
  placeOrder,
  updateCart,
  initiatePaymentSession,
} from "@lib/data/cart"
import {
  loadRazorpayScript,
  createRazorpayOrder,
} from "@lib/payments/razorpay"
import { convertToLocale } from "@lib/util/money"
import { logCheckoutError } from "@lib/util/checkout-log"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// ─── types ────────────────────────────────────────────────────────────────────

type AddrForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address1: string
  city: string
  postalCode: string
  province: string
  countryCode: string
  sameAsBilling: boolean
}

// Billing address (no email — that's the account/contact field on shipping).
type BillingAddr = {
  firstName: string
  lastName: string
  phone: string
  address1: string
  city: string
  postalCode: string
  province: string
  countryCode: string
}

type Props = {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
  availableShippingMethods: HttpTypes.StoreCartShippingOption[]
  countryCode: string
  isIndia: boolean
  ipCountry?: string | null
  // Every country the store serves, each tagged with its region (India→INR,
  // rest→USD). Powers the country autosuggest + region auto-switch.
  allCountries?: { iso_2: string; name: string; region_id: string }[]
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(amount: number | null | undefined, currency: string) {
  if (typeof amount !== "number" || amount === 0) return "FREE"
  return convertToLocale({ amount, currency_code: currency })
}

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
}

// ─── mobile order summary (top accordion) ────────────────────────────────────

function MobileOrderSummary({
  cart,
  currency,
  subtotal,
  shipping,
  hasShipping,
  total,
}: {
  cart: HttpTypes.StoreCart
  currency: string
  subtotal: number
  shipping: number
  hasShipping: boolean
  total: number
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="co-mobile-summary">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="co-mobile-summary-toggle"
      >
        <span className="ph-body-sm" style={{ color: "var(--sindoor)", fontWeight: 600 }}>
          {expanded ? "Hide" : "Show"} order summary
          <span style={{ marginLeft: 5, fontSize: 10 }}>{expanded ? "▲" : "▼"}</span>
        </span>
        <span className="ph-body ph-num" style={{ fontWeight: 700 }}>
          {convertToLocale({ amount: total, currency_code: currency })}
        </span>
      </button>

      {expanded && (
        <div style={{ padding: "12px 16px 14px", borderTop: "1px solid var(--ink-line)" }}>
          {(cart.items || []).map((item: any) => {
            const title = item.product_title || item.product?.title || item.title || "Service"
            const lineTotal = (item.unit_price || 0) * (item.quantity || 1)
            return (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                <span className="ph-body-sm" style={{ color: "var(--ink-3)", flex: 1, lineHeight: 1.4 }}>
                  {item.quantity > 1 && <span className="ph-num" style={{ color: "var(--ink-4)" }}>{item.quantity}× </span>}
                  {title}
                </span>
                <span className="ph-body-sm ph-num" style={{ fontWeight: 600, flexShrink: 0 }}>
                  {convertToLocale({ amount: lineTotal, currency_code: currency })}
                </span>
              </div>
            )
          })}
          <div style={{ borderTop: "1px solid var(--ink-line)", paddingTop: 8, marginTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span className="ph-body-sm" style={{ color: "var(--ink-4)" }}>Subtotal</span>
              <span className="ph-body-sm ph-num" style={{ color: "var(--ink-3)" }}>{convertToLocale({ amount: subtotal, currency_code: currency })}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span className="ph-body-sm" style={{ color: "var(--ink-4)" }}>Shipping</span>
              <span className="ph-body-sm ph-num" style={{ color: shipping === 0 ? "#2d6a4f" : "var(--ink-3)" }}>
                {!hasShipping ? "—" : shipping === 0 ? "Free" : convertToLocale({ amount: shipping, currency_code: currency })}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="ph-body-sm" style={{ fontWeight: 700 }}>Total</span>
              <span className="ph-body-sm ph-num" style={{ fontWeight: 700 }}>
                {convertToLocale({ amount: total, currency_code: currency })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── country autosuggest (typeahead) ───────────────────────────────────────────
// Replaces the dropdown: users type any country name and pick a match. Works
// across all served countries so no valid country is ever unreachable.

function CountryAutosuggest({
  countries,
  value,
  onChange,
  testId,
}: {
  countries: { iso_2: string; name: string }[]
  value: string
  onChange: (v: string) => void
  testId?: string
}) {
  const find = (v: string) =>
    countries.find((c) => c.iso_2.toLowerCase() === (v || "").toLowerCase())
  const [query, setQuery] = useState(find(value)?.name || "")
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)

  // Keep the visible text in sync when the value changes externally
  // (e.g. region auto-switch resets the country).
  useEffect(() => {
    setQuery(find(value)?.name || "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const ql = query.trim().toLowerCase()
  const sorted = [...countries].sort((a, b) => a.name.localeCompare(b.name))
  const matches = (
    ql
      ? sorted.filter(
          (c) => c.name.toLowerCase().includes(ql) || c.iso_2.toLowerCase() === ql
        )
      : sorted
  ).slice(0, 8)

  const pick = (c: { iso_2: string; name: string }) => {
    onChange(c.iso_2)
    setQuery(c.name)
    setOpen(false)
  }

  return (
    <div style={{ position: "relative" }}>
      <input
        className="ph-input co-input"
        style={{ width: "100%" }}
        value={query}
        placeholder="Start typing your country…"
        autoComplete="off"
        data-testid={testId}
        onFocus={() => { setOpen(true); setHi(0) }}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setHi(0) }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (!open) return
          if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, matches.length - 1)) }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)) }
          else if (e.key === "Enter" && matches[hi]) { e.preventDefault(); pick(matches[hi]) }
          else if (e.key === "Escape") setOpen(false)
        }}
      />
      {open && matches.length > 0 && (
        <ul
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 30,
            background: "var(--paper)", border: "1px solid var(--ink-line-2)", borderRadius: 8,
            maxHeight: 240, overflowY: "auto", margin: 0, padding: 4, listStyle: "none",
            boxShadow: "0 8px 24px rgba(26,20,16,0.12)",
          }}
        >
          {matches.map((c, i) => (
            <li
              key={c.iso_2}
              onMouseDown={() => pick(c)}
              onMouseEnter={() => setHi(i)}
              style={{
                padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 14,
                background: i === hi ? "rgba(139,90,43,0.10)" : "transparent",
              }}
            >
              {c.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── address form ─────────────────────────────────────────────────────────────

function AddressForm({
  form,
  onChange,
  countries,
  fieldErrors,
  onCountryChange,
}: {
  form: AddrForm
  onChange: (patch: Partial<AddrForm>) => void
  countries: { iso_2: string; name: string }[]
  fieldErrors: Record<string, string>
  onCountryChange?: (v: string) => void
}) {
  const f = (field: keyof AddrForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => onChange({ [field]: e.target.value })

  return (
    <div>
      {/* Name row — 2-col desktop, 1-col mobile */}
      <div className="co-2col" style={{ marginBottom: 10 }}>
        <FieldWrap label="First name" required error={fieldErrors.firstName}>
          <input className="ph-input co-input" style={{ width: "100%" }} autoComplete="given-name" value={form.firstName} onChange={f("firstName")} required />
        </FieldWrap>
        <FieldWrap label="Last name" required error={fieldErrors.lastName}>
          <input className="ph-input co-input" style={{ width: "100%" }} autoComplete="family-name" value={form.lastName} onChange={f("lastName")} required />
        </FieldWrap>
      </div>

      {/* Contact row — 2-col desktop, 1-col mobile */}
      <div className="co-2col" style={{ marginBottom: 10 }}>
        <FieldWrap label="Email" required error={fieldErrors.email}>
          <input className="ph-input co-input" style={{ width: "100%" }} type="email" inputMode="email" autoComplete="email" value={form.email} onChange={f("email")} required />
        </FieldWrap>
        <FieldWrap label="Phone">
          <input className="ph-input co-input" style={{ width: "100%" }} type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={f("phone")} />
        </FieldWrap>
      </div>

      {/* Address */}
      <FieldWrap label="Address" required error={fieldErrors.address1} style={{ marginBottom: 10 }}>
        <input className="ph-input co-input" style={{ width: "100%" }} autoComplete="address-line1" value={form.address1} onChange={f("address1")} required />
      </FieldWrap>

      {/* City + Postcode — keep 2-col even on mobile (both short) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <FieldWrap label="City" required error={fieldErrors.city}>
          <input className="ph-input co-input" style={{ width: "100%" }} autoComplete="address-level2" value={form.city} onChange={f("city")} required />
        </FieldWrap>
        <FieldWrap label="Postcode">
          <input className="ph-input co-input" style={{ width: "100%" }} autoComplete="postal-code" inputMode="numeric" value={form.postalCode} onChange={f("postalCode")} />
        </FieldWrap>
      </div>

      {/* Country */}
      <FieldWrap label="Country" required style={{ marginBottom: 0 }}>
        <CountryAutosuggest
          countries={countries}
          value={form.countryCode}
          onChange={onCountryChange || ((v) => onChange({ countryCode: v }))}
          testId="country-select"
        />
      </FieldWrap>
    </div>
  )
}

function FieldWrap({
  label,
  required,
  error,
  children,
  style,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div style={style}>
      <label className="ph-label" style={{ display: "block", marginBottom: 5, color: "var(--ink-3)" }}>
        {label}{required && <span style={{ color: "var(--sindoor)", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && <p style={{ fontSize: 11, color: "var(--sindoor)", marginTop: 3, marginBottom: 0 }}>{error}</p>}
    </div>
  )
}

// ─── billing address form (shown when billing ≠ delivery) ─────────────────────

function BillingForm({
  form,
  onChange,
  countries,
  fieldErrors,
}: {
  form: BillingAddr
  onChange: (patch: Partial<BillingAddr>) => void
  countries: { iso_2: string; name: string }[]
  fieldErrors: Record<string, string>
}) {
  const f = (field: keyof BillingAddr) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => onChange({ [field]: e.target.value })

  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--ink-line)" }}>
      <div className="co-2col" style={{ marginBottom: 10 }}>
        <FieldWrap label="First name" required error={fieldErrors.b_firstName}>
          <input className="ph-input co-input" style={{ width: "100%" }} autoComplete="billing given-name" value={form.firstName} onChange={f("firstName")} required />
        </FieldWrap>
        <FieldWrap label="Last name" required error={fieldErrors.b_lastName}>
          <input className="ph-input co-input" style={{ width: "100%" }} autoComplete="billing family-name" value={form.lastName} onChange={f("lastName")} required />
        </FieldWrap>
      </div>
      <FieldWrap label="Address" required error={fieldErrors.b_address1} style={{ marginBottom: 10 }}>
        <input className="ph-input co-input" style={{ width: "100%" }} autoComplete="billing address-line1" value={form.address1} onChange={f("address1")} required />
      </FieldWrap>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <FieldWrap label="City" required error={fieldErrors.b_city}>
          <input className="ph-input co-input" style={{ width: "100%" }} autoComplete="billing address-level2" value={form.city} onChange={f("city")} required />
        </FieldWrap>
        <FieldWrap label="Postcode">
          <input className="ph-input co-input" style={{ width: "100%" }} autoComplete="billing postal-code" inputMode="numeric" value={form.postalCode} onChange={f("postalCode")} />
        </FieldWrap>
      </div>
      <FieldWrap label="Country" required style={{ marginBottom: 0 }}>
        <CountryAutosuggest countries={countries} value={form.countryCode} onChange={(v) => onChange({ countryCode: v })} />
      </FieldWrap>
    </div>
  )
}

// ─── shipping option cards ────────────────────────────────────────────────────

function ShippingCards({
  methods,
  selected,
  onSelect,
  currency,
  isIndia,
}: {
  methods: HttpTypes.StoreCartShippingOption[]
  selected: string
  onSelect: (id: string) => void
  currency: string
  isIndia: boolean
}) {
  if (!methods.length) {
    return (
      <p className="ph-body-sm" style={{ color: "var(--ink-4)" }}>
        No shipping required — digital delivery only.
      </p>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {methods.map((m) => {
        const isSelected = selected === m.id
        const price = fmtPrice(m.amount ?? null, currency)
        const isFree = price === "FREE" || m.amount === 0

        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelect(m.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 18px",
              border: `1.5px solid ${isSelected ? "var(--sindoor)" : "var(--ink-line)"}`,
              borderRadius: 10,
              background: isSelected ? "#f7f4f1" : "var(--paper)",
              cursor: "pointer",
              textAlign: "left",
              transition: "border-color 0.15s",
            }}
          >
            <span style={{
              width: 18, height: 18, borderRadius: "50%",
              border: `2px solid ${isSelected ? "var(--sindoor)" : "var(--ink-line)"}`,
              background: isSelected ? "var(--sindoor)" : "transparent",
              flexShrink: 0,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              {isSelected && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
            </span>
            {/* Use spans (not divs) — buttons can only contain phrasing content */}
            <span style={{ flex: 1, display: "inline-flex", flexDirection: "column", gap: 2 }}>
              <span style={{ display: "inline-flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <span className="ph-body" style={{ fontWeight: 600 }}>
                  {m.name}
                </span>
                <span className="ph-label ph-num" style={{
                  color: isFree ? "#2d6a4f" : "var(--ink)",
                  fontWeight: 700,
                  background: isFree ? "#e8f5ee" : "transparent",
                  padding: isFree ? "2px 8px" : "0",
                  borderRadius: isFree ? 20 : 0,
                }}>
                  {isFree ? "Free" : price}
                </span>
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── desktop order summary sidebar ───────────────────────────────────────────

function OrderSummary({
  cart,
  currency,
  subtotal,
  shipping,
  hasShipping,
  total,
}: {
  cart: HttpTypes.StoreCart
  currency: string
  subtotal: number
  shipping: number
  hasShipping: boolean
  total: number
}) {
  const hasShippingMethod = hasShipping

  return (
    <div style={{ border: "1px solid var(--ink-line)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--ink-line)" }}>
        <h3 className="ph-h4" style={{ margin: 0 }}>Your order</h3>
      </div>
      <div style={{ padding: "14px 20px" }}>
        {(cart.items || []).map((item: any) => {
          const title = item.product_title || item.product?.title || item.title || "Service"
          const lineTotal = (item.unit_price || 0) * (item.quantity || 1)
          return (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
              <span className="ph-body-sm" style={{ color: "var(--ink-3)", flex: 1, lineHeight: 1.4 }}>
                {item.quantity > 1 && <span className="ph-num" style={{ color: "var(--ink-4)" }}>{item.quantity}× </span>}
                {title}
              </span>
              <span className="ph-body-sm ph-num" style={{ fontWeight: 600, flexShrink: 0 }}>
                {convertToLocale({ amount: lineTotal, currency_code: currency })}
              </span>
            </div>
          )
        })}
      </div>
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--ink-line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span className="ph-body-sm" style={{ color: "var(--ink-4)" }}>Subtotal</span>
          <span className="ph-body-sm ph-num" style={{ color: "var(--ink-3)" }}>
            {convertToLocale({ amount: subtotal, currency_code: currency })}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span className="ph-body-sm" style={{ color: "var(--ink-4)" }}>Shipping</span>
          <span className="ph-body-sm ph-num" style={{ color: shipping === 0 ? "#2d6a4f" : "var(--ink-3)" }}>
            {!hasShippingMethod ? "—" : shipping === 0 ? "Free" : convertToLocale({ amount: shipping, currency_code: currency })}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid var(--ink-line)", paddingTop: 10 }}>
          <span className="ph-body" style={{ fontWeight: 700 }}>Total</span>
          <span className="ph-body ph-num" style={{ fontWeight: 700, fontSize: 18 }} data-testid="summary-total">
            {convertToLocale({ amount: total, currency_code: currency })}
          </span>
        </div>
      </div>
      <div style={{ padding: "10px 20px", borderTop: "1px solid var(--ink-line)", background: "#fafaf8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12 }}>🔒</span>
          <span className="ph-label" style={{ color: "var(--ink-4)", fontSize: 10 }}>
            Secure checkout — your details are encrypted
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function OnePageCheckout({
  cart,
  customer,
  availableShippingMethods,
  countryCode,
  isIndia,
  ipCountry,
  allCountries = [],
}: Props) {
  const currency = cart.currency_code || "inr"

  const regionCountries = (cart.region?.countries || []).map((c: any) => ({
    iso_2: c.iso_2 || "",
    name: c.name || c.iso_2 || "",
  }))
  const countries = regionCountries.length > 0
    ? regionCountries
    : [{ iso_2: countryCode, name: countryCode.toUpperCase() }]

  // The autosuggest offers EVERY served country (India + international) so no
  // valid country is ever unreachable regardless of which region the cart is in.
  const selectableCountries = allCountries.length ? allCountries : countries

  const inRegion = (cc?: string | null) =>
    !!cc && countries.some((c: { iso_2: string }) => c.iso_2.toLowerCase() === cc.toLowerCase())

  // Pre-select the visitor's actual country: saved cart address → IP country →
  // URL country → region's first country (last resort). Avoids defaulting to
  // an arbitrary alphabetical first entry (e.g. Afghanistan).
  const defaultCountry =
    cart.shipping_address?.country_code ||
    (inRegion(ipCountry) ? (ipCountry as string) : undefined) ||
    (inRegion(countryCode) ? countryCode : undefined) ||
    (countries[0]?.iso_2 ?? countryCode)

  const [form, setForm] = useState<AddrForm>({
    firstName: cart.shipping_address?.first_name || customer?.first_name || "",
    lastName: cart.shipping_address?.last_name || customer?.last_name || "",
    email: cart.email || customer?.email || "",
    phone: cart.shipping_address?.phone || "",
    address1: cart.shipping_address?.address_1 || "",
    city: cart.shipping_address?.city || "",
    postalCode: cart.shipping_address?.postal_code || "",
    province: cart.shipping_address?.province || "",
    countryCode: defaultCountry,
    sameAsBilling: true,
  })

  // Default to the actual delivery option (Free shipping / International Speed
  // Post), not the "donate / do not send" option.
  const defaultShippingId =
    (availableShippingMethods.find((m) => !/donate|do not send/i.test(m.name || "")) ||
      availableShippingMethods[0])?.id || ""
  const [selectedShipping, setSelectedShipping] = useState<string>(defaultShippingId)

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const patch = useCallback((p: Partial<AddrForm>) => {
    setForm((prev) => ({ ...prev, ...p }))
    setFieldErrors({})
  }, [])

  const [billing, setBilling] = useState<BillingAddr>({
    firstName: cart.billing_address?.first_name || "",
    lastName: cart.billing_address?.last_name || "",
    phone: cart.billing_address?.phone || "",
    address1: cart.billing_address?.address_1 || "",
    city: cart.billing_address?.city || "",
    postalCode: cart.billing_address?.postal_code || "",
    province: cart.billing_address?.province || "",
    countryCode: cart.billing_address?.country_code || defaultCountry,
  })
  const patchBilling = useCallback((p: Partial<BillingAddr>) => {
    setBilling((prev) => ({ ...prev, ...p }))
    setFieldErrors({})
  }, [])

  const router = useRouter()

  // Delivery country change: set it, and if the picked country belongs to a
  // different region (India→INR vs rest→USD), switch the cart's region so
  // currency + shipping stay correct. Prevents the "India not selectable"
  // block when a visitor landed on the wrong regional storefront.
  const chooseCountry = (iso: string) => {
    patch({ countryCode: iso })
    const target = selectableCountries.find(
      (c: any) => c.iso_2.toLowerCase() === iso.toLowerCase()
    ) as { region_id?: string } | undefined
    if (target?.region_id && target.region_id !== cart.region_id) {
      startTransition(async () => {
        try {
          await updateCart({ region_id: target.region_id! })
          router.refresh()
        } catch (err) {
          logCheckoutError("region_switch", err, { cartId: cart.id, to: target.region_id })
        }
      })
    }
  }

  // Apply the chosen shipping method to the cart and refresh, so the order
  // summary total (which includes shipping) updates immediately. This is the
  // standard one-page-checkout behavior — selection must move the total.
  const chooseShipping = useCallback(
    (id: string) => {
      setSelectedShipping(id)
      if (!id) return
      startTransition(async () => {
        try {
          await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
          router.refresh()
        } catch (e) {
          logCheckoutError("set_shipping", e, { cartId: cart.id, shippingMethodId: id })
        }
      })
    },
    [cart.id, router]
  )

  // On load, if no shipping method is set yet, apply the default option so the
  // total reflects shipping from the start (e.g. international $32).
  const didInitShipping = useRef(false)
  useEffect(() => {
    if (didInitShipping.current) return
    const hasMethod = ((cart as any).shipping_methods?.length ?? 0) > 0
    if (!hasMethod && defaultShippingId) {
      didInitShipping.current = true
      chooseShipping(defaultShippingId)
    }
  }, [cart, availableShippingMethods, chooseShipping])

  // Client-optimistic order totals: reflect the selected shipping amount
  // immediately. retrieveCart() is force-cached, so the summary can't wait on a
  // server refresh — and these ALSO drive the charged amount, so what the
  // customer sees is exactly what they pay.
  const itemSubtotal = (cart as any).item_subtotal ?? cart.subtotal ?? 0
  const taxTotal = (cart as any).tax_total ?? 0
  const shippingAmount =
    availableShippingMethods.find((m) => m.id === selectedShipping)?.amount ?? 0
  const hasShippingSelected = !!selectedShipping
  const displayTotal = itemSubtotal + shippingAmount + taxTotal

  // Try to set shipping method — silently skips if the option has no price configured
  const trySetShipping = async () => {
    if (!selectedShipping) return
    const method = availableShippingMethods.find((m) => m.id === selectedShipping)
    if (!method || method.amount == null) return
    try {
      await setShippingMethod({ cartId: cart.id, shippingMethodId: selectedShipping })
    } catch {
      // shipping method has no price in this region — skip
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())
    if (!form.firstName.trim()) errs.firstName = "Required"
    if (!form.lastName.trim()) errs.lastName = "Required"
    if (!form.email.trim()) errs.email = "Required"
    else if (!emailOk) errs.email = "Enter a valid email"
    if (!form.address1.trim()) errs.address1 = "Required"
    if (!form.city.trim()) errs.city = "Required"

    // A shipping method must be chosen when physical delivery applies.
    if (availableShippingMethods.length > 0 && !selectedShipping) {
      errs.shipping = "Please choose a delivery option"
    }

    // Billing address is required when it differs from delivery.
    if (!form.sameAsBilling) {
      if (!billing.firstName.trim()) errs.b_firstName = "Required"
      if (!billing.lastName.trim()) errs.b_lastName = "Required"
      if (!billing.address1.trim()) errs.b_address1 = "Required"
      if (!billing.city.trim()) errs.b_city = "Required"
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Razorpay ────────────────────────────────────────────────────────────────

  const handleRazorpay = () => {
    if (!validate()) return
    setError(null)

    const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ""
    if (!RAZORPAY_KEY_ID) {
      setError("Payment gateway not configured. Please contact support.")
      return
    }

    startTransition(async () => {
      try {
        await saveAddressesForCheckout({
          ...form,
          billing: form.sameAsBilling ? undefined : billing,
        })
        await trySetShipping()

        const loaded = await loadRazorpayScript()
        if (!loaded) throw new Error("Failed to load payment gateway.")

        const order = await createRazorpayOrder({
          id: cart.id,
          total: displayTotal,
          currency_code: currency,
        } as any)
        if (!order) throw new Error("Could not create payment order.")

        const rzp = new window.Razorpay({
          key: RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: "PariharaOnline",
          description: "Temple Services & Prasad",
          order_id: order.id,
          prefill: {
            name: `${form.firstName} ${form.lastName}`,
            email: form.email,
            contact: form.phone,
          },
          theme: { color: "#b6442e" },
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch("/api/payments/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  cart_id: cart.id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              })
              if (!verifyRes.ok) throw new Error("Payment verification failed.")
              // The real charge is Razorpay's (already verified). Give Medusa
              // an authorized payment session via the system provider so
              // cart.complete() can turn the cart into an order.
              await initiatePaymentSession(cart, { provider_id: "pp_system_default" })
              await placeOrder()
            } catch (err: any) {
              logCheckoutError("razorpay_verify", err, { cartId: cart.id, currency, total: displayTotal })
              window.location.href = `/checkout/payment-error?reason=${encodeURIComponent(err.message || "verification_failed")}`
            }
          },
          modal: { ondismiss: () => {} },
        })
        rzp.open()
      } catch (err: any) {
        logCheckoutError("razorpay_init", err, { cartId: cart.id, currency, total: displayTotal })
        setError(err.message || "Payment failed. Please try again.")
      }
    })
  }

  // ── PayPal ──────────────────────────────────────────────────────────────────

  const handlePaypal = () => {
    if (!validate()) return
    setError(null)

    startTransition(async () => {
      try {
        await saveAddressesForCheckout({
          ...form,
          billing: form.sameAsBilling ? undefined : billing,
        })
        await trySetShipping()

        const base = getBaseUrl()
        const returnUrl = `${base}/checkout/paypal-return?cartId=${cart.id}`
        const cancelUrl = `${base}/checkout/payment-error?reason=cancelled`

        const res = await fetch("/api/payments/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: displayTotal,
            currency: "USD",
            description: "PariharaOnline - Temple Services",
            return_url: returnUrl,
            cancel_url: cancelUrl,
          }),
        })
        if (!res.ok) throw new Error("Could not create PayPal order.")
        const data = await res.json()

        const approveLink = data.links?.find((l: any) => l.rel === "approve")
        if (approveLink) {
          window.location.href = approveLink.href
        } else if (data.id) {
          window.location.href = `https://www.paypal.com/checkoutnow?token=${data.id}`
        } else {
          throw new Error("No PayPal approval URL returned.")
        }
      } catch (err: any) {
        logCheckoutError("paypal_init", err, { cartId: cart.id, currency, total: displayTotal })
        setError(err.message || "PayPal setup failed. Please try again.")
      }
    })
  }

  const isDigitalOnly = availableShippingMethods.length === 0

  return (
    <div className="checkout-layout">
      {/* Mobile order summary accordion — hidden on desktop */}
      <div className="co-mobile-only">
        <MobileOrderSummary
          cart={cart}
          currency={currency}
          subtotal={itemSubtotal}
          shipping={shippingAmount}
          hasShipping={hasShippingSelected}
          total={displayTotal}
        />
      </div>

      {/* ── Left — form ──────────────────────────────────────────── */}
      <div>
        {/* Address */}
        <section className="co-section">
          <SectionLabel>Delivery address</SectionLabel>
          {isDigitalOnly ? (
            <div style={{ padding: "10px 14px", background: "#e8f5ee", borderRadius: 8 }}>
              <p className="ph-body-sm" style={{ color: "#2d6a4f", margin: 0 }}>
                Only digital products in cart — no physical address needed.
              </p>
            </div>
          ) : (
            <AddressForm form={form} onChange={patch} countries={selectableCountries} fieldErrors={fieldErrors} onCountryChange={chooseCountry} />
          )}
        </section>

        {/* Shipping */}
        {!isDigitalOnly && (
          <section className="co-section">
            <SectionLabel>Prasad delivery</SectionLabel>
            <ShippingCards
              methods={availableShippingMethods}
              selected={selectedShipping}
              onSelect={chooseShipping}
              currency={currency}
              isIndia={isIndia}
            />
            {fieldErrors.shipping && (
              <p style={{ fontSize: 12, color: "var(--sindoor)", marginTop: 8, marginBottom: 0 }}>
                {fieldErrors.shipping}
              </p>
            )}
          </section>
        )}

        {/* Billing address */}
        <section className="co-section">
          <SectionLabel>Billing address</SectionLabel>
          <BillingCheckbox
            checked={form.sameAsBilling}
            onChange={(v) => patch({ sameAsBilling: v })}
          />
          {!form.sameAsBilling && (
            <BillingForm
              form={billing}
              onChange={patchBilling}
              countries={selectableCountries}
              fieldErrors={fieldErrors}
            />
          )}
        </section>

        {/* Payment */}
        <section className="co-section co-section-last">
          <SectionLabel>Payment</SectionLabel>

          {/* Payment method logos + button */}
          <PaymentSection
            isIndia={isIndia}
            isPending={isPending}
            error={error}
            onPay={(provider) => (provider === "paypal" ? handlePaypal() : handleRazorpay())}
          />
        </section>
      </div>

      {/* ── Right — desktop summary ───────────────────────────────── */}
      <div className="checkout-summary-col">
        <div style={{ position: "sticky", top: 80 }}>
          <OrderSummary
            cart={cart}
            currency={currency}
            subtotal={itemSubtotal}
            shipping={shippingAmount}
            hasShipping={hasShippingSelected}
            total={displayTotal}
          />
        </div>
      </div>

      <style>{`
        /* ── Layout ──────────────────────────────────────────────── */
        .checkout-layout {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .checkout-summary-col { display: none; }
        /* Base (mobile) — declared BEFORE the media query so the desktop
           overrides below win on ≥1024px. (Previously this was after the
           media query and leaked into desktop, keeping the mobile summary in
           the grid and pushing the form into the 320px column.) */
        .co-mobile-only { display: block; }
        @media (min-width: 1024px) {
          .checkout-layout {
            display: grid;
            grid-template-columns: 1fr 320px;
            gap: 48px;
            align-items: start;
          }
          .co-mobile-only { display: none; }
          .checkout-summary-col { display: block; }
        }

        /* Mobile order summary */
        .co-mobile-summary {
          border: 1px solid var(--ink-line);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 20px;
          background: var(--paper);
        }
        .co-mobile-summary-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: none;
          border: none;
          cursor: pointer;
          gap: 10;
        }

        /* Section spacing */
        .co-section { margin-bottom: 24px; }
        .co-section-last { margin-bottom: 0; }
        @media (max-width: 767px) {
          .co-section { margin-bottom: 20px; }
        }

        /* 2-col on desktop, 1-col on mobile */
        .co-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 767px) {
          .co-2col {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }

        /* Inputs: prevent iOS zoom (must be ≥16px) */
        .co-input,
        .co-input::placeholder {
          font-size: 16px !important;
        }

        /* Sticky pay bar on mobile */
        .co-pay-bar {
          position: sticky;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--paper);
          border-top: 1px solid var(--ink-line);
          padding: 14px 0 calc(14px + env(safe-area-inset-bottom, 0px));
          margin-top: 8px;
          z-index: 30;
        }
        @media (min-width: 1024px) {
          .co-pay-bar {
            position: static;
            border-top: 1px solid var(--ink-line);
            padding: 24px 0 0;
            margin-top: 28px;
            background: transparent;
          }
        }
      `}</style>
    </div>
  )
}

// ─── section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <span className="ph-label" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink-4)", textTransform: "uppercase" }}>
        {children}
      </span>
      <div style={{ height: 1, background: "var(--ink-line)", marginTop: 6 }} />
    </div>
  )
}

// ─── billing checkbox (shared between India and Intl) ─────────────────────────

function BillingCheckbox({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 16 }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 18, height: 18, accentColor: "var(--sindoor)", flexShrink: 0 }}
      />
      <span className="ph-body-sm" style={{ color: "var(--ink-3)" }}>
        Billing address same as delivery address
      </span>
    </label>
  )
}

// ─── India payment section ────────────────────────────────────────────────────

function PaymentRadio({
  selected,
  onSelect,
  title,
  subtitle,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  subtitle: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      style={{
        display: "flex", alignItems: "flex-start", gap: 12, width: "100%",
        padding: "16px 18px", textAlign: "left",
        border: `1.5px solid ${selected ? "var(--sindoor)" : "var(--ink-line)"}`,
        borderRadius: 10, background: selected ? "#f7f4f1" : "var(--paper)",
        cursor: "pointer", marginBottom: 12, transition: "border-color 0.15s",
      }}
    >
      <span style={{
        width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 2,
        border: `2px solid ${selected ? "var(--sindoor)" : "var(--ink-line)"}`,
        background: selected ? "var(--sindoor)" : "transparent",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>
        {selected && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
      </span>
      <span style={{ display: "inline-flex", flexDirection: "column", gap: 3 }}>
        <span className="ph-body" style={{ fontWeight: 600 }}>{title}</span>
        <span className="ph-body-sm" style={{ color: "var(--ink-4)", lineHeight: 1.5 }}>{subtitle}</span>
      </span>
    </button>
  )
}

// ─── payment section: radio choice + compact "Pay online" button ──────────────

function PaymentSection({
  isIndia,
  isPending,
  error,
  onPay,
}: {
  isIndia: boolean
  isPending: boolean
  error: string | null
  onPay: (provider: "razorpay" | "paypal") => void
}) {
  const [provider, setProvider] = useState<"razorpay" | "paypal">("razorpay")
  // India: Razorpay only — PayPal is not offered, keep the selection on Razorpay.
  useEffect(() => {
    if (isIndia && provider !== "razorpay") setProvider("razorpay")
  }, [isIndia, provider])

  return (
    <div>
      <div role="radiogroup" aria-label="Payment method">
        <PaymentRadio
          selected={provider === "razorpay"}
          onSelect={() => setProvider("razorpay")}
          title="Pay by Credit / Debit / UPI (powered by Razorpay)"
          subtitle="UPI payments, Wallets, VISA and Mastercard (International cards accepted except AMEX)"
        />
        {!isIndia && (
          <PaymentRadio
            selected={provider === "paypal"}
            onSelect={() => setProvider("paypal")}
            title="PayPal"
            subtitle="All international cards, including AMEX"
          />
        )}
      </div>

      <div className="co-pay-bar">
        {error && (
          <div style={{ padding: "10px 14px", background: "#fef2f0", border: "1px solid #fbc6be", borderRadius: 8, marginBottom: 12 }}>
            <p className="ph-body-sm" style={{ color: "var(--sindoor)", margin: 0 }}>{error}</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => onPay(provider)}
          disabled={isPending}
          className="ph-btn ph-btn-sindoor"
          data-testid="pay-online"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            width: "auto", padding: "13px 30px", fontSize: 16, fontWeight: 700,
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? "Processing…" : "Proceed to Payment →"}
        </button>
        <p className="ph-body-sm" style={{ color: "var(--ink-4)", marginTop: 10, display: "flex", alignItems: "center", gap: 5 }}>
          <span>🔒</span> Encrypted and secure
        </p>
      </div>
    </div>
  )
}
