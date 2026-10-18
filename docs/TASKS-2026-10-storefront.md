# Storefront task queue (started 18 Oct 2026)

Owner's request, worked one task at a time so a session can stop at any point and the next one
picks up from the first unchecked box. Update this file as each step finishes (commit it).

Order: **A → B → C** (owner: "do 2 first, then 1 and 3"). B and C both touch the home page,
so they ship together after A.

## A. Bundle page (owner's item 2)

A "bundle" is a normal Medusa product whose page shows a checklist of other products' variants
instead of its own variant picker; each ticked item is its own cart line. Today it is configured in
code (`src/lib/data/product-bundles.ts`, keyed by handle `navratri-poojas-online`).

- [x] A0. Checkbox bundle on the Navratri page, live (commit f7122e6); description sections and
      slokas (e883412, 0cf81ac).
- [x] A1. Low-fidelity layouts to discuss: sticky booking card on the right, rich content on the
      left, one section per bundled pooja, photos spread through the scroll, mobile bottom bar.
      Owner picked Option 1 (18 Oct).
- [x] A1b. Clickable version on localhost: `templates/bundle-spread.tsx` (sticky card, story sections per
      pooja with synced "Add to my selection", photos spread, mobile bottom bar). Committed, NOT pushed.
      Waiting for owner's review. If approved, generalise as "product page spread" for all products (A5).
- [ ] A2. Name and config: call it a "Pooja Bundle" in the UI/code; move the item list from code
      to product metadata (`metadata.bundle_items` = ordered variant IDs + labels) so bundles can be
      made in Medusa admin without a deploy. No change to Medusa's own data model.
- [x] A3. Built: one shared layout `templates/product-spread.tsx` (bundle mode + normal mode).
- [ ] A4. Test: desktop + mobile, INR (/in) and USD, add 1 and several items, cart lines, checkout
      reaches payment. Owner pushes to main; verify live.
- [x] A5. (18 Oct, owner approved and asked to push) Applied to ALL product pages, language switcher +
      translations kept, 3:2 no-crop SafeImage, plain descriptions' "Who is it for?"-style lines become sections.
      Was: If owner likes it: "product page spread" layout for every product page (sticky add-to-cart
      card, description sections with gallery photos spread through). Storefront-only; reads standard fields.

## B. Home page: videos and featured products (owner's item 1)

- [ ] B1. Move "Recent videos" up to sit right after the Ask Parihara chat section.
- [ ] B2. Replace the static featured grid with a curated rotation: a fixed core of 4–5 top
      sellers plus a seasonal slot (e.g. Navratri bundle, a planetary transit) that is switched by
      date window or by Medusa collection/metadata, not code. Decide carousel vs grid in A1-style
      low-fi first.
- [ ] B3. Test on mobile and desktop; owner pushes; verify live.

## C. Home page: new blog posts (owner's item 3)

Finding (18 Oct): the home page has **no** blog section, so scheduled posts are not advertised there.

- [ ] C1. "From the blog" section with the latest 3 published posts, a "New" tag on posts from the
      last 7 days, link to /blog. Only posts already live (respect the schedule).
- [ ] C2. Ship together with B; verify live.
