# Storefront layouts: how the pages fit together (Oct 2026)

Read this before changing product, home, cart or checkout pages. Everything here is storefront-only:
it reads standard Medusa fields (title, description, images, variants, metadata), so Medusa upgrades
don't break it. Production builds from `main`; `v4_july2026` is the working branch.

## Product pages: three templates, one URL scheme

`src/modules/products/templates/index.tsx` picks the template by product handle:

| Template | When | File |
|---|---|---|
| **Landing** (single column conversion page) | handle is in `LANDING_PRODUCTS` (`src/lib/data/landing-products.ts`): Garbharakshambigai ghee + oil, Rahu-Ketu at Sri Kalahasti, Shirdi udi | `templates/landing-spread.tsx` |
| **Pooja Bundle** (checkbox list of other products) | handle is in `PRODUCT_BUNDLES` (`src/lib/data/product-bundles.ts`): Navratri | `templates/product-spread.tsx` (bundle mode) |
| **Spread** (everything else) | default | `templates/product-spread.tsx` |

- **Landing**: no breadcrumb (a small "← Back" link instead, `components/back-link`), ✓ trust line,
  temple paragraph, "What you receive" / "What happens when you book" (config `receive`), parcel and
  usage-guide photos picked by file name (`packag…`, `booklet|guide`), who it's for, how to use, booking
  card (with `quantityTip`), remaining photos, review, details folded. `kind: "pooja" | "prasadam"`
  switches wording. Desktop: story left, order card sticky right (`.pland*` in globals.css).
- **Spread**: desktop = story left, booking card sticky right; phones = title → swipe gallery → card →
  story folded behind "Read more" (`components/spread-mobile`).
- **Bundle**: each ticked item is its own cart line (`addManyToCart` in `src/lib/data/cart.ts`).
  Phones: brand-coloured bar "N selected · Select poojas" opens a bottom sheet with the checklist; the
  button never changes, so the sheet can always be reopened; added items show "✓ In cart".

## Product descriptions (Medusa text → sections)

`src/lib/util/description-blocks.ts` turns the plain description into sections. Supported markup:
`## Heading`, `> sloka line`, `- bullet`. It also understands older Shopify-era text: short lines
ending in `:`/`?` are headings, `Label: text` lines split into heading + paragraph, a lone `-` line
means the next line is a bullet, and `Keywords` sections are hidden. Meta/JSON-LD use
`src/lib/util/description-text.ts` (intro only / markup stripped).

## Phone buy bar (all products)

`components/product-actions/mobile-actions.tsx`: always visible on phones, logo brown (`--sindoor`)
with the logo gold button, rounded top corners. Tapping opens a sheet (photo, name, price, options,
quantity, Add). `body` gets bottom padding while it's on screen. Desktop has no bar (card is sticky).

## Images

`src/modules/common/components/safe-image`: 3:2 frame; wider photos take their own shape; square and
portrait photos are shown whole over a blurred copy of themselves. Never crops heads.

## Home page

`src/modules/home/templates/home-v3.tsx` + `components/home-hero`: proof line, hero line with the
"Vedic homams" explainer (`components/term-tip`: hover bubble on desktop, centred pop-up with ✕ on
touch), intent tiles, seasonal banner, "Most ordered", Ask Parihara, then videos (tap-to-load YouTube,
`components/lite-youtube`), astrology, blog, FAQ.
- Seasonal banner: `SEASONAL_CALENDAR` in home-v3 (date window, IST) **or** product metadata
  `featured_until` = YYYY-MM-DD (+ optional `featured_label`) set in Medusa admin.
- "Most ordered": `TOP` in `home-hero` (from real order counts, Jul–Oct 2026).

## Cart and checkout

- Cart names/star are optional (`modules/cart/components/checkout-section`); the order-confirmed page
  asks for sankalpam details on WhatsApp.
- Non-India (USD) visitors see the estimated $32 international prasadam delivery before checkout:
  `src/lib/shipping-estimate.ts` (keep in sync with the Medusa shipping option).
- Checkout (`modules/checkout/templates/one-page-checkout`): phone summary shows "Items + delivery",
  WhatsApp help links, browser autofill on every field, postcode label/keypad by country.

## Analytics (GA4)

- Tag loads in `src/app/layout.tsx` from `GA4_ID` in `src/lib/analytics.ts` (live: `G-78BCF56K29`).
  `.env.local` sets `NEXT_PUBLIC_GA4_ID=` (blank) on purpose, so local testing sends nothing.
- Ecommerce events via `trackEcommerce()` in `src/lib/analytics.ts`:
  `add_to_cart` (product actions, bundle), `begin_checkout` (cart → checkout), `purchase` (order-confirmed
  page, `modules/order/components/ga-purchase`, once per order via localStorage).

## Other pages

- Browse (`modules/collections`): need chips + 2-column phone grid; `?need=health` preselects a chip.
- Festival calendar: `/calendar`, data in `src/lib/data/festival-calendar.ts` (verified dates; add next
  year's with sources in `content/blog-plan/festival-calendar-2026-27.md`).
