#!/usr/bin/env node
// Blog hero image pipeline.
//
// For every post in content/blog-plan/plan.json (`posts: [{ slug, imagePrompt, imageAlt }]`)
// whose public/blog/<slug>.webp is missing: generate an image through the
// Vercel AI Gateway, crop to 1200x630, stamp a "pariharaonline.com" watermark
// bottom-right, and save as WebP (q82).
//
// Usage:
//   npm run blog:images                      # all missing images from plan.json
//   npm run blog:images -- --only <slug>     # one post (repeatable)
//   npm run blog:images -- --dry-run         # show what would be generated
//   npm run blog:images -- --force           # overwrite existing files
//   npm run blog:images -- --seed-existing   # the 5 original posts (built-in prompts)
//
// Needs AI_GATEWAY_API_KEY (read from the environment or .env.local).

import fs from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const PLAN_PATH = process.env.BLOG_PLAN_PATH ? path.resolve(ROOT, process.env.BLOG_PLAN_PATH) : path.join(ROOT, "content", "blog-plan", "plan.json")
const OUT_DIR = process.env.BLOG_IMAGES_OUT ? path.resolve(ROOT, process.env.BLOG_IMAGES_OUT) : path.join(ROOT, "public", "blog")

const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/images/generations"
import { stylePrompt } from "./lib/image-style.mjs"
const MODEL = "openai/gpt-image-1-mini"
const GEN_SIZE = "1536x1024"
const WIDTH = 1200
const HEIGHT = 630
const QUALITY = 82
const CONCURRENCY = 3
// Raw (un-watermarked) generations are cached here so the watermark can be
// changed without paying for regeneration. Gitignored.
const RAW_DIR = process.env.BLOG_IMAGES_RAW ? path.resolve(ROOT, process.env.BLOG_IMAGES_RAW) : path.join(ROOT, ".blog-images-raw")
const REQUEST_TIMEOUT_MS = 180_000
const PROMPT_SUFFIX =
  ". Editorial photograph style, warm natural light, no text, no captions, no watermark."

// Prompts for the five original posts (they predate plan.json).
const EXISTING_POSTS = [
  {
    slug: "how-to-choose-the-right-puja-for-life-obstacles",
    imagePrompt:
      "A brass puja thali with a lit ghee lamp, marigold flowers, kumkum and a small Ganesha idol on a wooden table in a quiet Indian home, soft morning light through a window",
    imageAlt: "A brass puja thali with a lit lamp, marigolds and a small Ganesha idol in morning light",
  },
  {
    slug: "nri-guide-to-booking-temple-pujas-online",
    imagePrompt:
      "A woman in a modern American apartment kitchen holding a small brass lamp beside a laptop, a framed picture of a South Indian temple gopuram on the wall, evening light",
    imageAlt: "A woman abroad holding a brass lamp beside a laptop, a temple picture on the wall",
  },
  {
    slug: "understanding-navagraha-homam",
    imagePrompt:
      "A Vedic homam fire burning in a square copper kunda, a priest's hands offering ghee with a wooden ladle, nine small heaps of different grains arranged around it, warm firelight",
    imageAlt: "A priest offering ghee into a homam fire with nine heaps of grain arranged around it",
  },
  {
    slug: "what-prasad-delivery-means-for-online-puja-bookings",
    imagePrompt:
      "An opened cardboard parcel on a table revealing temple prasadam: a packet of vibhuti, kumkum, a sacred thread and dried flowers wrapped in banana leaf, soft daylight",
    imageAlt: "An opened parcel of temple prasadam with vibhuti, kumkum, a sacred thread and flowers",
  },
  {
    slug: "when-to-book-an-astrology-consultation-before-a-puja",
    imagePrompt:
      "A hand-drawn South Indian horoscope chart on paper beside a notebook, reading glasses and a cup of filter coffee on a wooden desk, afternoon light",
    imageAlt: "A hand-drawn South Indian horoscope chart beside reading glasses and filter coffee",
  },
]

// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { only: [], dryRun: false, force: false, seedExisting: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--only") args.only.push(argv[++i])
    else if (a.startsWith("--only=")) args.only.push(a.slice(7))
    else if (a === "--dry-run") args.dryRun = true
    else if (a === "--force") args.force = true
    else if (a === "--seed-existing") args.seedExisting = true
    else if (a === "--help" || a === "-h") args.help = true
    else {
      console.error(`Unknown argument: ${a}`)
      process.exit(2)
    }
  }
  args.only = args.only.filter(Boolean)
  return args
}

async function loadPlanPosts() {
  if (!existsSync(PLAN_PATH)) return null
  const raw = JSON.parse(await fs.readFile(PLAN_PATH, "utf8"))
  const posts = Array.isArray(raw) ? raw : [...(raw.posts || []), ...(raw.extras || [])]
  if (!Array.isArray(posts)) throw new Error("plan.json has no `posts` array")
  return posts
}

function loadApiKey() {
  if (!process.env.AI_GATEWAY_API_KEY) {
    try {
      process.loadEnvFile?.(path.join(ROOT, ".env.local"))
    } catch {
      // no .env.local — fall through
    }
  }
  return process.env.AI_GATEWAY_API_KEY || ""
}

const escapeXml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

