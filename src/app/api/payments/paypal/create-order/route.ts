import { NextRequest, NextResponse } from "next/server"
import { logCheckoutError } from "@lib/util/checkout-log"

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = "USD", description, return_url, cancel_url } = await req.json()

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "PayPal not configured. Please add PayPal credentials." },
        { status: 500 }
      )
    }

    // Get access token
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
    const isSandbox = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX === "true"
    const paypalBase = isSandbox ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com"

    const tokenResponse = await fetch(
      `${paypalBase}/v1/oauth2/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      }
    )

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) {
      logCheckoutError("paypal_auth_failed", tokenData?.error_description || "paypal oauth failed", {
        status: tokenResponse.status,
        sandbox: isSandbox,
      })
      return NextResponse.json(
        { error: "Failed to authenticate with PayPal" },
        { status: 500 }
      )
    }

    // Create order
    const orderResponse = await fetch(
      `${paypalBase}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: typeof amount === "number" ? (amount / 100).toFixed(2) : amount,
              },
              description: description || "PariharaOnline - Temple Services",
            },
          ],
          ...(return_url || cancel_url
            ? {
                application_context: {
                  return_url: return_url || undefined,
                  cancel_url: cancel_url || undefined,
                  brand_name: "PariharaOnline",
                  user_action: "PAY_NOW",
                },
              }
            : {}),
        }),
      }
    )

    const order = await orderResponse.json()

    if (!orderResponse.ok) {
      logCheckoutError("paypal_create_order_rejected", order.message || "paypal rejected", {
        status: orderResponse.status,
        currency,
        name: order.name,
      })
      return NextResponse.json(
        { error: order.message || "Failed to create PayPal order" },
        { status: orderResponse.status }
      )
    }

    return NextResponse.json(order)
  } catch (error: any) {
    logCheckoutError("paypal_create_order_exception", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
