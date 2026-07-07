# PariharaOnline — Storefront (V4)

Production storefront for **pariharaonline.com** — a Next.js App Router frontend backed by a
Medusa v2 commerce backend, deployed on Vercel. Includes the "Ask Parihara" AI chat, blog,
astrology services, and multi-region (India-default) checkout with PayPal/Razorpay.

> **Read [`docs/PROJECT.md`](docs/PROJECT.md) first** — it documents the full tech stack,
> where everything is hosted, and the environment-variable reference. Start there before
> making infrastructure or deployment changes.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Requires Node 20+ and the environment variables listed in [`.env.example`](.env.example)
(copy to `.env.local` and fill in real values — never commit secrets).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server on :3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (also see `next.config.js` → `eslint.ignoreDuringBuilds`) |
| `npm run test:e2e` | Playwright checkout E2E suite (reuses dev server locally) |
| `npm run medusa:unlock` / `:lock` / `:status` | Arm/disarm the gated Medusa admin window (Keychain) |

## Checkout & commerce

The cart → checkout → payment → fulfillment flow is production-hardened and E2E-tested. Highlights
(full detail in [`docs/CHECKOUT.md`](docs/CHECKOUT.md)):

- **Region & currency** by visitor IP — India → INR, elsewhere → USD, with a local-currency hint
  (subscript) on international prices for reference.
- **One-page checkout** — delivery address (IP-populated country), country-based **Medusa shipping**
  (India: Free / donate; International: $32 Speedpost-FedEx / donate), billing-address toggle, and
  payment (India → Razorpay; International → Razorpay default + PayPal).
- **Sankalpam** (devotee/nakshatram/rasi/gothram) is stored on **order line items** for temple staff.
- **Completion screens** — thank-you with per-item sankalpam; graceful error screen with WhatsApp +
  `hello@pariharaonline.com`. All payment failures are logged (`area:"checkout"`).

## Documentation

All project docs live in [`docs/`](docs/):

- [`docs/PROJECT.md`](docs/PROJECT.md) — **stack, hosting, and env-var reference** (start here)
- [`docs/CHECKOUT.md`](docs/CHECKOUT.md) — cart → checkout → payment → fulfillment flow, region/currency, shipping, sankalpam, tests
- [`docs/parihara-features.md`](docs/parihara-features.md) — feature notes
- [`docs/frontend-dependency.md`](docs/frontend-dependency.md) — dependency notes
- [`docs/design/`](docs/design/) — design source (Parihara-Final.html, hi-fi refs)

Internal working notes `docs/PLAN.md` and `docs/SESSION_HANDOFF.md` are **gitignored**
(local-only, contain internal details) and are not part of the repo.

> Note: some `.md` files are **runtime source, not docs** — `src/lib/parihara-soul.md` and
> `src/lib/order-knowledge.md` are read by the Ask Parihara chat, and `content/blog/*.md` are
> blog posts. Do not move these into `docs/`.

## Package manager

This repo standardizes on **npm** (`package-lock.json`, pinned via `packageManager`). Do not
add a `yarn.lock` or `pnpm-lock.yaml` — a single lockfile keeps Vercel builds reproducible.
