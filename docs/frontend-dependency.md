# Frontend ↔ Medusa Backend: Dependency Reference

This document describes exactly what the PariharaOnline Next.js frontend expects from the Medusa backend. Written for the backend developer to understand which endpoints are called, what fields must be returned, and where custom logic lives.

---

## 1. SDK & Connection

**Package:** `@medusajs/js-sdk` v2.x  
**Initialized in:** `src/lib/config.ts`

```ts
const sdk = new Medusa({
  baseUrl: process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
```

**Required env vars on frontend:**
| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Backend base URL |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Storefront publishable key |
| `NEXT_PUBLIC_DEFAULT_REGION` | Default country code (`in`) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay client key |
| `RAZORPAY_KEY_SECRET` | Razorpay server secret (Next.js API route only) |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal server secret (Next.js API route only) |
| `NEXT_PUBLIC_PAYPAL_SANDBOX` | `"true"` = sandbox PayPal |

All data calls are **server-side** (`"use server"` functions). The frontend does not call Medusa directly from the browser — everything goes through Next.js Server Actions or Server Components.

---

## 2. Regions & Routing

**Endpoint used:** `GET /store/regions`  
**Called from:** `src/lib/data/regions.ts`

The middleware (`src/middleware.ts`) detects the user's country and rewrites/redirects URLs:

- **India (default):** URLs are clean — `/products/foo`, `/store`, etc. Internally rewritten to `/in/products/foo`.
- **Other countries:** URL prefix added — `/us/products/foo`.
- **Country detection order:** `admin_region_override` cookie → Vercel `x-vercel-ip-country` header → default `in`.
- **Region cache:** Refreshed every 60 minutes via `Date.now() / 60000`.

**What the frontend needs from regions:**
```ts
{
  id: string
  name: string
  currency_code: string        // "inr", "usd" etc.
  countries: [{ iso_2: string }]
  payment_providers: [{ id: string }]
}
```

The country code from the URL segment maps to a region. If `getRegion("in")` returns null, the product page 404s.

---

## 3. Products

**Endpoint used:** `GET /store/products`  
**Called from:** `src/lib/data/products.ts`

**Fields requested on every product fetch:**
```
*images
*collection
*categories
*options
*variants.calculated_price
*variants.images
+variants.inventory_quantity
+metadata
+tags
handle
title
description
thumbnail
```

**What the frontend renders from product data:**

| Field | Used for |
|---|---|
| `title` | Page title, breadcrumb, h1 |
| `description` | Split on `\n\n`, rendered as paragraphs in "About This Ritual" |
| `thumbnail` | OG image, fallback display |
| `images[].url` | Gallery (first 2 full-width, rest 2-col grid) |
| `variants[].calculated_price` | Displayed price (INR or USD depending on region) |
| `variants[].options` | Option selector UI (e.g. "Number of priests") |
| `variants[].inventory_quantity` | Stock check for add-to-cart button state |
| `collection.title` / `collection.handle` | Breadcrumb + collection link |
| `metadata` | Puja-specific fields (see §8) |
| `handle` | URL slug |

**Price display:** `calculated_price` is a pre-formatted string from Medusa (e.g. `"₹2,100"` for India, `"$25.00"` for US). The frontend renders this directly — no client-side currency conversion.

**Variant selection:** When the user picks an option (e.g. a variant), `?v_id={variantId}` is appended to the URL. The server re-fetches images for that variant if `variant.images` exists, otherwise falls back to all product images.

---

## 4. Cart

**Endpoints used:** `POST/GET /store/carts`, `POST /store/carts/:id/line-items`, etc.  
**Called from:** `src/lib/data/cart.ts`

### Cart fields retrieved

```ts
*items.variant.product.collection
*items.variant.product.categories
*items.variant.product.tags
*items.variant.product.handle
*items.variant.product.metadata
*items.variant.options.value
*items.variant.option_values
+items.variant.inventory_quantity
*shipping_address
*billing_address
*shipping_methods.shipping_option
*payment_collection.payment_sessions
region.id
region.name
region.currency_code
region.countries
region.payment_providers
region.fulfillment_providers
promotions.code
```

