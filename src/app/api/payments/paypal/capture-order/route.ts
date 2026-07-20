import { NextRequest, NextResponse } from "next/server"
import { logCheckoutError } from "@lib/util/checkout-log"

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      logCheckoutError("paypal_capture_not_configured", "missing client id/secret", { orderId })
      return NextResponse.json(
        { error: "PayPal not configured" },
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
      logCheckoutError("paypal_capture_auth_failed", tokenData?.error_description || "oauth failed", {
        status: tokenResponse.status,
        sandbox: isSandbox,
        orderId,
      })
      return NextResponse.json(
        { error: "Failed to authenticate with PayPal" },
        { status: 500 }
      )
    }

    // Capture order
    const captureResponse = await fetch(
      `${paypalBase}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
      }
    )

    const captureData = await captureResponse.json()

    if (!captureResponse.ok) {
      logCheckoutError("paypal_capture_rejected", captureData?.message || "capture rejected", {
        status: captureResponse.status,
        orderId,
        name: captureData?.name,
      })
      return NextResponse.json(
        { error: captureData.message || "Failed to capture PayPal order" },
        { status: captureResponse.status }
      )
    }

    return NextResponse.json(captureData)
  } catch (error: any) {
    logCheckoutError("paypal_capture_exception", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
