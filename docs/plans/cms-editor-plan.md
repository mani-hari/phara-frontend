# Plan — WYSIWYG content editor for PariharaOnline

**Status:** Plan only. No code written yet. Awaiting decision on Section §10 before implementation.

---

## Goal (in plain English)

Mani edits the entire site — home page, FAQ, about, astrology, blog posts, etc. — without touching code. Three editing modes (Visual, HTML, Markdown). SEO fields per page (title, description, slug, OG image). Image uploads with replace-existing. Minimal, clean, free, no surprise costs.

## Audit — what's already there

| Surface | Current state | Editable today? |
|---|---|---|
| **Blog posts** | Markdown files in `content/blog/` with frontmatter, parsed by `gray-matter`. A basic editor exists at `/blog/editor` (just textareas + form). | Partially — works but no WYSIWYG, no SEO fields, no image upload |
| **Home page** (`home-v3.tsx`) | Hardcoded JSX. Featured-product handles hard-coded. Intent tiles hard-coded. | No |
| **Static pages** (about, contact, faq, how-it-works, astrology, privacy, terms, refund) | Hardcoded JSX, 46–270 lines each | No |
| **Product pages** | Pulled from Medusa | **Out of scope — edit in Medusa admin** |
| **Collection / category pages** | Pulled from Medusa | **Out of scope — edit in Medusa admin** |
| **Nav / footer** | Hardcoded in `nav/index.tsx` and `footer/index.tsx` | No |

**Important boundary:** the CMS we build edits **storefront-owned content** only. Product data, prices, variants, inventory all live in Medusa and stay editable in the Medusa admin. The CMS handles everything else.

## Recommended stack — Keystatic

