import "server-only"

import { existsSync } from "fs"
import fs from "fs/promises"
import path from "path"
import { cache } from "react"
import matter from "gray-matter"

import { resolveBlogAuthor } from "./blog-authors"

// Frontmatter schema: content/blog-plan/SPEC.md. The five original posts use
// an older shape (`excerpt`, `author: <display name>`, no image/related), and
// the /blog/editor writes `excerpt` + `coverImage`; both are still accepted.

export type BlogProducts = {
  handles: string[]
  query?: string
  heading?: string
}

export type BlogFaq = { q: string; a: string }

export type BlogPost = {
  slug: string
  title: string
  /** SEO description (`description`, falling back to legacy `excerpt`). */
  description: string
  /** Alias of `description`, kept for existing consumers. */
  excerpt: string
  /** Author display name. */
  author: string
  authorSlug: string
  /** YYYY-MM-DD */
  publishedAt: string
  /** YYYY-MM-DD (defaults to publishedAt) */
  updatedAt: string
  cluster?: string
  primaryKeyword?: string
  secondaryKeywords: string[]
  tags: string[]
  audience: "general" | "nri-us" | "seeker"
  /** Public path of the hero image — only set when the file exists in public/. */
  image?: string
  imageAlt: string
  /** Alias of `image`, kept for existing consumers. */
  coverImage?: string
  products?: BlogProducts
  related: string[]
  takeaways: string[]
  faq: BlogFaq[]
  readingTime: number
  draft: boolean
  content: string
}

export type SaveBlogPostInput = {
  slug?: string
  title: string
  excerpt: string
  author: string
  publishedAt: string
  tags?: string[]
  content: string
  coverImage?: string
}

export type BlogTag = { slug: string; name: string; count: number }

export const BLOG_PAGE_SIZE = 24

const BLOG_CONTENT_DIR = path.join(process.cwd(), "content", "blog")
// Scoped to public/blog so file tracing only bundles blog heroes, not all of public/.
const PUBLIC_BLOG_DIR = path.join(process.cwd(), "public", "blog")

const WORDS_PER_MINUTE = 200

const calculateReadingTime = (content: string) => {
  const words = content.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

/** "nri-us-guides" → "Nri Us Guides" (used when a cluster id has no tag of the same name). */
const humanize = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

const toStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((v) => String(v ?? "").trim()).filter(Boolean)
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
  }
  return []
}

/** gray-matter turns bare YAML dates into Date objects; normalise to YYYY-MM-DD. */
const toIsoDate = (value: unknown): string | null => {
  if (!value) return null
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  const raw = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10)
  const parsed = new Date(raw)
  return isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10)
}

const parseProducts = (value: unknown): BlogProducts | undefined => {
  if (!value || typeof value !== "object") return undefined
  const v = value as Record<string, unknown>
  const handles = toStringList(v.handles).slice(0, 2)
  const query = v.query ? String(v.query).trim() : undefined
  const heading = v.heading ? String(v.heading).trim() : undefined
  if (!handles.length && !query) return undefined
  return { handles, query: query || undefined, heading: heading || undefined }
}

const parseFaq = (value: unknown): BlogFaq[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const i = item as Record<string, unknown>
      const q = String(i.q ?? i.question ?? "").trim()
      const a = String(i.a ?? i.answer ?? "").trim()
      return q && a ? { q, a } : null
    })
    .filter((x): x is BlogFaq => !!x)
}

