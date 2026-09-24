/**
 * Builds/refreshes product_search_index from the Medusa store API.
 * Runs from POST/GET /api/search/reindex and `npm run search:reindex`.
 * Deliberately avoids src/lib/data/* ("use server", cookies) so it also runs
 * under plain node/tsx.
 */
import { createHash } from "crypto"
import { ensureSearchSchema, getSearchSql } from "./db"
import {
  EMBEDDING_BATCH_SIZE,
  EMBEDDING_MODEL,
  embedBatch,
  embeddingsEnabled,
} from "./embeddings"

type MedusaProduct = {
  id: string
  handle: string
  title: string
  subtitle?: string | null
  description?: string | null
  thumbnail?: string | null
  collection?: { title?: string | null } | null
  categories?: { name?: string | null }[] | null
  tags?: { value?: string | null }[] | null
  metadata?: Record<string, unknown> | null
}

type IndexRow = {
  product_id: string
  handle: string
  title: string
  subtitle: string | null
  description: string | null
  collection_title: string | null
  category_names: string[]
  tags: string[]
  thumbnail: string | null
  searchable_text: string
  content_hash: string
}

export type ReindexResult = {
  fetched: number
  upserted: number
  unchanged: number
  deleted: number
  embedded: number
  embeddingsSkipped: boolean
  embeddingError?: string
  durationMs: number
}

const PRODUCT_FIELDS =
  "+variants.prices,+images,+collection,+categories,+tags,+metadata"

// Metadata keys whose values read like search keywords. Everything else
// (ids, handles, dates, import bookkeeping) is ignored.
const METADATA_KEY_RE = /keyword|benefit|deity|god|temple|planet|graha|tag|type|occasion|purpose|dosha/i
const METADATA_VALUE_STOPLIST = new Set(["active", "n/a", "draft", "archived"])

