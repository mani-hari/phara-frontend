import { NextRequest, NextResponse } from "next/server"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BookingDetails = {
  poojaPersonName: string
  nakshatra?: string
  gothram?: string
  orderNote?: string
}

type CheckoutRequestBody = {
  cartId: string
  amount: number
  currency: "INR" | "USD"
  bookingDetails: BookingDetails
  customerName: string
  customerEmail: string
  customerPhone?: string
}

// ---------------------------------------------------------------------------
// POST /api/chat/checkout — create a Razorpay order from the chat interface
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Payment gateway not configured" },
      { status: 500 }
    )
  }

  let body: CheckoutRequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  // Validate required fields
  const { cartId, amount, currency, bookingDetails, customerName, customerEmail } = body

  if (!cartId || typeof cartId !== "string") {
    return NextResponse.json(
      { error: "cartId is required" },
      { status: 400 }
    )
  }
  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json(
      { error: "amount must be a positive number (in major currency units)" },
      { status: 400 }
    )
  }
  if (currency !== "INR" && currency !== "USD") {
    return NextResponse.json(
      { error: "currency must be INR or USD" },
      { status: 400 }
    )
  }
  if (!bookingDetails?.poojaPersonName) {
    return NextResponse.json(
      { error: "bookingDetails.poojaPersonName is required" },
      { status: 400 }
    )
  }
  if (!customerName || !customerEmail) {
    return NextResponse.json(
      { error: "customerName and customerEmail are required" },
      { status: 400 }
    )
  }

  // Build Razorpay order payload
  const receipt = `ph_chat_${Date.now()}`
  const notes: Record<string, string> = {
    cartId,
    customerName,
    customerEmail,
    poojaPersonName: bookingDetails.poojaPersonName,
    bookingDetails: JSON.stringify(bookingDetails),
  }
  if (body.customerPhone) notes.customerPhone = body.customerPhone

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64")

  let razorpayOrder: Record<string, any>
  try {
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // major units → paise (Razorpay requires the smallest currency unit)
        currency,
        receipt,
        notes,
      }),
    })

    razorpayOrder = await response.json()

    if (!response.ok) {
      console.error("[/api/chat/checkout] Razorpay error:", razorpayOrder)
      return NextResponse.json(
        {
          error:
            razorpayOrder?.error?.description ||
            "Failed to create payment order",
        },
        { status: response.status }
      )
    }
  } catch (err: any) {
    console.error("[/api/chat/checkout] fetch error:", err?.message ?? err)
    return NextResponse.json(
      { error: "Payment gateway unreachable" },
      { status: 502 }
    )
  }

  return NextResponse.json({
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId,
  })
}
