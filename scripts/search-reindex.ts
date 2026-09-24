/**
 * Rebuild the product search index (Neon) from the Medusa store API.
 * Usage: npm run search:reindex   (reads .env.local if present)
 */
import { reindexProducts } from "../src/lib/search/indexer"

reindexProducts()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2))
    process.exit(0)
  })
  .catch((err) => {
    console.error("[search:reindex] failed:", err instanceof Error ? err.message : err)
    process.exit(1)
  })
