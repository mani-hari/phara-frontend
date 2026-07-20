import { retrieveCart, placeOrder, initiatePaymentSession } from "@lib/data/cart"
import { redirect } from "next/navigation"
import { localizeHref } from "@lib/util/localize-href"
import { logCheckoutError, logCheckoutEvent } from "@lib/util/checkout-log"

export default async function PaypalReturnPage({
  params,
  searchParams,
}: {
  params: { countryCode: string }
  searchParams: { token?: string; PayerID?: string; cartId?: string }
}) {
  const { countryCode } = params
  const { token, cartId } = searchParams

  if (!token) {
    redirect(localizeHref(countryCode, "/checkout/payment-error?reason=no_token"))
  }

  try {
    // 1. Capture the approved PayPal order (this takes the money).
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const captureRes = await fetch(`${baseUrl}/api/payments/paypal/capture-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: token }),
      cache: "no-store",
    })
    const captureData = await captureRes.json().catch(() => ({}))

    if (!captureRes.ok) {
      logCheckoutError("paypal_capture_failed", captureData?.error || "capture returned non-ok", {
        status: captureRes.status,
        token,
        cartId,
      })
      redirect(localizeHref(countryCode, "/checkout/payment-error?reason=capture_failed"))
    }
    if (captureData.status !== "COMPLETED") {
      logCheckoutError("paypal_capture_not_completed", `status=${captureData?.status}`, { token, cartId })
      redirect(localizeHref(countryCode, "/checkout/payment-error?reason=not_completed"))
    }

    // 2. The PayPal charge is captured. Register an authorized system payment
    // session on the cart's payment collection and complete the cart so Medusa
    // creates the order. Fetch the cart WITH its payment_collection (and by the
    // explicit cartId from the return URL, not just the cookie) so the SDK
    // reuses any existing collection instead of creating duplicates.
    const cart = await retrieveCart(
      cartId,
      "id,region_id,currency_code,*payment_collection,+shipping_methods.name"
    )
    if (!cart) {
      logCheckoutError("paypal_return_no_cart", "retrieveCart returned null after capture", { token, cartId })
      redirect(localizeHref(countryCode, "/checkout/payment-error?reason=order_failed"))
    }

    await initiatePaymentSession(cart, { provider_id: "pp_system_default" })
    logCheckoutEvent("paypal_capture_ok_completing", { token, cartId: cart.id })
    await placeOrder(cartId || cart.id) // 409-idempotent; redirects on success
  } catch (err: any) {
    // placeOrder / the guard redirects above throw NEXT_REDIRECT on success —
    // let those through. Anything else is a real failure: log the exact reason
    // (the money was already captured) so it can be reconciled.
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err
    }
    logCheckoutError("paypal_return_order_failed", err, {
      token: searchParams?.token,
      cartId: searchParams?.cartId,
    })
    redirect(localizeHref(countryCode, "/checkout/payment-error?reason=order_failed"))
  }

  // Fallback (should not reach here — placeOrder redirects on success)
  redirect(localizeHref(countryCode, "/"))
}
