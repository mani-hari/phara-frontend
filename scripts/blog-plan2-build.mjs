// Builds content/blog-plan-2/plan.json, keywords.json and plan-summary.md from scripts/blog-plan2-data/*.
// Usage: node scripts/blog-plan2-build.mjs [--allow-missing]   (then: node scripts/blog-plan2-validate.mjs)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { clusters } from "./blog-plan2-data/skeleton.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "scripts/blog-plan2-data");
const outDir = path.join(root, "content/blog-plan-2");
const allowMissing = process.argv.includes("--allow-missing");
const PUBLISHED = "2026-11-07";

const detail = {};
for (const f of fs.readdirSync(dataDir).filter((f) => /^posts-[A-Za-z0-9]+\.json$/.test(f))) {
  Object.assign(detail, JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8")));
}
let kw = {};
if (fs.existsSync(path.join(dataDir, "keywords-src.mjs"))) kw = (await import("./blog-plan2-data/keywords-src.mjs")).kw;

const products = (handles, query, heading) => {
  const p = { handles };
  if (query) p.query = query;
  if (heading) p.heading = heading;
  return p;
};
const missing = [];
function makePost(cluster, t) {
  const [slug, title, author, audience, intent, primaryKeyword, handles, query, heading] = t;
  let d = detail[slug];
  if (!d) { missing.push(slug); if (!allowMissing) return null; d = {}; }
  return {
    slug, title, description: d.description ?? "", author, cluster, primaryKeyword,
    secondaryKeywords: d.secondaryKeywords ?? [], tags: d.tags ?? [], audience, intent,
    outline: d.outline ?? [], takeaways: d.takeaways ?? [], faq: d.faq ?? [], related: [],
    products: products(handles, query, heading),
    image: `/blog/${slug}.webp`, imagePrompt: d.imagePrompt ?? "", imageAlt: d.imageAlt ?? "",
    publishedAt: PUBLISHED,
  };
}

const byCluster = {};
const posts = [];
for (const c of clusters) {
  byCluster[c.id] = c.posts.map((t) => makePost(c.id, t));
  posts.push(...byCluster[c.id]);
}
if (missing.length && !allowMissing) {
  console.error(`missing detail for ${missing.length} posts, e.g. ${missing.slice(0, 8).join(", ")}`);
  process.exit(1);
}

// Related graph: 2 in-cluster (ring, so every post gets 2 inbound links from batch two),
// 1 batch-two cross-cluster (rotating through targets), 1 batch-one slug where the cluster lists them.
const crossCounter = {};
const b1Counter = {};
for (const c of clusters) {
  const list = byCluster[c.id];
  const n = list.length;
  list.forEach((p, i) => {
    p.related.push(list[(i + 1) % n].slug, list[(i + 2) % n].slug);
    const target = c.cross[i % c.cross.length];
    const tl = byCluster[target];
    const k = (crossCounter[target] = (crossCounter[target] ?? -1) + 1);
    p.related.push(tl[k % tl.length].slug);
    if (c.b1?.length) {
      const j = (b1Counter[c.id] = (b1Counter[c.id] ?? -1) + 1);
      p.related.push(c.b1[j % c.b1.length]);
    }
  });
}

const generatedAt = new Date().toISOString();
const plan = {
  generatedAt,
  note: "Batch two: exactly 300 evergreen posts (no years or calendar dates in any content field). publishedAt is a placeholder; the scheduler assigns real dates. related may point to batch-one slugs (content/blog-plan-2/batch1-index.json).",
  clusters: clusters.map((c) => ({ id: c.id, name: c.name, series: c.series ?? null })),
  posts,
};
fs.writeFileSync(path.join(outDir, "plan.json"), JSON.stringify(plan, null, 2) + "\n");

const qFile = path.join(root, ".firecrawl/kw2/q.txt");
const queries = fs.existsSync(qFile) ? fs.readFileSync(qFile, "utf8").trim().split("\n") : [];
const keywords = {
  generatedAt,
  method: "Firecrawl CLI search was the planned tool but the account had no credits left this billing cycle (every call returned HTTP 402), so the built-in WebSearch tool (US results, titles and URLs only, no page content) was used for the same seed queries. Evidence is SERP composition: who ranks (panchang portals, temple sites, recipe blogs, Wikipedia, forums such as Reddit and Quora, US temple and D2C puja sites) and whether queries are question-shaped or recurring. No search-volume tool was available, so demand is inferred, not measured. Raw results: .firecrawl/kw2/sNN.json (queries in .firecrawl/kw2/q.txt).",
  clusters: clusters.map((c) => {
    const k = kw[c.id] ?? { q: [], secondary: [], evidence: "" };
    const list = byCluster[c.id];
    return {
      id: c.id, name: c.name, series: c.series ?? null, primaryKeyword: c.primaryKeyword, secondaryKeywords: k.secondary,
      evidence: k.evidence, queriesSearched: k.q.map((i) => (queries[i - 1] ?? "").replace(/\b(19|20)\d{2}\b/g, "<year>")),
      audience: c.audience, seasonality: c.seasonality,
      products: { handles: [...new Set(list.flatMap((p) => p.products.handles))], query: [...new Set(list.map((p) => p.products.query).filter(Boolean))][0] ?? "" },
      posts: list.length,
    };
  }),
};
fs.writeFileSync(path.join(outDir, "keywords.json"), JSON.stringify(keywords, null, 2) + "\n");
console.log(`plan.json: ${posts.length} posts in ${clusters.length} clusters; keywords.json written${missing.length ? `; ${missing.length} posts missing detail (placeholders)` : ""}`);

// plan-summary.md
const v = spawnSync(process.execPath, [path.join(root, "scripts/blog-plan2-validate.mjs"), "--quiet"], { encoding: "utf8" });
const count = (arr, f) => arr.reduce((m, p) => ((m[f(p)] = (m[f(p)] ?? 0) + 1), m), {});
const bySeries = count(posts, (p) => clusters.find((c) => c.id === p.cluster).series ?? "(other)");
const authorBySeries = {};
for (const p of posts) {
  const s = clusters.find((c) => c.id === p.cluster).series ?? "(other)";
  authorBySeries[s] ??= { hariharan: 0, archana: 0, manikandan: 0 };
  authorBySeries[s][p.author]++;
}
const rows = keywords.clusters.map((c) => `| ${c.name} | \`${c.id}\` | ${c.series ?? ""} | ${c.audience} | ${c.posts} | ${c.primaryKeyword} | ${c.seasonality} |`);
const aud = count(posts, (p) => p.audience);
const au = count(posts, (p) => p.author);
const md = `# Batch two plan summary

Generated by \`node scripts/blog-plan2-build.mjs\` from \`scripts/blog-plan2-data/\`; validated by
\`node scripts/blog-plan2-validate.mjs\`. Evergreen: no years or calendar dates in any content field.
publishedAt is the placeholder ${PUBLISHED} for every post.

Research note: Firecrawl had no credits left this cycle (HTTP 402), so WebSearch (titles and URLs only)
was used for the seed queries. No search-volume tool; demand is inferred from SERP shape.

## Clusters (${clusters.length})

| Cluster | id | Series | Audience | Posts | Primary keyword | Seasonality |
|---|---|---|---|---|---|---|
${rows.join("\n")}
| **Total** | | | | **${posts.length}** | | |

## Series counts

| Series | Posts | hariharan | archana | manikandan |
|---|---|---|---|---|
${Object.entries(bySeries).map(([s, n]) => `| ${s} | ${n} | ${authorBySeries[s].hariharan} | ${authorBySeries[s].archana} | ${authorBySeries[s].manikandan} |`).join("\n")}

## Authors and audiences

- Authors: hariharan ${au.hariharan ?? 0}, archana ${au.archana ?? 0}, manikandan ${au.manikandan ?? 0}
- Audiences: nri-us ${aud["nri-us"] ?? 0}, seeker ${aud.seeker ?? 0}, general ${aud.general ?? 0}

Cluster audience is the main audience; audience is set per post.

## Validation (\`node scripts/blog-plan2-validate.mjs --quiet\`)

\`\`\`
${v.stdout.trim()}
\`\`\`
`;
fs.writeFileSync(path.join(outDir, "plan-summary.md"), md);
console.log(v.stdout.trim().split("\n").pop());
