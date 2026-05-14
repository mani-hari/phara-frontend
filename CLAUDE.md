# CLAUDE.md — Session Handoff & Project State

> **Read this first** if you're a new Claude session picking up work on this repo.
> This is the single source of truth for "what's been done, what's broken, what's next."
> Update it before you sign off each session.

**Last updated:** 2026-05-14
**Active branch:** `claude/dev_1.1`
**Default branch on GitHub:** `main`
**Branch policy:** push *only* to `claude/dev_1.1`. Never push to `main` directly — promote via PR or fast-forward merge once `claude/dev_1.1` is verified.

---

## Project overview

**PariharaOnline** is a Hindu religious services e-commerce site (poojas, homams, astrology, prasadam) currently on Shopify, being migrated to a custom Next.js + Medusa stack. Full project plan, requirements, URL inventory, analytics insights, and validation checklists live in `parihara-features.md` and the original revamp brief (search for "PariharaOnline.com — Website Revamp: Complete Project Plan" in conversation history).

**Stack:**
- Frontend: Next.js 14 + React 18 + Tailwind + TypeScript (this repo)
- Backend / Commerce: Medusa.js v2, hosted at `https://pariharaonline.medusajs.app` (admin UI at `/app` — DO NOT use `/app` as the API base)
- Hosting: Vercel (auto-deploys from GitHub)
- Payments: Razorpay (India, INR) + PayPal (international)
- AI Chat: Anthropic Claude API (planned, Sprint 4)
- Domain: `pariharaonline.com` (DNS will cut over to Vercel post-launch)

**Critical constraint:** URL slugs from the current Shopify site must be preserved exactly — this is gospel for SEO. Full slug inventory + ghost-URL 301 mapping is in the project brief.

---

## What's been accomplished this session

### Design system foundation (commit `a208019`)
- Ported the full Parihara V3 hi-fi design tokens from `docs/design/hifi-styles.css` into `src/styles/globals.css`:
  - Palette: `--paper`, `--cream`, `--ink`, `--sindoor`, `--gold`, `--sage` (warm Hindu-temple aesthetic)
  - Typography: Cormorant Garamond (serif, titles) + Inter (sans, body)
  - `.ph-*` component classes for buttons, chips, cards, image placeholders, kolam ornaments, gold rule, sticky bar
- Extended `tailwind.config.js` with matching color + font tokens so `bg-paper-2`, `text-sindoor`, `font-serif` utilities work alongside `.ph-*` classes
- Registered Cormorant Garamond as `--font-serif` in `src/app/layout.tsx`
- New brand primitive components in `src/modules/common/components/brand/`:
  - `Logo` (sun-mandala SVG + wordmark)
  - `KolamCorner`, `CenterSigil`, `GoldRule` (ornamental SVGs)
  - `SectionHeader`, `Stars`, `Img` (image placeholder), `Pulse`, `TrustRow`
- Floating "Ask Parihara" chat pill in `src/modules/common/components/ask-parihara-pill/`, mounted in `(main)/layout.tsx` — visible on every page (R9 idle state; full chat agent still TODO Sprint 4)
- New home page template `src/modules/home/templates/home-v3.tsx`:
  - Chat-forward hero with suggestion chips
  - Top 3 featured products from Medusa (Garbarakshambigai ghee/oil + Rahu Ketu = ~69% of revenue)
  - Browse-by-intent tile grid (6 categories)
  - Yagasala video strip (3 video placeholders)
  - Astrology + testimonial split panel
  - WhatsApp / FAQ teaser
- Replaced `MockHomepage` with `HomeV3` in `src/app/[countryCode]/(main)/page.tsx`
- Nav (`src/modules/layout/templates/nav/index.tsx`) rebuilt with hi-fi sticky cream-blur header, sindoor active underline, locale chip, sign-in pill
- Footer (`src/modules/layout/templates/footer/index.tsx`) rebuilt as dark ink panel with mandala logo + Services/Discover/Help columns

### Build hardening for Vercel (commits `2e13f56`, `f837700`, `2a14644`)
- **`src/lib/config.ts`** — Medusa SDK URL falls back from `MEDUSA_BACKEND_URL` → `NEXT_PUBLIC_MEDUSA_BACKEND_URL` → `localhost`. So a single Vercel env var is enough.
- **`force-dynamic` on Medusa-touching routes** — `page.tsx`, `(main)/layout.tsx`, `collections/[handle]`, `categories/[...category]`, `products/[handle]`. Build no longer requires Medusa to be reachable.
- **`generateStaticParams` wrapped in try/catch** for collections + categories (products already had it). Returns `[]` on Medusa failure.
- **Home page + main layout soft-fail Medusa** — every call wrapped in `.catch(() => null)`. Featured cards hide instead of crashing if products is `[]`.
- **`src/middleware.ts` fully hardened** — was causing `MIDDLEWARE_INVOCATION_FAILED` 500s:
  - Backend URL now falls back to public var
  - `getRegionMap()` returns empty map instead of throwing on missing env or fetch failure
  - Entire `middleware()` body wrapped in try/catch — any failure falls through to `NextResponse.next()` instead of 500ing
  - Empty regions case now redirects to `NEXT_PUBLIC_DEFAULT_REGION` fallback instead of returning HTTP 500
