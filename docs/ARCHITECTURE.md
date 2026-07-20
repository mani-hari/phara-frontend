# Parihara Frontend — Architecture Notes

Living reference for how the non-obvious subsystems actually work, so decisions
aren't re-litigated from scratch. Last verified: 2026-07-08.

---

## 1. Authentication / Sign-in — Medusa only (NextAuth removed 2026-07-08)

There is now **one** auth system: Medusa's own customer auth. NextAuth was fully
removed (`src/lib/auth.ts`, the `[...nextauth]` route, `SessionProvider`).

### How it works
- **Email/password** — `login()` / `signup()` server actions in
  `src/lib/data/customer.ts` use Medusa's `emailpass` provider and set the
  **httpOnly `_medusa_jwt` cookie** (read server-side via `getAuthHeaders`).
- **Google** — the sign-in/register pages call `sdk.auth.login("customer",
  "google")` and redirect to Google. Google returns to
  **`/account/google-callback`** (client page) which calls
  `sdk.auth.callback(...)`, creates the customer on first login
  (`sdk.store.customer.create`), refreshes the token, and hands it to the
  `persistAuthToken` server action to set the cookie. Provider is configured on
  the **backend** (`phara-backend-medusa` `medusa-config`, `@medusajs/medusa/auth-google`).
- **Identity is unified:** the same Medusa customer backs orders, addresses, AND
  the Ask-Parihara chat. Chat is keyed by **customer email** (chat routes call
  `retrieveCustomer`); client components read auth state via **`/api/me`**.
- **Admin gate:** `/admin` page + the floating `AdminBar` = a signed-in Medusa
  customer whose email is in **`ADMIN_EMAILS`**. `AdminBar` gets admin state as a
  prop from the server `layout.tsx` (no client-side session).

### Required config (all on the BACKEND env + Google Cloud)
- Backend env: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `GOOGLE_CALLBACK_URL=https://www.pariharaonline.com/account/google-callback`.
- Google Cloud **Authorized redirect URI** = that exact callback URL (+
  `http://localhost:3000/account/google-callback` for dev). NOT the backend URL.
- Frontend env: `ADMIN_EMAILS` (comma-separated) for the admin gate.
- The three strings (Google Cloud redirect URI, backend `GOOGLE_CALLBACK_URL`,
  the storefront page path) must be **identical** or Google returns
  `redirect_uri_mismatch`.

### Google OAuth gotchas (both hit + fixed 2026-07)
1. **Shared cache is REQUIRED.** Medusa stores the OAuth `state` in the CACHE
   module (`cache.set(stateKey,…,1200s)`). The default in-memory cache isn't
   shared across backend instances → start and callback land on different
   instances → "No state provided, or session expired". The Develop ($29) Cloud
   plan does NOT include managed Redis (that's Launch+), so we point the CACHE
   module at an external **Upstash Redis** via `CACHE_REDIS_URL` on the backend
   (`medusa-config` wires ONLY cache-redis — event-bus/workflow are Cloud-managed
   on higher plans and must not be double-configured).
2. **`/api/auth/google/start` must be `force-dynamic`.** As a plain GET route
   handler it was statically cached and served ONE stale state to everyone →
   also "No state provided". Marked `dynamic = "force-dynamic"` + `no-store`.
3. The whole exchange is same-origin/server-side (`/api/auth/google/start` +
   `/api/auth/google/callback`) to avoid browser→backend CORS ("Failed to fetch").

### Sign-in entry points
- Top nav "Sign in" → `/account/signin`. Ask-Parihara chat shows a sign-in nudge.
- `src/modules/cart/components/sign-in-prompt/index.tsx` exists but is unused.
- `next-auth` is still in `package.json` (unused) — safe to drop later.

---

## 2. Ask-Parihara chat + history

- **Model:** `claude-haiku-4-5-20251001` (`src/app/api/chat/route.ts`).
- **Storage is dual:**
  - **Browser localStorage** (`ph_chat_history`) — `src/lib/chat-history.ts`,
    capped at **`MAX_CONVERSATIONS = 30`** (not 10). Always on.
  - **Neon Postgres** — `src/lib/chat-store.ts`, tables `chat_sessions` +
    `chat_messages`, written **fire-and-forget** (never blocks the response).
    **Requires `DATABASE_URL`; if unset the whole DB layer silently no-ops.**
- **Context sent to Claude:** last **20** messages per request
  (`messages.slice(-20)`), a context-window trim, not a storage cap.
- **Signed-in users** get **cross-device history**: guest sessions are linked to
  the account on login (`linkSessionToUser`), and `getUserSessions` returns their
  last **30** sessions from Neon. **Guests** get localStorage-only (lost on
  clear/other device).
- ⚠️ **`DATABASE_URL` was NOT set in `.env.local`.** Confirm it's set on **Vercel
  (Production)** — without it, chat history is browser-only and nothing persists
  server-side / cross-device.

---

## 3. Regions, currency & the checkout shipping-address rule

### Medusa region model (the hard constraint)
- Two regions: **International (USD, 243 countries)** and **India (INR, 1 country)**.
- **A country belongs to exactly ONE region.** `in` is exclusively in the INR
  region. International does **not** include `in`.
- Medusa **enforces** `shipping_address.country_code ∈ region.countries`. Verified:
  setting an Indian address on a USD cart returns
  `400 "Country with code in is not within region International"`.

### Business rule (decided 2026-07-08)
**Currency must be determined by the visitor's access location (IP/region they
are browsing), NEVER by the shipping address.** A US visitor must keep seeing USD
even if they enter a foreign delivery address — Indian pricing (lower, because
domestic buyers are more price-sensitive) must never be revealed to
international visitors.

