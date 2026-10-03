# Writer brief — BATCH TWO (read fully before writing)

You are one of fifteen writers. Work only on your assigned index range of `content/blog-plan-2/plan.json`
(`jq '.posts[START:END]'`). Do NOT commit. Write only `content/blog-batch2/<slug>.md`. Do not touch
`content/blog/` (the live batch-one posts) or anything else.

## Read first
1. `content/blog-plan-2/SPEC.md` — voice, rules, frontmatter schema. Binding.
2. `content/blog-plan-2/BATCH2-DELTA.md` — what differs in batch two (storage, dates, series).
3. `content/blog-plan-2/VOICE-samples.md` and `AUTHOR-BIBLE.md` — imitate the author; never contradict
   the bible (Manikandan: New Jersey suburb, wife, son ~11, parents in Chennai; Hariharan: only a niece;
   Archana: no personal biography).
4. `content/blog-plan-2/catalog.json` — the only valid product handles.
5. Two finished batch-one posts in `content/blog/` by your authors, to match the markdown flavour.

## Per post
- Frontmatter exactly per SPEC schema; copy `title, description, author, cluster, primaryKeyword,
  secondaryKeywords, tags, audience, image, imageAlt, imagePrompt, products, related, takeaways, faq`
  VERBATIM from plan.json (generate it by script from the plan — every batch-one writer did this and it
  eliminated frontmatter errors). `publishedAt: 2026-11-07`, `updatedAt: 2026-11-07`, `readingTime`
  = ceil(words/200), `draft: false`.
- Body 550–850 words; hook paragraph first, answer-first; 3–5 `##`, ≥1 a question; practical close; no `#`
  H1, no HTML, no external links, no images, no years or dates, no prices, no product prose.
- Links: 3–6 `[anchor](/blog/<slug>)` to slugs in plan.json (batch two) or `content/blog/` (batch one);
  ≥1 to another cluster; descriptive anchors; never link to yourself; never invent a slug.
- Series posts (nakshatra, rasi, recipes, temple guides, stotras) follow the template implied by the
  outline but must read as written prose — vary openings, never a filled-in form.
- Recipes: give ingredients as a short list and the method as numbered steps in plain CommonMark;
  quantities in grams/ml with cups in brackets; note the traditional occasion; no health claims.
- Mythology & ideas: tell the story once, then say what it means; name the text (Purana, Kural number, etc.);
  Tirukkural posts quote the couplet in transliteration + a plain English rendering and cite the kural number.
- Define Sanskrit/Tamil terms on first use. Frame astrology as tradition, never certainty. No medical,
  legal or financial promises. Never mention AI, the persona influences, competitors, or temple politics.

## Before finishing
Run your own per-file check (word count 550–850, 3–6 `/blog/` links resolving to real slugs, ≥1 question
heading, primary keyword in first 100 words and in one `##`, no 19xx/20xx, no http, no HTML). Report:
slugs written, word counts, deviations.
