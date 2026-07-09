# Session Handoff — pariharaonline.com launch hardening (through 2026-07-09)

Paste this into a new thread to resume. Also read **`docs/ARCHITECTURE.md`** (auth,
chat, region/currency, Google OAuth gotchas) — it's the living reference.

## Repos, branches, dirs
- **Frontend (Next.js 14 storefront):** `/Users/manihk/Documents/02_agenticcoding/parihara-frontend`
  - Branches **`main`** and **`v4_july2026`** are kept **identical** — every push goes to both.
  - Latest frontend HEAD: **`d269d09`**.
- **Backend (Medusa v2):** `/Users/manihk/Documents/02_agenticcoding/phara-backend-medusa`
  - Branch **`main`**. Latest backend HEAD: **`dfbb6de`**.
- Live site: **https://www.pariharaonline.com** (Vercel). Backend: **https://pariharaonline.medusajs.app** (Medusa Cloud, **Develop $29** plan).
- DB for chat: **Neon** (Postgres). Cache/OAuth-state: **Upstash Redis** (external — Develop plan has no managed Redis).

## Build/verify notes
- Frontend: `npm run build`. **Don't build while `npm run dev` runs** (corrupts `.next` — `rm -rf .next` + restart dev after).
- Backend: `npx --yes yarn@1.22.22 build`.
- Gated Medusa admin API access: `node scripts/medusa-toggle.mjs unlock` (30-min window) + `bash scripts/medusa-admin.sh GET "<path>"` (key in macOS Keychain `parihara-medusa-admin`).
- Price units are **MAJOR** (₹8450 = 8450) — never ÷100/×100 in display.

## What shipped this session (frontend commits)
1. `4b0baee` — Fix charge≠order-total: shipping-option prices had swapped currencies (Intl "donate" had no USD price → setShippingMethod failed → cart kept $32 default). Fixed data via `scripts/fix-shipping-prices.mjs` + charge the authoritative `cart.total`.
2. `9cc6ece` — Checkout currency anchored to the **browsing region, never the shipping address** (country selector limited to region countries; `chooseCountry` no longer switches region). Re-enabled nav "Sign in". Added `docs/ARCHITECTURE.md`. Single-variant products no longer append `?v_id`.
3. `8a5f073` — **"Ship prasadam to India" escape hatch**: checkbox at top of the delivery-address section (non-India carts); when on, the fields become the buyer's *billing* address (cart stays USD) and a free-text India delivery address is saved to order metadata (`ship_to_india`, `india_delivery_address`); a $0 "Prasadham delivery to India" option is auto-applied and hidden from normal cards.
4. `324d878` — **Auth cutover NextAuth → Medusa** (Google + email). Chat identity via `retrieveCustomer` (keyed by email). `/api/me` probe for client components. Admin gate = signed-in customer whose email ∈ `ADMIN_EMAILS`. Removed NextAuth (`lib/auth`, `[...nextauth]`, SessionProvider). `next-auth` still in package.json (unused — safe to drop).
5. `27652d7` — Fix `/account/*` 404s (parallel-route slots `@dashboard`/`@login` lacked `default.tsx`; account layout now renders `children`).
6. `0054a4c` — Chat sidebar dead link `/api/auth/signin` → `/account/signin`; surface real Google errors; attribute logged-in chats at write time.
7. `00f6510` — Chat DB schema **auto-creates on first use** (`ensureSchema` was never called → empty Neon).
8. `341140e` — Google flow moved **server-side / same-origin** (`/api/auth/google/start` + `/api/auth/google/callback`) to kill browser→backend CORS ("Failed to fetch").
9. `68c7072` — `/api/auth/google/start` forced **dynamic** (`force-dynamic` + no-store); it was statically cached and served one stale OAuth state to everyone → "No state provided".
10. `2db7500` — **Temporary launch banner** on all pages (`src/components/top-banner.tsx`, mounted in `src/app/layout.tsx`) + **removed the registered office street address** everywhere (contact, about, privacy, terms, footer, Organization JSON-LD). Kept entity name "Harkarma Enterprises LLP".
11. `d269d09` — Support number normalized to **`+91-97432 44501`** everywhere; banner uses shared `src/lib/contact.ts` (`CONTACT`, single source).

