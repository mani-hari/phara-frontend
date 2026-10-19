# PariharaOnline growth engine (plan, 19 Oct 2026)

## The situation in one paragraph
Under ~200 real visitors a day. Two doors: Google (mostly Garbharakshambigai ghee and oil, i.e. couples trying to
conceive) and the newsletter (~5,000 subscribers, small but high quality). Nothing goes out on YouTube, Facebook or
Instagram, although the site already holds a large library: 430 blog articles with house-style paintings, real homam
footage from our priests (Homam Video Studio already makes a YouTube cut), the Digital Aarti paintings and chants,
and a verified festival calendar. The goal: open three new doors (YouTube, Facebook, Instagram), then put a small,
measured ad budget behind whatever proves itself, run as a steady experiment loop that I operate and you approve.

## Principles
1. **Measure first.** No ad rupee until a sale, a WhatsApp click and a newsletter sign-up are each counted (audit done 19 Oct).
2. **Repurpose, don't invent.** Every post comes from something real we already have: an article, a homam video,
   a festival date, a product page, an aarti. No made-up testimonials, no temple-affiliation claims, no promises of
   video/audio of a customer's pooja.
3. **Slow and steady.** One idea a day at most, a weekly approval session, monthly budget review. This is a trust
   business; consistency beats volume.
4. **Evidence, not guesses.** Every idea I bring cites numbers from our own data with a date range, says what we
   expect, what it costs, and how we will judge it. Experiments are logged with the result, kept or killed.
5. **You approve anything public or paid.** Later, once a content calendar is approved, routine organic posts from
   it can go out without one-by-one approval; ads always stay inside an agreed monthly cap.

## Two audiences, two campaigns

| | India | USA (NRI), later UK/Australia |
|---|---|---|
| Who | Men and women 40–65, devout, often for a parent's health, a child's marriage, graha doshas; plus couples 25–40 for fertility | Indian families abroad, 30–60, who cannot go to the temple; parents and in-laws back home; couples trying to conceive |
| Message | "Poojas at renowned temples and Vedic homams by our priests, in your family's name; prasadam to your door" | "Your family's pooja in India, done properly while you are abroad: sankalpam in your names, prasadam shipped to the US" |
| Lead products (to test) | Navagraha homam, Mrityunjaya homam (health), Rahu-Ketu at Sri Kalahasti, festival poojas | Garbharakshambigai ghee/oil (proven search demand), homams for parents' health, festival poojas, Digital Aarti as a free entry point |
| Channels | Facebook (strongest for 40+ in India), YouTube, WhatsApp shares | Google Search (high intent), YouTube, Instagram + Facebook |
| Language | English first; Tamil/Telugu/Hindi captions next | English |
| Starting ad budget | ₹200/day (about ₹6,000/month) | about $7/day (about $210/month) |

## The system

```
 sources (site + footage)  →  content engine  →  channels  →  site (tracked)  →  metrics store  →  daily idea + weekly review  →  you approve
       ↑                                                                                                                            │
       └──────────────────────────────────────────────── what worked gets more; what didn't gets dropped ───────────────────────────┘
```

### 1. Measurement layer
- GA4 (done, plus admin settings A–E in docs/TRACKING-AUDIT-2026-10-19.md).
- Server-side purchase backup from Medusa (backend task, needs a GA API secret).
- **Meta Pixel + Conversions API** on the site once the Meta ad account exists (Pixel ID from you); events:
  PageView, ViewContent, AddToCart, InitiateCheckout, Purchase, Contact (WhatsApp click), Lead.
- **Google Ads conversion import** from GA4 (purchase, contact_click) once Google Ads is linked to GA4.
- **UTM convention** for everything we post: `utm_source` = youtube | facebook | instagram | google | newsletter |
  whatsapp, `utm_medium` = organic | paid | email | share, `utm_campaign` = `<yyyy-mm>-<theme>`, `utm_content` = the
  specific post/ad. Links in YouTube descriptions, Instagram link stickers and ads all carry it.
- **Metrics store**: `growth/metrics/` in this repo (daily JSON snapshots from GA4, Listmonk, YouTube Analytics,
  Meta Insights, Google Ads), so every comparison is reproducible.

### 2. Content engine (from what we already have)

| Format | Source | Where | Rhythm to start |
|---|---|---|---|
| Homam film (3–8 min): what the homam is for, the fire, the mantras, real footage | Homam Video Studio YouTube cut + blog article for the script and description | YouTube (long), Facebook video | 1 a week |
| Mantra Short (30–60 s): a real chant from our homam with subtitles and meaning | Homam footage | YouTube Shorts, Instagram Reels, Facebook Reels | 3 a week |
| Story Short (45–60 s): a mythology story told over our paintings, text on screen | Blog articles + house-style images | Shorts, Reels | 2 a week |
| Festival "what to do today" post | festival-calendar.ts + blog | All three, plus newsletter | each festival, 3–5 days ahead |
| Carousel / single image: meaning of a sloka, a remedy explained, a temple's story | Blog | Instagram, Facebook | 3 a week |
| Digital Aarti moments: aarti GIF/video with chant, "light a lamp" | /aarti | Reels, Shorts, WhatsApp Status | around festivals |

