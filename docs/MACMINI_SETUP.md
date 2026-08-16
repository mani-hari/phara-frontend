# PariharaOnline Storefront — Mac Mini Workspace Setup

**Who this is for:** a Claude Code instance running on Mani's Mac Mini, setting
up this repo as part of moving the whole Parihara workspace (storefront +
Medusa backend + Homam Video Studio) there. This doc covers the storefront
only — see the sibling handoffs for the other two repos.

## Repo

- GitHub: **https://github.com/mani-hari/phara-frontend** (private — you need
  git credentials with access; ask Mani if `git clone` prompts and fails).
- Branches: `main` = production (deployed to Vercel, matches
  pariharaonline.com), `v4_july2026` = active dev branch, kept identical to
  `main` except for in-flight work. **Check out `v4_july2026`** — that's where
  active development happens.

## Setup

```bash
git clone https://github.com/mani-hari/phara-frontend.git
cd phara-frontend
git checkout v4_july2026
npm install
```

Requires **Node 20+**.

### Environment variables — do NOT reconstruct these from `.env.example`

`.env.local` on Mani's current machine has real **live** secrets: Razorpay
live keys, PayPal client secret, the Anthropic API key, the Neon Postgres
connection string (chat history), Google OAuth client secret, NextAuth secret.
**Copy the actual `.env.local` file over directly** (AirDrop, USB, or a secure
transfer) — never regenerate these from scratch, and never paste them into a
chat/prompt.

### Reserved dev port: 5001, not 3000

`npm run dev` is already configured to run on **port 5001** (not the Next.js
default 3000) — this is a deliberate project convention so it doesn't collide
with other projects' dev servers on the same machine. It's wired through
`package.json`, `.env.local`/`.env.example` (`NEXT_PUBLIC_BASE_URL`,
`NEXTAUTH_URL`), `playwright.config.ts`, and `scripts/shots.mjs` — don't
"fix" it back to 3000.

Two follow-ups if Google sign-in needs to work from the Mac Mini's `localhost:5001`
(only relevant if doing local auth testing there):
- Google Cloud Console → add `http://localhost:5001/account/google-callback`
  as an authorized redirect URI.
- Medusa backend `STORE_CORS` → add `http://localhost:5001` if it isn't
  already covering it (check the backend's Medusa Cloud env vars).

### Gated Medusa admin access (machine-specific — needs re-setup, not migration)

This repo has scripts for calling the live Medusa Admin API directly
(`scripts/medusa-admin.sh`), gated by:
1. A macOS Keychain entry holding the real Medusa admin secret key — this
   lives **only** in Keychain on Mani's current Mac, is never in git or
   `.env.local`, and does **not** transfer automatically. To set it up fresh
   on the Mac Mini, Mani needs to run `npm run medusa:key:set` there himself
   and paste the admin key interactively (it's a secret — don't have an
   agent type it in a scripted way).
2. A 30-minute time-boxed "arm" file (`npm run medusa:unlock` /
   `medusa:lock` / `medusa:status`) — this is just a local marker file, not a
   secret, and needs no migration; it'll work immediately once cloned.

If nobody needs to call the live Admin API from the Mac Mini, this step can be
skipped entirely — everything else in the repo works without it.

### Verify it runs

```bash
npm run dev          # http://localhost:5001
```

Confirm the homepage loads and product pages render. If you want to run the
E2E suite: `npm run test:e2e` (Playwright; reuses the dev server).

## What NOT to touch

- Never commit directly to `main` — that's production, kept in sync with
  `v4_july2026` deliberately (see the branch note above). Work on
  `v4_july2026` unless Mani says otherwise.
- `secrets/`, `.env.local`, and anything Keychain-related must never be
  committed or pasted into a prompt/chat log.