/** Only expose a hero path if the file is actually in public/ (writers set the planned path before the image pipeline runs). */
const resolveImage = (value: unknown): string | undefined => {
  if (!value) return undefined
  const src = String(value).trim()
  if (!src) return undefined
  if (/^https?:\/\//.test(src)) return src
  const rel = src.startsWith("/") ? src : `/${src}`
  if (!rel.startsWith("/blog/")) return rel
  return existsSync(path.join(PUBLIC_BLOG_DIR, rel.slice("/blog/".length)))
    ? rel
    : undefined
}

const parsePostFile = async (fileName: string): Promise<BlogPost> => {
  const fullPath = path.join(BLOG_CONTENT_DIR, fileName)
  const file = await fs.readFile(fullPath, "utf8")
  const { data, content } = matter(file)
  const slug = fileName.replace(/\.md$/, "")
  const author = resolveBlogAuthor(data.author)
  const publishedAt =
    toIsoDate(data.publishedAt) || new Date().toISOString().slice(0, 10)
  const description = String(data.description || data.excerpt || "").trim()
  const image = resolveImage(data.image || data.coverImage)
  const audience = ["general", "nri-us", "seeker"].includes(String(data.audience))
    ? (String(data.audience) as BlogPost["audience"])
    : "general"
  const readingTime = Number.isFinite(Number(data.readingTime)) && Number(data.readingTime) > 0
    ? Math.round(Number(data.readingTime))
    : calculateReadingTime(content)

  return {
    slug,
    title: String(data.title || slug).trim(),
    description,
    excerpt: description,
    author: author.name,
    authorSlug: author.slug,
    publishedAt,
    updatedAt: toIsoDate(data.updatedAt) || publishedAt,
    cluster: data.cluster ? slugify(String(data.cluster)) : undefined,
    primaryKeyword: data.primaryKeyword ? String(data.primaryKeyword) : undefined,
    secondaryKeywords: toStringList(data.secondaryKeywords),
    tags: toStringList(data.tags),
    audience,
    image,
    imageAlt: String(data.imageAlt || data.title || "").trim(),
    coverImage: image,
    products: parseProducts(data.products),
    related: toStringList(data.related).filter((s) => s !== slug),
    takeaways: toStringList(data.takeaways).slice(0, 3),
    faq: parseFaq(data.faq),
    readingTime,
    draft: data.draft === true || String(data.draft).toLowerCase() === "true",
    content: content.trim(),
  }
}

const sortByDateDesc = (a: BlogPost, b: BlogPost) =>
  b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title)

/** Every post on disk, drafts included (cached per request). */
const readAllPosts = cache(async (): Promise<BlogPost[]> => {
  let files: string[] = []
  try {
    files = await fs.readdir(BLOG_CONTENT_DIR)
  } catch {
    return []
  }
  const mdFiles = files.filter((file) => file.endsWith(".md"))
  // One malformed file must not take the whole blog down: skip it and log.
  const settled = await Promise.allSettled(mdFiles.map((file) => parsePostFile(file)))
  const posts: BlogPost[] = []
  settled.forEach((result, i) => {
    if (result.status === "fulfilled") posts.push(result.value)
    else console.error(`[blog] skipping ${mdFiles[i]}:`, result.reason)
  })
  return posts.sort(sortByDateDesc)
})

/** Published (non-draft) posts, newest first. */
export const getPublishedBlogPosts = async (limit?: number) => {
  const posts = (await readAllPosts()).filter((post) => !post.draft)
  return typeof limit === "number" ? posts.slice(0, limit) : posts
}

export const getBlogPostSlugs = async () => {
  const posts = await getPublishedBlogPosts()
  return posts.map((post) => post.slug)
}

/** Drafts are only reachable by URL in development (for previewing). */
export const getBlogPostBySlug = async (slug: string) => {
  const post = (await readAllPosts()).find((p) => p.slug === slug)
  if (!post) return null
  if (post.draft && process.env.NODE_ENV === "production") return null
  return post
}

// ---------------------------------------------------------------------------
// Tags & clusters — both are served from /blog/tag/<slug>.
// ---------------------------------------------------------------------------

export const tagSlug = (tag: string) => slugify(tag)