// Full-size SVG overlay. The watermark sits near the centre (slightly low-right of
// centre) so it cannot be removed by cropping an edge — owner rule, 28 Sep 2026.
// Subtle: white at 42% over a soft dark halo, wide letter-spacing, no rotation.
function watermarkSvg(text = "pariharaonline.com") {
  const x = Math.round(WIDTH * 0.56)
  const y = Math.round(HEIGHT * 0.63)
  const t = escapeXml(text)
  const font = `font-family="Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="44" font-weight="600" letter-spacing="3"`
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <text x="${x}" y="${y}" text-anchor="middle" ${font} fill="#fff" fill-opacity="0.30">${t}</text>
</svg>`)
}

async function generate(prompt, apiKey) {
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: stylePrompt(prompt),
      n: 1,
      size: GEN_SIZE,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!res.ok) {
    const body = (await res.text()).slice(0, 300)
    throw new Error(`HTTP ${res.status}: ${body}`)
  }
  const json = await res.json()
  const item = json?.data?.[0]
  if (item?.b64_json) return Buffer.from(item.b64_json, "base64")
  if (item?.url) {
    const img = await fetch(item.url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
    if (!img.ok) throw new Error(`image download HTTP ${img.status}`)
    return Buffer.from(await img.arrayBuffer())
  }
  throw new Error("response had no data[0].b64_json")
}

async function processImage(input) {
  return sharp(input)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: sharp.strategy.attention })
    .composite([{ input: watermarkSvg(), top: 0, left: 0 }])
    .webp({ quality: QUALITY })
    .toBuffer()
}

async function runOne(post, apiKey) {
  const out = path.join(OUT_DIR, `${post.slug}.webp`)
  const started = Date.now()
  let lastError
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const rawPath = path.join(RAW_DIR, `${post.slug}.png`)
      let raw
      try { raw = await fs.readFile(rawPath) } catch { raw = null }
      if (!raw) {
        raw = await generate(post.imagePrompt, apiKey)
        await fs.mkdir(RAW_DIR, { recursive: true })
        await fs.writeFile(rawPath, raw)
      }
      const webp = await processImage(raw)
      const tmp = `${out}.tmp-${process.pid}`
      await fs.writeFile(tmp, webp)
      await fs.rename(tmp, out)
      return { ok: true, bytes: webp.length, ms: Date.now() - started, attempts: attempt }
    } catch (err) {
      lastError = err
      if (attempt < 6) {
        // The Gateway allows 5 image requests/minute for this model; honour its Retry-After hint.
        const m = /Retry after (\d+)s/i.exec(err.message || "")
        const waitMs = m ? (Number(m[1]) + 3) * 1000 : /429/.test(err.message || "") ? 20000 : 3000
        console.log(`  retry  ${post.slug}  in ${Math.round(waitMs / 1000)}s  (${String(err.message).slice(0, 80)})`)
        await new Promise((r) => setTimeout(r, waitMs))
      }
    }
  }
  return { ok: false, error: lastError?.message || String(lastError), ms: Date.now() - started }
}

async function pool(items, limit, worker) {
  const results = new Array(items.length)
  let next = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await worker(items[i], i)
    }
  })
  await Promise.all(runners)
  return results
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(
      "Usage: node scripts/blog-images.mjs [--only <slug>]... [--dry-run] [--force] [--seed-existing]"
    )
    return
  }

  let posts
  if (args.seedExisting) {
    posts = EXISTING_POSTS
  } else {
    posts = await loadPlanPosts()
    if (!posts) {
      console.log(
        `No plan found at ${path.relative(ROOT, PLAN_PATH)} — nothing to do. (Use --seed-existing for the original five posts.)`
      )
      return
    }
  }

  if (args.only.length) {
    const wanted = new Set(args.only)
    posts = posts.filter((p) => wanted.has(p.slug))
    const missing = args.only.filter((s) => !posts.some((p) => p.slug === s))
    if (missing.length) console.log(`Not in the list: ${missing.join(", ")}`)
  }

  const invalid = posts.filter((p) => !p?.slug || !p?.imagePrompt)
  if (invalid.length) {
    console.log(`Skipping ${invalid.length} entr${invalid.length === 1 ? "y" : "ies"} without slug/imagePrompt.`)
  }
  const valid = posts.filter((p) => p?.slug && p?.imagePrompt)
  const existing = valid.filter((p) => existsSync(path.join(OUT_DIR, `${p.slug}.webp`)))
  const todo = args.force ? valid : valid.filter((p) => !existing.includes(p))

  if (!args.force) {
    for (const p of existing) console.log(`  skip   ${p.slug}  (exists)`)
  }

  if (args.dryRun) {
    for (const p of todo) console.log(`  would  ${p.slug}  → public/blog/${p.slug}.webp`)
    console.log(
      `\nDry run: ${todo.length} to generate, ${args.force ? 0 : existing.length} existing, ${valid.length} total.`
    )
    return
  }

  if (!todo.length) {
    console.log(`\nNothing to generate (${existing.length} already exist).`)
    return
  }

  const apiKey = loadApiKey()
  if (!apiKey) {
    console.error("AI_GATEWAY_API_KEY is not set (environment or .env.local).")
    process.exit(1)
  }

  await fs.mkdir(OUT_DIR, { recursive: true })
  console.log(`Generating ${todo.length} image(s) with ${MODEL}, concurrency ${CONCURRENCY}…`)

  const results = await pool(todo, CONCURRENCY, async (post) => {
    const r = await runOne(post, apiKey)
    if (r.ok) {
      console.log(
        `  ok     ${post.slug}  ${(r.bytes / 1024).toFixed(0)} KB  ${(r.ms / 1000).toFixed(1)}s${r.attempts > 1 ? "  (2nd try)" : ""}`
      )
    } else {
      console.log(`  FAIL   ${post.slug}  ${r.error}`)
    }
    return { slug: post.slug, ...r }
  })

  const ok = results.filter((r) => r.ok)
  const failed = results.filter((r) => !r.ok)
  console.log(
    `\nDone: ${ok.length} generated, ${failed.length} failed, ${args.force ? 0 : existing.length} skipped.`
  )
  if (failed.length) {
    console.log(`Failed: ${failed.map((f) => f.slug).join(", ")}`)
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err?.message || err)
  process.exit(1)
})
