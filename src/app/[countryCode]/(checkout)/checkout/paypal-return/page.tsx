import { retrieveCart, placeOrder } from "@lib/data/cart"
import { redirect } from "next/navigation"
import { localizeHref } from "@lib/util/localize-href"

export default async function PaypalReturnPage({
  params,
  searchParams,
}: {
  params: { countryCode: string }
  searchParams: { token?: string; PayerID?: string; cartId?: string }
}) {
  const { countryCode } = params
  const { token } = searchParams

  if (!token) {
    redirect(localizeHref(countryCode, "/checkout/payment-error?reason=no_token"))
  }

  try {
    // Capture the PayPal order
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const captureRes = await fetch(`${baseUrl}/api/payments/paypal/capture-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: token }),
    })

    if (!captureRes.ok) {
      redirect(localizeHref(countryCode, "/checkout/payment-error?reason=capture_failed"))
    }

    const captureData = await captureRes.json()
    if (captureData.status !== "COMPLETED") {
      redirect(localizeHref(countryCode, "/checkout/payment-error?reason=not_completed"))
    }

    // Place the Medusa order
    await placeOrder()
  } catch (err: any) {
    // placeOrder calls redirect() on success — if we get here it's a real error
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err
    }
    redirect(localizeHref(countryCode, "/checkout/payment-error?reason=order_failed"))
  }

  // Fallback (should not reach here — placeOrder redirects on success)
  redirect(localizeHref(countryCode, "/"))
}
