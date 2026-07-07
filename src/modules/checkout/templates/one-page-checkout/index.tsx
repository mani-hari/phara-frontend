"use client"

import { useState, useTransition, useCallback } from "react"
import { HttpTypes } from "@medusajs/types"
import {
  saveAddressesForCheckout,
  setShippingMethod,
  placeOrder,
} from "@lib/data/cart"
import {
  loadRazorpayScript,
  createRazorpayOrder,
} from "@lib/payments/razorpay"
import { convertToLocale } from "@lib/util/money"
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

type Props = {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
  availableShippingMethods: HttpTypes.StoreCartShippingOption[]
  countryCode: string
  isIndia: boolean
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

function MobileOrderSummary({ cart }: { cart: HttpTypes.StoreCart }) {
  const [expanded, setExpanded] = useState(false)
  const currency = cart.currency_code || "inr"
  const total = cart.total || cart.subtotal || 0

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
          <div style={{ borderTop: "1px solid var(--ink-line)", paddingTop: 8, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
            <span className="ph-body-sm" style={{ fontWeight: 700 }}>Total</span>
            <span className="ph-body-sm ph-num" style={{ fontWeight: 700 }}>
              {convertToLocale({ amount: total, currency_code: currency })}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── country select ───────────────────────────────────────────────────────────

function CountrySelect({
  countries,
  value,
  onChange,
}: {
  countries: { iso_2: string; name: string }[]
  value: string
  onChange: (v: string) => void
}) {
  const sorted = [...countries].sort((a, b) => a.name.localeCompare(b.name))
  return (
    <select
      className="ph-input co-input"
      style={{ width: "100%" }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {sorted.map((c) => (
        <option key={c.iso_2} value={c.iso_2}>
          {c.name}
        </option>
      ))}
    </select>
  )
}

// ─── address form ─────────────────────────────────────────────────────────────

function AddressForm({
  form,
  onChange,
  countries,
  fieldErrors,
}: {
  form: AddrForm
  onChange: (patch: Partial<AddrForm>) => void
  countries: { iso_2: string; name: string }[]
  fieldErrors: Record<string, string>
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
        <CountrySelect countries={countries} value={form.countryCode} onChange={(v) => onChange({ countryCode: v })} />
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
              padding: "14px 16px",
              border: `2px solid ${isSelected ? "var(--sindoor)" : "var(--ink-line)"}`,
              borderRadius: 10,
              background: isSelected ? "var(--sindoor-soft)" : "var(--paper)",
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
                  {isIndia && isFree ? "Ship prasad to me" : m.name}
                </span>
                <span className="ph-label ph-num" style={{
                  color: isFree ? "#2d6a4f" : "var(--ink)",
                  fontWeight: 700,
                  background: isFree ? "#e8f5ee" : "transparent",
                  padding: isFree ? "2px 8px" : "0",
                  borderRadius: isFree ? 20 : 0,
                }}>
                  {isIndia && isFree ? "FREE" : price}
                </span>
              </span>
              {isIndia && isFree && (
                <span className="ph-body-sm" style={{ color: "var(--ink-4)", display: "block" }}>
                  Prasad dispatched within 2–3 days of the ceremony
                </span>
              )}
            </span>
          </button>
        )
      })}

      {!isIndia && methods.length === 1 && (
        <button
          type="button"
          onClick={() => onSelect("")}
          style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 16px",
            border: `2px solid ${"" === selected ? "var(--sindoor)" : "var(--ink-line)"}`,
            borderRadius: 10, background: "var(--paper)", cursor: "pointer", textAlign: "left",
          }}
        >
          <span style={{
            width: 18, height: 18, borderRadius: "50%",
            border: `2px solid ${"" === selected ? "var(--sindoor)" : "var(--ink-line)"}`,
            background: "" === selected ? "var(--sindoor)" : "transparent",
            flexShrink: 0,
          }} />
          <span className="ph-body" style={{ fontWeight: 600 }}>Donate prasad at the temple</span>
        </button>
      )}
    </div>
  )
}

// ─── desktop order summary sidebar ───────────────────────────────────────────

