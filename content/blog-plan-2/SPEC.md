# PariharaOnline blog — content spec (100-post program, 28 Sep 2026)

Supervisor: Claude Fable. Writers: Claude Opus agents. Owner: Mani.

## Brand voice (do not mention these influences in posts)

PariharaOnline is a modern, practical, devotional brand. Readers are sincere, often God-fearing,
sometimes far from home (US/NRI), sometimes millennials who want meaning without dogma. We
never say "do this or else". We explain, we contextualise, we leave room. Rules can be old;
the intention behind them is what we honour. Warm, clear, unhurried English. No preaching, no
guilt, no fear-selling, no "AI voice" (no "delve", "tapestry", "in today's fast-paced world").

Three authors, each with a consistent lens. Every post has exactly one author.

| Author slug | Byline | Lens (never named in the post) | Signature moves |
|---|---|---|---|
| `hariharan` | Hariharan | Mythology decoded (Devdutt Pattanaik style) | Opens with a story or a question about a story; explains what the symbol *means*; "the story says… the story is really about…"; ends with a gentle reframe. Plain sentences, wry, humane. |
| `archana` | Archana | Inner practice, body & mind (Sadhguru / Isha style) | Direct, experiential, a little provocative; "try this for a week"; talks about attention, breath, food, sleep, the body as instrument; ritual as technology for the mind. No supernatural claims presented as fact; frames them as tradition/experience. |
| `manikandan` | Manikandan | The Sunday column (SpeakingTree style) | Reflective, anecdotal, quotes a verse or a saint once; connects a festival or ritual to an everyday situation (a commute, a hospital waiting room, a video call with parents); ends with one small thing to carry into the week. |

## Post rules

- **Length:** 550–850 words of body (exclude frontmatter and the products block). Short, crisp.
- **Structure:** H1 is the title (rendered by the page from frontmatter — do NOT repeat as `#` in body). Body starts with a hook paragraph (no heading). 3–5 `##` sections. A closing section that is practical, never a sales pitch.
- **Internal links:** at least 3, at most 6 links to other posts from `plan.json`, written as
  `[anchor text](/blog/<slug>)`. At least one link must go to a post in a different cluster.
  Only link slugs that exist in the plan. Anchor text must be descriptive (never "here").
- **Relevant products:** do NOT write product prose. Set frontmatter `products` (see schema); the
  page renders a "Relevant products" card block after the 2nd `##` section. Use 1–2 real product
  handles from `content/blog-plan/catalog.json` OR a search query (`query: "Durga"`) when several
  products fit. If nothing fits, use a query for the deity/theme anyway (search returns the closest).
