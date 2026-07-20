# Cart & Checkout Architecture

How the PariharaOnline cart → checkout → payment → fulfillment flow works, and how to test it.
See [`PROJECT.md`](./PROJECT.md) for the overall stack.

_Last updated: 2026-07-07._

## Flow at a glance

```
Product page ──add to cart──▶ Cart (/cart) ──▶ Checkout (/checkout) ──pay──▶ Order confirmed
   │  (line-item metadata)      │ sankalpam        │ address, shipping,        │ /order/[id]/confirmed
   │                            │ (line-item meta) │ billing, payment          │  or /checkout/payment-error
```

- **Cart page** (`src/modules/cart/`): line items + the **sankalpam** ("who is it for") form.
- **Checkout** (`src/modules/checkout/templates/one-page-checkout/index.tsx`): the single active
  checkout template — a **one-page** layout (delivery address → shipping → billing → payment) in the
  main column with a sticky order summary on the right. (The older `checkout/components/addresses` +
  multi-step template are **dead code** — do not edit them.)
- Server data actions live in `src/lib/data/cart.ts` (`"use server"`), callable from the client.

## Region & currency

- **Two Medusa regions:** India (`inr`, country `in`) and International (`usd`, 243 countries).
- `src/middleware.ts` picks the region from the visitor: **admin override (logged-in only) → Vercel
  `x-vercel-ip-country` → default `in`**. India is served at clean URLs (`/checkout`); other countries
  get a `/{cc}/` prefix (`/us/checkout`).
- The cart's `region_id` (set at creation from the visitor's country) determines the **currency** of all
  displayed prices via `convertToLocale` (`src/lib/util/money.ts`).
- **Admin region toggle** (`src/components/admin/admin-bar.tsx`) sets `admin_region_override`. The
  middleware honors it **only when a `_medusa_jwt` session cookie is present**, so a stale cookie can
  never mis-price the catalog for a logged-out customer.
- Checkout country auto-populates from `x-vercel-ip-country` (falls back to URL country / region).

## Shipping (country-based, Medusa-backed)

Configured by [`scripts/setup-shipping.mjs`](../scripts/setup-shipping.mjs) (idempotent, re-runnable):

| Zone (geo) | Options |
|---|---|
| India (`in`) | **Free shipping (India)** ₹0 · **International Shipping (from India)** ₹2,800 (hidden; INR cart shipping abroad) · **Do not send prasadham, donate at temple** ₹0 |
| International (243 cc) | **International Shipping (Speedpost/FedEx)** $32 · **Prasadham delivery to India (free)** $0 (hidden; USD cart shipping to India) · **Do not send prasadham, donate at temple** $0 |

`GET /store/shipping-options?cart_id=...` returns only the options whose service-zone geo matches the
cart's shipping-address country **and** have a price in the cart's currency — so options switch on
country automatically. The checkout requires a shipping selection before payment.

The two **hidden** options are the cross-region escape hatch (see ARCHITECTURE.md): applied
automatically when the delivery country is outside the cart's region, never shown as a normal card.

> **Change the rates:** `INTL_RATE=30 INR_INTL_RATE=2500 node scripts/setup-shipping.mjs`
> (defaults: $32 USD intl, ₹2,800 INR intl-from-India).

## Sankalpam / puja details (fulfillment-critical)

The devotee details (name, nakshatram, rasi, gothram, notes, date) are written to **line-item metadata**
(`updateCartPujaDetails` in `cart.ts` mirrors them onto each cart line item, plus cart metadata as a
backup). Line-item metadata reliably carries into the Medusa **order's** line items on completion, so
temple staff see who each puja is for on the order. The thank-you page renders `For: {devotee_name}`
per item.

## Payments

Verified: the live Razorpay account **accepts USD** (international enabled), so no INR conversion is
needed — the cart currency is sent as-is (`createRazorpayOrder` → `cart.currency_code`).

| Region | Providers (default first) | Currency sent |
|---|---|---|
| India | Razorpay only | INR |
| International | **Razorpay** (default) → PayPal | Razorpay: USD · PayPal: USD |

Payment provider selection keys off the URL country (`isIndia = countryCode === "in"`), which matches the
cart region in normal (geo-consistent) flows.

## Billing address

"Billing address same as delivery" is on by default. Unchecking reveals a full billing form (main
column); `saveAddressesForCheckout` sends the separate billing address to the order (it never sends an
empty billing address).

## Completion screens

- **Success:** `/order/[id]/confirmed` (`src/modules/order/templates/order-completed-template.tsx`) —
  blessing, order summary, per-item sankalpam, what-happens-next, support contact.
- **Failure:** `/checkout/payment-error` — reason-specific message + recovery, with WhatsApp and
  `hello@pariharaonline.com`. Contact details are centralized in [`src/lib/contact.ts`](../src/lib/contact.ts).

## Error logging

`src/lib/util/checkout-log.ts` emits single-line JSON logs (`area:"checkout"`, greppable in Vercel logs)
at every payment failure point — client handlers (`razorpay_init`, `razorpay_verify`, `paypal_init`) and
server order-creation routes (rejections + exceptions). No secrets/card data logged. (Sentry deferred.)

## Tests

Playwright E2E: [`e2e/checkout.spec.ts`](../e2e/checkout.spec.ts). Seeds a cart via the store API + cookie
(no fragile add-to-cart driving) and asserts the checkout renders in the main column, the billing toggle
works, India vs international shipping/payment render correctly, and empty-cart is graceful.

```bash
npm run test:e2e        # headless (reuses local dev server; starts one in CI)
npm run test:e2e:ui     # interactive
```

## Known enhancements (not blocking)

- **Local-currency subscript** under the USD price (IP-based, display-only) — see task #7.
- **Reactive shipping re-fetch** when a customer changes country *mid-checkout across the India/intl
  boundary** — options are correct for the cart's region on load; live cross-region switching isn't wired.
- International shipping rate is a **$25 placeholder** — confirm the real rate.