function OrderSummary({ cart }: { cart: HttpTypes.StoreCart }) {
  const currency = cart.currency_code || "inr"
  const total = cart.total || cart.subtotal || 0

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span className="ph-body" style={{ fontWeight: 700 }}>Total</span>
          <span className="ph-body ph-num" style={{ fontWeight: 700, fontSize: 18 }}>
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
}: Props) {
  const currency = cart.currency_code || "inr"

  const regionCountries = (cart.region?.countries || []).map((c: any) => ({
    iso_2: c.iso_2 || "",
    name: c.name || c.iso_2 || "",
  }))
  const countries = regionCountries.length > 0
    ? regionCountries
    : [{ iso_2: countryCode, name: countryCode.toUpperCase() }]

  const defaultCountry =
    cart.shipping_address?.country_code ||
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

  const [selectedShipping, setSelectedShipping] = useState<string>(
    availableShippingMethods[0]?.id || ""
  )

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const patch = useCallback((p: Partial<AddrForm>) => {
    setForm((prev) => ({ ...prev, ...p }))
    setFieldErrors({})
  }, [])

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
    if (!form.firstName.trim()) errs.firstName = "Required"
    if (!form.lastName.trim()) errs.lastName = "Required"
    if (!form.email.trim()) errs.email = "Required"
    if (!form.address1.trim()) errs.address1 = "Required"
    if (!form.city.trim()) errs.city = "Required"
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
        await saveAddressesForCheckout({ ...form })
        await trySetShipping()

        const loaded = await loadRazorpayScript()
        if (!loaded) throw new Error("Failed to load payment gateway.")

        const order = await createRazorpayOrder({
          id: cart.id,
          total: cart.total ?? 0,
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
              await placeOrder()
            } catch (err: any) {
              window.location.href = `/checkout/payment-error?reason=${encodeURIComponent(err.message || "verification_failed")}`
            }
          },
          modal: { ondismiss: () => {} },
        })
        rzp.open()
      } catch (err: any) {
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
        await saveAddressesForCheckout({ ...form })
        await trySetShipping()

        const base = getBaseUrl()
        const returnUrl = `${base}/checkout/paypal-return?cartId=${cart.id}`
        const cancelUrl = `${base}/checkout/payment-error?reason=cancelled`

        const res = await fetch("/api/payments/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: cart.total ?? 0,
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
        setError(err.message || "PayPal setup failed. Please try again.")
      }
    })
  }

  const isDigitalOnly = availableShippingMethods.length === 0
  const total = cart.total || cart.subtotal || 0

  return (
    <div className="checkout-layout">
      {/* Mobile order summary accordion — hidden on desktop */}
      <div className="co-mobile-only">
        <MobileOrderSummary cart={cart} />
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
            <AddressForm form={form} onChange={patch} countries={countries} fieldErrors={fieldErrors} />
          )}
        </section>

        {/* Shipping */}
        {!isDigitalOnly && (
          <section className="co-section">
            <SectionLabel>Prasad delivery</SectionLabel>
            <ShippingCards
              methods={availableShippingMethods}
              selected={selectedShipping}
              onSelect={setSelectedShipping}
              currency={currency}
              isIndia={isIndia}
            />
          </section>
        )}

        {/* Payment */}
        <section className="co-section co-section-last">
          <SectionLabel>Payment</SectionLabel>

          {/* Payment method logos + button */}
          {isIndia ? (
            <IndiaPayment
              currency={currency}
              total={total}
              isPending={isPending}
              error={error}
              onPay={handleRazorpay}
              sameAsBilling={form.sameAsBilling}
              onSameAsBillingChange={(v) => patch({ sameAsBilling: v })}
            />
          ) : (
            <IntlPayment
              currency={currency}
              total={total}
              isPending={isPending}
              error={error}
              onPaypal={handlePaypal}
              onRazorpay={handleRazorpay}
              sameAsBilling={form.sameAsBilling}
              onSameAsBillingChange={(v) => patch({ sameAsBilling: v })}
            />
          )}
        </section>
      </div>

      {/* ── Right — desktop summary ───────────────────────────────── */}
      <div className="checkout-summary-col">
        <div style={{ position: "sticky", top: 80 }}>
          <OrderSummary cart={cart} />
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
        .co-mobile-only { display: block; }
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
            border-top: none;
            padding: 0;
            margin-top: 0;
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

