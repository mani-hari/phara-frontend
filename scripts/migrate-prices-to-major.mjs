// migrate-prices-to-major.mjs — one-time correction of a units mistake.
//
// This store's Medusa prices were loaded as MINOR units (integer cents/paise,
// ×100 too high) — e.g. ₹8,450 stored as 845000. Medusa v2 natively treats
// stored amounts as MAJOR units, so its admin showed prices 100× too high, and
// the storefront/email compensated with a hidden ÷100 everywhere.
//
// This script divides every stored price by 100 so the data matches Medusa's
// model. It is paired with removing the ÷100 compensation from the frontend +
// email (do NOT run this without those code changes, or the storefront will
// show 100× too low until deployed).
//
// SAFE BY DEFAULT: dry-run (prints every change, writes nothing). Add --apply to
// write. Refuses to --apply twice (guarded by a store.metadata flag). Writes a
// timestamped backup of all current prices before applying.
//
// Reads admin key from macOS Keychain — run in an armed window:
//   node scripts/medusa-toggle.mjs unlock
//   node scripts/migrate-prices-to-major.mjs            # dry run
//   node scripts/migrate-prices-to-major.mjs --apply    # execute
import { execSync } from "node:child_process"
import { writeFileSync } from "node:fs"

const HOST = "https://pariharaonline.medusajs.app"
const KEY = execSync(`security find-generic-password -s parihara-medusa-admin -a medusa-admin -w`).toString().trim()
const BASIC = Buffer.from(`${KEY}:`).toString("base64")
const DIVISOR = 100
const APPLY = process.argv.includes("--apply")
const FORCE = process.argv.includes("--force")
const FLAG = "price_units_migrated_v1"

async function api(method, path, body) {
  const res = await fetch(`${HOST}${path}`, {
    method,
    headers: { Authorization: `Basic ${BASIC}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch { json = { raw: text } }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`)
  return json
}

function newAmount(amount) {
  const divided = amount / DIVISOR
  const rounded = Math.round(divided)
  const clean = amount % DIVISOR === 0
  return { rounded, clean }
}

async function main() {
  // ── idempotency guard ──────────────────────────────────────────────────────
  const store = (await api("GET", "/admin/stores?fields=id,metadata")).stores[0]
  const already = store?.metadata?.[FLAG]
  if (already && APPLY && !FORCE) {
    console.error(`\n✗ Refusing: store metadata says migration already applied at ${already}.`)
    console.error(`  If you really need to re-run, pass --force (DANGER: double-divides prices).`)
    process.exit(1)
  }

  // ── gather all variant prices (paginate) ───────────────────────────────────
  const variantUpdates = []
  let offset = 0, count = Infinity
  while (offset < count) {
    const page = await api("GET", `/admin/products?limit=50&offset=${offset}&fields=id,title,variants.id,variants.title,*variants.prices`)
    count = page.count
    for (const p of page.products) {
      for (const v of p.variants || []) {
        const prices = (v.prices || []).map((pr) => {
          const { rounded, clean } = newAmount(pr.amount)
          return { currency_code: pr.currency_code, oldAmount: pr.amount, amount: rounded, clean }
        })
        if (prices.length) variantUpdates.push({ productId: p.id, variantId: v.id, title: `${p.title} — ${v.title}`, prices })
      }
    }
    offset += 50
  }

  // ── gather shipping option prices ──────────────────────────────────────────
  const shippingOptions = (await api("GET", "/admin/shipping-options?limit=100&fields=id,name,*prices")).shipping_options || []
  const shippingUpdates = shippingOptions.map((o) => ({
    id: o.id,
    name: o.name,
    prices: (o.prices || []).map((pr) => {
      const { rounded, clean } = newAmount(pr.amount)
      return { currency_code: pr.currency_code, oldAmount: pr.amount, amount: rounded, clean }
    }),
  }))

  // ── report ─────────────────────────────────────────────────────────────────
  const dirty = []
  console.log(`\n${APPLY ? "APPLYING" : "DRY RUN"} — dividing every stored price by ${DIVISOR}\n`)
  console.log("VARIANT PRICES")
  for (const u of variantUpdates) {
    const parts = u.prices.map((p) => `${p.currency_code} ${p.oldAmount}→${p.amount}${p.clean ? "" : " ⚠NONINT"}`)
    if (u.prices.some((p) => !p.clean)) dirty.push(`${u.title}: ${parts.join(", ")}`)
    console.log(`  ${u.title.slice(0, 60).padEnd(60)} ${parts.join(", ")}`)
  }
  console.log("\nSHIPPING OPTIONS")
  for (const s of shippingUpdates) {
    const parts = s.prices.map((p) => `${p.currency_code} ${p.oldAmount}→${p.amount}${p.clean ? "" : " ⚠NONINT"}`)
    console.log(`  ${s.name.slice(0, 50).padEnd(50)} ${parts.join(", ") || "(no prices)"}`)
  }
  console.log(`\nTotals: ${variantUpdates.length} variants, ${shippingUpdates.length} shipping options.`)
  if (dirty.length) {
    console.log(`\n⚠ ${dirty.length} price(s) are NOT evenly divisible by 100 (rounded):`)
    dirty.forEach((d) => console.log("   " + d))
  }

  if (!APPLY) {
    console.log(`\nDry run only — nothing changed. Re-run with --apply to write.`)
    return
  }

  // ── backup ───────────────────────────────────────────────────────────────
  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupFile = `price-backup-${stamp}.json`
  writeFileSync(backupFile, JSON.stringify({ variantUpdates, shippingUpdates }, null, 2))
  console.log(`\nBackup written to ${backupFile}`)

  // ── apply ──────────────────────────────────────────────────────────────────
  let n = 0
  for (const u of variantUpdates) {
    await api("POST", `/admin/products/${u.productId}/variants/${u.variantId}`, {
      prices: u.prices.map((p) => ({ currency_code: p.currency_code, amount: p.amount })),
    })
    n++
    if (n % 10 === 0) console.log(`  ...${n}/${variantUpdates.length} variants updated`)
  }
  console.log(`  ${n}/${variantUpdates.length} variants updated`)

  let m = 0
  for (const s of shippingUpdates) {
    if (!s.prices.length) continue
    await api("POST", `/admin/shipping-options/${s.id}`, {
      prices: s.prices.map((p) => ({ currency_code: p.currency_code, amount: p.amount })),
    })
    m++
  }
  console.log(`  ${m} shipping options updated`)

  // ── mark done ────────────────────────────────────────────────────────────
  await api("POST", `/admin/stores/${store.id}`, {
    metadata: { ...(store.metadata || {}), [FLAG]: new Date().toISOString() },
  })
  console.log(`\n✓ Migration applied. store.metadata.${FLAG} set. Backup: ${backupFile}`)
}

main().catch((e) => { console.error(e.message || e); process.exit(1) })
