import { NextRequest, NextResponse } from "next/server"
import { addToCart } from "@lib/data/cart"

// Used by the Ask Parihara product cards. Goes through the storefront's own
// addToCart/getOrSetCart so the chat and the site share one cart in the
// visitor's region (this route previously created carts in a hardcoded
// region id that was actually the International/USD region).
export async function POST(req: NextRequest) {
  try {
    const { variantId, quantity = 1, countryCode = "in" } = await req.json()
    if (!variantId || typeof variantId !== "string") {
      return NextResponse.json({ error: "variantId required" }, { status: 400 })
    }
    const cc = String(countryCode).toLowerCase()
    if (!/^[a-z]{2}$/.test(cc)) {
      return NextResponse.json({ error: "invalid countryCode" }, { status: 400 })
    }
    const qty = Math.min(Math.max(parseInt(String(quantity), 10) || 1, 1), 10)
    await addToCart({ variantId, quantity: qty, countryCode: cc })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[/api/cart/add]", err?.message ?? err)
    return NextResponse.json({ error: "Could not add to cart" }, { status: 500 })
  }
}
