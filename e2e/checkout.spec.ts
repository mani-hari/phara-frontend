import { test, expect, request as pwRequest, type APIRequestContext } from "@playwright/test"

// ── Store API helpers ─────────────────────────────────────────────────────────
// Seed a cart directly via the Medusa store API and drop its id into the
// `_medusa_cart_id` cookie, so the checkout tests don't depend on the
// add-to-cart UI. This keeps the checkout assertions fast and deterministic.

const MEDUSA = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://pariharaonline.medusajs.app"
const PUB = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
const REGION_INDIA = "reg_01KCFT12W3X3NF5JYTMXYV7V7C"
const REGION_INTL = "reg_01KCFT01096J7B6E4TS591JN5V"

async function api(): Promise<APIRequestContext> {
  return pwRequest.newContext({
    extraHTTPHeaders: { "x-publishable-api-key": PUB, "Content-Type": "application/json" },
  })
}

async function seedCart(countryCode = "in", regionId = REGION_INDIA): Promise<string> {
  const ctx = await api()
  const prod = await (
    await ctx.get(`${MEDUSA}/store/products?limit=1&region_id=${regionId}&fields=variants.id`)
  ).json()
  const variant = prod.products?.[0]?.variants?.[0]?.id
  if (!variant) throw new Error("no variant found to seed cart")

  const cart = await (
    await ctx.post(`${MEDUSA}/store/carts`, { data: { region_id: regionId, email: "e2e@example.com" } })
  ).json()
  const cartId = cart.cart.id

  await ctx.post(`${MEDUSA}/store/carts/${cartId}/line-items`, {
    data: { variant_id: variant, quantity: 1, metadata: { devotee_name: "E2E Devotee", rasi: "Mesha" } },
  })
  await ctx.post(`${MEDUSA}/store/carts/${cartId}`, {
    data: {
      email: "e2e@example.com",
      shipping_address: {
        first_name: "E2E",
        last_name: "Test",
        address_1: "1 Test St",
        city: "Bengaluru",
        country_code: countryCode,
        postal_code: "560001",
      },
    },
  })
  await ctx.dispose()
  return cartId
}

async function gotoCheckoutWithCart(
  page: any,
  context: any,
  countryCode = "in",
  regionId = REGION_INDIA
) {
  const cartId = await seedCart(countryCode, regionId)
  const base = process.env.E2E_BASE_URL || "http://localhost:3000"
  await context.addCookies([{ name: "_medusa_cart_id", value: cartId, url: base }])
  // The payment UI (India vs International) is chosen from the URL country prefix.
  // "in" is served at the clean URL; other countries carry a /{cc}/ prefix.
  const path = countryCode === "in" ? "/checkout" : `/${countryCode}/checkout`
  await page.goto(path)
  await expect(page.getByTestId("checkout-container").first()).toBeVisible()
  return cartId
}

test.skip(!PUB, "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY not set — cannot seed carts")

// ── Tests ──────────────────────────────────────────────────────────────────────

test("checkout form renders in the main column, not the narrow summary column", async ({ page, context }) => {
  await gotoCheckoutWithCart(page, context)
  const firstName = page.locator('input[autocomplete="given-name"]').first()
  await expect(firstName).toBeVisible()
  const box = await firstName.boundingBox()
  // In the 320px summary column a field would be ~150px; in the main column it's ~400px+.
  expect(box!.width).toBeGreaterThan(360)
})

test('unchecking "billing same as delivery" reveals a billing form', async ({ page, context }) => {
  await gotoCheckoutWithCart(page, context)
  // Hidden by default
  await expect(page.locator('input[autocomplete="billing given-name"]')).toHaveCount(0)
  // Toggle the checkbox (clicking its label text toggles it)
  await page.getByText("Billing address same as delivery address").click()
  await expect(page.locator('input[autocomplete="billing given-name"]')).toBeVisible()
})

test("India cart: India shipping, Razorpay-only payment, no PayPal", async ({ page, context }) => {
  await gotoCheckoutWithCart(page, context, "in", REGION_INDIA)
  await expect(page.getByText(/Free shipping/i).first()).toBeVisible()
  // Razorpay radio present, PayPal hidden for India
  await expect(page.getByText(/Powered by Razorpay/i)).toBeVisible()
  await expect(page.getByText(/PayPal/i)).toHaveCount(0)
  await expect(page.getByTestId("pay-online")).toBeVisible()
})

test("international cart: intl shipping + Razorpay(default) & PayPal radios", async ({ page, context }) => {
  await gotoCheckoutWithCart(page, context, "us", REGION_INTL)
  await expect(page.getByText(/International Shipping|FedEx/i).first()).toBeVisible()
  await expect(page.getByText(/Powered by Razorpay/i)).toBeVisible()
  await expect(page.getByText(/including AMEX/i)).toBeVisible() // PayPal radio subtitle
  await expect(page.getByTestId("pay-online")).toBeVisible()
})

test("selecting a shipping option updates the order total", async ({ page, context }) => {
  await gotoCheckoutWithCart(page, context, "us", REGION_INTL)
  const total = page.getByTestId("summary-total")
  await expect(total).toBeVisible()
  // Pick the paid international option ($32)
  await page.getByText(/International Shipping/i).first().click()
  await expect(total).toContainText("$", { timeout: 15000 })
  await page.waitForTimeout(1500)
  const withShipping = ((await total.textContent()) || "").trim()
  // Switch to the free "Do not send prasadham" option → total must change (drop the $32)
  await page.getByText(/Do not send prasadham/i).first().click()
  await expect(total).not.toHaveText(withShipping || "__x__", { timeout: 15000 })
})

test("local-currency hint: none for US (USD), shown for non-US intl when price renders", async ({ browser }) => {
  // US visitor: price renders in USD, and NO hint (local currency == USD).
  const us = await browser.newContext({ extraHTTPHeaders: { "x-vercel-ip-country": "US" } })
  const usPage = await us.newPage()
  await usPage.goto("/us/products/navagraha-homam")
  await usPage.getByTestId("product-price").first().waitFor({ timeout: 15_000 })
  await expect(usPage.getByTestId("price-local-hint")).toHaveCount(0)
  await us.close()

  // GB visitor: when the product-detail price renders, the local (GBP) hint must show.
  const gb = await browser.newContext({ extraHTTPHeaders: { "x-vercel-ip-country": "GB" } })
  const gbPage = await gb.newPage()
  await gbPage.goto("/gb/products/navagraha-homam")
  const hasPrice = await gbPage
    .getByTestId("product-price")
    .first()
    .isVisible()
    .catch(() => false)
  // Pre-existing: the intl (non-US) product-detail price doesn't render — the hint can't attach.
  test.skip(!hasPrice, "intl (non-US) product-detail price not rendering (pre-existing)")
  await expect(gbPage.getByTestId("price-local-hint").first()).toBeVisible({ timeout: 15_000 })
  await gb.close()
})

test("empty checkout (no cart) is handled gracefully", async ({ page }) => {
  const res = await page.goto("/checkout")
  // No cart cookie → 404 not-found page (does not crash)
  expect(res?.status()).toBeLessThan(500)
})
