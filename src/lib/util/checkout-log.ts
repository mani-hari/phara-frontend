// Structured, single-line JSON logging for the checkout/payment path.
// Server-side (API routes) → Vercel logs; client-side → browser console.
// Greppable by `area:"checkout"` and `scope`. Never log full card/secret data.
type Ctx = Record<string, unknown>

export function logCheckoutError(scope: string, error: unknown, ctx: Ctx = {}) {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined
  try {
    console.error(
      JSON.stringify({
        level: "error",
        area: "checkout",
        scope,
        message,
        ...ctx,
        ...(stack ? { stack } : {}),
      })
    )
  } catch {
    console.error(`[checkout:${scope}]`, message, ctx)
  }
}

export function logCheckoutEvent(scope: string, ctx: Ctx = {}) {
  try {
    console.log(JSON.stringify({ level: "info", area: "checkout", scope, ...ctx }))
  } catch {
    console.log(`[checkout:${scope}]`, ctx)
  }
}
