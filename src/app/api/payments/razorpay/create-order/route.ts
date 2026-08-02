import { NextRequest, NextResponse } from "next/server"
import { logCheckoutError, logCheckoutEvent } from "@lib/util/checkout-log"

export async function POST(req: NextRequest) {
  try {
    const { cart_id, amount, currency = "INR", receipt, notes } = await req.json()

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay not configured. Please add RAZORPAY credentials." },
        { status: 500 }
      )
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64")

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // major units → paise (Razorpay requires the smallest currency unit)
        currency,
        // Stamp the Medusa cart_id onto the Razorpay order so the payment is
        // recoverable server-side (webhook completion + reconciliation). Without
        // this, a charged payment has no link to any cart → "paid, no order" is
        // impossible to reconcile from data. See MAN-21.
        receipt: receipt || cart_id || `order_${Date.now()}`,
        notes: { ...(notes || {}), cart_id: cart_id || "" },
      }),
    })

    const order = await response.json()

    if (!response.ok) {
      logCheckoutError("razorpay_create_order_rejected", order.error?.description || "razorpay rejected", {
        status: response.status,
        currency,
        amount,
        code: order.error?.code,
      })
      return NextResponse.json(
        { error: order.error?.description || "Failed to create order" },
        { status: response.status }
      )
    }

    // Correlation trail (Vercel logs): cart_id ↔ razorpay_order_id. MAN-21.
    logCheckoutEvent("razorpay_create_order_ok", {
      cart_id: cart_id || null,
      razorpay_order_id: order.id,
      amount,
      currency,
    })

    return NextResponse.json(order)
  } catch (error: any) {
    logCheckoutError("razorpay_create_order_exception", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
