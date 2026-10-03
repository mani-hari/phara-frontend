# Batch two — what differs from batch one (read with SPEC.md)

Owner decisions, 29 Sep 2026.

- **Size:** exactly 300 posts. Split evenly: hariharan 100, archana 100, manikandan 100.
- **Storage:** posts go to `content/blog-batch2/<slug>.md`, images to `content/blog-batch2/images/<slug>.webp`
  (NOT public/blog). Nothing is committed or published yet; a later step moves and schedules them.
  Frontmatter `image` should still be written as `/blog/<slug>.webp` (the path they will have when published).
- **No duplication with batch one:** `batch1-index.json` lists all 125 existing slugs, titles, primary and
  secondary keywords. A batch-two post may not reuse a slug, a title, or a primary keyword, and must not
  restate a batch-one post's core intent (a fresh angle on a shared theme is fine; a rewrite is not).
- **Cross-links:** 3–6 per post, to batch-one slugs (all will be live) and batch-two slugs. Every batch-two
  post must receive ≥2 inbound links from batch two.
- **Dates:** `publishedAt: 2026-11-07` placeholder for all; the scheduler assigns real dates at publish time.
- **Required series (evergreen), inside the 300:**
  1. Birth stars (nakshatra), 27 posts — deity, temple, temperament, traditional remedies, the star birthday.
  2. Rasis, 12 posts — nature, ruling planet, temples and poojas traditionally linked.
  3. Naivedyam & prasadam recipes, ~20 — home cooking for offerings; ingredients, method, when offered.
  4. Temple guides, ~15 — the temples our poojas are performed at and others devotees ask about; history,
     deity, what a devotee experiences, how to take part from afar (no travel logistics that go stale).
  5. Stotras & mantras explained, ~15 — meaning, context, how to begin.
  6. Mythology & ideas, ~40 — mostly Hariharan, some Manikandan. Stories of Ganesha, Vishnu (and avatars),
     Shiva and Parvati told for what they mean; the feminine in Hinduism and how the tradition honoured
     women and Shakti (Devi, Meenakshi, Andal, Avvaiyar…); Hinduism and business ethics (dharma in trade,
     Tirukkural on wealth, Kubera, Lakshmi and right earning); Hinduism's plural, wide view of the world
     (many paths, ishta devata, the household and the forest, debate as devotion); Thiruvalluvar's Tirukkural
     on personal and spiritual growth (a dozen posts on specific kurals and themes). Evergreen, no polemics.
  7. Remaining festivals across the year, ~25 — Ugadi/Tamil New Year, Ram Navami, Hanuman Jayanti, Akshaya
     Tritiya, Varalakshmi Vratham, Aadi, Krishna Janmashtami, Ganesh Chaturthi, Onam, Avani Avittam,
     Guru Purnima, Kartik Purnima, Ratha Saptami, etc. — evergreen framing, no dates.
  The remaining ~145 fill practice, seeker and US/NRI intents not yet covered (check batch1-index.json).
- Audience mix target: ≥50 nri-us, ≥45 seeker, rest general.
- Everything else (voice, length 550–850, takeaways, FAQ, GEO rules, products block, evergreen) as SPEC.md.
