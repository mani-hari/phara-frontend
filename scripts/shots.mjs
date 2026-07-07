import { chromium, request } from "@playwright/test"

const MEDUSA = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://pariharaonline.medusajs.app"
const PUB = process.env.PUB || ""
const REGION_INDIA = "reg_01KCFT12W3X3NF5JYTMXYV7V7C"
const REGION_INTL = "reg_01KCFT01096J7B6E4TS591JN5V"
const base = "http://localhost:3000"

async function seedCart(regionId) {
  const ctx = await request.newContext({
    extraHTTPHeaders: { "x-publishable-api-key": PUB, "Content-Type": "application/json" },
  })
  const prod = await (await ctx.get(`${MEDUSA}/store/products?limit=1&region_id=${regionId}&fields=variants.id`)).json()
  const variant = prod.products?.[0]?.variants?.[0]?.id
  const cart = await (await ctx.post(`${MEDUSA}/store/carts`, { data: { region_id: regionId, email: "shot@example.com" } })).json()
  const cartId = cart.cart.id
  await ctx.post(`${MEDUSA}/store/carts/${cartId}/line-items`, {
    data: { variant_id: variant, quantity: 1, metadata: { devotee_name: "Test Devotee", rasi: "Mesha" } },
  })
  return cartId
}

const inCart = await seedCart(REGION_INDIA)
const usCart = await seedCart(REGION_INTL)
const browser = await chromium.launch()

async function shoot(tag, viewport, cartId, paths) {
  const ctx = await browser.newContext({ viewport })
  await ctx.addCookies([{ name: "_medusa_cart_id", value: cartId, url: base }])
  const page = await ctx.newPage()
  for (const [name, url] of paths) {
    await page.goto(base + url, { waitUntil: "networkidle" }).catch(() => {})
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `/tmp/${name}-${tag}.png`, fullPage: true })
    console.log(`shot /tmp/${name}-${tag}.png`)
  }
  await ctx.close()
}

await shoot("desktop", { width: 1440, height: 900 }, inCart, [["cart", "/cart"], ["checkout", "/checkout"]])
await shoot("mobile", { width: 390, height: 844 }, inCart, [["cart", "/cart"], ["checkout", "/checkout"]])
await shoot("desktop", { width: 1440, height: 900 }, usCart, [["checkout-us", "/us/checkout"]])

await browser.close()
console.log("done")
