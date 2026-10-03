// Checks a detail file (posts-X.json) against plan rules before the build.
// Usage: node scripts/blog-plan2-data/check-detail.mjs posts-X.json [slug-list-file]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { clusters } from "./skeleton.mjs";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const file = path.resolve(here, process.argv[2]);
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const b1 = JSON.parse(fs.readFileSync(path.join(root, "content/blog-plan-2/batch1-index.json"), "utf8")).posts;
const b1Keys = new Set(b1.map((p) => p.primaryKeyword.toLowerCase()));
const tuple = Object.fromEntries(clusters.flatMap((c) => c.posts.map((t) => [t[0], t])));
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const MONTH = "(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)";
const BAD = [
  [/\b(19|20)\d{2}\b/, "4-digit year"], [new RegExp(`\\b${MONTH}\\.?\\s+\\d{1,2}(st|nd|rd|th)?\\b`, "i"), "month-day date"],
  [new RegExp(`\\b\\d{1,2}(st|nd|rd|th)?\\s+(of\\s+)?${MONTH}\\b`, "i"), "day-month date"], [/\b(this|next|last) year\b/i, "relative year"],
  [/\bdelve/i, "delve"], [/\btapestry\b/i, "tapestry"], [/fast-paced world/i, "fast-paced world"], [/\bmandir\b/i, "mandir"],
  [/chatgpt|language model|\bAI\b/, "AI reference"], [/devdutt|pattanaik|sadhguru|\bisha\b|speaking\s?tree/i, "persona influence"],
  [/(?<!\b(?:no|not|never|nor|without|isn't|cannot|can't|doesn't)\b(?:\s+\S+){0,3}\s+)\bguarantee[sd]?\b/i, "guarantee"],
  [/\$\s?\d|₹|\bRs\.?\s?\d|\bINR\b|\bUSD\b/, "price"],
  [/\bvibrant\b|\bembark\b|\bunlock (the|your)\b|\bholistic\b|\bin conclusion\b|\bever-evolving\b/i, "AI-voice cliché"], [/\bor else\b/i, "fear-selling"],
];
const STYLE = /\b(photograph\w*|photo|editorial|cinematic|illustration|watercolou?r|painting|render(ed)?|4k|8k|hdr|bokeh|golden (light|glow|hour)|glow(ing)?|luminous|warm light|soft light|style|realistic|hyper-?real\w*|film grain|depth of field)\b/i;
const STOP = new Set(["a", "an", "the", "of", "for", "to", "in", "at", "is", "and", "on", "vs", "how", "what", "why", "do", "does", "with", "your", "you", "my", "or"]);
const fuzzy = (t, ph) => ph.toLowerCase().split(/[^a-z0-9']+/).filter((w) => w && !STOP.has(w)).every((w) => t.toLowerCase().includes(w.replace(/s$/, "")));
let errs = 0, warns = 0;
const E = (s, m) => { errs++; console.log(`ERROR ${s}: ${m}`); };
const W = (s, m) => { warns++; console.log(`WARN  ${s}: ${m}`); };
const expected = process.argv[3] ? fs.readFileSync(path.resolve(process.argv[3]), "utf8").split(/\s+/).filter(Boolean) : null;
if (expected) for (const s of expected) if (!data[s]) E(s, "missing entry");
for (const [slug, d] of Object.entries(data)) {
  const t = tuple[slug];
  if (!t) { E(slug, "slug not in skeleton"); continue; }
  const pk = t[5];
  for (const k of ["description", "secondaryKeywords", "tags", "outline", "takeaways", "faq", "imagePrompt", "imageAlt"]) if (d[k] === undefined) E(slug, `missing ${k}`);
  const dl = (d.description ?? "").length; if (dl < 140 || dl > 160) E(slug, `description ${dl} chars (need 140–160)`);
  if (!fuzzy(d.description ?? "", pk)) W(slug, "description does not carry primary keyword");
  const sk = d.secondaryKeywords ?? []; if (sk.length < 2 || sk.length > 4) E(slug, `secondaryKeywords ${sk.length}`);
  for (const s of sk) { if (b1Keys.has(s.toLowerCase())) E(slug, `secondary "${s}" is a batch-one primary keyword`); if (s.toLowerCase() === pk.toLowerCase()) E(slug, "secondary equals primary"); }
  const tags = d.tags ?? []; if (tags.length < 2 || tags.length > 4) E(slug, `tags ${tags.length}`);
  for (const g of tags) if (g.split(/\s+/).some((w) => /^[a-z]/.test(w) && !["and", "of", "the", "vs", "for", "to", "in", "at", "on", "a", "with", "by"].includes(w))) E(slug, `tag not Title Case "${g}"`);
  const ol = d.outline ?? []; if (ol.length < 3 || ol.length > 5) E(slug, `outline ${ol.length} items (need 3–5)`);
  const heads = ol.filter((s) => s.trim().startsWith("##")).map((s) => s.split(/\s[—–-]\s/)[0]);
  if (heads.length < 2) E(slug, "outline needs ≥2 '## ' headings");
  if (!heads.some((h) => h.includes("?"))) E(slug, "no question-shaped ## heading (the '?' must be before the ' — ' note)");
  if (!heads.some((h) => fuzzy(h, pk))) W(slug, `primary keyword "${pk}" not in any ## heading`);
  const tk = d.takeaways ?? []; if (tk.length < 2 || tk.length > 3) E(slug, `takeaways ${tk.length}`);
  tk.forEach((x, i) => { if (words(x) > 35) E(slug, `takeaway ${i + 1} ${words(x)} words > 35`); });
  const faq = d.faq ?? []; if (faq.length < 3 || faq.length > 5) E(slug, `faq ${faq.length}`);
  faq.forEach((f, i) => {
    if (!f.q?.trim().endsWith("?")) E(slug, `faq ${i + 1} q must end with ?`);
    const w = words(f.a ?? ""); if (w < 40 || w > 70) E(slug, `faq ${i + 1} answer ${w} words (need 40–70)`);
    if (/as mentioned above|see above|as we saw/i.test(f.a ?? "")) E(slug, `faq ${i + 1} not self-contained`);
  });
  if (!faq.some((f) => sk.some((s) => fuzzy(`${f.q} ${f.a}`, s)))) W(slug, "no FAQ targets a secondary keyword");
  const ip = d.imagePrompt ?? "";
  if (STYLE.test(ip)) E(slug, `imagePrompt style word "${ip.match(STYLE)[0]}"`);
  if (ip.replace(/\.$/, "").split(/[.!?]\s+/).length > 1) E(slug, "imagePrompt must be one sentence");
  if (/\b(idol|statue|murti|portrait|face)\b/i.test(ip)) W(slug, "imagePrompt mentions idol/statue/face — keep deity faces out");
  if (/\b(calendar|panchang\w*|pages?|book|notebook|sign|poster|screen|label|newspaper|letters|writing|text|words|inscription|script)\b/i.test(ip)) W(slug, "imagePrompt may render text");
  const alt = d.imageAlt ?? ""; if (alt.length > 170) E(slug, `imageAlt ${alt.length} > 170`);
  if (!alt.endsWith(" | pariharaonline.com")) E(slug, 'imageAlt must end with " | pariharaonline.com"');
  const strings = [d.description, alt, ip, ...sk, ...tags, ...ol, ...tk, ...faq.flatMap((f) => [f.q, f.a])];
  for (const s of strings) for (const [re, n] of BAD) if (typeof s === "string" && re.test(s)) E(slug, `${n} in "${s.slice(0, 70)}"`);
}
console.log(`${Object.keys(data).length} entries; ${errs} errors, ${warns} warnings`);
process.exit(errs ? 1 : 0);
