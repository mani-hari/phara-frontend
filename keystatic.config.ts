import { collection, config, fields, singleton } from "@keystatic/core"

/* =====================================================================
   Keystatic config — PariharaOnline storefront CMS

   Production: storage uses Keystatic Cloud (magic-link auth, commits
   via the Keystatic Cloud GitHub App to claude/dev_1.1).
   Dev: set KEYSTATIC_STORAGE_KIND=local in .env.local to write to
   the local filesystem without any auth — useful for testing schema
   changes before pushing.

   Branch policy: edits commit to claude/dev_1.1 (current dev branch).
   A GitHub Actions workflow (.github/workflows/cms-auto-merge.yml)
   fast-forwards main when the changes are content-only.

   See docs/plans/cms-editor-plan.md for full rationale.
   ===================================================================== */

const KEYSTATIC_CLOUD_PROJECT =
  process.env.KEYSTATIC_CLOUD_PROJECT || "phara-frontend/phara-frontend"

// Default to cloud so production deploys "just work" once the env var
// chain is in place. Override to "local" for dev with no auth.
const storageKind =
  process.env.KEYSTATIC_STORAGE_KIND === "local" ? "local" : "cloud"

const seoFields = {
  seoTitle: fields.text({
    label: "SEO Title",
    description: "Shown in the browser tab and on Google results.",
  }),
  seoDescription: fields.text({
    label: "SEO Description",
    description: "Meta description. ~155 characters is ideal.",
    multiline: true,
  }),
  canonicalUrl: fields.text({
    label: "Canonical URL (optional)",
    description: "Override the canonical link tag if this page also exists elsewhere.",
  }),
  ogImage: fields.image({
    label: "Social share image (OG)",
    description: "Shown when this page is shared on WhatsApp, Twitter, Facebook, etc.",
    directory: "public/images/og",
    publicPath: "/images/og/",
  }),
}

const htmlSnippetField = fields.text({
  label: "HTML snippet (optional)",
  description:
    "Raw HTML for embeds, widgets, or tracking code. Renders below the body content. ⚠ Runs live — <script> tags will execute. Only paste from sources you trust.",
  multiline: true,
})

export default config({
  storage:
    storageKind === "cloud" ? { kind: "cloud" } : { kind: "local" },
  cloud: {
    project: KEYSTATIC_CLOUD_PROJECT,
  },
  ui: {
    brand: {
      name: "PariharaOnline CMS",
    },
    navigation: {
      "Site content": ["home", "pages", "blog"],
      Settings: ["nav", "footer"],
    },
  },

  // ------------------------------------------------------------------
  // SINGLETONS — one-of-a-kind pages
  // ------------------------------------------------------------------
  singletons: {
    home: singleton({
      label: "Home page",
      path: "content/home/",
      format: { data: "yaml" },
      schema: {
        heroEyebrow: fields.text({ label: "Hero eyebrow" }),
        heroTitle: fields.text({ label: "Hero title", multiline: true }),
        heroSubtitle: fields.text({ label: "Hero subtitle", multiline: true }),
        suggestionChips: fields.array(fields.text({ label: "Chip text" }), {
          label: "Chat suggestion chips",
          itemLabel: (props) => props.value,
        }),
        featuredProductHandles: fields.array(
          fields.text({ label: "Medusa product handle" }),
          {
            label: "Featured product handles",
            description:
              "Up to 3 Medusa product handles, in display order. Must match handles in your Medusa admin.",
            itemLabel: (props) => props.value,
          }
        ),
        intentTiles: fields.array(
          fields.object({
            title: fields.text({ label: "Title" }),
            subtitle: fields.text({ label: "Subtitle" }),
            count: fields.text({ label: "Count badge" }),
            href: fields.text({ label: "Link" }),
          }),
          {
            label: "Browse-by-intent tiles",
            itemLabel: (props) => props.fields.title.value,
          }
        ),
        recentVideos: fields.array(
          fields.object({
            title: fields.text({ label: "Title" }),
            meta: fields.text({ label: "Meta line (e.g. 'April 24 · 11 min')" }),
            placeholder: fields.text({ label: "Placeholder label" }),
            featured: fields.checkbox({ label: "Featured (large card)" }),
          }),
          {
            label: "Yagasala videos",
            itemLabel: (props) => props.fields.title.value,
          }
        ),
        astrologyEyebrow: fields.text({ label: "Astrology panel eyebrow" }),
        astrologyTitle: fields.text({ label: "Astrology panel title", multiline: true }),
        astrologyBody: fields.text({ label: "Astrology panel body", multiline: true }),
        astrologyCtaLabel: fields.text({ label: "Astrology CTA label" }),
        astrologyCtaSubline: fields.text({ label: "Astrology CTA subline" }),
        testimonialQuote: fields.text({ label: "Testimonial quote", multiline: true }),
        testimonialAuthor: fields.text({ label: "Testimonial author" }),
        testimonialLocation: fields.text({ label: "Testimonial location" }),
        htmlSnippet: htmlSnippetField,
        ...seoFields,
      },
    }),

    nav: singleton({
      label: "Site navigation",
      path: "content/settings/nav/",
      format: { data: "yaml" },
      schema: {
        items: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            href: fields.text({ label: "URL" }),
          }),
          {
            label: "Nav items",
            itemLabel: (props) => props.fields.label.value,
          }
        ),
      },
    }),

    footer: singleton({
      label: "Site footer",
      path: "content/settings/footer/",
      format: { data: "yaml" },
      schema: {
        tagline: fields.text({ label: "Tagline", multiline: true }),
        columns: fields.array(
          fields.object({
            title: fields.text({ label: "Column title" }),
            links: fields.array(
              fields.object({
                label: fields.text({ label: "Link label" }),
                href: fields.text({ label: "URL" }),
              }),
              {
                label: "Links",
                itemLabel: (props) => props.fields.label.value,
              }
            ),
          }),
          {
            label: "Columns",
            itemLabel: (props) => props.fields.title.value,
          }
        ),
        bottomLine: fields.text({ label: "Bottom-line text" }),
      },
    }),
  },

  // ------------------------------------------------------------------
  // COLLECTIONS — many-of pages
  // ------------------------------------------------------------------
  collections: {
    pages: collection({
      label: "Static pages",
      slugField: "title",
      path: "content/pages/*",
      format: { contentField: "body" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        body: fields.mdx({
          label: "Page content",
          options: {
            image: {
              directory: "public/images/pages",
              publicPath: "/images/pages/",
            },
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
      format: { contentField: "body" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        excerpt: fields.text({ label: "Excerpt", multiline: true }),
        author: fields.text({ label: "Author" }),
        publishedAt: fields.date({ label: "Published date" }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value,
        }),
        coverImage: fields.image({
          label: "Cover image",
          directory: "public/images/blog",
          publicPath: "/images/blog/",
        }),
        body: fields.mdx({
          label: "Post content",
          options: {
            image: {
              directory: "public/images/blog",
              publicPath: "/images/blog/",
            },
          },
        }),
        htmlSnippet: htmlSnippetField,
        ...seoFields,
      },
    }),
  },
})
