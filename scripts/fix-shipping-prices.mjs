// One-time fix: shipping-option prices got the wrong currency (India-zone
// options priced in USD, Intl donate priced in INR). Each zone's options must
// carry the price in that zone's region currency, else setShippingMethod fails
// and the cart keeps a stale default → order total ≠ charged amount.
//
// India zone  → INR. International zone → USD.
// Run in an armed window: node scripts/medusa-toggle.mjs unlock && node scripts/fix-shipping-prices.mjs
import { execSync } from "node:child_process"

const HOST = "https://pariharaonline.medusajs.app"
const KEY = execSync(`security find-generic-password -s parihara-medusa-admin -a medusa-admin -w`).toString().trim()
const BASIC = Buffer.from(`${KEY}:`).toString("base64")
const INTL_RATE = Number(process.env.INTL_RATE || 32) // USD, major units

async function api(method, path, body) {
  const res = await fetch(`${HOST}${path}`, {
    method,
    headers: { Authorization: `Basic ${BASIC}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`)
  return text ? JSON.parse(text) : {}
}

const opts = (
  await api("GET", "/admin/shipping-options?fields=id,name,*service_zone,service_zone.name&limit=100")
).shipping_options || []

for (const o of opts) {
  const zone = o.service_zone?.name || ""
  const isIndia = /india/i.test(zone)
  const isDonate = /do not send|donate/i.test(o.name)
  const currency = isIndia ? "inr" : "usd"
  const amount = isDonate ? 0 : isIndia ? 0 : INTL_RATE // India paid = free; Intl paid = $32
  await api("POST", `/admin/shipping-options/${o.id}`, {
    prices: [{ currency_code: currency, amount }],
  })
  console.log(`~ ${o.name} [${zone}] → ${currency} ${amount}`)
}

console.log("\n=== verify ===")
const after = (await api("GET", "/admin/shipping-options?fields=id,name,service_zone.name,*prices&limit=100")).shipping_options
for (const o of after) {
  console.log(o.name, "|", o.service_zone?.name, "|", (o.prices || []).map((p) => `${p.currency_code} ${p.amount}`).join(", "))
}
