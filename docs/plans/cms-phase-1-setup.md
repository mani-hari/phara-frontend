# CMS — Phase 1 Setup (status & next steps)

**Status:** Phase 1 scaffolded. Local dev works; production cloud auth needs Mani's GitHub action.

## What's been shipped (commit pending — about to push)

- `keystatic.config.ts` at repo root — full schema for home, pages, blog, nav, footer with `htmlSnippet` + SEO fields on every content type
- `/keystatic` admin route (page.tsx + API route handler)
- `content/` directory scaffolded:
  - `content/home/index.yaml` — pre-seeded with current home page copy
  - `content/settings/nav/index.yaml` — pre-seeded with current nav items
  - `content/settings/footer/index.yaml` — pre-seeded with current footer
  - `content/pages/` — empty, ready for static page migration in Phase 4
  - `content/blog/` — existing markdown blog posts (not yet migrated to Keystatic format)
- `public/images/{og,blog,pages}/` — upload destinations
- `.github/workflows/cms-auto-merge.yml` — auto-merge content commits dev_1.1 → main
- `src/middleware.ts` — Keystatic admin path excluded from country-code routing

## How to use it locally right now

```bash
npm run dev
# open http://localhost:8000/keystatic
```

In local mode (no Keystatic Cloud configured), edits write directly to your local filesystem — no auth required, no commits. Use this to verify the editor UI works and to test the schema before going live.

## How to enable production CMS auth (Mani's action required)

This is the only thing blocking real production use. Takes ~5 minutes.

1. **Sign up at https://keystatic.cloud** with the same email as your GitHub account (`manihk@gmail.com`)
2. **Create a new project** in the Keystatic Cloud dashboard:
   - Name: `phara-frontend`
   - Link to GitHub repo: `mani-hari/phara-frontend`
   - Branch: `claude/dev_1.1`
   - Install the Keystatic Cloud GitHub App when prompted (grants commit access to the repo)
3. **Copy the project slug** shown in the dashboard (looks like `mani-hari/phara-frontend`)
4. **Set two env vars in Vercel** (Production + Preview scopes):
   - `KEYSTATIC_STORAGE_KIND=cloud`
   - `KEYSTATIC_CLOUD_PROJECT=<the slug from step 3>`
5. **Redeploy** — Keystatic admin at `https://your-vercel-url.vercel.app/keystatic` now shows a "Sign in" button using Keystatic Cloud magic-link auth
6. **Add allowed emails** in the Keystatic Cloud dashboard — only `manihk@gmail.com` for now

## What works today (without Cloud, locally)

- All schemas are valid; editor loads
- Editing the home page YAML, nav, footer
- Creating new static pages
- Image uploads (write to `public/images/...`)
- Visual + Markdown source toggle (Keystatic native — click the `</>` icon in the editor toolbar)
- SEO sidebar
- HTML snippet field per content type

## What's NOT wired up yet (Phase 2–5)

- Storefront pages still read from hardcoded JSX, not from Keystatic content files. So editing in Keystatic right now changes the YAML/MDX files but the live pages don't reflect the changes until Phase 2 wires `home-v3.tsx` to read from `content/home/index.yaml`. This is the Phase 2 work.
- Existing blog posts in `content/blog/*.md` need format adapter to match Keystatic's expected structure (Phase 3)
- Static pages still hardcoded (Phase 4)

## Next steps (priority order)

1. **Mani sets up Keystatic Cloud project** (5 min, blocks production CMS auth)
2. **Phase 2 — wire storefront to Keystatic** (½ day):
   - Refactor `home-v3.tsx` to read from `content/home/index.yaml`
   - Refactor `nav/index.tsx` to read from `content/settings/nav/`
   - Refactor `footer/index.tsx` to read from `content/settings/footer/`
   - Add `generateMetadata()` helper for SEO fields
   - Add HTML snippet render block in templates
3. **Phase 3 — blog migration** (½ day)
4. **Phase 4 — static pages** (1 day)
5. **Phase 5 — full home wiring** (continues from Phase 2)
6. **Phase 6 — polish** (½ day)

## Notes

- Keystatic admin route bundles to ~852 KB. That's fine for an admin UI loaded only by Mani.
- Build verified locally with `next build`. No type errors, no runtime warnings related to Keystatic.
- The `/keystatic` route is excluded from the country-code middleware so it doesn't get redirected to `/in/keystatic` or similar.
- For local mode, no auth is enforced. Once Cloud is set up, only allowed emails can log in via magic link.
