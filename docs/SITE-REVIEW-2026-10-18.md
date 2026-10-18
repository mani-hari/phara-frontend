# PariharaOnline site review: analytics + experience (18 Oct 2026)

Sources: GA4 property 453712866 (usable data from ~30 Sep, after the tag fix; "last 28 days" = 20 Sep–17 Oct),
a mobile walkthrough of the live site as a US visitor (home → product → cart → checkout, stopped before
payment), and order/email data from this month.

## 1. What the analytics say

| Signal | Number | Meaning |
|---|---|---|
| Real tracking window | ~1–17 Oct | Before 30 Sep the tag was broken; ignore earlier days. |
| Users / sessions | 1,433 / 1,694 | Includes ~340 bot users (below). Real visitors ≈ 1,100. |
| Bots | Singapore 287 users (4% engaged, 4s), China 49 | Crawlers. They inflate "Direct" (639 sessions, 15% engaged) and drag every average down. |
| Real audience | India 742 (57% engaged, 1m24s), US 230, then UK, UAE, Australia, Canada | Two markets: India (INR) and NRIs (USD). |
| Device | Mobile = 72% of engaged sessions (1m21s); desktop 34s | Design for the phone first. |
| Channels | Organic search 896 sessions (62% engaged, 1m13s) ≫ Email 73 ≫ AI assistants 16 | Google is the main door; email is small but high quality. |
| Top pages | Garbharakshambigai OIL 472 views, GHEE 447, home 229, cart 152, pregnancy landing 88, checkout 64 | Fertility/pregnancy is the dominant intent, not "40+ general". |
| Funnel | cart 88 users → checkout 47 users | ~half are lost between cart and checkout. |
| Sign-in | /account/signin 65 views by 19 users (3.4 each) | People get stuck in sign-in loops. |
| **Purchases** | **0 key events, ₹0 revenue** | **GA cannot see sales at all.** Every conversion question is unanswerable until fixed. |

Audience note: the biggest real segment right now is couples trying to conceive / expecting (often 25–40,
often the wife searching, often abroad), plus their parents (40–65) who pay or gift. The 40+ devotee is the
second core segment (graha doshas, health, marriage of children, ancestors).

## 2. What a typical visitor experiences (mobile, US)

1. **Home**: first screen is a chat box ("What would you like a pooja for?") with no products, prices,
   temples or proof. Videos come next (good). Header is cramped at phone width ("Sign in" is cut off).
2. **Product page (ghee)**: the booking card sits *above* the photo, and a second sticky "Add Pooja to Cart"
   bar is shown at the same time: two buy buttons take ~45% of the screen and the photo is pushed out.
   Button says "Add *Pooja* to Cart" / "Book this ritual" on a *prasadam* jar. "You usually need 2 bottles"
   and "international shipping at additional cost" are buried mid-page. No shipping cost shown.
3. **Add to cart**: no clear confirmation on mobile.
4. **Cart**: blank thumbnail, "Default variant" shown, and **"Who is it for? / What is your prayer?" is
   mandatory before checkout — even for ghee prasadam**. "Please enter at least one name" blocks the button.
5. **Checkout**: total jumps from $36 to **$68** (shipping $32 appears only here). URL switches to
   `/af/checkout` (Afghanistan code) — a bug to fix. Form is reasonable; PayPal + Razorpay are clear; the
   festival-reminder opt-in is a good touch.
6. **Browse (Pujas & Homams)**: page intro literally says "Choose from our real **Medusa catalog**" (developer
   text leaked), dark heavy banner, narrow left-shifted cards, truncated titles, no "what it's for", no filter
   by need. Page title says "PariharaOnline | PariharaOnline".

## 3. What this visitor needs (and what the site should do)

They are anxious or hopeful about something specific (a child, a parent's health, a marriage, a dosha),
moderately to deeply devout, often abroad and unable to go to the temple, and wary of being cheated online.
They decide on **trust + fit + total cost**, mostly on a phone, often after asking family on WhatsApp.

So the site must answer, in this order, within one scroll:
1. *Is this for my problem?* (intent-first navigation: "Trying to conceive", "Safe delivery", "Health",
   "Marriage", "Doshas", "Ancestors", "Festivals")
2. *Is it real?* (temple name + photo, our priests' video, how proof is shared, years in service, real reviews
   with photos/initials, "we are not the temple, we are your representative" said plainly once)
3. *What exactly will I get, and when?* (what happens, when it is performed, what is sent, delivery time)
4. *What will it cost in total?* (price + shipping to my country, upfront)
5. *Can I talk to a person?* (WhatsApp, prominent but calm)

## 4. Recommendations, prioritised

### P0 — fix leaks (days, biggest revenue effect)
1. **Track purchases in GA4** (purchase event with value/currency from the order-confirmed page; add_to_cart,
   begin_checkout). Without it we are blind.
2. **Don't block checkout on the devotee name for prasadam-only carts**; for poojas, keep it but make it
   skippable ("Add names now or reply to our WhatsApp later").
3. **Show shipping upfront**: on prasadam pages "Free delivery in India · $32 to USA, UK, Canada…" and in the
   cart before checkout. Consider folding international shipping into the price ("$68 delivered") or a
   2-bottle "48-day course" variant with shipping included — the page already says you need 2.
4. **Mobile product page order**: title → photo → price/benefit → booking card; hide the sticky bar while the
   card is visible. Change button copy by product type ("Add to cart" / "Book this pooja").
5. **Fix**: `/af/checkout` country bug; "Medusa catalog" text; double "| PariharaOnline" in titles; cart
   thumbnail + "Default variant"; mobile header overflow; add-to-cart confirmation on mobile.
6. **Filter bot traffic** in GA (Singapore/China data-centre traffic) so numbers mean something.

### P1 — trust and fit (1–2 weeks)
7. **Home first screen for a 40+ devotee**: one plain promise ("Poojas performed in your family's name at
   renowned temples — prasadam delivered worldwide"), 3 proof chips (15+ years · 4,000+ families · video/
   photo proof where offered), then **intent tiles** with real photos, then videos, then top sellers.
   Keep Ask Parihara, but as a secondary "Not sure? Ask us" rather than the whole first screen.
8. **Fertility hub**: the pregnancy landing page is the #1 entry after the two products. Make it a proper
   journey (conceive → pregnancy → safe delivery → child's first rituals), with the ghee/oil course, the
   relevant poojas, honest FAQs, and real stories.
9. **Reviews**: replace generated-looking reviews with real ones (name initial, city, date, product, photo
   of the prasadam received). Fewer, real, specific beats many perfect ones; risky claims hurt credibility.
10. **"What happens after you book"** timeline on every product (booked → performed on [day] → updates on
    WhatsApp → prasadam shipped with tracking), consistent wording (we are a service, not the temple).
11. **Browse page**: light header, intent filter chips, full-width cards with one-line "for…" and the temple.

### P2 — engagement and repeat revenue
12. **Festival calendar + reminders** (already opt-in at checkout): seasonal slot on home, email series like
    Navratri, "book for the next auspicious date" on products.
13. **WhatsApp follow-up** for abandoned carts with a name/email (most of this audience lives on WhatsApp).
14. **Bundles** for common journeys (fertility course, graha shanti set, festival packages) using the new
    bundle page.
15. **Language**: the switcher exists — surface it near the top of product pages for India traffic and
    translate the key trust lines, not only descriptions.

## 5. Measures to watch after the fixes
cart→checkout rate (now ~53%), checkout→purchase (unknown until tracking), revenue per visitor by country,
organic landing → add-to-cart, email session → purchase.
