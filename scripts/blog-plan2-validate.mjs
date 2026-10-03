// Validates content/blog-plan-2/plan.json and keywords.json against SPEC.md + BATCH2-DELTA.md.
// Adapted from scripts/blog-plan-validate.mjs. Adds: batch-one overlap checks (batch1-index.json),
// series counts (27 named nakshatras, 12 named rasis, ~N others), exactly 300 posts, exact 100/100/100.
// Usage: node scripts/blog-plan2-validate.mjs [--quiet]   exit code 1 on any error.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const plan = read("content/blog-plan-2/plan.json");
const keywords = read("content/blog-plan-2/keywords.json");
const catalog = new Set(read("content/blog-plan-2/catalog.json").map((p) => p.handle));
const batch1 = read("content/blog-plan-2/batch1-index.json");
const quiet = process.argv.includes("--quiet");

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

const TOTAL = 300;
const PUBLISHED = "2026-11-07";
const AUTHOR_EXACT = { hariharan: 100, archana: 100, manikandan: 100 };
const MIN_NRI = 50, MIN_SEEKER = 45;
// series: exact or [min, max] (BATCH2-DELTA "~N" read as N ± 3)
const SERIES = { nakshatra: [27, 27], rasi: [12, 12], recipes: [17, 23], temples: [12, 18], stotras: [12, 18], mythology: [37, 43], festivals: [22, 28] };
const TIRUKKURAL = [10, 14]; // "a dozen" inside mythology
const NAKSHATRAS = [
  ["ashwini", "aswini", "asvini"], ["bharani"], ["krittika", "karthigai", "kritika", "kruthika"], ["rohini"],
  ["mrigashira", "mrigasira", "mirugasirisham", "mrigashirsha"], ["ardra", "thiruvathirai", "arudra"], ["punarvasu", "punarpoosam"],
  ["pushya", "poosam", "pusam"], ["ashlesha", "ayilyam", "aslesha"], ["magha", "magam", "makam"], ["purva phalguni", "pooram", "purva-phalguni"],
  ["uttara phalguni", "uthiram", "uttara-phalguni"], ["hasta", "hastham", "atham"], ["chitra", "chithirai", "chithira"], ["swati", "swathi", "svati"],
  ["vishakha", "visakam", "vishaka"], ["anuradha", "anusham"], ["jyeshtha", "kettai", "jyeshta"], ["mula", "moolam"],
  ["purva ashadha", "pooradam", "purva-ashadha"], ["uttara ashadha", "uthiradam", "uttara-ashadha"], ["shravana", "thiruvonam", "sravana"],
  ["dhanishta", "avittam", "dhanishtha"], ["shatabhisha", "sadayam", "shatabhishak"], ["purva bhadrapada", "poorattathi", "purva-bhadrapada"],
  ["uttara bhadrapada", "uthirattathi", "uttara-bhadrapada"], ["revati", "revathi"],
];
const RASIS = [["mesha"], ["rishabha", "vrishabha"], ["mithuna"], ["kataka", "karka"], ["simha"], ["kanya"], ["tula", "thula"], ["vrischika", "vrishchika"], ["dhanu"], ["makara"], ["kumbha"], ["meena"]];

