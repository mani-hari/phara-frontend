// setup-shipping.mjs — idempotent Medusa v2 shipping configuration.
//
// Creates country-based shipping options on the live Medusa backend:
//   India zone (geo: in)        → "Free shipping (India)" (₹0)  + "Donate prasadam at temple" (₹0)
//   International zone (243 cc)  → "International Speed Post / FedEx" ($INTL_RATE) + "Donate prasadam at temple" ($0)
//
// Reads the admin key from macOS Keychain (same source as scripts/medusa-admin.sh),
// so run inside an armed window: `npm run medusa:unlock && node scripts/setup-shipping.mjs`.
// Re-running is safe: existing zones/options (matched by name) are reused/updated, not duplicated.
//
// The international rate is a BUSINESS input — override with:  INTL_RATE=30 node scripts/setup-shipping.mjs
import { execSync } from "node:child_process"

const HOST = "https://pariharaonline.medusajs.app"
const KEY = execSync(`security find-generic-password -s parihara-medusa-admin -a medusa-admin -w`).toString().trim()
const BASIC = Buffer.from(`${KEY}:`).toString("base64")
const INTL_RATE = Number(process.env.INTL_RATE || 32) // USD, major units

// Canonical option names (used to reconcile — anything else in these zones is removed).
const OPT = {
  indiaFree: "Free shipping (India)",
  intlPaid: "International Shipping (Speedpost/FedEx)",
  donate: "Do not send prasadham, donate at temple",
}
// Legacy names from earlier runs to delete on reconcile.
const LEGACY_NAMES = ["India", "International Speed Post / FedEx", "Donate prasadam at temple"]

// Known IDs (from admin inspection)
const STOCK_LOCATION = "sloc_01KCFV8EM0P3SK25ZRHNV1VVZ4"
const FULFILLMENT_SET = "fuset_01KQMNRE7HW2JJMWPCA49PZ1FH"
const INDIA_ZONE = "serzo_01KQMNSDDDH16194Q6TZG1365N"
const PROFILE = "sp_01KCFRX7E5TVEGFD5ZFB0832JT"
const PROVIDER = "manual_manual"
const INTL_REGION = "reg_01KCFT01096J7B6E4TS591JN5V"

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

async function getShippingOptions() {
  const j = await api("GET", "/admin/shipping-options?fields=id,name,service_zone.id,service_zone.name,price_type,*prices&limit=100")
  return j.shipping_options || []
}

async function ensureOption({ name, zoneId, prices }) {
  const existing = (await getShippingOptions()).find(
    (o) => o.name === name && o.service_zone?.id === zoneId
  )
  const payload = {
    name,
    service_zone_id: zoneId,
    shipping_profile_id: PROFILE,
    provider_id: PROVIDER,
    price_type: "flat",
    type: { label: name, description: name, code: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
    prices,
  }
  if (existing) {
    // update prices + name (idempotent)
    await api("POST", `/admin/shipping-options/${existing.id}`, { name, prices })
    console.log(`  ~ updated option: ${name} (${existing.id})`)
    return existing.id
  }
  const j = await api("POST", "/admin/shipping-options", payload)
  console.log(`  + created option: ${name} (${j.shipping_option?.id})`)
  return j.shipping_option?.id
}

async function main() {
  console.log(`INTL_RATE = $${INTL_RATE} (USD)`)

  // 1. International service zone (all intl-region countries except India)
  const regions = await api("GET", "/admin/regions?fields=id,currency_code,countries.iso_2&limit=20")
  const intl = (regions.regions || []).find((r) => r.id === INTL_REGION)
  const intlCountries = (intl?.countries || []).map((c) => c.iso_2).filter((cc) => cc && cc !== "in")
  console.log(`International region has ${intlCountries.length} countries`)

  // Service zones are read via the stock location (there is no GET /admin/fulfillment-sets/{id}).
  const zonesOf = async () => {
    const j = await api("GET", `/admin/stock-locations/${STOCK_LOCATION}?fields=id,*fulfillment_sets.service_zones`)
    return (j.stock_location?.fulfillment_sets || []).flatMap((fs) => fs.service_zones || [])
  }
  let intlZone = (await zonesOf()).find((z) => z.name === "International")
  if (intlZone) {
    console.log(`  ~ International zone exists: ${intlZone.id}`)
  } else {
    await api("POST", `/admin/fulfillment-sets/${FULFILLMENT_SET}/service-zones`, {
      name: "International",
      geo_zones: intlCountries.map((cc) => ({ type: "country", country_code: cc })),
    })
    intlZone = (await zonesOf()).find((z) => z.name === "International")
    console.log(`  + created International zone: ${intlZone?.id} (${intlCountries.length} countries)`)
  }
  if (!intlZone?.id) throw new Error("could not resolve International service zone id after creation")

  // 2. India zone options
  console.log("India zone:")
  await ensureOption({ name: OPT.indiaFree, zoneId: INDIA_ZONE, prices: [{ currency_code: "inr", amount: 0 }] })
  await ensureOption({ name: OPT.donate, zoneId: INDIA_ZONE, prices: [{ currency_code: "inr", amount: 0 }] })

  // 3. International zone options
  console.log("International zone:")
  await ensureOption({ name: OPT.intlPaid, zoneId: intlZone.id, prices: [{ currency_code: "usd", amount: INTL_RATE }] })
  await ensureOption({ name: OPT.donate, zoneId: intlZone.id, prices: [{ currency_code: "usd", amount: 0 }] })

  // 4. Reconcile — delete legacy/renamed options so only the canonical set remains.
  const keep = new Set([OPT.indiaFree, OPT.intlPaid, OPT.donate])
  for (const o of await getShippingOptions()) {
    if (LEGACY_NAMES.includes(o.name) && !keep.has(o.name)) {
      await api("DELETE", `/admin/shipping-options/${o.id}`)
      console.log(`  - deleted legacy option "${o.name}" (${o.id})`)
    }
  }

  // 4. Verify
  console.log("\n=== final shipping options ===")
  for (const o of await getShippingOptions()) {
    console.log(`  ${o.name} | zone=${o.service_zone?.name} | ${o.price_type} | ${JSON.stringify((o.prices || []).map((p) => p.amount + p.currency_code))}`)
  }
}

main().catch((e) => { console.error("FAILED:", e.message); process.exit(1) })
