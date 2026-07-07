"use client"

import { useState, useCallback } from "react"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import { loadRazorpayScript } from "@lib/payments/razorpay"

type CheckoutSummaryCardProps = {
  items: { title: string; priceInr: number | null; quantity: number }[]
  totalInr: number
  bookingDetails: {
    poojaPersonName: string
    nakshatra?: string
    gothram?: string
    address: {
      firstName: string
      lastName: string
      city: string
      countryCode: string
    }
  }
  countryCode: string
  razorpayKeyId: string
  razorpayOrderId?: string
  onRazorpaySuccess: (paymentId: string, orderId: string, signature: string) => void
  onRazorpayFailure: (error: string) => void
  onPaypalSuccess?: (orderId: string) => void
  onSaveLater: () => void
  isProcessing?: boolean
}

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "test"
const COUNTRY_NAMES: Record<string, string> = {
  in: "India", us: "US", gb: "UK", ca: "Canada", au: "Australia",
  sg: "Singapore", ae: "UAE", de: "Germany", fr: "France", nl: "Netherlands",
  nz: "New Zealand", my: "Malaysia",
}

export default function CheckoutSummaryCard({
  items,
  totalInr,
  bookingDetails,
  countryCode,
  razorpayKeyId,
  razorpayOrderId,
  onRazorpaySuccess,
  onRazorpayFailure,
  onPaypalSuccess,
  onSaveLater,
  isProcessing = false,
}: CheckoutSummaryCardProps) {
  const [razorpayLoading, setRazorpayLoading] = useState(false)
  const [showRazorpayFallback, setShowRazorpayFallback] = useState(false)
  const isIndia = countryCode === "in"

  const handleRazorpay = useCallback(async () => {
    if (!razorpayOrderId) return
    setRazorpayLoading(true)
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        onRazorpayFailure("Failed to load payment gateway. Please try again.")
        return
      }
      new window.Razorpay({
        key: razorpayKeyId,
        amount: totalInr * 100,
        currency: "INR",
        order_id: razorpayOrderId,
        name: "PariharaOnline",
        description: "Temple Services",
        prefill: {
          name: bookingDetails.poojaPersonName,
        },
        theme: { color: "#b6442e" },
        handler: (res) => {
          onRazorpaySuccess(
            res.razorpay_payment_id,
            res.razorpay_order_id ?? "",
            res.razorpay_signature ?? ""
          )
        },
        modal: {
          ondismiss: () => {
            setRazorpayLoading(false)
          },
        },
      }).open()
    } catch {
      onRazorpayFailure("Payment failed. Please try again.")
    } finally {
      setRazorpayLoading(false)
    }
  }, [razorpayOrderId, razorpayKeyId, totalInr, bookingDetails.poojaPersonName, onRazorpaySuccess, onRazorpayFailure])

  const countryLabel =
    COUNTRY_NAMES[countryCode.toLowerCase()] ||
    countryCode.toUpperCase()

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
          marginBottom: 16,
          paddingBottom: 14,
          borderBottom: "1px solid var(--ink-line)",
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "var(--sage)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            color: "#fff",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          ✓
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
          Booking Summary
        </h3>
      </div>

      {/* Line items */}
      <div style={{ marginBottom: 12 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "var(--ink-2)",
                lineHeight: 1.4,
                flex: 1,
              }}
            >
              {item.quantity > 1 && (
                <span style={{ color: "var(--ink-4)", marginRight: 4 }}>
                  {item.quantity}×
                </span>
              )}
              {item.title}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ink)",
                whiteSpace: "nowrap",
                fontFeatureSettings: "'tnum' 1",
              }}
            >
              {item.priceInr != null
                ? `₹${(item.priceInr * item.quantity).toLocaleString("en-IN")}`
                : "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 10,
          marginBottom: 14,
          borderTop: "1px solid var(--ink-line)",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
          Total
        </span>
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--sindoor)",
            fontFeatureSettings: "'tnum' 1",
          }}
        >
          ₹{totalInr.toLocaleString("en-IN")}
        </span>
      </div>

      {/* Booking meta */}
      <div
        style={{
          padding: "10px 12px",
          background: "var(--paper)",
          border: "1px solid var(--ink-line)",
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 12.5,
          color: "var(--ink-3)",
          lineHeight: 1.6,
        }}
      >
        <div>
          <span style={{ color: "var(--ink-4)" }}>For: </span>
          <strong style={{ color: "var(--ink)" }}>
            {bookingDetails.poojaPersonName}
          </strong>
        </div>
        <div>
          <span style={{ color: "var(--ink-4)" }}>Deliver to: </span>
          {bookingDetails.address.city}, {countryLabel}
        </div>
        {bookingDetails.nakshatra && (
          <div>
            <span style={{ color: "var(--ink-4)" }}>Nakshatra: </span>
            {bookingDetails.nakshatra}
          </div>
        )}
      </div>

      {/* Payment section */}
      <div style={{ marginBottom: 12 }}>
        {!isIndia && (
          <>
            {/* PayPal first for international */}
            <div style={{ marginBottom: 10 }}>
              <PayPalScriptProvider
                options={{
                  clientId: PAYPAL_CLIENT_ID,
                  currency: "USD",
                  intent: "capture",
                }}
              >
                <PayPalButtons
                  style={{
                    layout: "horizontal",
                    color: "gold",
                    shape: "pill",
                    label: "paypal",
                    height: 40,
                  }}
                  createOrder={async () => {
                    const res = await fetch("/api/payments/paypal/create-order", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        amount: totalInr,
                        currency: "INR",
                        description: "PariharaOnline - Temple Services",
                      }),
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || "Failed to create order")
                    return data.id
                  }}
                  onApprove={async (data) => {
                    const res = await fetch("/api/payments/paypal/capture-order", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ orderId: data.orderID }),
                    })
                    if (!res.ok) {
                      const err = await res.json()
                      throw new Error(err.error || "Capture failed")
                    }
                    onPaypalSuccess?.(data.orderID)
                  }}
                />
              </PayPalScriptProvider>
            </div>

            {/* Razorpay fallback for international */}
            {!showRazorpayFallback ? (
              <button
                type="button"
                onClick={() => setShowRazorpayFallback(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12.5,
                  color: "var(--ink-4)",
                  textDecoration: "underline",
                  padding: 0,
                  display: "block",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                or pay with card →
              </button>
            ) : (
              <RazorpayButton
                totalInr={totalInr}
                loading={razorpayLoading}
                disabled={!razorpayOrderId || isProcessing}
                onClick={handleRazorpay}
              />
            )}
          </>
        )}

        {isIndia && (
          <RazorpayButton
            totalInr={totalInr}
            loading={razorpayLoading}
            disabled={!razorpayOrderId || isProcessing}
            onClick={handleRazorpay}
          />
        )}
      </div>

      {/* Save later */}
      <div style={{ textAlign: "center" }}>
        <button
          type="button"
          onClick={onSaveLater}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            color: "var(--ink-4)",
            textDecoration: "underline",
            padding: 0,
          }}
        >
          Save &amp; complete later
        </button>
      </div>
    </div>
  )
}

function RazorpayButton({
  totalInr,
  loading,
  disabled,
  onClick,
}: {
  totalInr: number
  loading: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="ph-btn ph-btn-sindoor ph-btn-block"
      style={{
        fontSize: 14,
        fontWeight: 600,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        gap: 8,
      }}
    >
      {loading ? (
        <>
          <span
            style={{
              display: "inline-block",
              width: 14,
              height: 14,
              border: "2px solid rgba(255,255,255,0.4)",
              borderTopColor: "#fff",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }}
          />
          Loading…
        </>
      ) : (
        `Pay ₹${totalInr.toLocaleString("en-IN")} with Razorpay →`
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  )
}
