/**
 * Neon (Postgres) access + idempotent schema bootstrap for product search.
 * Same client library as src/lib/chat-store.ts (@neondatabase/serverless).
 * Server-only: never import from client components.
 */
import { neon, type NeonQueryFunction } from "@neondatabase/serverless"
import { EMBEDDING_DIMS } from "./embeddings"

let sql: NeonQueryFunction<false, false> | null = null
let schemaReady: Promise<void> | null = null

export function getSearchSql(): NeonQueryFunction<false, false> | null {
  const url = process.env.DATABASE_URL
  if (!url) return null
  if (!sql) sql = neon(url)
  return sql
}

/**
 * Creates extensions, the product_search_index table and its indexes.
 * Safe to call repeatedly; runs once per process (retried if it failed).
 */
export async function ensureSearchSchema(): Promise<void> {
  const db = getSearchSql()
  if (!db) throw new Error("DATABASE_URL is not set")
  if (!schemaReady) {
    schemaReady = createSchema(db).catch((err) => {
      schemaReady = null
      throw err
    })
  }
  return schemaReady
}

async function createSchema(db: NeonQueryFunction<false, false>) {
  await db`CREATE EXTENSION IF NOT EXISTS vector`
  await db`CREATE EXTENSION IF NOT EXISTS pg_trgm`
  // Dimension is a constant, not user input — safe to interpolate.
  await db.query(`
    CREATE TABLE IF NOT EXISTS product_search_index (
      product_id       TEXT PRIMARY KEY,
      handle           TEXT NOT NULL,
      title            TEXT NOT NULL,
      subtitle         TEXT,
      description      TEXT,
      collection_title TEXT,
      category_names   TEXT[] NOT NULL DEFAULT '{}',
      tags             TEXT[] NOT NULL DEFAULT '{}',
      thumbnail        TEXT,
      searchable_text  TEXT NOT NULL DEFAULT '',
      tsv              TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(subtitle, '') || ' ' || coalesce(collection_title, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(searchable_text, '')), 'C')
      ) STORED,
      embedding        VECTOR(${EMBEDDING_DIMS}),
      content_hash     TEXT,
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await db`CREATE INDEX IF NOT EXISTS product_search_index_tsv_idx ON product_search_index USING GIN (tsv)`
  await db`CREATE INDEX IF NOT EXISTS product_search_index_title_trgm_idx ON product_search_index USING GIN (title gin_trgm_ops)`
  await db`CREATE INDEX IF NOT EXISTS product_search_index_embedding_idx ON product_search_index USING hnsw (embedding vector_cosine_ops)`
}