### The bug this replaces
`one-page-checkout` previously called `updateCart({ region_id })` when the
delivery country changed to another region (`chooseCountry`), which flipped
USD→INR and exposed Indian prices. That switch is being removed.

### Resolution chosen (2026-07-08) — Option 1: region-locked delivery country
`one-page-checkout` now limits the delivery-country selector to the **cart
region's own countries** (`selectableCountries = countries`) and `chooseCountry`
**no longer switches region** — it only sets the address country. Result:
- USD visitors keep USD and can ship to any of the 243 International countries.
- INR visitors keep INR and ship within India.
- Currency is impossible to leak, and every selectable country is region-valid
  (no more Medusa out-of-region 400s).

**Do NOT add `in` to the International region** to "fix" ship-to-India — a country
can only be in one region, so that would strip India from the INR region and
charge Indian visitors in USD. That destroys the pricing strategy.

### Cross-region delivery escape hatch (built 2026-07-08, generalized 2026-07-20)
A buyer can ship prasadam to a country **outside their billing region** without
changing the cart's currency. Both directions across the India boundary are
supported (the only place a country is out-of-region): a USD buyer shipping to
India, and an INR buyer shipping abroad. Implemented as a metadata escape hatch,
NOT a region change:
- **Checkout:** the delivery-country selector shows the **union of all regions'
  countries** (`allCountries`, built in `checkout/page.tsx`). Picking a country
  outside the cart's own region flips `outOfRegion`: the main form is treated as
  the **structured delivery address** (name, address 1/2, city, state, postal,
  phone) and a **region-valid billing address** is required below and becomes the
  cart's Medusa shipping/billing address (keeps currency correct). No checkbox —
  the country choice drives everything.
- **Metadata** written to cart/order: `alt_delivery: true`,
  `alt_delivery_country: "<iso>"`, `alt_delivery_address: "<JSON>"` (structured),
  plus legacy-compatible `ship_to_india` (true only for India destinations) and a
  human-readable `india_delivery_address` string.
- **Shipping:** two **hidden** options, applied automatically by `outOfRegion`
  and never shown as normal cards: **$0 "Prasadham delivery to India (free)"** in
  the International zone (USD→India), and **₹2,800 "International Shipping (from
  India)"** in the India zone (INR→abroad). Destination India is always free;
  destination outside India pays the intl rate (warehouse is in India).
- **Backend (phara-backend-medusa):** a loud "🚚 SHIP PRASADAM TO <COUNTRY>"
  banner widget at `order.details.before` and the address in the `order-placed`
  email (`shipToIndiaFor()` in `resend/templates.ts`) — both now read the
  structured `alt_delivery_address` and fall back to the legacy free-text field.
  The staff order-view (`routes/order-view/page.tsx`) shows the shipping method +
  cost.

Note: Medusa admin has no per-row list-badge injection zone, so the "badge" is
the top-of-order banner (impossible to miss on the detail page) rather than a
chip in the orders list.