### Cart flow

1. `getOrSetCart(countryCode)` — creates cart if none exists, updates region if country changes. Cart ID stored in `_medusa_cart_id` cookie.
2. `addToCart({ variantId, quantity, countryCode, metadata })` — adds line item with optional puja metadata.
3. `setAddresses(formData)` — sets shipping + billing address, called from checkout address step.
4. `listCartOptions()` → `setShippingMethod({ cartId, shippingMethodId })` — selects shipping.
5. `placeOrder(cartId)` — completes cart, creates order, clears cart cookie, redirects to `/order/confirmed/{orderId}`.

### Puja metadata on cart items

When adding to cart, the frontend attaches:
```ts
{
  devotees: JSON.stringify([{ name, nakshatram, rasi, gothram }]),
  devotee_name: "comma separated names",
  date_preference: "string or undefined",
  sankalpam_notes: "string or undefined",
}
```
Medusa must store this as line item metadata and return it in order retrieval.

---

## 5. Checkout & Payments

### Payment providers expected in region

The frontend renders different payment UI based on `payment_providers` in the region:

| Provider ID | UI rendered |
|---|---|
| `pp_razorpay_razorpay` | Razorpay modal (India) |
| `pp_paypal_paypal` | PayPal button (international) |

### Razorpay flow (India)

Payment is handled **outside Medusa's payment session** — directly via Next.js API routes:

1. **`POST /api/payments/razorpay/create-order`** — calls Razorpay API with `amount` (paise) and returns `{ id, amount, currency, ... }`.
2. Client opens Razorpay checkout modal with the order ID.
3. On success: **`POST /api/payments/razorpay/verify`** — verifies HMAC signature using `razorpay_order_id|razorpay_payment_id` + key secret.
4. After verification: `placeOrder()` is called to complete the Medusa cart.

**Important:** The Razorpay integration does not currently use Medusa's payment session (`/store/payment-sessions`). The payment is verified independently and then the cart is completed. If the backend adds a Razorpay plugin that creates payment sessions, the frontend will need updating.

### PayPal flow (international)

Similarly handled via Next.js API routes:

1. **`POST /api/payments/paypal/create-order`** — gets OAuth token, creates PayPal order, returns `{ id, status }`.
2. Client completes PayPal flow.
3. **`POST /api/payments/paypal/capture-order`** — captures the PayPal payment.
4. After capture: `placeOrder()` completes the Medusa cart.

---

## 6. Orders

**Endpoints used:** `GET /store/orders/:id`, `GET /store/orders`  
**Called from:** `src/lib/data/orders.ts`

**Fields retrieved:**
```
*payment_collections.payments
*items.variant.product
*items.metadata
*items.variant.options
```

Used in:
- `/order/confirmed/:id` — order confirmation page
- `/account/orders` — customer order history
- Ask Parihara AI agent's `queryOrderStatus` tool (looks up order by ID or email)

**Order transfer endpoints** also used: `POST /store/orders/:id/transfer`, accept/decline variants.

---

## 7. Customer Authentication

**Called from:** `src/lib/data/customer.ts`

| Action | Method |
|---|---|
| Register | `sdk.auth.register("customer", "emailpass", { email, password })` |
| Login | `sdk.auth.login("customer", "emailpass", { email, password })` |
| Logout | `sdk.auth.logout()` |
| Get customer | `sdk.store.customer.retrieve()` |
| Update profile | `sdk.store.customer.update(body)` |
| Add address | `sdk.store.customer.addresses.create(address)` |
| Delete address | `sdk.store.customer.addresses.delete(id)` |

Auth token stored in `_medusa_jwt` cookie (httpOnly, 7-day expiry, sameSite=strict).

