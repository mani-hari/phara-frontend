// QA for the 100-post program: validates every content/blog/*.md that belongs to
// content/blog-plan/plan.json against SPEC.md's definition of done, and (with --fix)
// re-syncs plan-owned frontmatter fields (author, imageAlt, image, title, description,
// products, related, takeaways, faq, tags, cluster, keywords) from plan.json.
//
//   node scripts/blog-posts-qa.mjs            # report
//   node scripts/blog-posts-qa.mjs --fix      # sync plan fields into frontmatter, then report
//   node scripts/blog-posts-qa.mjs --json     # machine-readable summary
import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const ROOT = path.resolve(new URL("..", import.meta.url).pathname)
const BLOG = path.join(ROOT, "content/blog")
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, "content/blog-plan/plan.json"), "utf8"))
const catalog = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, "content/blog-plan/catalog.json"), "utf8")).map((p) => p.handle))
const FIX = process.argv.includes("--fix")
const JSON_OUT = process.argv.includes("--json")
const FINAL = process.argv.includes("--final") // images must exist

const planned = [...(plan.posts || []).map((p) => ({ ...p, kind: "core" })), ...(plan.extras || []).map((p) => ({ ...p, kind: "extra" }))]
const byslug = new Map(planned.map((p) => [p.slug, p]))
const allFiles = fs.readdirSync(BLOG).filter((f) => f.endsWith(".md"))
const legacySlugs = new Set(allFiles.map((f) => f.replace(/\.md$/, "")).filter((s) => !byslug.has(s)))
const validLinkTargets = new Set([...byslug.keys(), ...legacySlugs])
const AUTHORS = new Set(["hariharan", "archana", "manikandan"])
const BANNED = [/\bdelve\b/i, /\btapestry\b/i, /fast-paced world/i, /as an ai\b/i, /language model/i, /chatgpt/i, /\bmandir\b/i, /\bdevdutt\b|\bpattanaik\b|\bsadhguru\b|\bisha yoga\b|\bisha foundation\b|speakingtree|speaking tree/i, /\bharihar\b/i, /\bharchana\b/i, /₹|\$\s?\d|\brs\.?\s?\d/i, /\b(we|this|it|which|that) (will )?guarantees?\b|(?<!not )guaranteed (results|success)/i]
const YEAR = /\b(19|20)\d{2}\b/
const MONTHDAY = /\b(\d{1,2}(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*|(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{1,2}(st|nd|rd|th)?)\b/i

const SYNC_KEYS = ["title", "description", "author", "cluster", "primaryKeyword", "secondaryKeywords", "tags", "audience", "image", "imageAlt", "imagePrompt", "products", "related", "takeaways", "faq"]

const words = (s) => (s.match(/[A-Za-zऀ-෿][\w'’-]*/g) || []).length
const results = []
let fixed = 0

for (const p of planned) {
  const file = path.join(BLOG, `${p.slug}.md`)
  const r = { slug: p.slug, kind: p.kind, author: p.author, errors: [], warnings: [] }
  results.push(r)
  if (!fs.existsSync(file)) { r.errors.push("MISSING FILE"); continue }
  let parsed
  try { parsed = matter(fs.readFileSync(file, "utf8")) } catch (e) { r.errors.push(`frontmatter parse error: ${e.message}`); continue }
  let fm = parsed.data
  let body = parsed.content

  if (FIX) {
    const next = { ...fm }
    for (const k of SYNC_KEYS) if (p[k] !== undefined) next[k] = p[k]
    next.publishedAt = fm.publishedAt || "2026-09-28"
    next.updatedAt = fm.updatedAt || next.publishedAt
    next.readingTime = Math.max(1, Math.ceil(words(body) / 200))
    next.draft = fm.draft === true ? true : false
    // strip stray leftovers of the old author identifiers in the body
    const cleaned = body.replace(/\bHarchana\b/g, "Manikandan").replace(/\bHarihar\b(?!an)/g, "Hariharan")
    const out = matter.stringify(cleaned, next)
    if (out !== fs.readFileSync(file, "utf8")) { fs.writeFileSync(file, out); fixed++ }
    fm = next; body = cleaned
  }

  // frontmatter
  for (const k of ["title", "description", "author", "publishedAt", "cluster", "primaryKeyword", "tags", "audience", "image", "imageAlt", "products", "related", "takeaways", "faq"]) if (fm[k] === undefined) r.errors.push(`missing frontmatter ${k}`)
  if (!AUTHORS.has(fm.author)) r.errors.push(`bad author ${fm.author}`)
  if ((fm.title || "").length > 60) r.errors.push(`title ${fm.title.length} > 60`)
  const dl = (fm.description || "").length; if (dl < 140 || dl > 160) r.errors.push(`description ${dl} chars`)
  if (!/pariharaonline\.com/.test(fm.imageAlt || "")) r.errors.push("imageAlt lacks pariharaonline.com")
  if (fm.image !== `/blog/${p.slug}.webp`) r.warnings.push(`image path ${fm.image}`)
  if (!fs.existsSync(path.join(ROOT, "public", `blog/${p.slug}.webp`))) (FINAL ? r.errors : r.warnings).push("hero image file missing")
  for (const h of fm.products?.handles || []) if (!catalog.has(h)) r.errors.push(`unknown product handle ${h}`)
  const rel = fm.related || []; if (rel.length < 3 || rel.length > 4) r.errors.push(`related has ${rel.length}`)
  for (const s of rel) { if (s === p.slug) r.errors.push("related includes self"); if (!validLinkTargets.has(s)) r.errors.push(`related slug missing: ${s}`) }
  const tk = fm.takeaways || []; if (tk.length < 2 || tk.length > 3) r.errors.push(`takeaways ${tk.length}`)
  for (const t of tk) if (words(t) > 35) r.errors.push(`takeaway > 35 words`)
  const faq = fm.faq || []; if (faq.length < 3 || faq.length > 5) r.errors.push(`faq ${faq.length}`)
  for (const f of faq) { if (!/\?$/.test((f.q || "").trim())) r.errors.push(`faq question lacks ?: ${f.q}`); const w = words(f.a || ""); if (w < 40 || w > 70) r.errors.push(`faq answer ${w} words: ${(f.q || "").slice(0, 40)}`) }

  // body
  const bw = words(body)
  if (bw < 550 || bw > 850) r.errors.push(`body ${bw} words`)
  if (/^#\s/m.test(body)) r.errors.push("H1 in body")
  const h2 = body.match(/^##\s.+$/gm) || []
  if (h2.length < 3 || h2.length > 5) r.errors.push(`${h2.length} ## headings`)
  if (!h2.some((h) => /\?\s*$/.test(h))) r.errors.push("no question heading")
  const links = [...body.matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)].map((m) => m[1])
  if (links.length < 3 || links.length > 6) r.errors.push(`${links.length} internal links`)
  for (const l of links) { if (!validLinkTargets.has(l)) r.errors.push(`broken link /blog/${l}`); if (l === p.slug) r.errors.push("self link") }
  const crossCluster = links.some((l) => byslug.get(l) && byslug.get(l).cluster !== p.cluster) || links.some((l) => legacySlugs.has(l))
  if (!crossCluster) r.warnings.push("no cross-cluster link")
  if (/\]\(https?:/.test(body)) r.errors.push("external link")
  if (/<[a-z][\s\S]*>/i.test(body)) r.errors.push("HTML in body")
  if (/!\[/.test(body)) r.errors.push("inline image")
  const bodyForBans = body + " " + (fm.title || "") + " " + (fm.description || "") + " " + JSON.stringify(fm.faq || []) + " " + JSON.stringify(fm.takeaways || [])
  for (const re of BANNED) if (re.test(bodyForBans)) r.errors.push(`banned pattern ${re}`)
  if (YEAR.test(bodyForBans)) r.errors.push("4-digit year")
  if (MONTHDAY.test(bodyForBans)) r.errors.push("month-day date")
  const first100 = body.split(/\s+/).slice(0, 100).join(" ").toLowerCase()
  if (!first100.includes((fm.primaryKeyword || "").toLowerCase())) r.warnings.push("primary keyword not in first 100 words")
}

// inbound links across the whole set
const inbound = new Map(planned.map((p) => [p.slug, 0]))
for (const p of planned) {
  const file = path.join(BLOG, `${p.slug}.md`); if (!fs.existsSync(file)) continue
  const body = matter(fs.readFileSync(file, "utf8")).content
  for (const m of body.matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)) if (inbound.has(m[1]) && m[1] !== p.slug) inbound.set(m[1], inbound.get(m[1]) + 1)
}
for (const r of results) { const n = inbound.get(r.slug) || 0; if (n < 1) r.warnings.push("no inbound links yet") }

const bad = results.filter((r) => r.errors.length)
const summary = { planned: planned.length, present: results.filter((r) => !r.errors.includes("MISSING FILE")).length, withErrors: bad.length, fixed, authors: Object.fromEntries(["hariharan", "archana", "manikandan"].map((a) => [a, results.filter((r) => r.author === a).length])) }
if (JSON_OUT) { console.log(JSON.stringify({ summary, results }, null, 2)); process.exit(bad.length ? 1 : 0) }
for (const r of results) {
  if (!r.errors.length && !r.warnings.length) continue
  console.log(`${r.errors.length ? "ERR " : "warn"} [${r.kind}] ${r.slug}`)
  for (const e of r.errors) console.log(`     ✗ ${e}`)
  for (const w of r.warnings) console.log(`     · ${w}`)
}
console.log(`\n${bad.length ? "FAIL" : "PASS"}: ${summary.present}/${summary.planned} present, ${bad.length} with errors, ${fixed} files re-synced. Authors: ${JSON.stringify(summary.authors)}`)
process.exit(bad.length ? 1 : 0)
