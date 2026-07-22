# Email Marketing

## Provider split (decided 2026-07)
- **Marketing / promotional email → Brevo.** Chosen for **per-email pricing with unlimited contacts** (you don't pay for the ~5,800 mostly-cold Medusa records). Built-in editor, list management, unsubscribe/bounce handling, campaign scheduling, API.
- **Transactional email → Resend (unchanged).** Order confirmations, payment, status, staff alerts stay on Resend (Medusa `resend` module). **Deliberately NOT consolidated** — isolating marketing from transactional protects the must-arrive order emails from any marketing spam-complaint reputation damage.
- Send marketing from a **dedicated subdomain** (e.g. `news.pariharaonline.com`) so the two reputations never mix.

## Brevo account
- Existing free-plan account on `hello@pariharaonline.com` (2 campaigns sent historically, then paused when the store used Shopify's tool).
- **~3,590 consented contacts already imported** (with block/unsubscribe info). This is the good, clean list — prefer it over syncing the cold Medusa customer list (5,798 records, only 16 registered / 55 orders).
- Access for tooling: create a **Brevo API v3 key** (Settings → SMTP & API → API Keys) and store it in macOS Keychain (mirroring the Medusa admin-key pattern), not in chat or git. Used to verify sender/domain auth (SPF/DKIM/DMARC), lists, and to create/schedule campaigns via the API. No official Brevo MCP — cloud workflow is via an API-backed project skill.

## Decisions
- **Skip Brevo's Send Time Optimization (STO) premium (~$20/mo).** Build our own — see [[MAN-17]] / Linear MAN-17. The cold list has too little engagement data for per-contact ML STO to be worth paying for now.
- Campaign authoring should support **inserting a Medusa product link/card without copying URLs** — a project skill lists products and injects a branded card (image + title + price + button) with the correct storefront URL.

## To build (see Linear MAN-17, High priority — deferred)
1. **Timezone-bucket scheduler** — derive contact timezone from country (Medusa address / IP-at-signup, default IST), bucket, and schedule one Brevo send per bucket to land at a good local hour. ~80% of STO's value, cheap.
2. **Open-tracking webhook → Neon** — Brevo `opened`/`click` webhook → endpoint → per-contact open timestamps in Neon. Turn on early to accumulate engagement data.
3. **Per-contact best-hour scheduling (Tier 2, later)** — from accumulated open history, send each contact at their modal best hour. Replicates STO for free once data density exists.
4. **Product-link skill** — Medusa product → branded card + correct URL, injected into campaign HTML.

Guardrail: send-time is a marginal lever vs list quality, consent, subject lines, and cadence — build cheaply, don't over-invest early.
