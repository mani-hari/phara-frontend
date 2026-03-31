import "server-only"

import fs from "fs/promises"
import path from "path"
import matter from "gray-matter"

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  author: string
  publishedAt: string
  tags: string[]
  content: string
  coverImage?: string
  readingTime: number
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

const BLOG_CONTENT_DIR = path.join(process.cwd(), "content", "blog")

const calculateReadingTime = (content: string) => {
  const words = content.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 220))
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const normalizeTags = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String)
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  return []
}

const ensureBlogDir = async () => {
  await fs.mkdir(BLOG_CONTENT_DIR, { recursive: true })
}

const parsePostFile = async (fileName: string): Promise<BlogPost> => {
  const fullPath = path.join(BLOG_CONTENT_DIR, fileName)
  const file = await fs.readFile(fullPath, "utf8")
  const { data, content } = matter(file)
  const slug = fileName.replace(/\.md$/, "")

  return {
    slug,
    title: String(data.title || slug),
    excerpt: String(data.excerpt || ""),
    author: String(data.author || "PariharaOnline"),
    publishedAt: String(data.publishedAt || new Date().toISOString()),
    tags: normalizeTags(data.tags),
    content: content.trim(),
    coverImage: data.coverImage ? String(data.coverImage) : undefined,
    readingTime: calculateReadingTime(content),
  }
}

export const getPublishedBlogPosts = async (limit?: number) => {
  await ensureBlogDir()

  const files = await fs.readdir(BLOG_CONTENT_DIR)
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map((file) => parsePostFile(file))
  )

  const sorted = posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  return typeof limit === "number" ? sorted.slice(0, limit) : sorted
}

export const getBlogPostSlugs = async () => {
  const posts = await getPublishedBlogPosts()
  return posts.map((post) => post.slug)
}

export const getBlogPostBySlug = async (slug: string) => {
  await ensureBlogDir()

  try {
    return await parsePostFile(`${slug}.md`)
  } catch {
    return null
  }
}

export const saveBlogPost = async (input: SaveBlogPostInput) => {
  await ensureBlogDir()

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
