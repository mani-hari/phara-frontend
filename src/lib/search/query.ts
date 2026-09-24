/**
 * Hybrid product search: pgvector cosine similarity + Postgres full-text /
 * trigram keyword matching, merged with reciprocal rank fusion (RRF).
 * Falls back to keyword-only when embeddings are unavailable. Never throws.
 */
import { ensureSearchSchema, getSearchSql } from "./db"
import { embedQuery, embeddingsEnabled } from "./embeddings"

export type SearchResult = {
  id: string
  handle: string
  title: string
  subtitle: string | null
  thumbnail: string | null
  score: number
}

export type SearchResponse = {
  query: string
  results: SearchResult[]
  mode: "hybrid" | "keyword"
}

export const MAX_QUERY_LENGTH = 200
export const MAX_LIMIT = 24
const CANDIDATES = 50
const RRF_K = 60
// Vector hits below this cosine similarity are dropped so unrelated products
// don't ride in on semantic noise. Tune once real embeddings are live.
const VECTOR_MIN_SIMILARITY = 0.25

type Row = {
  product_id: string
  handle: string
  title: string
  subtitle: string | null
  thumbnail: string | null
}

let warnedDegraded = false
function warnOnce(msg: string) {
  if (warnedDegraded) return
  warnedDegraded = true
  console.warn(`[search] ${msg} — using keyword-only results`)
}

export function normalizeQuery(q: string): string {
  return q.replace(/\s+/g, " ").trim().toLowerCase().slice(0, MAX_QUERY_LENGTH)
}

function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (m) => "\\" + m)
}

async function keywordSearch(q: string, tokens: string[]): Promise<Row[]> {
  const db = getSearchSql()!
  // Tokens are [\p{L}\p{N}]+ only, so this prefix tsquery is syntax-safe.
  // Single characters are skipped as prefixes (they'd match nearly everything).
  const prefixQuery = tokens
    .filter((t) => t.length >= 2)
    .map((t) => `${t}:*`)
    .join(" | ")
  const like = `%${escapeLike(q)}%`
  return (await db`
    WITH q AS (
      SELECT websearch_to_tsquery('english', ${q}) AS web,
             to_tsquery('english', ${prefixQuery}) AS pre
    )
    SELECT p.product_id, p.handle, p.title, p.subtitle, p.thumbnail
    FROM product_search_index p, q
    WHERE p.tsv @@ q.web
       OR p.tsv @@ q.pre
       OR p.searchable_text ILIKE ${like}
       OR word_similarity(${q}, p.searchable_text) > 0.45
    ORDER BY
      2 * ts_rank_cd(p.tsv, q.web)
      + ts_rank_cd(p.tsv, q.pre)
      + word_similarity(${q}, p.title)
      + 0.5 * word_similarity(${q}, p.searchable_text)
      + CASE WHEN p.title ILIKE ${like} THEN 1 ELSE 0 END
      DESC,
      p.title ASC
    LIMIT ${CANDIDATES}
  `) as Row[]
}

async function vectorSearch(vec: number[]): Promise<Row[]> {
  const db = getSearchSql()!
  const v = JSON.stringify(vec)
  return (await db`
    SELECT product_id, handle, title, subtitle, thumbnail
    FROM product_search_index
    WHERE embedding IS NOT NULL
      AND 1 - (embedding <=> ${v}::vector) >= ${VECTOR_MIN_SIMILARITY}
    ORDER BY embedding <=> ${v}::vector
    LIMIT ${CANDIDATES}
  `) as Row[]
}

function fuse(lists: Row[][], limit: number): SearchResult[] {
  const scores = new Map<string, { row: Row; score: number }>()
  for (const list of lists) {
    list.forEach((row, i) => {
      const add = 1 / (RRF_K + i + 1)
      const cur = scores.get(row.product_id)
      if (cur) cur.score += add
      else scores.set(row.product_id, { row, score: add })
    })
  }
  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ row, score }) => ({
      id: row.product_id,
      handle: row.handle,
      title: row.title,
      subtitle: row.subtitle,
      thumbnail: row.thumbnail,
      score: Number(score.toFixed(6)),
    }))
}

export async function searchProducts(
  rawQuery: string,
  { limit = 12 }: { limit?: number } = {}
): Promise<SearchResponse> {
  const query = normalizeQuery(rawQuery || "")
  const safeLimit = Math.max(1, Math.min(MAX_LIMIT, Math.floor(limit) || 12))
  const tokens = query.match(/[\p{L}\p{N}]+/gu) ?? []
  const empty: SearchResponse = { query, results: [], mode: "keyword" }
  if (!query || tokens.length === 0 || !getSearchSql()) return empty

  try {
    await ensureSearchSchema()
  } catch (err) {
    console.error("[search] schema bootstrap failed:", err)
    return empty
  }

  const keywordP = keywordSearch(query, tokens).catch((err) => {
    console.error("[search] keyword query failed:", err)
    return [] as Row[]
  })

  let vectorP: Promise<Row[] | null> = Promise.resolve(null)
  if (!embeddingsEnabled()) {
    warnOnce("AI_GATEWAY_API_KEY not set")
  } else {
    vectorP = embedQuery(query)
      .then(vectorSearch)
      .catch((err) => {
        warnOnce(`vector search failed (${err instanceof Error ? err.message : err})`)
        return null
      })
  }

  const [kw, vec] = await Promise.all([keywordP, vectorP])
  return {
    query,
    results: fuse(vec ? [kw, vec] : [kw], safeLimit),
    mode: vec ? "hybrid" : "keyword",
  }
}