async function fetchAllProducts(): Promise<MedusaProduct[]> {
  const base = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL
  const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (!base || !key) throw new Error("Medusa backend URL / publishable key not set")

  const limit = 100
  const all: MedusaProduct[] = []
  for (let offset = 0; ; offset += limit) {
    const url = new URL("/store/products", base)
    url.searchParams.set("limit", String(limit))
    url.searchParams.set("offset", String(offset))
    url.searchParams.set("fields", PRODUCT_FIELDS)
    const res = await fetch(url, {
      headers: { "x-publishable-api-key": key },
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`Medusa /store/products HTTP ${res.status}`)
    const json = (await res.json()) as { products: MedusaProduct[]; count: number }
    all.push(...json.products)
    if (json.products.length < limit || all.length >= json.count) break
  }
  return all
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function metadataKeywords(meta: Record<string, unknown> | null | undefined): string[] {
  if (!meta) return []
  const out: string[] = []
  for (const [k, v] of Object.entries(meta)) {
    if (!METADATA_KEY_RE.test(k)) continue
    const values = Array.isArray(v) ? v : [v]
    for (const val of values) {
      if (typeof val !== "string") continue
      const t = val.trim()
      if (!t || t.length > 300 || /^https?:\/\//.test(t)) continue
      if (METADATA_VALUE_STOPLIST.has(t.toLowerCase())) continue
      out.push(t)
    }
  }
  return Array.from(new Set(out))
}

function toRow(p: MedusaProduct): IndexRow {
  const description = p.description ? stripHtml(p.description) : null
  const collection_title = p.collection?.title?.trim() || null
  const category_names = (p.categories ?? [])
    .map((c) => c?.name?.trim())
    .filter((x): x is string => !!x)
  const tags = (p.tags ?? []).map((t) => t?.value?.trim()).filter((x): x is string => !!x)
  const meta = metadataKeywords(p.metadata)

  const searchable_text = [
    p.title,
    p.subtitle,
    collection_title,
    category_names.join(", "),
    tags.join(", "),
    meta.join(", "),
    description,
  ]
    .filter((x) => x && String(x).trim())
    .join("\n")

  const content_hash = createHash("sha256")
    .update(EMBEDDING_MODEL + "\n" + searchable_text)
    .digest("hex")

  return {
    product_id: p.id,
    handle: p.handle,
    title: p.title,
    subtitle: p.subtitle?.trim() || null,
    description,
    collection_title,
    category_names,
    tags,
    thumbnail: p.thumbnail || null,
    searchable_text,
    content_hash,
  }
}

export async function reindexProducts(): Promise<ReindexResult> {
  const started = Date.now()
  const db = getSearchSql()
  if (!db) throw new Error("DATABASE_URL is not set")
  await ensureSearchSchema()

  const products = await fetchAllProducts()
  const rows = products.filter((p) => p.id && p.handle && p.title).map(toRow)

  const existing = (await db`
    SELECT product_id, content_hash, embedding IS NOT NULL AS has_embedding
    FROM product_search_index
  `) as { product_id: string; content_hash: string | null; has_embedding: boolean }[]
  const existingById = new Map(existing.map((r) => [r.product_id, r]))

  let upserted = 0
  let unchanged = 0
  const needsEmbedding: IndexRow[] = []

  for (const r of rows) {
    const prev = existingById.get(r.product_id)
    const changed = !prev || prev.content_hash !== r.content_hash
    if (changed) {
      // Content changed: overwrite and clear any stale embedding.
      await db`
        INSERT INTO product_search_index (
          product_id, handle, title, subtitle, description, collection_title,
          category_names, tags, thumbnail, searchable_text, content_hash,
          embedding, updated_at
        ) VALUES (
          ${r.product_id}, ${r.handle}, ${r.title}, ${r.subtitle}, ${r.description},
          ${r.collection_title}, ${r.category_names}, ${r.tags}, ${r.thumbnail},
          ${r.searchable_text}, ${r.content_hash}, NULL, NOW()
        )
        ON CONFLICT (product_id) DO UPDATE SET
          handle = EXCLUDED.handle,
          title = EXCLUDED.title,
          subtitle = EXCLUDED.subtitle,
          description = EXCLUDED.description,
          collection_title = EXCLUDED.collection_title,
          category_names = EXCLUDED.category_names,
          tags = EXCLUDED.tags,
          thumbnail = EXCLUDED.thumbnail,
          searchable_text = EXCLUDED.searchable_text,
          content_hash = EXCLUDED.content_hash,
          embedding = NULL,
          updated_at = NOW()
      `
      upserted++
    } else {
      unchanged++
    }
    if (changed || !prev?.has_embedding) needsEmbedding.push(r)
  }

  // Remove products no longer published — only when the fetch clearly worked.
  let deleted = 0
  if (rows.length > 0) {
    const ids = rows.map((r) => r.product_id)
    const del = (await db`
      DELETE FROM product_search_index
      WHERE NOT (product_id = ANY(${ids}))
      RETURNING product_id
    `) as unknown[]
    deleted = del.length
  }

  let embedded = 0
  let embeddingError: string | undefined
  const embeddingsSkipped = !embeddingsEnabled()
  if (!embeddingsSkipped) {
    try {
      for (let i = 0; i < needsEmbedding.length; i += EMBEDDING_BATCH_SIZE) {
        const batch = needsEmbedding.slice(i, i + EMBEDDING_BATCH_SIZE)
        const vectors = await embedBatch(batch.map((r) => r.searchable_text.slice(0, 8000)))
        for (let j = 0; j < batch.length; j++) {
          await db`
            UPDATE product_search_index
            SET embedding = ${JSON.stringify(vectors[j])}::vector
            WHERE product_id = ${batch[j].product_id} AND content_hash = ${batch[j].content_hash}
          `
          embedded++
        }
      }
    } catch (err) {
      embeddingError = err instanceof Error ? err.message : String(err)
      console.warn("[search] embedding during reindex failed:", embeddingError)
    }
  }

  return {
    fetched: products.length,
    upserted,
    unchanged,
    deleted,
    embedded,
    embeddingsSkipped,
    ...(embeddingError ? { embeddingError } : {}),
    durationMs: Date.now() - started,
  }
}
