import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = "USD", description } = await req.json()

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
    const tokenResponse = await fetch(
      "https://api-m.paypal.com/v1/oauth2/token",
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
      return NextResponse.json(
        { error: "Failed to authenticate with PayPal" },
        { status: 500 }
      )
    }

    // Create order
    const orderResponse = await fetch(
      "https://api-m.paypal.com/v2/checkout/orders",
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
                value: (amount / 100).toFixed(2), // Convert from cents to dollars
              },
              description: description || "PariharaOnline - Temple Services",
            },
          ],
        }),
      }
    )

    const order = await orderResponse.json()

    if (!orderResponse.ok) {
      return NextResponse.json(
        { error: order.message || "Failed to create PayPal order" },
        { status: orderResponse.status }
      )
    }

    return NextResponse.json(order)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
