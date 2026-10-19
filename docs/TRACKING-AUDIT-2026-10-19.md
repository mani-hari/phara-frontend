# Tracking audit: storefront + email (19 Oct 2026)

Scope: every analytics call in `phara-frontend` (GA4 `G-78BCF56K29`, Microsoft Clarity), the redirects in
`src/middleware.ts`, the checkout and payment flows, and how Listmonk emails link to the site.

Before this audit the site sent only four events (add_to_cart ×2, begin_checkout, purchase). GA's automatic
"enhanced measurement" adds page views, scrolls, outbound clicks and engagement time.

## Gaps found and fixed in code (commit d990b56, live after the next push to main)

| # | Gap | Effect | Fix |
|---|---|---|---|
| 1 | GA ran on Vercel preview deployments and for the owner/team | Team testing counted as customers | GA only on production; logged-in admins sent with `traffic_type=internal` |
| 2 | WhatsApp / phone / email clicks not tracked | The main lead action of this business was invisible | `contact_click {method, link_location, page}` from one site-wide listener (`components/analytics/site-tracking.tsx`) |
| 3 | No `view_item` | Could not see which products people look at vs add | `view_item` on every product page (price, category) |
| 4 | Checkout steps not tracked | Could not see where checkout loses people | `add_shipping_info` and `add_payment_info {payment_type: razorpay \| paypal}` |
| 5 | Purchase only counted if the buyer reaches the confirmation page | Sales lost when the tab closes, PayPal return fails or the webhook completes the order late (known issue) | GA client/session ids saved on the cart metadata (copied to the order). **Backend half still to do**: Medusa `order.placed` subscriber sends a Measurement Protocol `purchase` with the same `transaction_id` (GA de-duplicates). Needs a GA Measurement Protocol API secret. |
| 6 | Digital Aarti had no events | No way to see what people do there | `aarti_enter`, `aarti_action {action}`, `aarti_complete` |
| 7 | Blessing and darshan share links had no tags | Visits from WhatsApp shares showed as "direct" | `utm_source=whatsapp&utm_medium=share&utm_campaign=aarti-blessing \| aarti-darshan-share` |
| 8 | Site search and Ask Parihara chat not tracked | Unknown demand and chat use | `search`, `search_suggestion_click`, `chat_start`, `chat_message` |
| 9 | Festival-reminder opt-in at checkout not tracked | Newsletter growth invisible | `generate_lead {lead_source: checkout_reminders}` |
| 10 | Old-URL ("ghost") redirects dropped the query string | utm tags lost on old links | Query string kept |

## Gaps fixed outside the code

| # | Gap | Fix |
|---|---|---|
| 11 | Digital Aarti launch email links were not wrapped in Listmonk `{{ TrackLink }}` | Listmonk showed 0 clicks. Fixed for the UK batch and the final Navratri campaigns. **Rule: every email link goes through TrackLink, with utm_content per link (hero, button, card).** |

## GA admin settings (owner approved 19 Oct; done unless marked)

| # | Setting | Status |
|---|---|---|
| A | Unwanted referrals: `paypal.com`, `razorpay.com` (returning buyers keep their email/organic credit) | Done |
| B | Internal traffic filter (logged-in admins, `traffic_type=internal`) | Active |
| B2 | New: hostname filter "Exclude Vercel preview builds" (hostname contains `vercel.app`); GA had detected ~10 preview hosts sending data | Active |
| C | Key events `contact_click`, `generate_lead` (purchase already is, locked on) | Pending: GA must receive each event once; the 19 Oct 9 AM task stars them |
| D | Measurement Protocol API secret `medusa-purchase` (owner accepted terms 19 Oct); stored in phara-backend-medusa/.env (git-ignored). Backend subscriber `src/subscribers/order-placed-ga4.ts` committed (184f90c), payload validated with GA's debug endpoint | Done; **to go live: set GA4_MEASUREMENT_ID + GA4_API_SECRET in Medusa Cloud and push the backend** |
| E | Bot traffic: GA cannot exclude by country; handled in reporting ("real visitors" excludes unengaged Singapore/China sessions). Nothing blocked on the site; AI agents (GPTBot, ClaudeBot, PerplexityBot, ChatGPT-User...) verified to get full pages and are welcomed in robots.txt | Done (reporting rule) |
| F | New: event data retention 2 → **14 months** (default 2 months limited explorations) | Done |
| G | New: 8 custom dimensions so event details show in reports: Aarti action, Deity, Contact method, Link location, Lead source, Blessing occasion, Payment type, From blessing link | Done |
| H | New: tag diagnostics: preview-domain suggestions dismissed; monitored domain = www.pariharaonline.com | Done |
| I | Search Console link (pariharaonline.com, Domain property) | Done (owner verified and linked 19 Oct) |
| J | Second GA administrator (Google recommends it to avoid lock-out) | Done (owner added a second business account as admin, 19 Oct) |

## Still not tracked (low priority)
- Sign-up / sign-in success (sign-in loops are a known issue; worth adding with the account rework).
- Add-to-cart that happens inside the Ask Parihara chat (server-side add); the purchase is still counted.
- Emails link to `/us/...` for India subscribers too, which shows USD on product pages. Use prefix-free links
  (`/products/...`, `/aarti`) in future emails so the visitor's own country applies.