function IndiaPayment({
  total,
  isPending,
  error,
  onPay,
  sameAsBilling,
  onSameAsBillingChange,
}: {
  currency: string
  total: number
  isPending: boolean
  error: string | null
  onPay: () => void
  sameAsBilling: boolean
  onSameAsBillingChange: (v: boolean) => void
}) {
  return (
    <div>
      {/* Accepted logos */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        {["UPI", "Visa", "Mastercard"].map((l) => (
          <span key={l} className="ph-label ph-num" style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", border: "1px solid var(--ink-line)", borderRadius: 4, color: "var(--ink-3)", background: "var(--paper)" }}>{l}</span>
        ))}
        <span className="ph-body-sm" style={{ color: "var(--ink-4)", marginLeft: 4 }}>Secured by Razorpay</span>
      </div>

      {/* Billing checkbox just above Pay */}
      <BillingCheckbox checked={sameAsBilling} onChange={onSameAsBillingChange} />

      {/* Sticky pay bar */}
      <div className="co-pay-bar">
        {error && (
          <div style={{ padding: "10px 14px", background: "#fef2f0", border: "1px solid #fbc6be", borderRadius: 8, marginBottom: 12 }}>
            <p className="ph-body-sm" style={{ color: "var(--sindoor)", margin: 0 }}>{error}</p>
          </div>
        )}
        <button
          type="button"
          onClick={onPay}
          disabled={isPending}
          className="ph-btn ph-btn-sindoor"
          style={{ width: "100%", padding: "16px 24px", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? "Processing…" : "Pay with Razorpay →"}
        </button>
        <p className="ph-body-sm" style={{ color: "var(--ink-4)", textAlign: "center", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <span>🔒</span> Encrypted and secure
        </p>
      </div>
    </div>
  )
}

// ─── International payment section ───────────────────────────────────────────

function IntlPayment({
  total,
  isPending,
  error,
  onPaypal,
  onRazorpay,
  sameAsBilling,
  onSameAsBillingChange,
}: {
  currency: string
  total: number
  isPending: boolean
  error: string | null
  onPaypal: () => void
  onRazorpay: () => void
  sameAsBilling: boolean
  onSameAsBillingChange: (v: boolean) => void
}) {
  return (
    <div>
      {/* Logos */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        {["PayPal", "Visa", "Mastercard", "UPI"].map((l) => (
          <span key={l} className="ph-label ph-num" style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", border: "1px solid var(--ink-line)", borderRadius: 4, color: "var(--ink-3)", background: "var(--paper)" }}>{l}</span>
        ))}
      </div>

      {/* Billing checkbox just above Pay */}
      <BillingCheckbox checked={sameAsBilling} onChange={onSameAsBillingChange} />

      {/* Sticky pay bar */}
      <div className="co-pay-bar">
        {error && (
          <div style={{ padding: "10px 14px", background: "#fef2f0", border: "1px solid #fbc6be", borderRadius: 8, marginBottom: 12 }}>
            <p className="ph-body-sm" style={{ color: "var(--sindoor)", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* PayPal primary */}
        <button
          type="button"
          onClick={onPaypal}
          disabled={isPending}
          style={{
            width: "100%", padding: "16px 24px", fontSize: 16, fontWeight: 700,
            background: "#0070ba", color: "#fff", border: "none", borderRadius: 10,
            cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "var(--sans)", marginBottom: 6,
          }}
        >
          {isPending ? "Processing…" : "Continue with PayPal →"}
        </button>
        <p className="ph-body-sm" style={{ color: "var(--ink-4)", textAlign: "center", marginBottom: 14 }}>
          PayPal charges in USD · {convertToLocale({ amount: total, currency_code: "usd" })}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 1, background: "var(--ink-line)" }} />
          <span className="ph-label" style={{ color: "var(--ink-4)", fontSize: 11 }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--ink-line)" }} />
        </div>

        <button
          type="button"
          onClick={onRazorpay}
          disabled={isPending}
          className="ph-btn ph-btn-ghost"
          style={{ width: "100%", padding: "12px 24px", fontSize: 14, fontWeight: 600, opacity: isPending ? 0.7 : 1, marginBottom: 5 }}
        >
          Pay with Razorpay (cards / UPI)
        </button>
        <p className="ph-body-sm" style={{ color: "var(--ink-4)", textAlign: "center" }}>
          Razorpay international is in beta
        </p>

        <p className="ph-body-sm" style={{ color: "var(--ink-4)", textAlign: "center", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <span>🔒</span> Encrypted and secure
        </p>
      </div>
    </div>
  )
}
