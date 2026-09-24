/**
 * Embeddings via Vercel AI Gateway (OpenAI-compatible REST). Plain fetch on
 * purpose — the repo pins `ai` v4, which we don't upgrade for this.
 */

/** The one place the embedding model is configured. Changing it re-embeds everything on next reindex. */
export const EMBEDDING_MODEL = "openai/text-embedding-3-small"
export const EMBEDDING_DIMS = 1536
export const EMBEDDING_BATCH_SIZE = 50

const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/embeddings"

export function embeddingsEnabled(): boolean {
  return !!process.env.AI_GATEWAY_API_KEY
}

/** Embeds up to EMBEDDING_BATCH_SIZE inputs. Throws on any failure. */
export async function embedBatch(inputs: string[]): Promise<number[][]> {
  const key = process.env.AI_GATEWAY_API_KEY
  if (!key) throw new Error("AI_GATEWAY_API_KEY is not set")
  if (inputs.length === 0) return []
  if (inputs.length > EMBEDDING_BATCH_SIZE) {
    throw new Error(`embedBatch: max ${EMBEDDING_BATCH_SIZE} inputs per call`)
  }
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: inputs }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`embeddings HTTP ${res.status}: ${body.slice(0, 200)}`)
  }
  const json = (await res.json()) as {
    data: { embedding: number[]; index: number }[]
  }
  const out = [...json.data].sort((a, b) => a.index - b.index).map((d) => d.embedding)
  if (out.length !== inputs.length || out.some((e) => e.length !== EMBEDDING_DIMS)) {
    throw new Error("embeddings: unexpected response shape")
  }
  return out
}

// Small in-process LRU for query embeddings (keyed by normalized query only —
// no user data involved, so sharing across users is fine).
const QUERY_CACHE_MAX = 200
const queryCache = new Map<string, number[]>()

export async function embedQuery(normalizedQuery: string): Promise<number[]> {
  const hit = queryCache.get(normalizedQuery)
  if (hit) {
    queryCache.delete(normalizedQuery)
    queryCache.set(normalizedQuery, hit)
    return hit
  }
  const [vec] = await embedBatch([normalizedQuery])
  queryCache.set(normalizedQuery, vec)
  if (queryCache.size > QUERY_CACHE_MAX) {
    const oldest = queryCache.keys().next().value
    if (oldest !== undefined) queryCache.delete(oldest)
  }
  return vec
}