## What shipped this session (backend commits)
- `17c64cf` — Auto-capture payment on `order.placed` (`src/subscribers/order-payment-capture.ts`) + **Sankalpam details** admin card (`src/admin/widgets/sankalpam-details.tsx`, order.details.side.after) — gothram was never "missing", just buried in the devotees JSON.
- `da2a610` — **🚚 SHIP PRASADAM TO INDIA** admin banner (`src/admin/widgets/ship-to-india.tsx`, order.details.before) + India address in the order-placed email (`src/modules/resend/templates.ts`; `order-placed.ts` now fetches order `metadata`).
- `805769e` — **Ask Parihara chat admin page** (`src/admin/routes/chat-sessions/page.tsx` + `src/api/admin/chat-sessions/[id]`; reads Neon via `pg` + `CHAT_DATABASE_URL`) + explicit **auth module** with emailpass + Google (`@medusajs/medusa/auth-google`, env-guarded).
- `62293ab` → `dfbb6de` — Wire **Redis cache** for OAuth state (`CACHE_REDIS_URL`); scoped to the **cache module only** (event-bus/workflow are Cloud-managed on higher plans — don't double-configure).

## Environment variables (must exist)
**Frontend (Vercel, runtime):**
- `NEXT_PUBLIC_GA4_ID=G-GJX2GCC47T`, `NEXT_PUBLIC_CLARITY_ID`
- `DATABASE_URL` = Neon chat DB (**set**; tables created manually via SQL — see ARCHITECTURE §2)
- `ADMIN_EMAILS` = comma-separated admin emails (for `/admin` gate)
- `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, `NEXT_PUBLIC_BASE_URL=https://www.pariharaonline.com`, Razorpay/PayPal keys, `ANTHROPIC_API_KEY`
- (NextAuth vars now unused — can delete)

**Backend (Medusa Cloud, runtime):**
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL=https://www.pariharaonline.com/account/google-callback`
- `CHAT_DATABASE_URL` = same Neon URL as frontend `DATABASE_URL` (admin chat page reads it)
- `CACHE_REDIS_URL` = Upstash `rediss://…` (OAuth state cache — **user set this**)
- `RESEND_API_KEY`, `RESEND_FROM`, `AUTH_CORS`/`STORE_CORS`/`ADMIN_CORS` (include www+apex), `JWT_SECRET`, `COOKIE_SECRET`, `DATABASE_URL` (Medusa's own Postgres — different from Neon)

**Google Cloud Console (OAuth client, project `414962747830`):**
- Authorized redirect URI: `https://www.pariharaonline.com/account/google-callback` (+ `http://localhost:3000/account/google-callback`).

## Verified working (by live tests)
- DNS fully propagated (Google/Cloudflare/OpenDNS all return correct Vercel records). India "not loading" was NOT DNS.
- Chat persistence: guest chat writes to Neon + reads back (after `DATABASE_URL` set + tables created).
- Google OAuth **state now persists** across instances (Upstash Redis) AND the start route mints a **fresh** state per call (dynamic fix) — confirmed via the state-persistence test.

## OPEN / TO DO (next thread)
1. **Final Google sign-in browser test** — do the real click-through on the live site: Continue with Google → consent → lands logged in on `/account`; a first-time Google user should create a **Medusa customer** (check Medusa admin → Customers). All infra verified; only the real-code round-trip (customer-create + token refresh in `/api/auth/google/callback`) is unconfirmed. If it errors, the callback page shows the message.
2. **Refund the earlier live ₹/$1 Razorpay test charge(s)** (flagged).
3. **Place a real test order** end-to-end to confirm the whole flow (payment → order → auto-capture → email → admin widgets).
4. **Remove the temporary launch banner** once migration settles: delete `src/components/top-banner.tsx` + the `<TopBanner />` line and import in `src/app/layout.tsx`.
5. Optional cleanup: remove unused `next-auth` from `package.json`.
6. Ensure the latest **backend deploy** is live (sankalpam card, auto-capture, chat admin, Google auth, Redis).

## Handy verification snippets
```bash
# Google OAuth state persistence (should print "Could not exchange token", NOT "No state provided")
PUB=<publishable key>; BE=https://pariharaonline.medusajs.app; SITE=https://www.pariharaonline.com
state=$(curl -s "$SITE/api/auth/google/start" | grep -oE 'state=[a-f0-9]{16,}' | head -1 | sed 's/state=//')
curl -s "$BE/auth/customer/google/callback?code=DUMMY&state=$state" -H "x-publishable-api-key: $PUB"

# Chat persistence (guest): POST a message then read it back
SID="check-$(date +%s)"
curl -s -X POST "$SITE/api/chat" -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SID\",\"messages\":[{\"role\":\"user\",\"content\":\"test\"}]}" -o /dev/null
sleep 5; curl -s "$SITE/api/chat/history/$SID"
```

## Memory (auto-loaded) already records
Currency rule, price-units=MAJOR, typography (DM Serif + Inter, no italics), branch/deploy workflow, go-live config, checkout status, backend ops. See `~/.claude/.../memory/MEMORY.md`.
