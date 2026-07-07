import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://pariharaonline.medusajs.app"
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
const REGION_ID = "reg_01KCFT01096J7B6E4TS591JN5V" // India region

async function medusa(path: string, method = "GET", body?: object) {
  const cookieStore = cookies()
  const cartIdCookie = cookieStore.get("_medusa_cart_id")
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": PUB_KEY,
      ...(cartIdCookie ? { Cookie: `_medusa_cart_id=${cartIdCookie.value}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })
  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const { variantId, quantity = 1 } = await req.json()
    if (!variantId) return NextResponse.json({ error: "variantId required" }, { status: 400 })

    const cookieStore = cookies()
    let cartId = cookieStore.get("_medusa_cart_id")?.value

    // Create cart if none exists
    if (!cartId) {
      const created = await medusa("/store/carts", "POST", { region_id: REGION_ID })
      cartId = created?.cart?.id
      if (!cartId) return NextResponse.json({ error: "Could not create cart" }, { status: 500 })
    }

    // Add line item
    const result = await medusa(`/store/carts/${cartId}/line-items`, "POST", {
      variant_id: variantId,
      quantity,
    })

    const res = NextResponse.json({ ok: true, cartId })
    res.cookies.set("_medusa_cart_id", cartId, { path: "/", maxAge: 60 * 60 * 24 * 7 })
    return res
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
