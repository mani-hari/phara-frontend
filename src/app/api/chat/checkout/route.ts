import { NextRequest, NextResponse } from "next/server"
import { addToCart } from "@lib/data/cart"
import { localizeHref } from "@lib/util/localize-href"
import { getCatalog, findProduct } from "@lib/chat/catalog"

// ---------------------------------------------------------------------------
// POST /api/chat/checkout: book from the Ask Parihara chat.
//
// Adds the chosen product variant (with who the pooja is for) to the SAME
// Medusa cart the storefront uses (`_medusa_cart_id` cookie via
// getOrSetCart/addToCart), then returns the storefront checkout URL. Payment
// (Razorpay for INR, PayPal for USD), addresses, order completion, failure
// reporting and confirmation emails all happen in the storefront checkout.
// The chat no longer creates its own Razorpay order, which was never tied to
// a Medusa cart and so could never produce an order.
// ---------------------------------------------------------------------------

type Body = {
  handle?: string
  variantId?: string
  countryCode?: string
  bookingDetails?: {
    poojaPersonName?: string
    nakshatra?: string
    gothram?: string
    orderNote?: string
  }
}

const clean = (v: unknown, max = 200) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : ""

export async function POST(req: NextRequest) {
  let body: Body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const countryCode = clean(body.countryCode, 2).toLowerCase() || "in"
  if (!/^[a-z]{2}$/.test(countryCode)) {
    return NextResponse.json({ error: "Invalid country." }, { status: 400 })
  }

  const name = clean(body.bookingDetails?.poojaPersonName, 120)
  if (!name) {
    return NextResponse.json(
      { error: "Please enter the name of the person the pooja is for." },
      { status: 400 }
    )
  }

  // The variant must belong to a published catalog product: never trust a
  // variant id or price coming from the browser or the model.
  const catalog = await getCatalog()
  const product = body.handle ? findProduct(catalog, body.handle) : null
  const variant = product?.variants.find((v) => v.id === body.variantId)
  if (!product || !variant) {
    return NextResponse.json(
      { error: "This service can't be booked from chat right now." },
      { status: 400 }
    )
  }

  const nakshatram = clean(body.bookingDetails?.nakshatra, 60)
  const gothram = clean(body.bookingDetails?.gothram, 60)
  const notes = clean(body.bookingDetails?.orderNote, 500)
  // Same line-item metadata shape the product page writes
  // (src/modules/products/components/product-actions), so staff see who each
  // pooja is for on the order.
  const metadata: Record<string, unknown> = {
    devotees: JSON.stringify([
      { name, ...(nakshatram ? { nakshatram } : {}), ...(gothram ? { gothram } : {}) },
    ]),
    devotee_name: name,
    ...(nakshatram ? { nakshatram } : {}),
    ...(gothram ? { gothram } : {}),
    ...(notes ? { sankalpam_notes: notes } : {}),
    source: "ask-parihara",
  }

  try {
    await addToCart({
      variantId: variant.id,
      quantity: 1,
      countryCode,
      metadata: metadata as any,
    })
  } catch (err: any) {
    console.error("[/api/chat/checkout] addToCart failed:", err?.message ?? err)
    return NextResponse.json(
      { error: "We couldn't add this to your cart." },
      { status: 502 }
    )
  }

  return NextResponse.json({
    ok: true,
    checkoutUrl: localizeHref(countryCode, "/checkout"),
    productUrl: localizeHref(countryCode, `/products/${product.handle}`),
  })
}
