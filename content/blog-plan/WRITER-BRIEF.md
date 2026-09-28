# Writer brief (read fully before writing a single post)

You are one of several writers drafting posts for pariharaonline.com. Work only on the posts
assigned to you (by index range in plan.json). Do NOT commit. Do not edit any file outside
`content/blog/<your-slugs>.md`.

## Read first, in this order
1. `content/blog-plan/SPEC.md` — voice, rules, frontmatter schema, definition of done. Binding.
2. `content/blog-plan/VOICE-samples.md` — imitate the assigned author's rhythm and moves.
3. `content/blog-plan/catalog.json` — the ONLY valid product handles.
4. Your posts: `jq '.posts[START:END]' content/blog-plan/plan.json` (or `.extras[START:END]`).
5. One existing post in `content/blog/` to see the markdown flavour the renderer expects.

## For each post
- File: `content/blog/<slug>.md`. Frontmatter = exactly the SPEC schema. Copy `title`,
  `description`, `author`, `cluster`, `primaryKeyword`, `secondaryKeywords`, `tags`, `audience`,
  `image`, `imageAlt`, `imagePrompt`, `products`, `related`, `takeaways`, `faq` from plan.json
  VERBATIM (you may tighten an FAQ answer's wording but keep its meaning and 40–70 words).
  Add `publishedAt: 2026-09-28`, `updatedAt: 2026-09-28`, `readingTime` (words/200, rounded up),
  `draft: false`.
- Body: 550–850 words. Follow the plan's `outline`. Hook paragraph first (answer-first, no
  heading, no repeating the title). 3–5 `##` sections, at least one phrased as a question.
  Practical close. No `#` H1. No HTML. No external links. No images. No dates/years. No prices.
- Internal links: 3–6 markdown links to `/blog/<slug>` using slugs from `related` and any other
  plan slug (core or extras) or the 5 existing posts; descriptive anchors; at least one to a
  different cluster. Never link to a slug that is not in plan.json / content/blog.
- Voice: exactly the assigned author. Hariharan tells and decodes stories; Archana speaks to the
  body and attention with "try this"; Manikandan writes the reflective column with one everyday
  scene and one verse. Never name the influences, never mention AI, never preach or threaten.
- Define Sanskrit/Tamil terms on first use. Name the text when citing a story or verse.
- Product prose is forbidden in the body; the products block renders from frontmatter.

## Before you finish
Run `node scripts/blog-plan-validate.mjs --posts` if that mode exists; otherwise run this quick
check for each of your files: word count of body between 550 and 850, 3–6 `](/blog/` links, no
`#` line starting the body, no 4-digit number 19xx/20xx, no "http". Fix, then report: list of
slugs written, word counts, and any plan field you changed and why.
