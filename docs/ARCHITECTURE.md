# Parihara Frontend — Architecture Notes

Living reference for how the non-obvious subsystems actually work, so decisions
aren't re-litigated from scratch. Last verified: 2026-07-08.

---

## 1. Authentication / Sign-in

There are **two independent auth systems** in the codebase. This is important —
they are not the same thing.

### A. NextAuth (social + credentials) — `src/lib/auth.ts`, route `src/app/api/auth/[...nextauth]/route.ts`
- **Google OAuth** — wired via `next-auth/providers/google`, using
  `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`. The current client ID belongs to
  **GCP project number `414962747830`** (`…-c718cah7….apps.googleusercontent.com`).
  *Which Google account owns that project must be checked in the Google Cloud
  Console — it cannot be derived from the code.*
- **Credentials** — email/password, which internally POSTs to Medusa's
  `/auth/customer/emailpass`.
- **Facebook** — only loads if `FACEBOOK_CLIENT_ID`/`SECRET` are set (currently not).
- The NextAuth **session (`session.user.email`) is what the Ask-Parihara chat
  uses as identity** for saving/retrieving history.

### B. Medusa customer auth — `src/lib/data/customer.ts`
- `signup()` / `login()` server actions using Medusa's `emailpass` provider; sets
  a Medusa JWT cookie. This is what backs the account pages, orders, addresses.

### Known gap (verify before enabling accounts broadly)
A **Google sign-in creates a NextAuth session but does NOT automatically create a
Medusa customer record.** So a Google user gets chat identity, but order/address
history tied to a Medusa customer may not be linked. If accounts are enabled for
commerce (not just chat), this linkage needs wiring.

### Current UI state
- Sign-in is **hidden from the top nav** — `src/modules/layout/templates/nav/index.tsx:61`
  (`{/* Sign in hidden for now — accounts to be enabled later. */}`).
- Sign-in still surfaces in:
  - **Ask-Parihara chat** — `src/components/chat/chat-interface.tsx` (a
    `suggestSignIn` nudge card + booking-form "Sign in to auto-fill" →
    `/account/signin`).
  - **Cart** — `src/modules/cart/components/sign-in-prompt/index.tsx` exists but
    is **not currently imported** anywhere.
- Full sign-in page lives at `/[countryCode]/account/signin`.

### Google Cloud Console config required for live Google sign-in
- **Authorized JavaScript origins:** `https://www.pariharaonline.com`,
  `https://pariharaonline.com`, `http://localhost:3000`
- **Authorized redirect URIs:**
  `https://www.pariharaonline.com/api/auth/callback/google`,
  `https://pariharaonline.com/api/auth/callback/google`,
  `http://localhost:3000/api/auth/callback/google`
- **OAuth consent screen:** publish to *Production* (else only test users can sign
  in), authorized domain `pariharaonline.com`, scopes `openid email profile`.
- **Vercel env:** `NEXTAUTH_URL=https://www.pariharaonline.com`, `NEXTAUTH_SECRET`,
  `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

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

### Follow-up option (not built) — Option 2: buyer-currency + recipient-anywhere
To let an international (USD) buyer physically send prasad to India while still
paying USD: keep the cart in the buyer's region, add a "send to a different
recipient (incl. India)" block, store that recipient address as **order metadata**
(same pattern as sankalpam), add a USD "international prasad to India" shipping
option, and surface the recipient address in the admin. Medusa's own
`shipping_address` stays region-valid. Green-light this if intl→India gifting is common.