After login/register, `transferCart()` links the anonymous cart to the authenticated customer via `sdk.store.carts.transferCart(cartId)`.

**NextAuth is also present** (`next-auth` v4) for Google SSO — this is a separate auth layer used for the "Ask Parihara" chat page sign-in. It does NOT interact with Medusa customer auth. These are two independent auth systems currently.

---

## 8. Custom Metadata Fields

The backend must store and return these custom fields:

### Product metadata
The frontend reads `product.metadata` to look up mock content keyed by product handle. Currently most content is mock data in `src/lib/mock-storefront.ts`. As real content is added to Medusa, the frontend will read it from metadata. Fields that will be migrated:
- `effective_for` — comma-separated list of what the ritual addresses
- `review_text`, `review_author` — testimonial
- `included` — what's included (pipe or JSON-separated)

### Line item metadata (puja details)
```ts
{
  devotees: string          // JSON array of devotee objects
  devotee_name: string      // comma-separated names (for display)
  date_preference?: string  // preferred ritual date
  sankalpam_notes?: string  // additional notes
}
```

### Cart metadata
```ts
{
  devotee_count: number
  date_preference?: string
  sankalpam_notes?: string
}
```

---

## 9. Collections & Categories

**Endpoints used:**
- `GET /store/collections?handle=pujas-and-homams`
- `GET /store/product-categories`

The `/collections/pujas-and-homams` route is the primary browse page. The frontend lists products filtered by collection handle. The nav link points to this URL.

---

## 10. Caching Architecture

All data fetching uses Next.js `force-cache` with revalidation tags:

| Tag | Invalidated when |
|---|---|
| `products` | Any product mutation |
| `carts` | Cart add/update/delete |
| `customers` | Profile or address update |
| `orders` | Order placed or updated |
| `fulfillment` | Shipping method set |

Tags are scoped per session using a `_medusa_cache_id` cookie so different users never share cached data.

---

## 11. What the Backend Must Have Configured

For the frontend to work end-to-end, the Medusa backend needs:

1. **India region** with `country: in`, currency `INR`, at least one payment provider ID matching `pp_razorpay_razorpay` (or whatever the Razorpay plugin registers).
2. **US/international region** with `country: us`, currency `USD`, PayPal provider.
3. **Publishable API key** — set in `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.
4. **Product variants with calculated prices** — every variant must have a price set for each region's currency. If a variant has no price for the current region, the add-to-cart button is disabled.
5. **Shipping options** configured per region — the checkout delivery step lists these.
6. **Stock management** — `inventory_quantity > 0` or `manage_inventory: false` for add-to-cart to be enabled.
7. **CORS** — must allow the frontend domain (localhost:3000 in dev, Vercel URL in prod).

---

## 12. Ghost URL Redirects

The middleware handles legacy/alternate slugs with 301 redirects to canonical URLs:

| From | To |
|---|---|
| `/products/garbharakshambika-ghee` | `/products/garbarakshambigai-ghee` |
| `/products/annadhanam-donate-food-*` | `/products/annadhanam-food-donation` |
| `/products/sudarsana-homam` | `/products/sudarshana-homam` |
| `/products/rahu-ketu-*` (several variants) | `/products/rahu-ketu-pooja` |

These are hardcoded in `src/middleware.ts`. If product handles change in Medusa, add a redirect here.

---

## 13. Ask Parihara AI — Medusa Touchpoints

The AI chat agent (`src/app/api/chat/route.ts`) has a `queryOrderStatus` tool that calls:

```ts
sdk.store.orders.list({ fields: "id,display_id,status,items,total,created_at" })
```

This requires the user to be authenticated (auth header passed through). The agent also has a `recommendProducts` tool that calls `listProducts()` with a search query.

If a `MEDUSA_ADMIN_JWT` env var is set, the agent can look up orders by customer email without the customer being logged in (admin-level lookup). This is not currently set but is planned.

---

*Last updated: May 2026. Frontend branch: `v3`.*
