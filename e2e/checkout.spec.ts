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

test("India cart shows India shipping options + a pay button", async ({ page, context }) => {
  await gotoCheckoutWithCart(page, context, "in", REGION_INDIA)
  await expect(page.getByText(/Free shipping|prasad/i).first()).toBeVisible()
  await expect(page.getByRole("button", { name: /Razorpay|PayPal/i }).first()).toBeVisible()
})

test("international cart shows international shipping + Razorpay default", async ({ page, context }) => {
  await gotoCheckoutWithCart(page, context, "us", REGION_INTL)
  // International Speed Post / FedEx should appear (country-based shipping)
  await expect(page.getByText(/Speed Post|FedEx|International/i).first()).toBeVisible()
  // Both providers offered; Razorpay is the primary/default button
  await expect(page.getByRole("button", { name: /Razorpay/i }).first()).toBeVisible()
  await expect(page.getByRole("button", { name: /PayPal/i }).first()).toBeVisible()
})

test("empty checkout (no cart) is handled gracefully", async ({ page }) => {
  const res = await page.goto("/checkout")
  // No cart cookie → 404 not-found page (does not crash)
  expect(res?.status()).toBeLessThan(500)
})
