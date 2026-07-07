// ─────────────────────────────────────────────────────────────────────────────
// Site analytics IDs — SINGLE SOURCE OF TRUTH.
//
// To change either tag, edit the fallback string here (or, for env-based
// control, set NEXT_PUBLIC_GA4_ID / NEXT_PUBLIC_CLARITY_ID in Vercel and it
// overrides the value below). These IDs are public by design (they ship to the
// browser), so hardcoding them here is safe and means analytics works on every
// deploy with no extra env setup.
//
// GA4  = Google Analytics 4 Measurement ID (looks like "G-XXXXXXXXXX")
// CLARITY = Microsoft Clarity project ID (the "…/tag/<id>" value)
// Set either to "" to disable that tag entirely.
// ─────────────────────────────────────────────────────────────────────────────

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "G-78BCF56K29"
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "xiyhxkfax5"
