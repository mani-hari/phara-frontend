"use client"

import { useEffect, useRef, useState } from "react"
import {
  retrieveCart,
  completeCartAndGetOrder,
  initiatePaymentSession,
  reportFailedCheckout,
} from "@lib/data/cart"
import { logCheckoutError } from "@lib/util/checkout-log"
import { localizeHref } from "@lib/util/localize-href"

// Completes a PayPal order AFTER the buyer approves. Runs client-side and calls
// the server actions (retrieveCart / initiatePaymentSession /
// completeCartAndGetOrder) — the SAME path Razorpay uses. Those actions call
// revalidateTag, which throws if run during a server-component render, so the
// old server-component version failed AFTER the money was captured. Completion
// RETURNS the order (no server-action redirect) and we navigate explicitly —
// a redirect awaited inside a client try/catch swallowed successful orders
// into a false error. Every real failure is reported so staff can follow up.
export default function PaypalReturnClient({
  token,
  cartId,
  countryCode,
}: {
  token: string
  cartId: string
  countryCode: string
}) {
  const ran = useRef(false)
  const [status, setStatus] = useState("Confirming your payment…")

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const toError = (reason: string) => {
      window.location.href = `/${countryCode}/checkout/payment-error?reason=${reason}`
    }

    ;(async () => {
      if (!token) return toError("no_token")
      try {
        // 1. Capture the approved PayPal order (takes the money).
        const res = await fetch("/api/payments/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: token }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          await reportFailedCheckout(cartId, `paypal_capture_failed:${data?.error || res.status}`, "paypal")
          return toError("capture_failed")
        }
        if (data.status !== "COMPLETED") {
          await reportFailedCheckout(cartId, `paypal_not_completed:${data?.status}`, "paypal")
          return toError("not_completed")
        }

        // 2. Money captured — now create the Medusa order via server actions.
        setStatus("Payment received — creating your order…")
        const cart = await retrieveCart(
          cartId,
          "id,region_id,currency_code,*payment_collection,+shipping_methods.name"
        )
        if (!cart) {
          await reportFailedCheckout(cartId, "paypal_no_cart_on_return", "paypal")
          return toError("order_failed")
        }
        await initiatePaymentSession(cart, { provider_id: "pp_system_default" })
        const result = await completeCartAndGetOrder(cartId || cart.id)
        if (result.ok) {
          // Navigate explicitly (don't rely on a server-action redirect from
          // the client — that swallowed successful orders into a false error).
          window.location.href = localizeHref(
            result.countryCode || countryCode,
            `/order/${result.orderId}/confirmed`
          )
          return
        }

        // Completion did NOT produce an order though the money was captured —
        // report it so staff can reconcile, then show the error.
        await reportFailedCheckout(cartId, `paypal_complete_no_order:${result.reason}`, "paypal")
        toError("order_failed")
      } catch (err: any) {
        logCheckoutError("paypal_return_client_failed", err, { token, cartId })
        try {
          await reportFailedCheckout(cartId, `paypal_complete_exception:${err?.message || "error"}`, "paypal")
        } catch {}
        toError("order_failed")
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, textAlign: "center" }}>
      <div
        style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid var(--ink-line, #e7ded4)", borderTopColor: "var(--sindoor, #b6442e)", animation: "ppspin 0.8s linear infinite" }}
        aria-hidden
      />
      <p className="ph-body" style={{ color: "var(--ink-2, #2b2320)", margin: 0 }}>{status}</p>
      <p className="ph-body-sm" style={{ color: "var(--ink-4, #6b615c)", margin: 0 }}>
        Please don’t close or refresh this page.
      </p>
      <style>{`@keyframes ppspin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