All rendered in the approved house look (deity art = the /aarti cover paintings; scenes = twilight tonalism),
captions in English first. Real priest audio wherever there is chanting; no synthetic voice for mantras.
Each item ships with a title, description, hashtags and a tagged link to the matching page on the site.

### 3. Paid layer (only after organic content exists to promote)
- **Meta (India)**: boost the best organic Reels/videos of the week to 40–65, India, interests in Hinduism/temples/
  astrology; plus a "festival pooja" campaign before each big festival. Retarget site visitors and video viewers.
- **Meta (US)**: Indian-diaspora targeting (language/interests), the Garbharakshambigai and "pooja for parents back
  home" angles; retarget.
- **Google Search (US first)**: high-intent keywords already showing in our organic data (Garbharakshambigai ghee/oil,
  online homam for parents, Rahu-Ketu pooja online), sending to the existing landing pages.
- Each ad experiment has a hypothesis, a budget, a 7–14 day window and a kill rule (e.g. cost per WhatsApp click or
  add-to-cart above an agreed limit after 7 days → stop). Hard monthly caps set inside the ad accounts as well.

### 4. The loop I run
- **Every morning (scheduled task):** pull the numbers into the metrics store; check yesterday's posts and ads;
  flag anything unusual (a post outperforming, an ad burning money, a tracking break). Write at most **one idea card**:
  evidence → proposal → cost → expected result → how we judge it. Saved to `growth/ideas/`.
- **Weekly review (your chosen day):** one page with last week's numbers per channel and audience, the experiment
  log (kept / killed / running), and **2–3 cases for approval**. You approve, change or reject; I execute.
- **Monthly:** budget review and the next month's content calendar (festivals first).
- Everything public is queued for your approval in the first month; after that, approved-calendar organic posts can
  go out on schedule.

## Tools: use established ones, don't rebuild (owner, 19 Oct)
- **Marketing plugin (Anthropic)**: content creation, campaign plans, brand-voice review, performance reports.
- **Windsor.ai plugin (partner)**: one connector to read and manage Google Ads, Meta Ads, Instagram, Facebook organic,
  YouTube and GA4; budgets, campaign pause/enable, reporting. Paid third-party service; check its plan before relying on it.
- Meta's own Business Suite / Graph API for scheduling Facebook and Instagram posts if Windsor's posting is limited;
  YouTube Studio / YouTube Data API for uploads; Homam Video Studio for the films. Custom code only where nothing exists
  (the daily metrics snapshot and idea cards).

## What only you can do (one sitting, about 2 hours; I will guide you live)
I cannot create accounts, sign in with your passwords, accept terms for you or enter payment details. Everything
else I set up.

1. **YouTube**: confirm the PariharaOnline channel (Brand Account) owner login. In the existing Google Cloud project
   `parihara-project`, enable YouTube Data API v3 and YouTube Analytics API, create an OAuth client, and sign in once
   to grant upload access. Note: uploads through an unaudited API project stay **private** until Google's audit is
   approved, so we apply for the audit right away; until then I prepare each video (file, title, description,
   thumbnail, tags) and you press Publish in YouTube Studio, or I publish via the browser while you are signed in.
2. **Meta**: a Business portfolio that owns the PariharaOnline Facebook Page and the Instagram professional account
   (linked); an ad account in INR with your payment method and an **account spending limit**; a Pixel (dataset);
   a system user with access to the Page, Instagram account and ad account, and its token pasted into `.env.local`.
   (A Meta app in development mode is enough for our own Page, Instagram and ad account.)
3. **Google Ads**: an account with billing, linked to GA4 (Admin → Product links), and an API developer-token
   application (approval takes days; until then I work in the Google Ads web UI with you signed in).
4. **GA4**: approve admin settings A–E from the audit and create the Measurement Protocol secret.
5. **Footage**: keep homam clips flowing into the `Parihara Homam Jobs` Drive folder (already set up); mark which
   ones are fine to publish (no customer names or faces without consent).
6. **Decide**: the weekly review day, the first month's ad caps (proposed ₹6,000 India + $210 US), and who answers
   WhatsApp leads quickly (ads will raise volume).

## First 30 days
| When | What |
|---|---|
| Week 0 (now) | Tracking fixes live; GA admin settings; setup sitting with you; growth/ folders and the daily scheduled task |
| Week 1 | First content batch from existing assets: 2 homam films, 8 Shorts/Reels, 9 image posts; posting calendar; Meta Pixel + CAPI on the site |
| Week 2 | Organic posting starts on all three channels; first ad drafts for India and US presented as cases (not live) |
| Week 3 | Approved ads go live at the starting budgets; daily idea cards begin |
| Week 4 | First weekly review with real channel numbers; first keep/kill decisions; Diwali/Karthigai calendar |

## How we will know it is working (first 90 days)
Real visitors per day (excluding bots) and how many come from the new channels; WhatsApp clicks and newsletter
sign-ups per week; orders and revenue by source; cost per order on ads (by audience); subscribers/followers per
channel as a secondary signal. Starting point to beat: under 200 visitors/day, two traffic sources.
