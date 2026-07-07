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

## How to enable production CMS auth (status: project linked)

✅ **Mani has registered the Keystatic Cloud project as `phara-frontend/phara-frontend`** and the project slug is now baked into `keystatic.config.ts` as the default.

Remaining steps to finish wiring on Vercel:

1. ✅ Keystatic Cloud project created
2. ✅ GitHub App installed on the repo (granted when project was linked)
3. ✅ Project slug `phara-frontend/phara-frontend` set as the default in `keystatic.config.ts` — no Vercel env var needed for this
4. **Add the allowed editor email** in the Keystatic Cloud dashboard:
   - Open the project at https://keystatic.cloud/
   - Settings → Team → Invite `manihk@gmail.com`
5. **Redeploy** the Vercel project — it will now serve the cloud-backed admin
6. **Open** `https://your-vercel-url.vercel.app/keystatic` → sign in with the magic link

Optional: set `KEYSTATIC_STORAGE_KIND=local` in `.env.local` if you want to test schema changes locally without auth or git commits.

## How to use it locally right now

```bash
# Test with local storage (no auth, writes directly to filesystem)
KEYSTATIC_STORAGE_KIND=local npm run dev
# open http://localhost:8000/keystatic

# Or test with cloud auth pointing at the real project:
npm run dev
# open http://localhost:8000/keystatic — will prompt for Keystatic Cloud login
```

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