- **External links:** none. **Images:** none inline; the hero comes from frontmatter.
- **Evergreen, always (owner rule, 28 Sep 2026):** never anchor content to a year or a calendar
  date. No "2026", no "this year", no "on 8 November", in titles, slugs, descriptions, keywords or
  body. Festivals recur: describe them by season and lunar timing ("Deepavali falls on the new-moon
  night of Karthika, usually late October or November", "Navratri's nine nights begin with the new
  moon of Ashwin"). If a reader needs the exact date, say "check the current year's panchangam" and,
  where natural, point to the site rather than printing a date. `festival-dates.json` is for the
  writers' own orientation only; its dates must not appear in posts.
- **Facts:** no medical, legal or financial promises. Astrology is framed as tradition ("in Jyotish,
  Shani is seen as…"), never as certainty.
- **US/NRI posts:** speak to someone in the US (time zones, temple distances, shipping prasadam,
  Diwali on a weekday, explaining festivals to kids or colleagues). Use "temple" not "mandir" unless
  quoting. Give both IST and US-friendly framing when dates matter.
- **Millennial/seeker posts:** honest, curious, non-dogmatic. Allowed to say "many people find…"
  and "you may not". Never mock tradition; never mock the sceptic.
- **SEO:** title ≤ 60 chars with the primary keyword near the front; `description` 140–160 chars,
  plain and specific; primary keyword appears in the first 100 words and in one `##`; secondary
  keywords appear naturally; no keyword stuffing; slug = lowercase, hyphens, ≤ 6 words.
- **Never:** mention AI, ChatGPT, "as a language model", the persona influences, competitors,
  temple permissions/politics, prices, or guarantees of outcomes.

## Agent- and answer-engine-friendly (GEO) rules — every post

- **Answer capsule:** frontmatter `takeaways` = 2–3 plain sentences (≤ 35 words each) that directly
  answer the primary search intent, quotable on their own. The page renders them in a box under the
  byline. The first body paragraph must also be answer-first (no throat-clearing).
- **FAQ:** frontmatter `faq` = 3–5 items. Questions are phrased as a real person would type into
  ChatGPT/Claude/Google ("Can I do Navratri pooja at home without a priest?", "What do I say when I
  light the lamp?"). Answers are 40–70 words, self-contained (do not say "as mentioned above"),
  evergreen, no dates, no prices, may mention PariharaOnline once where natural. At least one FAQ
  should target a long-tail question from the cluster's secondary keywords. The page renders the
  FAQ as a section titled "Questions people ask" and emits FAQPage JSON-LD.
- **Question-shaped headings:** at least one `##` is a question.
- **Definitions:** when a Sanskrit/Tamil term first appears, define it in the same sentence
  ("sankalpam, the spoken statement of intention before a pooja").
- **Sources:** where a story or verse is cited, name the text (Devi Mahatmyam, Skanda Purana,
  Tiruppavai…) in the sentence; no external links.
- **Markdown twin:** the site serves each post as clean markdown at `/blog/<slug>.md` and lists all
  posts in `/llms.txt`; writers need do nothing, but body markdown must be standard CommonMark
  (no HTML, no shortcodes).

## Frontmatter schema (YAML, exactly these keys)

```yaml
---
title: "Why Navratri Lasts Nine Nights: The Story Behind It"  # ≤ 60 chars, NO years/dates
description: "…140–160 chars…"
author: hariharan                                           # hariharan | archana | manikandan
publishedAt: 2026-09-28
updatedAt: 2026-09-28
cluster: navratri                                         # cluster id from plan.json
primaryKeyword: "why navratri is nine days"                  # no years in keywords either
secondaryKeywords: ["sharad navratri meaning", "nine forms of durga"]
tags: ["Navratri", "Festivals"]                           # 2–4 Title Case
audience: general                                         # general | nri-us | seeker
image: /blog/navratri-2026-dates-nine-nights.webp          # set by the image pipeline; leave as planned path
imageAlt: "Brass lamps lit in rows before a Durga idol at dusk"
imagePrompt: "…the prompt from plan.json…"
products:
  handles: ["durga-saptashati-parayanam"]                 # 0–2 real handles from catalog.json
  query: "Durga"                                          # optional search query fallback/addition
  heading: "Poojas for Navratri"                          # optional, default "Relevant products"
related: ["slug-a", "slug-b", "slug-c"]                   # 3–4 slugs from plan.json (drives Related posts)
takeaways:                                                # 2–3 quotable sentences, answer-first
  - "Navratri lasts nine nights because each night honours one form of the Goddess, moving from strength to wealth to wisdom."
  - "You can observe it fully at home with a lamp, a simple offering and a few minutes of attention each evening."
faq:                                                      # 3–5 Q&As, 40–70 word answers
  - q: "Can I observe Navratri at home without a priest?"
    a: "Yes. …"
  - q: "Which form of the Goddess is worshipped on each night?"
    a: "…"
readingTime: 4                                            # minutes, integer, ~200 wpm
draft: false
---
```

## File layout

- Posts: `content/blog/<slug>.md` (existing 5 posts stay; do not edit them).
- Plan: `content/blog-plan/plan.json` (research agent), `catalog.json` (real product handles/titles),
  `festival-dates.json`, this SPEC, `VOICE-samples.md` (one sample paragraph per author).
- Images: `public/blog/<slug>.webp` (1200×630, watermark "pariharaonline.com" bottom-right).

## Definition of done (QA agent checks all of these)

1. 100 new files, valid frontmatter, all keys present, slugs unique, titles unique.
2. Body 550–850 words; no `#` H1 in body; 3–5 `##`.
3. 3–6 internal links, all resolve to plan slugs or the 5 existing posts; ≥1 cross-cluster.
4. `products.handles` ⊂ catalog.json handles.
5. `related` has 3–4 valid slugs, none self.
6. Title ≤ 60, description 140–160, primary keyword in first 100 words.
7. No banned words/phrases; no external links; no persona names or influences mentioned.
8. Image file exists and frontmatter path matches.
9. `takeaways` has 2–3 items ≤ 35 words; `faq` has 3–5 items, answers 40–70 words, questions end
   with "?"; at least one `##` heading is a question; no 4-digit year / month-day anywhere.
