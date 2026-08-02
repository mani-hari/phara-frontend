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