| Decision | Choice | Why |
|---|---|---|
| **Editor framework** | [Keystatic](https://keystatic.com/) by Thinkmill | Free + MIT licensed, native Next.js integration, file-based (writes MDX/YAML to repo), no database required, admin UI is clean and modern, schema-driven so adding fields is one line each |
| **Storage** | Git (writes to repo, commits via GitHub API) | Free, version-controlled, every edit is a git commit (full audit trail), no DB to provision/maintain |
| **Rich text engine** | Keystatic's built-in (Slate.js under the hood) | Battle-tested, supports MDX, has block-level components |
| **Three-view editing** | Visual (default) + Source (Markdown) + Preview (HTML render) — implemented as toolbar buttons in the editor | Not a default Keystatic feature; we add a small "view mode" toggle. ~3 hours of custom work |
| **SEO fields** | Schema-defined per content type, rendered as a separate sidebar panel | Native Keystatic capability |
| **Image management** | Uploads to `public/images/[collection]/`, committed to git OR routed to Cloudinary free tier (10 GB / month) | Native Keystatic capability |
| **Auth** | Keystatic Cloud (free) — magic-link login via email, locked to `manihk@gmail.com` | No password to manage, no GitHub mobile app required |
| **Where the admin lives** | `/keystatic` route in this Next.js app | Same domain, same deploy |

### Why Keystatic over the alternatives

| Option | Verdict | Reason |
|---|---|---|
| **Keystatic** ✅ | Recommended | Best fit: free, file-based, modern UI, no DB, sits inside this Next.js app |
| Payload CMS v3 | Strong but heavier | Needs Postgres (Vercel/Neon free tier exists but adds infra). More features than we need (multi-user RBAC, drafts, versioning). Migration of existing markdown blog is more work. Better answer if we need 5+ editors collaborating with role-based permissions — we don't. |
| TinaCMS | Close second | Visual editing directly on the live page is killer, but free tier limits collaborators and the paid tier kicks in if Mani adds anyone. Keystatic Cloud has no such limit. |
| Decap CMS (formerly Netlify CMS) | No | UI is dated, dev work has stalled in 2024, weak image handling. |
| Sanity / Contentful / Strapi Cloud | No | All have free tiers but lock you into vendor pricing if usage grows. Keystatic is self-hosted from day one. |
| Custom build with TipTap | No | The user explicitly asked for a well-established library. We'd be rebuilding 80% of what Keystatic gives for free. |

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Next.js app (this repo, deployed on Vercel)                 │
│                                                              │
│  ┌────────────────────┐    ┌─────────────────────────────┐  │
│  │  Storefront        │    │  Keystatic admin            │  │
│  │  /                 │    │  /keystatic                 │  │
│  │  /products/...     │    │  - locked to ADMIN_EMAIL    │  │
│  │  /about            │    │  - Visual/HTML/Markdown     │  │
│  │  /blog/...         │    │  - SEO panel per page       │  │
│  │  /faq              │    │  - Image upload + replace   │  │
│  └────────┬───────────┘    └────────────┬────────────────┘  │
│           │                              │                   │
│           │  reads at build / request   │  writes on save   │
│           ▼                              ▼                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  content/  ←  Git-tracked content directory          │   │
│  │  ├── home.mdx                                        │   │
│  │  ├── pages/                                          │   │
│  │  │   ├── about.mdx                                   │   │
│  │  │   ├── faq.mdx                                     │   │
│  │  │   ├── how-it-works.mdx                            │   │
│  │  │   └── ...                                         │   │
│  │  ├── blog/                                           │   │
│  │  │   └── *.mdx       (existing — migrated from .md)  │   │
│  │  ├── settings/                                       │   │
│  │  │   ├── nav.yaml                                    │   │
│  │  │   └── footer.yaml                                 │   │
│  │  └── images/         (uploads land here)             │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                              │
                              │  every edit pushes a commit to:
                              ▼
                  github.com/mani-hari/phara-frontend
                          (claude/dev_1.1 branch — or
                           a dedicated `content/main` branch)
```

## Schema design (Keystatic config)

A single `keystatic.config.ts` at the repo root defines what's editable. Outline:

```ts
import { config, collection, singleton, fields } from "@keystatic/core"

const seoFields = {
  seoTitle: fields.text({ label: "SEO Title", description: "Browser tab + Google result" }),
  seoDescription: fields.text({ label: "SEO Description", multiline: true }),
  ogImage: fields.image({ label: "Social share image", directory: "public/images/og" }),
  canonicalUrl: fields.text({ label: "Canonical URL (optional)" }),
}

export default config({
  storage: { kind: "cloud" },         // Keystatic Cloud (free) handles auth + git
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
        featuredProductHandles: fields.array(fields.text(), { label: "Featured product handles (Medusa)" }),
        intentTiles: fields.array(
          fields.object({
            title: fields.text({ label: "Title" }),
            subtitle: fields.text({ label: "Subtitle" }),
            count: fields.text({ label: "Count badge" }),
            href: fields.text({ label: "Link" }),
          }),
          { label: "Intent tiles" }
        ),
        recentVideos: fields.array(/* ... */, { label: "Yagasala videos" }),
        astrologyPanel: fields.object({ /* ... */ }),
        ...seoFields,
      },
    }),

    nav: singleton({
      label: "Site navigation",
      path: "content/settings/nav/",
      schema: {
        items: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            href: fields.text({ label: "URL" }),
          }),
          { label: "Nav items" }
        ),
      },
    }),

    footer: singleton({ /* similar */ }),
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
            // The visual / source / preview toggle goes here
          },
        }),
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
        ...seoFields,
      },
    }),
  },
})
```

This config is the single source of truth for what's editable. Adding a new page or new field = edit this file + edit the corresponding React template.

## The three-view editor mode

Keystatic's default MDX editor is the Visual mode. We add two more by extending the editor toolbar:

| Mode | What it shows | How |
|---|---|---|
| **Visual** (default) | The Slate-based rich-text editor with formatting buttons, image drop zone, etc. | Native |
| **Markdown source** | A `<textarea>` with the raw MDX source | Toggle button in toolbar swaps the editor with a Monaco / CodeMirror text area bound to the same field value |
| **HTML preview** | Read-only rendered HTML (what the visitor will see) | Toggle button shows the page's rendered output in an iframe |

Switching modes preserves content (same underlying field). Save commits whichever mode the editor was in. Library used for source mode: `@uiw/react-textarea-code-editor` (~5 KB, free, MIT). The HTML preview uses the existing Next.js page renderer via a `/preview/[slug]` route, only accessible from the admin.

This is ~150 lines of custom React inside `keystatic.config.ts`. Two pieces:
1. A custom field component that wraps `fields.mdx` with a three-button toolbar
2. The preview route on the storefront side

## SEO field design

Every page (home, static pages, blog posts) gets the same SEO sidebar:

```
┌─ SEO ────────────────────────────────────┐
│  SEO Title              [____________]   │  ← <title> tag override
│  SEO Description        [____________]   │  ← <meta name="description">
│                         (160 char limit) │
│  Canonical URL          [____________]   │  ← <link rel="canonical">
│                                          │
│  Social share image     [📷 Upload]     │  ← OG + Twitter card
│  ┌─────────────┐                         │
│  │  preview    │                         │
│  └─────────────┘                         │
│                                          │
│  Slug                   [____________]   │  ← URL path (collections only)
└──────────────────────────────────────────┘
```

Defined once as `seoFields` in `keystatic.config.ts` (see schema above), reused across all content types.

On the storefront side, the templates read these fields and inject them into `generateMetadata()`. Currently the static pages don't do this — they need ~10 lines of `generateMetadata()` each.

## Image management

**Where uploaded images go:** `public/images/[collection]/` (e.g. `public/images/blog/`, `public/images/pages/`, `public/images/og/`). Files committed to git, served by Vercel as static assets, automatically optimised via Next.js `<Image>`.

**Replace existing:** Click any image in the editor → "Replace image" button → file picker → uploaded over the same path (so any other page referencing it updates too). For a one-time copy-and-replace, "Insert new image" creates a new file.

**Storage growth limit:** Vercel free tier gives 100 GB bandwidth + unlimited static asset storage. Image files in git can bloat the repo though. Soft limit recommendation:
- Up to ~500 images total: keep in git
- Beyond that: migrate to Vercel Blob (free 1 GB) or Cloudinary (free 25 GB) — Keystatic supports both with a one-line config change

**Image optimisation:** Keystatic stores the original. Next.js's `<Image>` component generates WebP/AVIF at request time. No build-time work needed.

## Auth and access control

**Path A (recommended): Keystatic Cloud**
- Free for any single user
- Magic-link login (email)
- Email allowlist locked to `manihk@gmail.com` (configurable later)
- Pushes commits as the Keystatic Cloud GitHub app
- Works from Mani's phone browser
- No password to manage

**Path B (alternative): GitHub-based**
- Sign in with GitHub OAuth
- Only repo collaborators can log in
- Free
- Requires GitHub mobile app to edit from phone
- More setup but no third-party service

Either is free. Path A is simpler and more phone-friendly. Recommend Path A unless you have a reason to avoid Keystatic's hosted auth.

## Content migration — what we need to refactor

Each static page currently has its copy hardcoded in JSX. To make them editable, we:

1. **Extract content to a `.mdx` file** in `content/pages/[slug].mdx`
2. **Refactor the page template** to read from the MDX file via Keystatic's reader API
3. **Add `generateMetadata()`** for SEO fields

Approximate effort per page:

| Page | Lines of JSX | Editable content extracted | Migration effort |
|---|---|---|---|
| about | 158 | 1 hero + 4 prose blocks + values + team | 1 hour |
| how-it-works | 189 | 1 hero + 4 step blocks + CTA | 1 hour |
| astrology | 270 | 1 hero + 6 sections + sample report block + CTA | 1.5 hours |
| faq | 148 | Categories array + Q&A pairs | 1 hour |
| contact | 111 | 1 hero + form labels + contact details | 30 min |
| privacy, terms, refund | 46 each | Prose body + heading | 15 min each |
| home (`home-v3.tsx`) | 480 | Hero copy + chips + intent tiles + videos + astrology panel + testimonial + WhatsApp/FAQ teaser | 2 hours |
| nav | 100 | Items array | 15 min |
| footer | 130 | Columns array + tagline + bottom strip | 30 min |

**Total content refactor:** ~8 hours of focused work. Can be done one page at a time across multiple sessions — until a page is migrated, it still works (just isn't editable).

The blog migration is the easiest — content is already markdown with frontmatter. Just remap field names if needed and Keystatic reads it as-is.

## Implementation phases

### Phase 1 — Foundation (1 day)
- Install Keystatic + dependencies
- Create `keystatic.config.ts` with empty collections (home, pages, blog stubs)
- Set up Keystatic Cloud project, hook up auth
- Add `/keystatic` route, gate with `ADMIN_EMAIL` check
- Verify edit + commit flow works end-to-end (edit a dummy field, see the commit on GitHub, see Vercel redeploy)

**Definition of done:** Mani logs in at `pariharaonline.com/keystatic`, edits a test field, change appears on the live site within 90 seconds.

### Phase 2 — Three-view editor + SEO sidebar (1 day)
- Build the Visual/Markdown/HTML toggle as a custom MDX field component
- Build the SEO sidebar component (title, description, canonical, OG image)
- Wire the OG image upload to `public/images/og/`
- Add `generateMetadata()` helper that reads Keystatic SEO fields for any page

**Definition of done:** Editing a blog post shows all three modes; SEO sidebar saves and pushes the meta tags onto the live page.

### Phase 3 — Migrate blog (½ day)
- Migrate existing `content/blog/*.md` files into Keystatic's expected format (rename, normalise frontmatter)
- Retire the old `/blog/editor` route (Keystatic replaces it)
- Verify all five existing blog posts render unchanged

**Definition of done:** All current blog posts work; Mani can publish a new one entirely through Keystatic with cover image upload.

### Phase 4 — Migrate static pages (1 day)
- Extract each static page's content into `content/pages/[slug].mdx`
- Refactor `page.tsx` for each route to read from Keystatic and render the MDX
- Add SEO fields per page

**Definition of done:** All 8 static pages are editable through Keystatic, render identically to today, have SEO fields populated with the existing static metadata.

### Phase 5 — Migrate home + nav + footer (1 day)
- Extract home's hero copy, chips, intent tiles, video metadata, testimonial, etc. into structured fields in `content/home/index.yaml`
- Refactor `home-v3.tsx` to read from Keystatic
- Extract nav items and footer columns

**Definition of done:** Home page hero, chips, and tiles are editable. Nav + footer items can be added/removed/reordered.

### Phase 6 — Polish (½ day)
- Image library page (browse all uploaded images, delete unused)
- Quick "duplicate page" action
- Admin-only diagnostics: which page hasn't been edited in 90+ days, which page has no SEO description

### Total: ~4 days of focused work

Phases 1–3 cover the user's stated core requirements (WYSIWYG + HTML + Markdown + SEO + uploads). Phases 4–6 progressively migrate more of the site so increasingly more content is editable.

I'd recommend shipping Phase 1+2+3 as one block (one PR, fully working for the blog), then doing Phase 4+5+6 either incrementally or as a second block, depending on how quickly you want full coverage.

## Risks and watch-outs

1. **Keystatic Cloud is operated by Thinkmill** — small company, free tier could theoretically change. If it does, we self-host the auth ourselves (Path B). Migration is one config change, no content loss.
2. **MDX files in git mean every edit is a commit + Vercel redeploy** — a redeploy takes ~90 seconds with this codebase. Tolerable for daily editing, painful if Mani edits 30 things in a row. We can mitigate by batching saves (Keystatic supports "draft" mode that holds edits in the browser until "Publish all" is clicked).
3. **Cross-origin auth quirks** — Keystatic Cloud sets cookies on `keystatic.cloud` and verifies on our domain. Works on Vercel but might fail behind a corporate proxy. Not relevant for typical use.
4. **Image uploads to git can bloat the repo** — once we hit ~500 images, switch to Vercel Blob or Cloudinary. One config change.
5. **`generateMetadata` for SEO has to be in a server component** — Keystatic reader works server-side, so this is fine, but worth flagging if anyone tries to read content client-side later.
6. **The three-view toggle is custom code** — Keystatic itself doesn't ship this. We're building it. Maintenance burden is small (it's a thin wrapper) but it's not zero.

## Decision points — need your input before I start

| # | Decision | Default I recommend | Override? |
|---|---|---|---|
| 1 | **Auth path** — Keystatic Cloud vs self-managed GitHub OAuth | Keystatic Cloud (Path A) — free, phone-friendly, no password | ❓ |
| 2 | **Image storage** — git vs Vercel Blob vs Cloudinary | Git for now (move to Blob/Cloudinary if we hit ~500 images) | ❓ |
| 3 | **Content branch** — push edits to `claude/dev_1.1` or a dedicated `content/main` branch | `claude/dev_1.1` for now (since that's where development happens); switch to `main` post-launch | ❓ |
| 4 | **Phasing** — Phase 1–3 first then pause? Or all phases in one stretch? | Phase 1–3 first, verify the editing experience works for Mani daily, then phase 4–6 | ❓ |
| 5 | **Migration timing** — Do you want the existing `/blog/editor` route preserved as a fallback during migration, or removed immediately when Keystatic is up? | Preserve until Phase 3 ships, then delete | ❓ |
| 6 | **HTML view** — Is "render preview of the page" enough, or do you really need raw HTML editing (i.e., type `<div>` and have it stick)? | Render preview is the standard interpretation and is what most CMSes do. Raw HTML editing risks breaking the page. | ❓ |

## Estimated effort

| Phase | Effort | Notes |
|---|---|---|
| Phase 1 — Foundation | 1 day | Install, auth, gate, verify pipeline |
| Phase 2 — Editor + SEO | 1 day | Three-view toggle, SEO sidebar, generateMetadata helper |
| Phase 3 — Blog migration | ½ day | Existing markdown → Keystatic format |
| Phase 4 — Static pages | 1 day | 8 pages × ~30–90 min each |
| Phase 5 — Home + nav + footer | 1 day | Most complex schema, biggest payoff |
| Phase 6 — Polish | ½ day | Image library, diagnostics |
| **Total** | **~5 days** | Can be split across multiple sessions |

After this is done, you also unlock: drafts (work-in-progress that doesn't go live), scheduled publishing, content reuse across pages (e.g. shared testimonials block), and full undo via git history.

## What I'll NOT do in this plan

- Edit Medusa product/collection/category data — that stays in Medusa admin
- Build user roles / multi-editor permissions — free Keystatic is single-user; we can upgrade later
- Migrate the design system files in `docs/design/` to Keystatic — those are dev references, not content
- Build a CMS for marketing emails — the `docs/marketing/` folder is fine as-is, those are one-off campaigns
- Touch the Razorpay/PayPal/checkout flows — out of scope

## Questions for you

Answer the 6 decisions in the table above (or just say "go with all defaults") and I'll start Phase 1 in the next session. If you want a different stack from Keystatic (e.g. Payload CMS instead), say so before I begin — switching stacks mid-implementation costs a day.
