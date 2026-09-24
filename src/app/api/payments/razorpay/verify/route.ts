import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { logCheckoutError, logCheckoutEvent } from "@lib/util/checkout-log"

export async function POST(req: NextRequest) {
  try {
    const {
      cart_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json()

    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keySecret) {
      return NextResponse.json(
        { error: "Razorpay not configured" },
        { status: 500 }
      )
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex")

    const isValid = expectedSignature === razorpay_signature

    if (!isValid) {
      logCheckoutError("razorpay_verify_bad_signature", "invalid signature", {
        cart_id: cart_id || null,
        razorpay_payment_id,
        razorpay_order_id,
      })
      return NextResponse.json(
        { error: "Invalid payment signature", verified: false },
        { status: 400 }
      )
    }

    // Correlation trail (Vercel logs): the money is now CONFIRMED captured on
    // Razorpay. If no Medusa order later exists for this cart_id, this line is
    // the proof a charge happened — the join key for reconciliation. MAN-21.
    logCheckoutEvent("razorpay_verify_ok", {
      cart_id: cart_id || null,
      razorpay_payment_id,
      razorpay_order_id,
    })

    // Stamp the Razorpay ids onto the cart BEFORE the client completes it.
    // Medusa copies cart metadata onto the order, so staff and the reconciler
    // can match the order to the charge. Medusa merges metadata keys (existing
    // keys like payment_gateway/marketing_opt_in are kept). Best-effort: a
    // failure here must never turn a verified payment into an error.
    if (cart_id) {
      await stampCartWithRazorpayIds(cart_id, razorpay_payment_id, razorpay_order_id)
    }

    return NextResponse.json({
      verified: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
    })
  } catch (error: any) {
    logCheckoutError("razorpay_verify_exception", error)
    return NextResponse.json(
      { error: error.message || "Verification failed", verified: false },
      { status: 500 }
    )
  }
}

async function stampCartWithRazorpayIds(
  cartId: string,
  razorpayPaymentId: string,
  razorpayOrderId: string
) {
  const ctx = {
    cart_id: cartId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_order_id: razorpayOrderId,
  }
  try {
    const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    if (!backend || !key) throw new Error("medusa backend not configured")
    const res = await fetch(
      `${backend}/store/carts/${encodeURIComponent(cartId)}?fields=id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": key,
        },
        body: JSON.stringify({
          metadata: {
            razorpay_payment_id: razorpayPaymentId,
            razorpay_order_id: razorpayOrderId,
            payment_gateway: "razorpay",
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      }
    )
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`)
    }
  } catch (e) {
    logCheckoutError("razorpay_stamp_cart_failed", e, ctx)
  }
}
