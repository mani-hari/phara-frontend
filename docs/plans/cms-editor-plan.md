# Plan v2 — WYSIWYG content editor for PariharaOnline

**Status:** ✅ All decisions locked. Implementation can begin.
v1 preserved in git history (commit `2924f69`).

## Locked decisions

| # | Decision | Locked answer |
|---|---|---|
| 1 | Snippet slots | **Single slot** per page (`htmlSnippet`). Renders at fixed location: bottom of body, above footer. |
| 2 | Sanitisation | **Allow everything, including `<script>` tags.** Admin-only field. Warning shown in admin UI: *"This HTML runs live. `<script>` tags execute."* |
| 3 | Publishing flow | **Two-branch: commits to `claude/dev_1.1` then auto-merges to `main`.** Implementation: Keystatic commits to dev_1.1 as usual; a GitHub Actions workflow watches for content-only commits (paths matching `content/**` or `public/images/**`) and fast-forwards `main` if there are no conflicts. Code changes (any non-content path) still flow through the normal dev_1.1 → manual merge to main path. |
| 4 | Auth path | Keystatic Cloud (default) — magic-link to `manihk@gmail.com` |
| 5 | Image storage | Git (default) — migrate to Vercel Blob or Cloudinary if we exceed ~500 images |
| 6 | Phasing | Phase 1–3 first, verify Mani's daily workflow, then Phase 4–6 |
| 7 | Existing `/blog/editor` | Preserve until Phase 3 ships, then delete |

## Auto-merge workflow detail (added for decision #3)

New file in Phase 1: `.github/workflows/cms-auto-merge.yml`

```yaml
name: CMS auto-merge content to main
on:
  push:
    branches: [claude/dev_1.1]
    paths:
      - 'content/**'
      - 'public/images/**'
jobs:
  fast-forward-main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}
      - name: Fast-forward main to dev_1.1
        run: |
          git config user.name "Keystatic CMS"
          git config user.email "cms@pariharaonline.com"
          git fetch origin main:main
          git checkout main
          git merge --ff-only origin/claude/dev_1.1
          git push origin main
```

- Triggers **only** when the push touches `content/**` or `public/images/**` paths (so pure code changes still need manual review before reaching main)
- Uses `--ff-only` so any non-trivial divergence falls back to manual merge (safe by default)
- Runs in ~30 seconds; Mani's content edits propagate to main automatically