- **`src/lib/util/env.ts`** — `getBaseURL()` falls back to `VERCEL_URL` (Vercel auto-injects per deploy), so Preview deploys work without setting `NEXT_PUBLIC_BASE_URL` per branch
- **`check-env-variables.js`** — missing `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` now warns loudly instead of `process.exit(1)`. The site shell ships even with partial env config.

### Git topology cleanup
- Created `main` branch from current work
- Renamed working branch `claude/website-revamp-planning-QoXjG` → `claude/dev_1.1`
- User manually set `main` as default branch in GitHub Settings (this session can't do it — no MCP tool exposed)
- **TODO (user):** delete the two stale branches via GitHub UI:
  - `claude/website-revamp-planning-QoXjG`
  - `claude/setup-payment-framework-2tNcw`
- Push attempts to delete them via git push --delete returned HTTP 403 from this environment

### Design bundle preserved
- Full Claude Design handoff bundle copied to `docs/design/`:
  - `Parihara-Final.html` — the primary design the user had open
  - `hifi-styles.css`, `hifi-brand.jsx`, `hifi-home.jsx` — source CSS and JSX
  - `chat-transcript.md` — the design conversation that produced these mockups
  - `DESIGN-README.md` — original handoff README

---

## Decisions made (and why)

1. **Stick with assigned branch name** `claude/dev_1.1` going forward, not `v3` (user proposal). Branch policy: only this one branch gets pushes from Claude sessions.
2. **Don't try to prerender Medusa-backed pages at build time.** Vercel's build container can't always reach Medusa cloud, and intermittent failures shouldn't break deploys. All product/collection/category routes are `force-dynamic`.
3. **Middleware should never throw.** It runs on every request — one bad fetch shouldn't 500 the whole site. Wrapped in top-level try/catch that always returns `NextResponse.next()` on failure.
4. **Build should succeed with partial env config.** Downgraded `check-env-variables.js` from hard error to warning. Runtime code already soft-fails when Medusa is unreachable, so a partial config produces an empty-but-functional shell rather than a red build.
5. **Use `.ph-*` CSS classes instead of pure Tailwind utilities** for the design system. Design tokens are CSS custom properties (`--paper`, `--sindoor`, etc.) so they're shared between `.ph-*` component classes and the Tailwind extension. Tailwind utilities work for layout helpers (`flex`, `gap-*`, etc.), `.ph-*` for typographic and design-system primitives.
6. **`/app` is the Medusa admin UI, not the API.** API base URL is the root `https://pariharaonline.medusajs.app`. Don't put `/app` in any env var.

---

## Uncommitted work / known gaps

**As of this commit: working tree is clean. Nothing pending.**

What's *not* yet implemented from the project plan:

### Sprint 0 — Pre-flight (incomplete)
- [ ] Medusa slug audit — diff Medusa product handles against the 31 Shopify slugs in `parihara-features.md`. Fix mismatches in Medusa admin before frontend goes live.
- [ ] Verify Medusa backend reachable + products populated.

### Sprint 1 — Foundation (partial)
- [x] Next.js + Tailwind + Medusa connection (was already in repo)
- [x] Home page with featured products from Medusa
- [x] Site nav + footer
- [ ] Product Detail Page redesign to match hi-fi mockups (`PoojaProductPage`, `GheePage`, `OilPage`, `RahuKetuPage` in `docs/design/hifi-products.jsx` — currently using generic Medusa starter template)
- [ ] Geo-detection middleware tightening — current middleware uses Vercel's IP country header but no strict India/non-India enforcement yet (R5)
- [ ] Ghost URL 301 redirects (12 known ghost URLs in project plan — `/products/garbharakshambika`, `/collections/all`, etc.). Need a `redirects.config.ts` or `middleware.ts` redirect map.

### Sprint 2 — Commerce (not started)
- [ ] Cart page with progressive disclosure form (R4)
- [ ] Shipping logic — free India, $34 international per qty for oil/ghee, free for astro reports, donate-prasadham toggle (R4.5)
- [ ] Razorpay integration (LIVE keys provided — recommend switching to test keys first)
- [ ] PayPal integration (sandbox creds provided)

### Sprint 3 — Design & content (partial)
- [x] Design system foundation
- [x] Home page
- [ ] FAQ page hi-fi rebuild
- [ ] Astrology landing page with sample report (sample reports are in `public/sample-reports/`)
- [ ] Blog WYSIWYG editor + post pages
- [ ] `/llms.txt`, structured data, sitemap, ghost URL redirects

### Sprint 4 — Ask Parihara chat (not started)
- [ ] `SOUL.md` / `CHARACTER.md` (Sadhguru-inspired persona)
- [ ] Floating pill → opens chat panel (currently links to `/ask-parihara` route which doesn't exist yet)
- [ ] Anthropic API integration with context awareness
- [ ] Product cards in chat
- [ ] Agentic booking flow (chat → cart → checkout)
- [ ] `ASTROLOGY_CHAT.md` placeholder

### Sprint 5 — Admin & polish (not started)
- [ ] Admin debug panel (admin email: `manihk@gmail.com`)
- [ ] GA4 integration with e-commerce events
- [ ] Sentry error tracking
- [ ] Security hardening: CSP, rate limiting, input sanitization

---

## Vercel deployment state

- **Project:** connected to `mani-hari/phara-frontend` on GitHub
- **Production branch:** `main`
- **Preview branch in this workstream:** `claude/dev_1.1` at `https://phara-frontend-git-claude-dev-1-1-manihk.vercel.app/`
- **Last known issue:** `MIDDLEWARE_INVOCATION_FAILED` 500s — should be fixed by commits `f837700` and `2a14644`. Not yet verified.

**Env vars that must be set on Vercel (Production + Preview scopes):**

| Var | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | `https://pariharaonline.medusajs.app` | API base — root only, no `/app` |
| `MEDUSA_BACKEND_URL` | same as above | Belt-and-suspenders, code reads either |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | `pk_…` | User has this; required for Medusa API auth |
| `NEXT_PUBLIC_DEFAULT_REGION` | `in` | Default region for non-geo'd users |
| `NEXT_PUBLIC_BASE_URL` | (optional; auto-derives from `VERCEL_URL`) | Set only for canonical/OG to point at prod domain |
| `REVALIDATE_SECRET` | any string | Used by ISR revalidation hooks |
| `ANTHROPIC_API_KEY` | `sk-ant-…` | For Sprint 4 chat agent |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | (live keys in local `.env.local`) | Sprint 2 — recommend swapping to test keys first |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | (sandbox creds in local `.env.local`) | Sprint 2 |
| `ADMIN_EMAIL` | `manihk@gmail.com` | For admin-only UI gating (Sprint 5) |
| `NEXT_PUBLIC_GA4_ID` | (to be provided later) | Sprint 5 |
| `SENTRY_DSN` | (to be provided later) | Sprint 5 |

**.env.local** is gitignored and contains real values — never commit it. See `.env.example` for the template.

---

## What's next

In priority order:

1. **Verify Vercel deploy is green.** Once Vercel MCP is loaded into a session (CLI: `claude mcp add --transport http vercel https://mcp.vercel.com`, then `/mcp` to authenticate), check the latest deploy of `claude/dev_1.1`. Fix any remaining build/runtime errors.
2. **Sprint 0 pre-flight:** run a slug audit against Medusa, set up the 12 ghost URL 301 redirects.
3. **Sprint 1 completion:** redesign Product Detail Pages to match `docs/design/hifi-products.jsx` (Pooja generic + Ghee + Oil + Rahu Ketu variants).
4. **Sprint 2:** cart page with progressive disclosure + shipping logic + payment integrations.
5. **Sprint 3 remainder:** FAQ + astrology pages, blog editor, SEO files.
6. **Sprint 4:** Ask Parihara agentic chat.
7. **Sprint 5:** admin panel + analytics + security.

---

## Working with this repo

**Branch:** always work on `claude/dev_1.1`. Never push to `main` directly.

**Local dev:**
```bash
cp .env.example .env.local       # fill in real values from prior session notes
npm install                       # or yarn
npm run dev                       # http://localhost:8000
```

**Build verification before push:**
```bash
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_test_dummy \
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://pariharaonline.medusajs.app \
NEXT_PUBLIC_DEFAULT_REGION=in \
npx next build
```

**Design reference:** read `docs/design/Parihara-Final.html` and its imports (`hifi-*.jsx`, `hifi-styles.css`) before doing any visual work.

**Project plan source of truth:** `parihara-features.md` + the full revamp brief from the original conversation (URL inventory, sprint plan, validation checklists, env var list).

---

## Session handoff checklist

When you sign off, update this file:
- [ ] Commits added this session listed under "What's been accomplished"
- [ ] Any in-progress / uncommitted work flagged under "Uncommitted work"
- [ ] New decisions noted under "Decisions made"
- [ ] "What's next" priority list updated
- [ ] Vercel deploy state updated if relevant
- [ ] `Last updated` date at top bumped

The repo is the source of truth, not the chat history. If a decision matters, put it here.