export const getBlogTags = async (): Promise<BlogTag[]> => {
  const posts = await getPublishedBlogPosts()
  const map = new Map<string, BlogTag>()
  const bump = (slug: string, name: string, post: BlogPost, seen: Set<string>) => {
    if (!slug || seen.has(slug)) return
    seen.add(slug)
    const existing = map.get(slug)
    if (existing) existing.count += 1
    else map.set(slug, { slug, name, count: 1 })
  }
  for (const post of posts) {
    const seen = new Set<string>()
    post.tags.forEach((t) => bump(tagSlug(t), t, post, seen))
    if (post.cluster) bump(post.cluster, humanize(post.cluster), post, seen)
  }
  // Prefer a real tag's display name over a humanised cluster id.
  for (const post of posts) {
    for (const t of post.tags) {
      const entry = map.get(tagSlug(t))
      if (entry) entry.name = t
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  )
}

export const getBlogTag = async (slug: string) =>
  (await getBlogTags()).find((t) => t.slug === slug) || null

export const getPostsByTag = async (slug: string) => {
  const posts = await getPublishedBlogPosts()
  return posts.filter(
    (post) => post.cluster === slug || post.tags.some((t) => tagSlug(t) === slug)
  )
}

export const getPostsByAuthor = async (authorSlug: string) =>
  (await getPublishedBlogPosts()).filter((post) => post.authorSlug === authorSlug)

/** The label shown in a post's eyebrow: its first tag, else its cluster. */
export const getPostEyebrow = (post: BlogPost) => {
  if (post.tags[0]) return { slug: tagSlug(post.tags[0]), name: post.tags[0] }
  if (post.cluster) return { slug: post.cluster, name: humanize(post.cluster) }
  return null
}

// ---------------------------------------------------------------------------
// Related posts: explicit `related` slugs first (skipping missing/draft ones),
// then filled by shared tags (+ same cluster), then recency.
// ---------------------------------------------------------------------------

export const getRelatedPosts = async (post: BlogPost, max = 4) => {
  const posts = (await getPublishedBlogPosts()).filter((p) => p.slug !== post.slug)
  const bySlug = new Map(posts.map((p) => [p.slug, p]))
  const picked: BlogPost[] = []
  for (const slug of post.related) {
    const p = bySlug.get(slug)
    if (p && !picked.includes(p)) picked.push(p)
    if (picked.length >= max) return picked
  }

  const target = Math.max(3, Math.min(max, picked.length))
  if (picked.length >= target) return picked

  const ownTags = new Set(post.tags.map(tagSlug))
  const scored = posts
    .filter((p) => !picked.includes(p))
    .map((p, index) => {
      const shared = p.tags.filter((t) => ownTags.has(tagSlug(t))).length
      const sameCluster = post.cluster && p.cluster === post.cluster ? 1 : 0
      return { p, score: shared * 2 + sameCluster, index }
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)

  for (const { p } of scored) {
    if (picked.length >= target) break
    picked.push(p)
  }
  return picked
}

// ---------------------------------------------------------------------------
// Pagination (server-side, ?page=N)
// ---------------------------------------------------------------------------

export const parsePageParam = (value: unknown) => {
  const raw = Array.isArray(value) ? value[0] : value
  const n = parseInt(String(raw ?? "1"), 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

export const paginate = <T,>(items: T[], page: number, size = BLOG_PAGE_SIZE) => {
  const totalPages = Math.max(1, Math.ceil(items.length / size))
  const current = Math.min(Math.max(1, page), totalPages)
  return {
    items: items.slice((current - 1) * size, current * size),
    page: current,
    totalPages,
  }
}

export const formatBlogDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })

// ---------------------------------------------------------------------------
// Editor (/blog/editor → POST /api/blog)
// ---------------------------------------------------------------------------

export const saveBlogPost = async (input: SaveBlogPostInput) => {
  await fs.mkdir(BLOG_CONTENT_DIR, { recursive: true })

  const slug = slugify(input.slug || input.title)

  if (!slug) {
    throw new Error("A valid slug could not be generated for this blog post.")
  }

  const filePath = path.join(BLOG_CONTENT_DIR, `${slug}.md`)

  const document = matter.stringify(`${input.content.trim()}\n`, {
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    author: input.author.trim(),
    publishedAt: input.publishedAt,
    tags: input.tags?.filter(Boolean) || [],
    ...(input.coverImage?.trim() ? { coverImage: input.coverImage.trim() } : {}),
  })

  await fs.writeFile(filePath, document, "utf8")

  return slug
}
