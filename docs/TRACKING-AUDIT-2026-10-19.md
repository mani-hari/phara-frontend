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

## Needs the owner's OK (GA admin settings, nothing changed yet)

| # | Setting | Why |
|---|---|---|
| A | Admin → Data streams → Configure tag settings → **List unwanted referrals**: `paypal.com`, `razorpay.com`, `api.razorpay.com` | PayPal is a full-page redirect; returning buyers start a new session credited to "paypal.com", stealing credit from email/organic |
| B | Admin → Data filters → **Internal traffic**: switch from Testing to **Active** | Makes fix #1 for admins take effect |
| C | Admin → Events → mark **contact_click** and **generate_lead** as key events (purchase already is) | They become conversions in reports and can be imported into Google Ads / used by Meta |
| D | Admin → Data streams → **Measurement Protocol API secrets** → create one (name: medusa-purchase) | Needed for fix #5 |
| E | Exclude the Singapore/China data-centre bot traffic (~340 users/month) with a Looker/Exploration segment, or Cloudflare/Vercel firewall | Bots drag every average down (open task D6) |

## Still not tracked (low priority)
- Sign-up / sign-in success (sign-in loops are a known issue; worth adding with the account rework).
- Add-to-cart that happens inside the Ask Parihara chat (server-side add); the purchase is still counted.
- Emails link to `/us/...` for India subscribers too, which shows USD on product pages. Use prefix-free links
  (`/products/...`, `/aarti`) in future emails so the visitor's own country applies.
