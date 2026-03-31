"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { markdownToHtml } from "@lib/util/markdown"

type BlogEditorProps = {
  countryCode: string
}

const today = new Date().toISOString().slice(0, 10)

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export default function BlogEditor({ countryCode }: BlogEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [excerpt, setExcerpt] = useState("")
  const [author, setAuthor] = useState("PariharaOnline Editorial Team")
  const [publishedAt, setPublishedAt] = useState(today)
  const [tags, setTags] = useState("Temple Rituals, Spiritual Guidance")
  const [coverImage, setCoverImage] = useState("")
  const [content, setContent] = useState(`# Article Title

Start with a short introduction that explains why this topic matters to devotees.

## Key Takeaways

- Point one
- Point two
- Point three

## Main Section

Write the detailed content here.`)
  const [mode, setMode] = useState<"edit" | "preview">("edit")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title))
    }
  }, [slugTouched, title])

  const previewHtml = useMemo(() => markdownToHtml(content), [content])

  const submit = () => {
    setMessage(null)
    setError(null)

    startTransition(async () => {
      try {
        const response = await fetch("/api/blog", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            slug,
            excerpt,
            author,
            publishedAt,
            tags: tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
            coverImage,
            content,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to save blog post.")
        }

        setMessage(`Saved ${data.slug}.md to content/blog.`)
        router.push(`/${countryCode}/blog/${data.slug}`)
        router.refresh()
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : "Failed to save blog post."
        )
      }
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[32px] border border-grey-10 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
              Markdown Editor
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-grey-90">
              Publish a new article
            </h2>
          </div>
          <div className="inline-flex rounded-full bg-grey-5 p-1 text-sm">
            <button
              type="button"
              className={`rounded-full px-4 py-2 ${
                mode === "edit"
                  ? "bg-white text-grey-90 shadow-sm"
                  : "text-grey-50"
              }`}
              onClick={() => setMode("edit")}
            >
              Edit
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-2 ${
                mode === "preview"
                  ? "bg-white text-grey-90 shadow-sm"
                  : "text-grey-50"
              }`}
              onClick={() => setMode("preview")}
            >
              Preview
            </button>
          </div>
        </div>

        {mode === "edit" ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-grey-70">Title</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-2xl border border-grey-10 px-4 py-3 text-sm outline-none transition focus:border-brand-300"
                  placeholder="How to choose the right puja for a family remedy"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-grey-70">Slug</span>
                <input
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true)
                    setSlug(slugify(event.target.value))
                  }}
                  className="w-full rounded-2xl border border-grey-10 px-4 py-3 text-sm outline-none transition focus:border-brand-300"
                  placeholder="choose-the-right-puja"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-grey-70">Excerpt</span>
              <textarea
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-grey-10 px-4 py-3 text-sm outline-none transition focus:border-brand-300"
                placeholder="A short summary used on the blog homepage and SEO snippets."
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-medium text-grey-70">Author</span>
                <input
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  className="w-full rounded-2xl border border-grey-10 px-4 py-3 text-sm outline-none transition focus:border-brand-300"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-grey-70">
                  Publish date
                </span>
                <input
                  type="date"
                  value={publishedAt}
                  onChange={(event) => setPublishedAt(event.target.value)}
                  className="w-full rounded-2xl border border-grey-10 px-4 py-3 text-sm outline-none transition focus:border-brand-300"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-grey-70">Tags</span>
                <input
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  className="w-full rounded-2xl border border-grey-10 px-4 py-3 text-sm outline-none transition focus:border-brand-300"
                  placeholder="Astrology, Remedies, Temples"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-grey-70">
                Cover image URL
              </span>
              <input
                value={coverImage}
                onChange={(event) => setCoverImage(event.target.value)}
                className="w-full rounded-2xl border border-grey-10 px-4 py-3 text-sm outline-none transition focus:border-brand-300"
                placeholder="Optional. Leave blank if not using a cover image."
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-grey-70">Markdown</span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={20}
                className="min-h-[520px] w-full rounded-3xl border border-grey-10 bg-grey-95 px-4 py-4 font-mono text-sm text-grey-5 outline-none transition focus:border-brand-300"
              />
            </label>

            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-grey-50">
                Saves directly into `content/blog`. This is intended for local
                authoring in this workspace.
              </p>
              <button
                type="button"
                onClick={submit}
                disabled={isPending}
                className="rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Save article"}
              </button>
            </div>
          </div>
        ) : (
          <article className="prose max-w-none">
            <h1 className="text-3xl font-bold text-grey-90">{title || "Untitled article"}</h1>
            <p className="mt-3 text-sm text-grey-50">
              {author} • {publishedAt || today}
            </p>
            <div
              className="mt-8"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </article>
        )}

        {message && <p className="mt-4 text-sm text-emerald-700">{message}</p>}
        {error && <p className="mt-4 text-sm text-rose-700">{error}</p>}
      </section>

      <aside className="rounded-[32px] border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-warm-50 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
          Authoring Notes
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-grey-90">
          Keep publishing lightweight
        </h3>
        <div className="mt-6 space-y-4 text-sm leading-7 text-grey-60">
          <p>
            Use one `.md` file per article. The blog index and article routes
            read from `content/blog`, so new articles appear without extra code.
          </p>
          <p>
            Recommended structure: short intro, 2-4 helpful sections, a small
            FAQ, and one practical takeaway for devotees booking a service.
          </p>
          <p>
            Tags shape homepage discovery cards, so keep them concise and
            repeatable.
          </p>
        </div>
      </aside>
    </div>
  )
}
