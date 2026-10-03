// Assigns publishedAt dates for the drip-publish programme (owner decision 28 Sep 2026):
// 10 seed posts on 26–28 Sep 2026, then three posts per day (one per author) from 29 Sep.
// Festival posts must land before their festival; evergreen posts fill the gaps,
// alternating authors. Writes publishedAt/updatedAt into content/blog/<slug>.md and
// plan.json, and a human-readable content/blog-plan/schedule.md.
//   node scripts/blog-schedule.mjs [--dry]
import fs from "node:fs"; import path from "node:path"; import matter from "gray-matter"
const ROOT = path.resolve(new URL("..", import.meta.url).pathname)
const DRY = process.argv.includes("--dry")
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, "content/blog-plan/plan.json"), "utf8"))
const posts = [...plan.posts, ...plan.extras]
const by = Object.fromEntries(posts.map((p) => [p.slug, p]))

const SEEDS = {
  "2026-09-26": ["why-navratri-lasts-nine-nights", "online-puja-from-usa-explained", "is-astrology-real"],
  "2026-09-27": ["celebrate-navratri-in-the-usa", "puja-at-home-step-by-step", "what-is-sankalpam"],
  "2026-09-28": ["navratri-fasting-rules", "golu-in-a-small-apartment", "why-do-hindus-light-lamps", "pitru-paksha-for-nri-families"],
}
// Publish-by dates (festival minus lead time). Cluster-level, with per-slug overrides.
const CLUSTER_DEADLINE = {
  "pitru-ancestors": "2026-10-06",      // Pitru Paksha ends 10 Oct
  "navratri-meaning": "2026-10-09",     // Navratri 11–20 Oct
  "navratri-usa": "2026-10-09",
  "exams-education": "2026-10-15",      // Saraswati puja 17 Oct
  "diwali-meaning": "2026-11-04",       // Dhanteras 6 Nov, Deepavali 8 Nov
  "diwali-in-usa": "2026-11-04",
  "murugan-skanda": "2026-11-08",       // Skanda Sashti 10–15 Nov
  "karthigai-deepam": "2026-11-20",     // 24 Nov
  "ekadashi-fasting": "2026-12-14",     // Margazhi 16 Dec, Vaikunta Ekadashi 20 Dec
  "pongal-sankranti": "2027-01-10",     // 15 Jan
  "maha-shivaratri": "2027-01-21",      // festival in March; publish at the tail
  "holi": "2027-01-21",
}
const SLUG_DEADLINE = {
  "explaining-diwali-to-kids": "2026-11-04",
  "dhanvantari-and-healing": "2026-11-04",
  "thaipusam-kavadi-meaning": "2027-01-15",
  "ayudha-pooja-meaning": "2026-10-17", "dussehra-ravana-story-meaning": "2026-10-17", "vidyarambham-first-letters": "2026-10-17",
  "amavasya-and-ancestors": "2026-10-08", "tarpanam-at-home": "2026-10-06",
  "fasting-and-focus": null, "fasting-with-a-desk-job": null, // evergreen despite cluster
}
const deadlineOf = (p) => (p.slug in SLUG_DEADLINE ? SLUG_DEADLINE[p.slug] : CLUSTER_DEADLINE[p.cluster] || null)
const addDays = (iso, n) => { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
const daysBetween = (a, b) => Math.round((new Date(b + "T00:00:00Z") - new Date(a + "T00:00:00Z")) / 86400000)

const seeded = new Set(Object.values(SEEDS).flat())
for (const s of seeded) if (!by[s]) throw new Error("unknown seed " + s)
let dated = []  // { slug, date }
for (const [d, slugs] of Object.entries(SEEDS)) for (const s of slugs) dated.push({ slug: s, date: d })

let pool = posts.filter((p) => !seeded.has(p.slug))
const authorsOrder = ["hariharan", "archana", "manikandan"]
const PER_DAY = 3 // owner decision 28 Sep 2026: three posts a day, one per author where possible
let day = "2026-09-29"
while (pool.length) {
  const todays = []
  for (const author of authorsOrder) {
    if (!pool.length || todays.length >= PER_DAY) break
    // Prefer this author's most urgent post (earliest deadline first, then evergreen); if the author
    // has nothing left, fall back to whoever has the most remaining posts, urgent first.
    const mine = pool.filter((p) => p.author === author && !todays.includes(p))
    const src = mine.length ? mine : pool.filter((p) => !todays.includes(p))
    if (!src.length) break
    const sorted = [...src].sort((a, b) => (deadlineOf(a) || "9999").localeCompare(deadlineOf(b) || "9999") || (a.audience === "nri-us" ? -1 : 0) - (b.audience === "nri-us" ? -1 : 0))
    const pick = sorted[0] // most urgent first; with 3 slots/day festival posts spread naturally
    todays.push(pick)
  }
  for (const p of todays) dated.push({ slug: p.slug, date: day })
  pool = pool.filter((p) => !todays.includes(p))
  day = addDays(day, 1)
}
// checks
const late = dated.filter(({ slug, date }) => deadlineOf(by[slug]) && date > deadlineOf(by[slug]))
if (late.length) { console.error("LATE:", late); process.exit(1) }
const perDay = {}; for (const d of dated) perDay[d.date] = (perDay[d.date] || 0) + 1
const over = Object.entries(perDay).filter(([d, n]) => n > PER_DAY && !(d in SEEDS)); if (over.length) { console.error("MULTI:", over); process.exit(1) }

// write
if (!DRY) {
  for (const { slug, date } of dated) {
    const f = path.join(ROOT, "content/blog", slug + ".md"); const m = matter(fs.readFileSync(f, "utf8"))
    m.data.publishedAt = date; m.data.updatedAt = date
    fs.writeFileSync(f, matter.stringify(m.content, m.data))
    by[slug].publishedAt = date
  }
  fs.writeFileSync(path.join(ROOT, "content/blog-plan/plan.json"), JSON.stringify(plan, null, 2) + "\n")
  const rows = dated.sort((a, b) => a.date.localeCompare(b.date)).map(({ slug, date }) => `| ${date} | ${by[slug].author} | ${by[slug].cluster} | [${by[slug].title}](/blog/${slug}) |`)
  fs.writeFileSync(path.join(ROOT, "content/blog-plan/schedule.md"), `# Blog release schedule\n\nThree posts per day (one per author where possible) from 29 Sep 2026 (10 seeds on 26–28 Sep). A post becomes visible on its date (IST); the site revalidates hourly. Generated by scripts/blog-schedule.mjs.\n\n| Date | Author | Cluster | Post |\n|---|---|---|---|\n${rows.join("\n")}\n`)
}
const last = dated.map((d) => d.date).sort().at(-1)
console.log(`${dated.length} posts dated; last release ${last}; deadline posts all on time.`)
console.log("first 14 days:"); for (const { slug, date } of dated.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 24)) console.log(" ", date, by[slug].author.padEnd(10), by[slug].cluster.padEnd(22), slug)
