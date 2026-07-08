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

### "Ship prasadam to India" escape hatch (built 2026-07-08)
International (USD) buyers can send prasadam to an address in India without
leaking INR pricing. Implemented as a metadata escape hatch, NOT a region change:
- **Checkout:** a "Ship prasadam to an address in India?" checkbox at the top of
  the delivery-address section (non-India carts only). When ticked, the form
  fields become the buyer's **billing** address (region-valid → cart stays USD)
  and a free-text **India delivery address** is captured and written to cart/order
  metadata: `ship_to_india: true`, `india_delivery_address: "<text>"`.
- **Shipping:** a **$0 "Prasadham delivery to India (free)"** option lives in the
  International service zone (`so_01KX1YADK1ER…`). It's hidden from the normal
  shipping cards (an intl buyer could otherwise pick it to dodge postage) and
  auto-applied only when the checkbox is on. India delivery is always free.
- **Backend (phara-backend-medusa):** a loud "🚚 SHIP PRASADAM TO INDIA" banner
  widget at `order.details.before`, and the address is included in the
  `order-placed` confirmation email (`order-placed.ts` now fetches order
  `metadata`; `shipToIndiaFor()` in `resend/templates.ts`).
- **Verified** via store API: USD cart + India metadata + $0 option →
  total == item_total (no shipping added), metadata persisted.

Note: Medusa admin has no per-row list-badge injection zone, so the "badge" is
the top-of-order banner (impossible to miss on the detail page) rather than a
chip in the orders list.
