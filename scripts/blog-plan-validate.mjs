// Validates content/blog-plan/plan.json and keywords.json against SPEC.md rules.
// Usage: node scripts/blog-plan-validate.mjs [--quiet]   exit code 1 on any error.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const plan = read("content/blog-plan/plan.json");
const keywords = read("content/blog-plan/keywords.json");
const catalog = new Set(read("content/blog-plan/catalog.json").map((p) => p.handle));
const quiet = process.argv.includes("--quiet");

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

// Existing posts (slugs/titles must not collide; may be linked by writers)
const blogDir = path.join(root, "content/blog");
const existing = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md")).map((f) => {
  const txt = fs.readFileSync(path.join(blogDir, f), "utf8");
  const m = txt.match(/^title:\s*"?(.+?)"?\s*$/m);
  return { slug: f.replace(/\.md$/, ""), title: m ? m[1] : "" };
});

const core = plan.posts ?? [];
const extras = plan.extras ?? [];
const all = [...core, ...extras];
const coreSlugs = new Set(core.map((p) => p.slug));
const planSlugs = new Set(all.map((p) => p.slug));
const bySlug = Object.fromEntries(all.map((p) => [p.slug, p]));
const clusterIds = new Set((plan.clusters ?? []).map((c) => c.id));

// ---------- evergreen + banned content ----------
const MONTH = "(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*";
const DATE_PATTERNS = [
  [/\b(19|20)\d{2}\b/i, "4-digit year"],
  [new RegExp(`\\b${MONTH}\\.?\\s+\\d{1,2}(st|nd|rd|th)?\\b`, "i"), "month-day date"],
  [new RegExp(`\\b\\d{1,2}(st|nd|rd|th)?\\s+(of\\s+)?${MONTH}\\b`, "i"), "day-month date"],
  [/\b\d{4}-\d{2}-\d{2}\b/, "ISO date"],
  [/\bthis year\b/i, "'this year'"],
];
const BANNED = [
  [/\bdelve/i, "delve"], [/\btapestry\b/i, "tapestry"], [/fast-paced world/i, "fast-paced world"],
  [/\bmandir\b/i, "mandir (use temple)"], [/chatgpt|language model/i, "AI reference"], [/\bAI\b/, "AI reference"],
  [/devdutt|pattanaik|sadhguru|\bisha\b|speaking\s?tree/i, "persona influence named"],
  [/(?<!\b(?:no|not|never|nor|without|isn't|cannot|can't|doesn't)\b(?:\s+\S+){0,3}\s+)\bguarantee[sd]?\b(?!\s+(?:of\s+)?(?:anything|nothing))/i, "outcome guarantee (not negated)"], [/\$\s?\d|₹|\bRs\.?\s?\d|\bINR\b|\bUSD\b/, "price"],
];
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
  if (p.reason) out.push(["reason", p.reason]);
  return out;
}

// ---------- per-post checks ----------
const AUTHORS = ["hariharan", "archana", "manikandan"];
const AUDIENCES = ["general", "nri-us", "seeker"];
const INTENTS = ["informational", "comparison", "how-to", "seasonal", "story"];
const STOP = new Set(["a", "an", "the", "of", "for", "to", "in", "at", "is", "and", "on", "vs", "how", "what", "why", "do", "does", "with", "your", "you"]);
const kwTokens = (s) => s.toLowerCase().split(/[^a-z0-9']+/).filter((w) => w && !STOP.has(w));
const fuzzyHas = (text, phrase) => {
  const t = text.toLowerCase();
  return kwTokens(phrase).every((w) => t.includes(w.replace(/s$/, "")));
};

const seenSlug = new Map();
const seenTitle = new Map();
// Only the LEGACY posts count as pre-existing. Once writers start, content/blog also
// contains this plan's own posts; those must not be reported as collisions.
const ownSlugs = new Set([...(plan.posts || []), ...(plan.extras || [])].map((p) => p.slug));
for (const e of existing) { if (ownSlugs.has(e.slug)) continue; seenSlug.set(e.slug, "existing post"); seenTitle.set(e.title.toLowerCase(), "existing post"); }

function checkPost(p, kind) {
  const L = `[${kind}] ${p.slug}`;
  const req = ["slug", "title", "description", "author", "cluster", "primaryKeyword", "secondaryKeywords", "tags", "audience", "intent", "outline", "related", "products", "imagePrompt", "imageAlt", "publishedAt", "takeaways", "faq"];
  for (const k of req) if (p[k] === undefined || p[k] === "") err(`${L}: missing ${k}`);
  if (kind === "extra" && !p.reason) err(`${L}: extras need a 'reason'`);

  if (seenSlug.has(p.slug)) err(`${L}: duplicate slug (also ${seenSlug.get(p.slug)})`); else seenSlug.set(p.slug, p.slug);
  const tl = (p.title ?? "").toLowerCase();
  if (seenTitle.has(tl)) err(`${L}: duplicate title`); else seenTitle.set(tl, p.slug);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) err(`${L}: slug not lowercase-hyphen`);
  if (p.slug.split("-").length > 6) err(`${L}: slug has > 6 words`);
  if ((p.title ?? "").length > 60) err(`${L}: title ${p.title.length} chars > 60`);
  const dl = (p.description ?? "").length;
  if (dl < 140 || dl > 160) err(`${L}: description ${dl} chars (need 140–160)`);
  if (!AUTHORS.includes(p.author)) err(`${L}: bad author ${p.author}`);
  if (!AUDIENCES.includes(p.audience)) err(`${L}: bad audience ${p.audience}`);
  if (!INTENTS.includes(p.intent)) err(`${L}: bad intent ${p.intent}`);
  if (!clusterIds.has(p.cluster)) err(`${L}: unknown cluster ${p.cluster}`);
  if (p.publishedAt !== "2026-09-28") err(`${L}: publishedAt must be 2026-09-28`);
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
  if (/\b(calendar|panchang\w*|pages?|open book|notebook open|sign|poster|screen|label|newspaper|letters|writing)\b/i.test(p.imagePrompt ?? "")) warn(`${L}: imagePrompt may render text: "${p.imagePrompt}"`);
  if (/\b(idol|statue|deity'?s? face)\b/i.test(p.imagePrompt ?? "")) warn(`${L}: imagePrompt mentions an idol/statue; keep deity faces out of frame`);
  const tk = p.takeaways ?? [];
  if (tk.length < 2 || tk.length > 3) err(`${L}: takeaways ${tk.length} (need 2–3)`);
  tk.forEach((t, i) => { if (words(t) > 35) err(`${L}: takeaway ${i + 1} has ${words(t)} words > 35`); });
  const faq = p.faq ?? [];
  if (faq.length < 3 || faq.length > 5) err(`${L}: faq ${faq.length} items (need 3–5)`);
  faq.forEach((f, i) => {
    if (!f.q || !f.q.trim().endsWith("?")) err(`${L}: faq ${i + 1} question must end with '?'`);
    const w = words(f.a ?? "");
    if (w < 40 || w > 70) err(`${L}: faq ${i + 1} answer ${w} words (need 40–70)`);
    if (/as mentioned above|see above/i.test(f.a ?? "")) err(`${L}: faq ${i + 1} answer not self-contained`);
  });
  if (!faq.some((f) => sk.some((s) => fuzzyHas(`${f.q} ${f.a}`, s)))) warn(`${L}: no FAQ clearly targets a secondary keyword`);

  const h = p.products?.handles ?? [];
  if (!Array.isArray(h) || h.length > 2) err(`${L}: products.handles must be 0–2`);
  for (const x of h) if (!catalog.has(x)) err(`${L}: unknown product handle ${x}`);
  if (h.length === 0 && !p.products?.query) err(`${L}: products needs handles or a query`);
  if ((p.imageAlt ?? "").length > 170) err(`${L}: imageAlt ${p.imageAlt.length} chars > 170`);
  if (!/pariharaonline\.com/.test(p.imageAlt ?? "")) err(`${L}: imageAlt must include pariharaonline.com (owner SEO rule)`);

  const rel = p.related ?? [];
  if (rel.length < 3 || rel.length > 4) err(`${L}: related ${rel.length} (need 3–4)`);
  if (new Set(rel).size !== rel.length) err(`${L}: duplicate related`);
  for (const r of rel) {
    if (r === p.slug) err(`${L}: related includes itself`);
    else if (!planSlugs.has(r)) err(`${L}: related slug not in plan: ${r}`);
  }
  if (!rel.some((r) => bySlug[r] && bySlug[r].cluster !== p.cluster)) err(`${L}: related needs ≥1 cross-cluster slug`);
  if (kind === "extra" && rel.filter((r) => coreSlugs.has(r)).length < 3) err(`${L}: extras must link to ≥3 core posts`);

  for (const [label, text] of contentStrings(p)) scanText(`${L} ${label}`, text);
}
core.forEach((p) => checkPost(p, "core"));
extras.forEach((p) => checkPost(p, "extra"));

// ---------- counts ----------
if (core.length !== 100) err(`core posts: ${core.length} (need exactly 100)`);
if (extras.length < 20 || extras.length > 30) err(`extras: ${extras.length} (need 20–30)`);
const nClusters = clusterIds.size;
if (nClusters < 20 || nClusters > 30) err(`clusters: ${nClusters} (need 20–30)`);
const perCluster = {};
core.forEach((p) => (perCluster[p.cluster] = (perCluster[p.cluster] ?? 0) + 1));
for (const id of clusterIds) {
  const n = perCluster[id] ?? 0;
  if (n < 3 || n > 6) err(`cluster ${id}: ${n} core posts (need 3–6)`);
}
const count = (arr, key) => arr.reduce((m, p) => ((m[p[key]] = (m[p[key]] ?? 0) + 1), m), {});
const authorSplit = count(core, "author");
for (const a of AUTHORS) if ((authorSplit[a] ?? 0) < 30 || (authorSplit[a] ?? 0) > 37) err(`author split off target (≈34/33/33): ${a}=${authorSplit[a] ?? 0}`);
const audienceCore = count(core, "audience");
if ((audienceCore["nri-us"] ?? 0) < 20) err(`core nri-us posts ${audienceCore["nri-us"] ?? 0} < 20`);
if ((audienceCore.seeker ?? 0) < 18) err(`core seeker posts ${audienceCore.seeker ?? 0} < 18`);

// ---------- link graph ----------
const inboundCore = Object.fromEntries(all.map((p) => [p.slug, 0]));
const inboundAll = Object.fromEntries(all.map((p) => [p.slug, 0]));
for (const p of all) for (const r of p.related ?? []) if (r in inboundAll) {
  inboundAll[r]++;
  if (coreSlugs.has(p.slug)) inboundCore[r]++;
}
for (const p of core) if (inboundCore[p.slug] < 2) err(`[core] ${p.slug}: inbound from core posts ${inboundCore[p.slug]} < 2`);
for (const p of extras) if (inboundAll[p.slug] < 1) err(`[extra] ${p.slug}: no inbound link from any post`);
const minIn = (list, m) => Math.min(...list.map((p) => m[p.slug]));
const maxIn = (list, m) => Math.max(...list.map((p) => m[p.slug]));

// ---------- keywords.json ----------
const kc = keywords.clusters ?? [];
if (kc.length !== nClusters) err(`keywords.json has ${kc.length} clusters, plan has ${nClusters}`);
for (const c of kc) {
  if (!clusterIds.has(c.id)) err(`keywords.json: cluster ${c.id} not in plan`);
  const n = (c.secondaryKeywords ?? []).length;
  if (n < 4 || n > 8) err(`keywords.json ${c.id}: ${n} secondary keywords (need 4–8)`);
  for (const k of ["name", "primaryKeyword", "evidence", "audience", "seasonality", "products"]) if (!c[k]) err(`keywords.json ${c.id}: missing ${k}`);
}
const kwAud = count(kc, "audience");
if ((kwAud["nri-us"] ?? 0) < 6) err(`keywords.json: nri-us clusters ${kwAud["nri-us"] ?? 0} < 6`);
if ((kwAud.seeker ?? 0) < 5) err(`keywords.json: seeker clusters ${kwAud.seeker ?? 0} < 5`);
(function walk(o, where) {
  if (typeof o === "string") return scanText(`keywords.json ${where}`, o, DATE_PATTERNS);
  if (Array.isArray(o)) return o.forEach((v, i) => walk(v, `${where}[${i}]`));
  if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) if (k !== "generatedAt") walk(v, `${where}.${k}`);
})(keywords.clusters, "clusters");
scanText("keywords.json method", keywords.method, DATE_PATTERNS);

// ---------- report ----------
const summary = {
  clusters: nClusters, corePosts: core.length, extras: extras.length,
  authorSplitCore: authorSplit, authorSplitAll: count(all, "author"),
  audienceCore, audienceAll: count(all, "audience"),
  intentCore: count(core, "intent"),
  coreInboundFromCore: { min: minIn(core, inboundCore), max: maxIn(core, inboundCore) },
  coreInboundAll: { min: minIn(core, inboundAll), max: maxIn(core, inboundAll) },
  extrasInbound: { min: minIn(extras, inboundAll), max: maxIn(extras, inboundAll) },
  descriptionLength: { min: Math.min(...all.map((p) => p.description.length)), max: Math.max(...all.map((p) => p.description.length)) },
  titleLengthMax: Math.max(...all.map((p) => p.title.length)),
  faqItems: all.reduce((s, p) => s + (p.faq?.length ?? 0), 0),
  errors: errors.length, warnings: warnings.length,
};
console.log(JSON.stringify(summary, null, 2));
if (!quiet) warnings.forEach((w) => console.log("WARN  " + w));
errors.forEach((e) => console.log("ERROR " + e));
console.log(errors.length ? `FAIL: ${errors.length} error(s)` : "PASS: all checks");
process.exit(errors.length ? 1 : 0);