// ---------- batch one + legacy posts ----------
const b1Posts = batch1.posts ?? batch1;
const b1Slugs = new Set(b1Posts.map((p) => p.slug));
const b1BySlug = Object.fromEntries(b1Posts.map((p) => [p.slug, p]));
const normWords = (s) => (s ?? "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
const first5 = (s) => normWords(s).slice(0, 5).join(" ");
const b1Titles = new Map(b1Posts.map((p) => [p.title.toLowerCase().trim(), p.slug]));
const b1First5 = new Map(b1Posts.map((p) => [first5(p.title), p.slug]));
const b1Keys = new Map(b1Posts.map((p) => [p.primaryKeyword.toLowerCase().trim(), p.slug]));
const posts = plan.posts ?? [];
const ownSlugs = new Set(posts.map((p) => p.slug));
const blogDir = path.join(root, "content/blog");
const legacy = fs.existsSync(blogDir) ? fs.readdirSync(blogDir).filter((f) => f.endsWith(".md")).map((f) => {
  const txt = fs.readFileSync(path.join(blogDir, f), "utf8");
  const m = txt.match(/^title:\s*"?(.+?)"?\s*$/m);
  return { slug: f.replace(/\.md$/, ""), title: m ? m[1] : "" };
}).filter((e) => !ownSlugs.has(e.slug) || b1Slugs.has(e.slug)) : [];
const legacySlugs = new Set(legacy.map((e) => e.slug));
const legacyTitles = new Set(legacy.map((e) => e.title.toLowerCase().trim()));

const bySlug = Object.fromEntries(posts.map((p) => [p.slug, p]));
const clusterIds = new Set((plan.clusters ?? []).map((c) => c.id));
const seriesOf = Object.fromEntries((plan.clusters ?? []).map((c) => [c.id, c.series ?? null]));
const linkable = (s) => ownSlugs.has(s) || b1Slugs.has(s) || legacySlugs.has(s);
const clusterOf = (s) => bySlug[s]?.cluster ?? (b1BySlug[s] ? `b1:${b1BySlug[s].cluster}` : "legacy");

// ---------- evergreen + banned content ----------
const MONTH = "(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)";
const DATE_PATTERNS = [
  [/\b(19|20)\d{2}\b/, "4-digit year"],
  [new RegExp(`\\b${MONTH}\\.?\\s+\\d{1,2}(st|nd|rd|th)?\\b`, "i"), "month-day date"],
  [new RegExp(`\\b\\d{1,2}(st|nd|rd|th)?\\s+(of\\s+)?${MONTH}\\b`, "i"), "day-month date"],
  [/\b\d{4}-\d{2}-\d{2}\b/, "ISO date"],
  [/\b(this|next|last) year\b/i, "relative year"],
];
const BANNED = [
  [/\bdelve/i, "delve"], [/\btapestry\b/i, "tapestry"], [/fast-paced world/i, "fast-paced world"],
  [/\bmandir\b/i, "mandir (use temple)"], [/chatgpt|language model/i, "AI reference"], [/\bAI\b/, "AI reference"],
  [/devdutt|pattanaik|sadhguru|\bisha\b|speaking\s?tree/i, "persona influence named"],
  [/(?<!\b(?:no|not|never|nor|without|isn't|cannot|can't|doesn't)\b(?:\s+\S+){0,3}\s+)\bguarantee[sd]?\b(?!\s+(?:of\s+)?(?:anything|nothing))/i, "outcome guarantee (not negated)"],
  [/\$\s?\d|₹|\bRs\.?\s?\d|\bINR\b|\bUSD\b/, "price"],
  [/\bvibrant\b|\bembark\b|\bunlock (the|your)\b|\bholistic\b|\bin conclusion\b|\bever-evolving\b|\bnavigat(e|ing) the complexities\b/i, "AI-voice cliché"],
  [/\bor else\b|\bwill be (displeased|angry)\b|\bbad luck will\b/i, "fear-selling"],
];
const STYLE_WORDS = /\b(photograph\w*|photo|editorial|cinematic|illustration|watercolou?r|painting|render(ed)?|4k|8k|hdr|bokeh|golden (light|glow|hour)|glow(ing)?|luminous|warm light|soft light|style|realistic|hyper-?real\w*|film grain|depth of field)\b/i;

function scanText(label, text, patterns = [...DATE_PATTERNS, ...BANNED]) {
  if (typeof text !== "string") return;
  for (const [re, name] of patterns) if (re.test(text)) err(`${label}: ${name} in "${text.slice(0, 90)}"`);
}
function contentStrings(p) {
  const out = [["title", p.title], ["slug", p.slug], ["description", p.description], ["primaryKeyword", p.primaryKeyword],
    ["imagePrompt", p.imagePrompt], ["imageAlt", p.imageAlt], ["products.heading", p.products?.heading], ["products.query", p.products?.query]];
  (p.secondaryKeywords ?? []).forEach((s) => out.push(["secondaryKeywords", s]));
  (p.tags ?? []).forEach((s) => out.push(["tags", s]));
  (p.outline ?? []).forEach((s) => out.push(["outline", s]));
  (p.takeaways ?? []).forEach((s) => out.push(["takeaways", s]));
  (p.faq ?? []).forEach((f) => { out.push(["faq.q", f.q]); out.push(["faq.a", f.a]); });
  return out;
}

// ---------- per-post checks ----------
const AUTHORS = Object.keys(AUTHOR_EXACT);
const AUDIENCES = ["general", "nri-us", "seeker"];
const INTENTS = ["informational", "comparison", "how-to", "seasonal", "story"];
const STOP = new Set(["a", "an", "the", "of", "for", "to", "in", "at", "is", "and", "on", "vs", "how", "what", "why", "do", "does", "with", "your", "you", "my", "or"]);
const kwTokens = (s) => s.toLowerCase().split(/[^a-z0-9']+/).filter((w) => w && !STOP.has(w));
const fuzzyHas = (text, phrase) => { const t = text.toLowerCase(); return kwTokens(phrase).every((w) => t.includes(w.replace(/s$/, ""))); };

const seenSlug = new Map(), seenTitle = new Map(), seenKey = new Map(), seenFirst5 = new Map();
function checkPost(p) {
  const L = `${p.slug}`;
  const req = ["slug", "title", "description", "author", "cluster", "primaryKeyword", "secondaryKeywords", "tags", "audience", "intent", "outline", "related", "products", "imagePrompt", "imageAlt", "publishedAt", "takeaways", "faq"];
  for (const k of req) if (p[k] === undefined || p[k] === "") err(`${L}: missing ${k}`);

  // uniqueness inside batch two
  const tl = (p.title ?? "").toLowerCase().trim(), kl = (p.primaryKeyword ?? "").toLowerCase().trim(), f5 = first5(p.title);
  if (seenSlug.has(p.slug)) err(`${L}: duplicate slug`); else seenSlug.set(p.slug, 1);
  if (seenTitle.has(tl)) err(`${L}: duplicate title (also ${seenTitle.get(tl)})`); else seenTitle.set(tl, p.slug);
  if (seenKey.has(kl)) err(`${L}: duplicate primaryKeyword (also ${seenKey.get(kl)})`); else seenKey.set(kl, p.slug);
  if (seenFirst5.has(f5)) warn(`${L}: first five title words match ${seenFirst5.get(f5)}`); else seenFirst5.set(f5, p.slug);
  // overlap with batch one + legacy
  if (b1Slugs.has(p.slug) || legacySlugs.has(p.slug)) err(`${L}: slug exists in batch one / legacy posts`);
  if (b1Titles.has(tl) || legacyTitles.has(tl)) err(`${L}: title exists in batch one / legacy posts`);
  if (b1Keys.has(kl)) err(`${L}: primaryKeyword "${p.primaryKeyword}" is batch-one ${b1Keys.get(kl)}'s primary keyword`);
  if (b1First5.has(f5)) err(`${L}: first five title words match batch-one ${b1First5.get(f5)}`);
  for (const s of p.secondaryKeywords ?? []) if (b1Keys.has(s.toLowerCase().trim())) warn(`${L}: secondary keyword "${s}" is batch-one ${b1Keys.get(s.toLowerCase().trim())}'s primary`);

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) err(`${L}: slug not lowercase-hyphen`);
  if (p.slug.split("-").length > 6) err(`${L}: slug has > 6 words`);
  if ((p.title ?? "").length > 60) err(`${L}: title ${p.title.length} chars > 60`);
  const dl = (p.description ?? "").length;
  if (dl < 140 || dl > 160) err(`${L}: description ${dl} chars (need 140–160)`);
  if (!AUTHORS.includes(p.author)) err(`${L}: bad author ${p.author}`);
  if (!AUDIENCES.includes(p.audience)) err(`${L}: bad audience ${p.audience}`);
  if (!INTENTS.includes(p.intent)) err(`${L}: bad intent ${p.intent}`);
  if (!clusterIds.has(p.cluster)) err(`${L}: unknown cluster ${p.cluster}`);
  if (p.publishedAt !== PUBLISHED) err(`${L}: publishedAt must be ${PUBLISHED}`);
  if (p.image !== `/blog/${p.slug}.webp`) err(`${L}: image must be /blog/${p.slug}.webp`);
  const sk = p.secondaryKeywords ?? [];
  if (sk.length < 2 || sk.length > 4) err(`${L}: secondaryKeywords ${sk.length} (need 2–4)`);
  const tags = p.tags ?? [];
  if (tags.length < 2 || tags.length > 4) err(`${L}: tags ${tags.length} (need 2–4)`);
  for (const t of tags) if (!/^[A-Z0-9]/.test(t) || t.split(/\s+/).some((w) => /^[a-z]/.test(w) && !["and", "of", "the", "vs", "for", "to", "in", "at", "on", "a", "with", "by"].includes(w))) err(`${L}: tag not Title Case "${t}"`);

  const ol = p.outline ?? [];
  if (ol.length < 3 || ol.length > 5) err(`${L}: outline ${ol.length} items (need 3–5)`);
  const heads = ol.filter((s) => s.trim().startsWith("##")).map((s) => s.split(/\s[—–-]\s/)[0]);
  if (heads.length < 2) err(`${L}: outline needs ≥2 '##' section headings`);
  if (!heads.some((h) => h.includes("?"))) err(`${L}: no question-shaped '##' heading in outline`);
  if (!heads.some((h) => fuzzyHas(h, p.primaryKeyword))) warn(`${L}: primary keyword "${p.primaryKeyword}" not visible in any ## heading`);
  if (!fuzzyHas(p.title ?? "", p.primaryKeyword ?? "")) warn(`${L}: title does not carry primary keyword "${p.primaryKeyword}"`);

  const ip = p.imagePrompt ?? "";
  if (STYLE_WORDS.test(ip)) err(`${L}: imagePrompt has style words (the pipeline adds house style): "${ip.match(STYLE_WORDS)[0]}"`);
  if (ip.replace(/\.$/, "").split(/[.!?]\s+/).length > 1) err(`${L}: imagePrompt must be one sentence`);
  if (/\b(face of (lord|goddess|the god|the goddess)|deity'?s? face|god'?s face|goddess'?s? face)\b/i.test(ip)) err(`${L}: imagePrompt shows a deity's face`);
  if (/\b(idol|statue|murti|portrait)\b/i.test(ip)) warn(`${L}: imagePrompt mentions an idol/statue/portrait; keep deity faces out of frame`);
  if (/\b(calendar|panchang\w*|pages?|book|notebook|sign|poster|screen|label|newspaper|letters|writing|text|words|inscription|script)\b/i.test(ip)) warn(`${L}: imagePrompt may render text: "${ip}"`);
  const alt = p.imageAlt ?? "";
  if (alt.length > 170) err(`${L}: imageAlt ${alt.length} chars > 170`);
  if (!alt.endsWith(" | pariharaonline.com")) err(`${L}: imageAlt must end with " | pariharaonline.com"`);

  const tk = p.takeaways ?? [];
  if (tk.length < 2 || tk.length > 3) err(`${L}: takeaways ${tk.length} (need 2–3)`);
  tk.forEach((t, i) => { if (words(t) > 35) err(`${L}: takeaway ${i + 1} has ${words(t)} words > 35`); });
  const faq = p.faq ?? [];
  if (faq.length < 3 || faq.length > 5) err(`${L}: faq ${faq.length} items (need 3–5)`);
  faq.forEach((f, i) => {
    if (!f.q || !f.q.trim().endsWith("?")) err(`${L}: faq ${i + 1} question must end with '?'`);
    const w = words(f.a ?? "");
    if (w < 40 || w > 70) err(`${L}: faq ${i + 1} answer ${w} words (need 40–70)`);
    if (/as mentioned above|see above|as we saw/i.test(f.a ?? "")) err(`${L}: faq ${i + 1} answer not self-contained`);
  });
  if (!faq.some((f) => sk.some((s) => fuzzyHas(`${f.q} ${f.a}`, s)))) warn(`${L}: no FAQ clearly targets a secondary keyword`);

  const h = p.products?.handles ?? [];
  if (!Array.isArray(h) || h.length > 2) err(`${L}: products.handles must be 0–2`);
  for (const x of h) if (!catalog.has(x)) err(`${L}: unknown product handle ${x}`);
  if (h.length === 0 && !p.products?.query) err(`${L}: products needs handles or a query`);

  const rel = p.related ?? [];
  if (rel.length < 3 || rel.length > 4) err(`${L}: related ${rel.length} (need 3–4)`);
  if (new Set(rel).size !== rel.length) err(`${L}: duplicate related`);
  for (const r of rel) {
    if (r === p.slug) err(`${L}: related includes itself`);
    else if (!linkable(r)) err(`${L}: related slug not in batch one or two: ${r}`);
  }
  if (!rel.some((r) => r !== p.slug && linkable(r) && clusterOf(r) !== p.cluster)) err(`${L}: related needs ≥1 slug from another cluster`);

  for (const [label, text] of contentStrings(p)) scanText(`${L} ${label}`, text);
}
posts.forEach(checkPost);

// ---------- counts ----------
const count = (arr, f) => arr.reduce((m, p) => ((m[f(p)] = (m[f(p)] ?? 0) + 1), m), {});
if (posts.length !== TOTAL) err(`posts: ${posts.length} (need exactly ${TOTAL})`);
const nClusters = clusterIds.size;
if (nClusters < 35 || nClusters > 50) err(`clusters: ${nClusters} (need ≈45, 35–50)`);
const perCluster = count(posts, (p) => p.cluster);
for (const id of clusterIds) if ((perCluster[id] ?? 0) < 3) err(`cluster ${id}: ${perCluster[id] ?? 0} posts (need ≥3)`);
const authorSplit = count(posts, (p) => p.author);
for (const a of AUTHORS) if ((authorSplit[a] ?? 0) !== AUTHOR_EXACT[a]) err(`author split must be exactly 100/100/100: ${a}=${authorSplit[a] ?? 0}`);
const audience = count(posts, (p) => p.audience);
if ((audience["nri-us"] ?? 0) < MIN_NRI) err(`nri-us posts ${audience["nri-us"] ?? 0} < ${MIN_NRI}`);
if ((audience.seeker ?? 0) < MIN_SEEKER) err(`seeker posts ${audience.seeker ?? 0} < ${MIN_SEEKER}`);

// series
const seriesCount = count(posts, (p) => seriesOf[p.cluster] ?? "(other)");
for (const [s, [lo, hi]] of Object.entries(SERIES)) {
  const n = seriesCount[s] ?? 0;
  if (n < lo || n > hi) err(`series ${s}: ${n} posts (need ${lo === hi ? lo : `${lo}–${hi}`})`);
}
function namedSeries(series, names, label) {
  const list = posts.filter((p) => seriesOf[p.cluster] === series);
  for (const aliases of names) {
    const hits = list.filter((p) => aliases.some((a) => new RegExp(`\\b${a.replace(/[- ]/g, "[- ]")}\\b`, "i").test(`${p.title} ${p.slug} ${p.primaryKeyword}`)));
    if (hits.length !== 1) err(`${label} "${aliases[0]}": ${hits.length} series posts name it (need exactly 1)${hits.length ? `: ${hits.map((h) => h.slug).join(", ")}` : ""}`);
  }
  return list;
}
const nak = namedSeries("nakshatra", NAKSHATRAS, "nakshatra");
namedSeries("rasi", RASIS, "rasi");
const nakAuthors = count(nak, (p) => p.author);
if (Object.keys(nakAuthors).length < 2) err(`nakshatra series written by a single author`);
for (let i = 1; i < nak.length; i++) if (nak[i].author === nak[i - 1].author) err(`nakshatra series: ${nak[i - 1].slug} and ${nak[i].slug} share an author back to back (alternate authors)`);
const kural = posts.filter((p) => seriesOf[p.cluster] === "mythology" && /kural|valluvar/i.test(`${p.slug} ${p.title} ${p.primaryKeyword}`));
if (kural.length < TIRUKKURAL[0] || kural.length > TIRUKKURAL[1]) err(`Tirukkural posts inside mythology: ${kural.length} (need ${TIRUKKURAL[0]}–${TIRUKKURAL[1]})`);
const mythAuthors = count(posts.filter((p) => seriesOf[p.cluster] === "mythology"), (p) => p.author);
if ((mythAuthors.hariharan ?? 0) <= (mythAuthors.manikandan ?? 0) + (mythAuthors.archana ?? 0)) warn(`mythology should be mostly hariharan: ${JSON.stringify(mythAuthors)}`);
const recipeAuthors = count(posts.filter((p) => seriesOf[p.cluster] === "recipes"), (p) => p.author);
if ((recipeAuthors.archana ?? 0) * 2 <= (seriesCount.recipes ?? 0)) warn(`recipes should be mostly archana: ${JSON.stringify(recipeAuthors)}`);

// ---------- link graph (inbound counted from batch two only) ----------
const inbound = Object.fromEntries(posts.map((p) => [p.slug, 0]));
for (const p of posts) for (const r of p.related ?? []) if (r in inbound && r !== p.slug) inbound[r]++;
for (const p of posts) if (inbound[p.slug] < 2) err(`${p.slug}: inbound from batch two ${inbound[p.slug]} < 2`);
const b1Linked = new Set(posts.flatMap((p) => p.related ?? []).filter((r) => b1Slugs.has(r)));

// ---------- keywords.json ----------
const kc = keywords.clusters ?? [];
if (kc.length !== nClusters) err(`keywords.json has ${kc.length} clusters, plan has ${nClusters}`);
for (const c of kc) {
  if (!clusterIds.has(c.id)) err(`keywords.json: cluster ${c.id} not in plan`);
  const n = (c.secondaryKeywords ?? []).length;
  if (n < 4 || n > 8) err(`keywords.json ${c.id}: ${n} secondary keywords (need 4–8)`);
  for (const k of ["name", "primaryKeyword", "evidence", "audience", "seasonality", "products"]) if (!c[k]) err(`keywords.json ${c.id}: missing ${k}`);
  if (!(c.queriesSearched ?? []).length) err(`keywords.json ${c.id}: no queriesSearched`);
}
(function walk(o, where) {
  if (typeof o === "string") return scanText(`keywords.json ${where}`, o, DATE_PATTERNS);
  if (Array.isArray(o)) return o.forEach((v, i) => walk(v, `${where}[${i}]`));
  if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) if (k !== "generatedAt") walk(v, `${where}.${k}`);
})(keywords.clusters, "clusters");

// ---------- report ----------
const lens = (f) => posts.length ? { min: Math.min(...posts.map(f)), max: Math.max(...posts.map(f)) } : {};
const summary = {
  clusters: nClusters, posts: posts.length,
  authorSplit, audience, intent: count(posts, (p) => p.intent),
  series: seriesCount, seriesTolerance: "nakshatra 27 exact (all 27 named once), rasi 12 exact (all 12 named once), other series ~N ± 3",
  nakshatraAuthors: nakAuthors, tirukkuralPosts: kural.length, mythologyAuthors: mythAuthors, recipeAuthors,
  inboundFromBatch2: lens((p) => inbound[p.slug]),
  batchOneSlugsLinked: b1Linked.size,
  descriptionLength: lens((p) => (p.description ?? "").length),
  titleLengthMax: lens((p) => (p.title ?? "").length).max,
  faqItems: posts.reduce((s, p) => s + (p.faq?.length ?? 0), 0),
  errors: errors.length, warnings: warnings.length,
};
console.log(JSON.stringify(summary, null, 2));
if (!quiet) warnings.forEach((w) => console.log("WARN  " + w));
errors.forEach((e) => console.log("ERROR " + e));
console.log(errors.length ? `FAIL: ${errors.length} error(s)` : "PASS: all checks");
process.exit(errors.length ? 1 : 0);
