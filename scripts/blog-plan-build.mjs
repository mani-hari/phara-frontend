// Builds content/blog-plan/plan.json and keywords.json from scripts/blog-plan-data/*.
// Usage: node scripts/blog-plan-build.mjs   (then: node scripts/blog-plan-validate.mjs)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { clusters, extras } from "./blog-plan-data/skeleton.mjs";
import { kw } from "./blog-plan-data/keywords-src.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "scripts/blog-plan-data");
const detail = {};
for (const f of fs.readdirSync(dataDir).filter((f) => /^posts-[A-Z]\.json$/.test(f))) {
  Object.assign(detail, JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8")));
}
const queries = fs.readFileSync(path.join(root, ".firecrawl/kw/q.txt"), "utf8").trim().split("\n");
const PUBLISHED = "2026-09-28";

const products = (handles, query, heading) => {
  const p = { handles };
  if (query) p.query = query;
  if (heading) p.heading = heading;
  return p;
};

function makePost(cluster, t, isExtra) {
  const [slug, title, author, audience, intent, primaryKeyword, handles, query, heading] = t;
  const d = detail[slug];
  if (!d) throw new Error(`missing detail for ${slug}`);
  const post = {
    slug, title, description: d.description, author, cluster, primaryKeyword,
    secondaryKeywords: d.secondaryKeywords, tags: d.tags, audience, intent,
    outline: d.outline, takeaways: d.takeaways, faq: d.faq, related: [],
    products: products(handles, query, heading),
    image: `/blog/${slug}.webp`, imagePrompt: d.imagePrompt, imageAlt: d.imageAlt,
    publishedAt: PUBLISHED,
  };
  if (isExtra) post.reason = d.reason;
  return post;
}

// Core posts + related graph
const byCluster = {};
const posts = [];
for (const c of clusters) {
  byCluster[c.id] = c.posts.map((t) => makePost(c.id, t, false));
  posts.push(...byCluster[c.id]);
}
const crossCounter = {};
for (const c of clusters) {
  const list = byCluster[c.id];
  const n = list.length;
  list.forEach((p, i) => {
    p.related.push(list[(i + 1) % n].slug, list[(i + 2) % n].slug);
    const target = c.cross[i % c.cross.length];
    const tl = byCluster[target];
    const k = (crossCounter[target] = (crossCounter[target] ?? -1) + 1);
    p.related.push(tl[k % tl.length].slug);
  });
}

// Extras: link to 3 core posts (2 in-cluster, 1 cross-cluster); get linked from 1 core post.
const extraPosts = [];
const extraInCounter = {};
const extraOutCounter = {};
for (const t of extras) {
  const [cid, ...rest] = t;
  const e = makePost(cid, rest, true);
  const list = byCluster[cid];
  const c = clusters.find((x) => x.id === cid);
  const o = (extraOutCounter[cid] = (extraOutCounter[cid] ?? -1) + 1);
  e.related.push(list[o % list.length].slug, list[(o + 1) % list.length].slug);
  const cross = byCluster[c.cross[o % c.cross.length]];
  e.related.push(cross[o % cross.length].slug);
  // inbound from a core post in the same cluster, preferring one that does not already have an extra
  const k = (extraInCounter[cid] = (extraInCounter[cid] ?? -1) + 1);
  const host = list[(list.length - 1 - k + list.length * 4) % list.length];
  if (host.related.length >= 4) throw new Error(`host ${host.slug} already has 4 related`);
  host.related.push(e.slug);
  extraPosts.push(e);
}

const plan = {
  generatedAt: new Date().toISOString(),
  note: "Evergreen plan: no years or calendar dates in any content field. Core = exactly 100 posts; extras = additional posts (owner update).",
  clusters: clusters.map((c) => ({ id: c.id, name: c.name })),
  posts,
  extras: extraPosts,
};
fs.writeFileSync(path.join(root, "content/blog-plan/plan.json"), JSON.stringify(plan, null, 2) + "\n");

const keywords = {
  generatedAt: plan.generatedAt,
  method: "Firecrawl web search (US geo, top 8 results) for each seed query; evidence is SERP composition (who ranks, forum/Q&A presence, year-qualified recurring queries). No search-volume tool was available, so demand is inferred, not measured. Year-qualified date queries are captured with evergreen titles; the site or a panchangam link carries the current date. Raw results: .firecrawl/kw/.",
  clusters: clusters.map((c) => {
    const k = kw[c.id];
    if (!k) throw new Error(`missing keywords for ${c.id}`);
    const all = [...byCluster[c.id], ...extraPosts.filter((e) => e.cluster === c.id)];
    const handles = [...new Set(all.flatMap((p) => p.products.handles))];
    const qs = [...new Set(all.map((p) => p.products.query).filter(Boolean))];
    return {
      id: c.id, name: c.name, primaryKeyword: c.primaryKeyword, secondaryKeywords: k.secondary,
      evidence: k.evidence, queriesSearched: k.q.map((i) => queries[i - 1].replace(/\b(19|20)\d{2}\b/g, "<year>")),
      audience: c.audience, seasonality: c.seasonality,
      products: { handles, query: qs[0] ?? "" },
      corePosts: byCluster[c.id].length,
      extraPosts: all.length - byCluster[c.id].length,
    };
  }),
};
fs.writeFileSync(path.join(root, "content/blog-plan/keywords.json"), JSON.stringify(keywords, null, 2) + "\n");
console.log(`plan.json: ${posts.length} core + ${extraPosts.length} extras; keywords.json: ${keywords.clusters.length} clusters`);

// plan-summary.md: cluster table + validator output
import { spawnSync } from "node:child_process";
const v = spawnSync(process.execPath, [path.join(root, "scripts/blog-plan-validate.mjs"), "--quiet"], { encoding: "utf8" });
const rows = keywords.clusters.map((c) => `| ${c.name} | \`${c.id}\` | ${c.audience} | ${c.corePosts} | ${c.extraPosts} | ${c.primaryKeyword} | ${c.seasonality} |`);
const summaryMd = `# Blog plan summary

Generated by \`node scripts/blog-plan-build.mjs\` from \`scripts/blog-plan-data/\`; validated by
\`node scripts/blog-plan-validate.mjs\`. Evergreen: no years or calendar dates in any content field.

## Clusters (${keywords.clusters.length})

| Cluster | id | Audience | Core posts | Extras | Primary keyword | Seasonality |
|---|---|---|---|---|---|---|
${rows.join("\n")}
| **Total** | | | **${posts.length}** | **${extraPosts.length}** | | |

Audience of a cluster is its main audience; audience is set per post, so NRI and seeker posts also
sit inside festival, health, pitru and puja clusters.

## Validation (\`node scripts/blog-plan-validate.mjs --quiet\`)

\`\`\`
${v.stdout.trim()}
\`\`\`
`;
fs.writeFileSync(path.join(root, "content/blog-plan/plan-summary.md"), summaryMd);
console.log(v.stdout.split("\n").slice(-1)[0] || v.stdout.trim().split("\n").pop());
