#!/usr/bin/env node
// Lists blog posts whose hero image is missing.
//  - every post in content/blog-plan/plan.json → public/blog/<slug>.webp
//  - every content/blog/*.md → its frontmatter `image` (or missing `image`)
// Exit code 1 if anything is missing.

import fs from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import matter from "gray-matter"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const PLAN_PATH = path.join(ROOT, "content", "blog-plan", "plan.json")
const BLOG_DIR = path.join(ROOT, "content", "blog")
const PUBLIC = path.join(ROOT, "public")

const missing = []
let checked = 0

if (existsSync(PLAN_PATH)) {
  const raw = JSON.parse(await fs.readFile(PLAN_PATH, "utf8"))
  const posts = Array.isArray(raw) ? raw : raw.posts || []
  for (const p of posts) {
    if (!p?.slug) continue
    checked++
    if (!existsSync(path.join(PUBLIC, "blog", `${p.slug}.webp`))) {
      missing.push({ slug: p.slug, reason: `plan: public/blog/${p.slug}.webp not found` })
    }
  }
} else {
  console.log("(no content/blog-plan/plan.json — checking content/blog only)")
}

const seen = new Set(missing.map((m) => m.slug))
for (const file of (await fs.readdir(BLOG_DIR)).filter((f) => f.endsWith(".md"))) {
  const slug = file.replace(/\.md$/, "")
  const { data } = matter(await fs.readFile(path.join(BLOG_DIR, file), "utf8"))
  if (data.draft === true) continue
  checked++
  if (seen.has(slug)) continue
  if (!data.image) {
    missing.push({ slug, reason: "post: no `image` in frontmatter" })
  } else if (!/^https?:/.test(data.image) && !existsSync(path.join(PUBLIC, String(data.image)))) {
    missing.push({ slug, reason: `post: ${data.image} not found` })
  }
}

for (const m of missing) console.log(`  missing  ${m.slug}  (${m.reason})`)
console.log(`\n${missing.length} missing of ${checked} checked.`)
process.exitCode = missing.length ? 1 : 0