If the merge ever fails (e.g., main has commits dev_1.1 doesn't), the workflow exits non-zero and posts a notification — manual sync needed.

---

# Plan v2 — WYSIWYG content editor for PariharaOnline

---

## Goal

Mani edits the entire storefront — home, FAQ, about, astrology, blog, etc. — through a clean admin UI. Two editing modes (Visual, Markdown). Every page has an "HTML snippet" slot for pasting embeds (YouTube, Instagram, tracking pixels, third-party widgets). SEO fields per page. Image upload with replace-existing. Free, minimal, well-established library.

## What changed and why

**Original plan:** Visual + Markdown + HTML editor modes, all editing the same body content. The HTML mode was the only custom-built piece — Keystatic doesn't ship it. Risk: typing `<div>` in HTML mode can produce malformed MDX when the editor parses it back. Most CMSes don't offer raw HTML editing because it tends to corrupt content. We were going against the grain.

**New plan:** Visual + Markdown only for body content (both supported natively by Keystatic, one toggle button switches them). For raw HTML — embed codes, custom widgets, tracking snippets — every page gets a separate **HTML snippet** field. This is a code-only text area, rendered into the page exactly where the template places it. No risk of mixing rich text with raw HTML and corrupting either.

This is how Webflow, Ghost, Notion, Squarespace, and most modern CMSes handle it. Body content stays clean; "custom code" lives in its own slot.

---

## Audit (unchanged from v1)

| Surface | Current state | In scope? |
|---|---|---|
| **Blog posts** | Markdown in `content/blog/`, basic editor at `/blog/editor` | ✅ Yes |
| **Home page** | Hardcoded JSX in `home-v3.tsx` (~480 lines) | ✅ Yes |
| **Static pages** (about, contact, faq, how-it-works, astrology, privacy, terms, refund) | Hardcoded JSX, 46–270 lines each | ✅ Yes |
| **Product / collection / category pages** | Pulled from Medusa | ❌ Stays in Medusa admin |
| **Nav / footer** | Hardcoded in templates | ✅ Yes |

## Stack (unchanged)

| Decision | Choice |
|---|---|
| CMS | **Keystatic** (Thinkmill, MIT, free, file-based) |
| Storage | Git — every edit commits to repo |
| Auth | Keystatic Cloud — magic link to `manihk@gmail.com` |
| Admin route | `/keystatic` in this Next.js app |
| Editor | Keystatic's native Slate-based editor (Visual + Markdown source toggle, both built in) |
| HTML snippet | New schema field on every page — explained below |
| SEO fields | Native Keystatic schema fields, rendered as a sidebar panel |
| Image management | Native Keystatic upload + replace |

## How the editor looks

```
┌─────────────────────────────────────────────────────────────┐
│  ← All pages         Editing: About Us            [Publish] │
├─────────────────────────────────────────────────────────────┤
│  Title    [_________________________________________________]│
│                                                              │
│  Body     [ Visual | Markdown ]    ← toggle, default Visual │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ # PariharaOnline                                        ││
│  │ For over a decade, we've connected devotees to...       ││
│  │                                                         ││
│  │ [B] [I] [link] [H1] [H2] [img] [list]                   ││
│  │                                                         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  HTML snippet (optional)                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ <iframe src="https://youtube.com/embed/abc" ...></iframe││
│  │                                                         ││
│  │ ⚠ This HTML runs live. <script> tags execute.           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─ SEO ─────────────────────────────┐                      │
│  │ Title         [________________]   │                      │
│  │ Description   [________________]   │                      │
│  │ Canonical     [________________]   │                      │
│  │ OG image      [📷 Upload]         │                      │
│  └────────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## HTML snippet field — design

**One field per content type**, named `htmlSnippet`, stored as a string in the page's MDX frontmatter or YAML file. Rendered by the page template at a fixed slot — by default, **at the bottom of the main body content, above the footer**.

```yaml
# content/pages/astrology.mdx frontmatter
title: Astrology
seoTitle: Vedic Astrology Consultations | PariharaOnline
seoDescription: ...
htmlSnippet: |
  <div id="trustpilot-widget" data-locale="en-US" data-template-id="..."></div>
  <script src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"></script>
---
# (rich text body content lives here)
```

On the page template:

```tsx
// src/app/[countryCode]/(main)/astrology/page.tsx
const page = await reader.collections.pages.read("astrology")

return (
  <>
    <PageBody mdx={page.body} />
    {page.htmlSnippet && (
      <div
        className="content-container py-12"
        dangerouslySetInnerHTML={{ __html: page.htmlSnippet }}
      />
    )}
  </>
)
```

### Where exactly the snippet renders, per content type

| Page | Snippet renders at |
|---|---|
| Static pages (about, faq, etc.) | Below body, above footer |
| Home page | Below the astrology + testimonial split, above the WhatsApp/FAQ teaser block |
| Blog posts | Below post body, above "related posts" / chat pill |

Templates know exactly where; nothing for Mani to configure.

### Common use cases (the field exists for these)

- YouTube / Vimeo video embed (`<iframe>`)
- Instagram / Twitter / TikTok post embed (`<blockquote>` + `<script>`)
- Calendly booking widget
- Trustpilot / Google reviews widget
- One-off CSS for a seasonal banner (`<style>...</style>`)
- Pixel / conversion tracking (`<noscript>`, `<img>` beacons — though GA4 / Meta pixel should be in the root layout, not per page)
- HTML email signup form from Mailchimp / Klaviyo
- A 3rd-party donation widget

### Security

- The snippet executes on the live page. `<script>` tags will run.
- We're trusting Mani's input — this is admin-only and his email is the only one with access.
- Admin UI shows the warning *"This HTML runs live. `<script>` tags execute. Only paste code from sources you trust."*
- No server-side execution. Snippet is rendered as static HTML at request time. It does not have access to API keys or secrets.
- For Mani's safety, the snippet field is **not** rendered on `/preview/` routes if someone other than admin views them (e.g., shareable preview links to non-editors). Practical impact: when previewing a page before publish, the snippet area shows a placeholder reading *"HTML snippet hidden in preview — visible on live site"*.

## Schema (Keystatic config)

```ts
// keystatic.config.ts
import { config, collection, singleton, fields } from "@keystatic/core"

const seoFields = {
  seoTitle: fields.text({ label: "SEO Title" }),
  seoDescription: fields.text({ label: "SEO Description", multiline: true }),
  canonicalUrl: fields.text({ label: "Canonical URL (optional)" }),
  ogImage: fields.image({ label: "Social share image", directory: "public/images/og" }),
}

const htmlSnippetField = fields.text({
  label: "HTML snippet (optional)",
  description: "Raw HTML for embeds, widgets, or tracking code. Runs live. <script> tags execute.",
  multiline: true,
})

export default config({
  storage: { kind: "cloud" },
  cloud: { project: "phara-frontend" },

  singletons: {
    home: singleton({
      label: "Home page",
      path: "content/home/",
      schema: {
        heroEyebrow: fields.text({ label: "Hero eyebrow" }),
        heroTitle: fields.text({ label: "Hero title", multiline: true }),
        heroSubtitle: fields.text({ label: "Hero subtitle", multiline: true }),
        suggestionChips: fields.array(fields.text(), { label: "Chat suggestion chips" }),
        featuredProductHandles: fields.array(fields.text(), { label: "Featured product Medusa handles" }),
        intentTiles: fields.array(/* ... */, { label: "Intent tiles" }),
        recentVideos: fields.array(/* ... */, { label: "Yagasala videos" }),
        astrologyPanel: fields.object({ /* ... */ }),
        htmlSnippet: htmlSnippetField,
        ...seoFields,
      },
    }),

    nav: singleton({ /* nav items only — no body, no snippet, no SEO */ }),
    footer: singleton({ /* footer columns only */ }),
  },

  collections: {
    pages: collection({
      label: "Static pages",
      slugField: "title",
      path: "content/pages/*",
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        body: fields.mdx({
          label: "Page content",
          options: {
            image: { directory: "public/images/pages" },
          },
        }),
        htmlSnippet: htmlSnippetField,
        ...seoFields,
      },
    }),

    blog: collection({
      label: "Blog posts",
      slugField: "title",
      path: "content/blog/*",
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        excerpt: fields.text({ label: "Excerpt", multiline: true }),
        author: fields.text({ label: "Author" }),
        publishedAt: fields.date({ label: "Published date" }),
        tags: fields.array(fields.text(), { label: "Tags" }),
        coverImage: fields.image({ label: "Cover image", directory: "public/images/blog" }),
        body: fields.mdx({ label: "Post content" }),
        htmlSnippet: htmlSnippetField,
        ...seoFields,
      },
    }),
  },
})
```

Adding a new editable page = add an entry to `content/pages/`, no schema change needed. Adding a new field (e.g., per-page "hero background colour") = one line in this config.

## What Phase 2 work now looks like (simpler than v1)

In v1, Phase 2 was 1 day because we had to custom-build a 3-mode editor toggle. In v2, Phase 2 is ~½ day:

- Wire up the SEO sidebar (Keystatic does most of this; we add the layout)
- Add the HTML snippet field to each schema (1 line each)
- Add the snippet render block to each page template (~10 lines each, 8 pages = 1 hour)
- Add the `generateMetadata()` helper that maps Keystatic SEO fields to Next.js metadata

The body editor itself — Visual + Markdown source toggle — is Keystatic out of the box. Zero custom code. The Markdown view is reached via Keystatic's existing "source mode" button in the editor toolbar.

## Image management (unchanged)

- Upload to `public/images/[collection]/`, committed to git
- "Replace image" button on existing images
- Migrate to Vercel Blob or Cloudinary if we exceed ~500 images (one config change)

## Auth and access control (unchanged)

- Keystatic Cloud free tier
- Magic-link login locked to `manihk@gmail.com`
- All edits push as the Keystatic Cloud GitHub app

## Content migration (unchanged)

8 hours total to extract hardcoded JSX content into editable MDX/YAML files. Each page can be migrated independently — until migrated, the page works as-is, it just isn't editable.

| Page | Effort |
|---|---|
| Home | 2 h |
| Astrology | 1.5 h |
| About / How it works / FAQ | 1 h each |
| Contact | 30 min |
| Privacy / Terms / Refund | 15 min each |
| Nav | 15 min |
| Footer | 30 min |

## Implementation phases (updated)

| Phase | Ships | Time |
|---|---|---|
| 1 | Foundation — Keystatic install, Cloud auth, gated `/keystatic` route, working pipeline | 1 day |
| 2 | Visual+Markdown editor (native), SEO sidebar, **HTML snippet field**, generateMetadata helper | ½ day |
| 3 | Blog migration — existing markdown adapted into Keystatic format, retire `/blog/editor` | ½ day |
| 4 | Static pages migrated (8 pages) | 1 day |
| 5 | Home + nav + footer migrated | 1 day |
| 6 | Polish — image library, diagnostics | ½ day |
| **Total** | | **~4.5 days** |

Phases 1–3 are the user-visible MVP (blog publishing works through Keystatic with the snippet + SEO fields). Phases 4–6 progressively cover the rest of the site.

## Risks (mostly unchanged)

1. **Keystatic Cloud operated by Thinkmill** — small company. If free tier changes, swap to self-managed GitHub OAuth (one-config change, no content loss).
2. **Every edit triggers a Vercel redeploy** (~90s). Keystatic supports batched draft mode if this becomes annoying.
3. **HTML snippet field can break a page** if Mani pastes malformed HTML — but the failure is isolated to the snippet block, not the rest of the page. We render it inside a `<div>` boundary so a missing `</div>` doesn't break parent layout.
4. **Image uploads bloat the repo at scale** — migrate to Vercel Blob / Cloudinary at ~500 images.
5. **No raw-HTML editing of body content** — but Markdown view covers 99% of advanced editing cases. If Mani genuinely needs to write a `<div>` mid-paragraph, he can: MDX supports inline HTML. Power user feature.

## What stays out of scope

- Editing Medusa products, collections, categories, prices, inventory (Medusa admin)
- Multi-editor permissions / role-based access (single-user assumption)
- Editing the design system files in `docs/design/`
- A CMS for marketing emails (`docs/marketing/` stays flat-file)
- Editing checkout / payment / region logic

## Decisions — need your input before I start

| # | Decision | My recommended default | Override? |
|---|---|---|---|
| 1 | **Auth path** — Keystatic Cloud vs self-managed GitHub OAuth | Keystatic Cloud (phone-friendly, free, no password) | ❓ |
| 2 | **Image storage** — git vs Vercel Blob vs Cloudinary | Git for now (move at ~500 images) | ❓ |
| 3 | **Content commit branch** — push edits to `claude/dev_1.1` vs `main` vs dedicated `content/main` | `claude/dev_1.1` during dev; switch to `main` after launch | ❓ |
| 4 | **Phasing** — ship 1–3 then pause, or all 6 in one block? | 1–3 first, verify the editing experience works for Mani daily, then 4–6 | ❓ |
| 5 | **Existing `/blog/editor` route** — keep as fallback until Phase 3 ships, or delete immediately? | Keep until Phase 3 ships, then delete | ❓ |

## Open questions for you (need answers before I start)

1. **HTML snippet location override** — should each page have a single snippet slot that always renders below body (my recommendation), or do you want **named slots** like `htmlSnippetHeader` / `htmlSnippetFooter` so you can paste different code at top vs bottom of the same page? Named slots cost ~30 min extra and add a tiny bit of admin clutter. Single slot covers ~95% of needs.

2. **HTML snippet sanitisation** — should the field allow everything (including `<script>` tags), or do we strip script tags for safety? I recommend **allow everything** because most useful embeds (YouTube, Instagram, Trustpilot, Calendly) need scripts to function. The warning in the admin UI plus single-admin access makes this safe in practice. But if you'd rather strip scripts, say so.

3. **Where should "publish" actually publish to?** Two options:
   - **A.** Edits commit to `claude/dev_1.1` (current dev branch). Vercel preview rebuilds. Once verified, you merge `dev_1.1` → `main` to go live. This is the safer dev workflow.
   - **B.** Edits commit directly to `main` (production branch). Vercel production rebuilds. Live in 90 seconds. This is faster but riskier — a broken HTML snippet immediately hits production.
   
   Most clients on Keystatic use option B because the audit trail + 1-click revert via git is enough safety. But for a religious services site where content credibility matters, option A might feel better. Which do you want?

Reply with answers (or just "go with all defaults") and I'll start Phase 1 in the next session.
