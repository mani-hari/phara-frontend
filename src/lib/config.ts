import Medusa from "@medusajs/js-sdk"

// Resolve the Medusa backend URL. Server-side env vars take precedence; we
// fall back to the public one so a single Vercel env var
// (NEXT_PUBLIC_MEDUSA_BACKEND_URL) is enough to wire up the storefront.
const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
