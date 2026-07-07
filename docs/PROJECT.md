# PariharaOnline — Project Reference

Single source of truth for the tech stack, hosting, and configuration of the
pariharaonline.com storefront. **No secret values live here — only names and locations.**

_Last updated: 2026-07-07._

## What this is

Customer-facing storefront for **pariharaonline.com** (temple pujas, prasadam, astrology
services). Next.js frontend + Medusa v2 commerce backend. Replacing the legacy Shopify store;
product URL slugs are kept identical to the old Shopify slugs so SEO/backlinks don't break.

## Tech stack

| Layer | Choice | Version / notes |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.28 |
| Language | TypeScript | — |
| UI | React | 18.3.1 |
| Styling | Tailwind CSS + autoprefixer | v3.4.x (`tailwind.config.js`, `postcss.config.js`) |
| Commerce backend | Medusa v2 | `@medusajs/js-sdk` 2.12.x |
| AI chat ("Ask Parihara") | Vercel AI SDK (`ai` v4) + `@ai-sdk/anthropic` | Anthropic direct (see note below) |
| Payments | PayPal, Razorpay, (Stripe key present), Medusa payments | — |
| Auth | NextAuth + Google/Facebook OAuth | — |
| Analytics | Google Analytics 4, Microsoft Clarity | — |
| Package manager | **npm** (pinned via `packageManager`) | single lockfile only |

> AI note: chat currently calls Anthropic directly via `@ai-sdk/anthropic`. On Vercel, routing
> through **Vercel AI Gateway** (plain `"anthropic/…"` model strings) is worth considering for
> observability + failover — not yet done.

## Hosting & infrastructure

| Component | Where | Notes |
|---|---|---|
| Frontend | **Vercel** | Deployed from GitHub `mani-hari/phara-frontend`. _TODO: confirm Vercel project name/team._ |
| Commerce backend | **Medusa Cloud** | `https://pariharaonline.medusajs.app` |
| Backend database | **TODO: confirm** (Neon? Medusa Cloud managed?) | Lives with the Medusa backend, not this repo |
| Product images | **Medusa Cloud S3** (`s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-…`) | Allowlisted in `next.config.js` via `MEDUSA_CLOUD_S3_*` |
| Legacy images | `cdn.shopify.com` | ⚠️ Being deprecated — see Known work |
| Repo | GitHub `mani-hari/phara-frontend` | active branch `v4_july2026` |
| Domain / DNS | pariharaonline.com | _TODO: confirm registrar + where DNS is managed_ |

## Environment variables

Full list with placeholders in [`.env.example`](../.env.example). Copy to `.env.local`
(gitignored) and fill real values. **Never commit secrets.** Categories:

- **Site:** `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_DEFAULT_REGION` (`in`), `NEXT_PUBLIC_ADMIN_EMAILS`
- **Medusa:** `MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (public), `MEDUSA_ADMIN_API_KEY` (🔒 secret, admin scripts), `MEDUSA_CLOUD_S3_HOSTNAME`, `MEDUSA_CLOUD_S3_PATHNAME`
- **Payments:** `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` (🔒), `NEXT_PUBLIC_PAYPAL_SANDBOX`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (🔒), `NEXT_PUBLIC_STRIPE_KEY`, `NEXT_PUBLIC_MEDUSA_PAYMENTS_*`
- **AI:** `ANTHROPIC_API_KEY` (🔒)
- **Auth:** `NEXTAUTH_SECRET` (🔒), `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (🔒), `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET` (🔒)
- **Analytics:** `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_CLARITY_ID`
- **Misc:** `EXCHANGE_RATE_API_KEY` (🔒), `REVALIDATE_SECRET` (🔒)

Secrets live in: local `.env.local` (dev) and **Vercel → Project → Settings → Environment
Variables** (preview/prod). Keep the two in sync.

## Repo conventions

- **`public/`** holds only site chrome (favicon, logos, `llms.txt`), fallback `mock-assets/`
  (shown when Medusa is unreachable), and `sample-reports/`. **No product/business images in
  `public/`** — product images are served from the Medusa backend (S3).
- **Runtime `.md` files (do NOT move):** `src/lib/parihara-soul.md` and
  `src/lib/order-knowledge.md` are read by the Ask Parihara chat; `content/blog/*.md` are blog
  posts. Documentation `.md` lives in `docs/`.
- **Config:** one each — `next.config.js`, `postcss.config.js`, `.eslintrc.js`. Don't
  reintroduce `.ts`/`.mjs` duplicates.
- **Middleware** (`src/middleware.ts`): India (`in`) is the default region served at clean URLs;
  other countries get a `/{cc}/` prefix. Holds ghost-URL 301 redirects (old handle → canonical
  slug).

## Product slugs (SEO-critical)

Medusa product `handle`s are kept **byte-identical to the pariharaonline.com Shopify slugs** so
existing SEO links don't break. As of 2026-07-07, 32/33 products match Shopify exactly (the
lone exception has no Shopify counterpart). If you add/rename a product, match the Shopify slug
or add a 301 in `GHOST_REDIRECTS`.

## Known / pending work

- **Rehost product images off `cdn.shopify.com` → Medusa S3.** Product thumbnails in Medusa
  still point at Shopify's CDN. Migrate them to Medusa-hosted images and drop `cdn.shopify.com`
  from `next.config.js` once done. (35 design images were uploaded to Medusa S3 on 2026-07-07;
  filename→URL map in `.slug-migration/image-uploads.json`, local only.)
- **Customer + order migration** from Shopify → Medusa (separate effort; needs Shopify read
  access + Medusa backend/DB access).
- **Confirm the TODOs above** (DB provider, Vercel project, DNS).
