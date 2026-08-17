// One-off migration: push all Medusa customers with accepts_email_marketing
// === true (set by scripts/enrich-customers-from-csv.mjs, or via any other
// path that ever sets it) into Listmonk's "Parihara Newsletter" list.
//
// Deliberately queries LIVE Medusa state, not the CSV — this is what makes it
// also cover any customer added to Medusa after the July 7 Shopify export.
// Anyone without accepts_email_marketing === true is skipped entirely (never
// touches Listmonk), so consent is never assumed.
//
// Same Keychain + time-boxed-arm gate as scripts/medusa-admin.sh. Also needs
// LISTMONK_API_URL / LISTMONK_API_USER / LISTMONK_API_TOKEN as env vars
// (same values already set in Medusa Cloud's dashboard for the live
// checkout/order-placed integration).
//
// Usage:
//   LISTMONK_API_URL=... LISTMONK_API_USER=... LISTMONK_API_TOKEN=... \
//     node scripts/sync-customers-to-listmonk.mjs --dry-run
//   (drop --dry-run for the real run)
import fs from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const ARM_FILE = path.join(ROOT, ".medusa-admin.armed")
const PROGRESS_FILE = path.join(ROOT, ".listmonk-sync-progress.json")
const BACKEND = "https://pariharaonline.medusajs.app"
const SERVICE = "parihara-medusa-admin"
const ACCOUNT = "medusa-admin"
const CONCURRENCY = 8
const NEWSLETTER_LIST_ID = 3

const DRY_RUN = process.argv.includes("--dry-run")

function die(msg, code = 1) {
  console.error(msg)
  process.exit(code)
}

if (!fs.existsSync(ARM_FILE)) die("Medusa admin is LOCKED. Run: npm run medusa:unlock", 3)
const exp = parseInt(fs.readFileSync(ARM_FILE, "utf8").trim(), 10) || 0
if (Date.now() / 1000 >= exp) {
  fs.unlinkSync(ARM_FILE)
  die("Admin window expired. Run: npm run medusa:unlock", 3)
}
let key
try {
  key = execSync(`security find-generic-password -s "${SERVICE}" -a "${ACCOUNT}" -w`, {
    encoding: "utf8",
  }).trim()
} catch {
  die("No admin key in Keychain. Run: npm run medusa:key:set", 4)
}
if (!key) die("No admin key in Keychain. Run: npm run medusa:key:set", 4)
const MEDUSA_AUTH = "Basic " + Buffer.from(`${key}:`).toString("base64")

const LISTMONK_API_URL = process.env.LISTMONK_API_URL
const LISTMONK_API_USER = process.env.LISTMONK_API_USER
const LISTMONK_API_TOKEN = process.env.LISTMONK_API_TOKEN
if (!LISTMONK_API_URL || !LISTMONK_API_USER || !LISTMONK_API_TOKEN) {
  die("Missing LISTMONK_API_URL / LISTMONK_API_USER / LISTMONK_API_TOKEN env vars.")
}
const LISTMONK_AUTH =
  "Basic " + Buffer.from(`${LISTMONK_API_USER}:${LISTMONK_API_TOKEN}`).toString("base64")

// --- Segment logic, ported from phara-backend-medusa/src/lib/email-segments.ts ---
const SEGMENT_DEFINITIONS = [
  { key: "india", countries: ["IN"] },
  { key: "americas", countries: ["US", "CA"] },
  { key: "americas_uk", countries: ["GB", "IE", "MX", "BR", "AR", "CL", "CO", "TT", "JM"] },
  {
    key: "europe_middle_east",
    countries: [
      "DE", "FR", "ES", "IT", "NL", "BE", "PT", "AT", "CH",
      "SE", "NO", "DK", "FI", "PL",
      "AE", "SA", "QA", "KW", "BH", "OM",
    ],
  },
  { key: "sea_west_australia", countries: ["SG", "MY", "TH", "ID", "PH", "VN"] },
  { key: "australia_pacific", countries: ["AU", "NZ", "FJ", "PG", "WS", "TO"] },
]
const CATCH_ALL_SEGMENT_KEY = "catch_all"
const COUNTRY_TO_SEGMENT = {}
for (const def of SEGMENT_DEFINITIONS) {
  for (const c of def.countries) COUNTRY_TO_SEGMENT[c] = def.key
}
function resolveSegmentForCountry(countryCode) {
  const c = String(countryCode || "").trim().toUpperCase()
  if (!c) return CATCH_ALL_SEGMENT_KEY
  return COUNTRY_TO_SEGMENT[c] || CATCH_ALL_SEGMENT_KEY
}

async function medusaFetch(reqPath) {
  const res = await fetch(`${BACKEND}${reqPath}`, { headers: { Authorization: MEDUSA_AUTH } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json).slice(0, 300)}`)
  return json
}

async function fetchAllCustomers() {
  const all = []
  let offset = 0
  const limit = 1000
  while (true) {
    const json = await medusaFetch(
      `/admin/customers?limit=${limit}&offset=${offset}&fields=id,email,first_name,last_name,metadata,addresses.country_code`
    )
    all.push(...json.customers)
    if (json.customers.length < limit) break
    offset += limit
  }
  return all
}

async function listmonkFetch(reqPath, options = {}) {
  const res = await fetch(`${LISTMONK_API_URL}${reqPath}`, {
    ...options,
    headers: {
      Authorization: LISTMONK_AUTH,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json).slice(0, 300)}`)
  return json
}

async function upsertListmonkSubscriber(email, name, attribs) {
  const query = encodeURIComponent(`subscribers.email='${email.replace(/'/g, "''")}'`)
  const lookup = await listmonkFetch(`/api/subscribers?query=${query}`)
  const existing = lookup?.data?.results?.[0]
  const body = {
    email,
    name: name || "",
    status: "enabled",
    lists: [NEWSLETTER_LIST_ID],
    attribs,
  }
  if (existing) {
    await listmonkFetch(`/api/subscribers/${existing.id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    })
    return "updated"
  }
  await listmonkFetch(`/api/subscribers`, { method: "POST", body: JSON.stringify(body) })
  return "created"
}

let progress = {}
if (fs.existsSync(PROGRESS_FILE)) {
  try {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"))
  } catch {}
}
function saveProgress() {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress))
}

async function runPool(items, worker, concurrency) {
  let idx = 0
  let active = 0
  return new Promise((resolve) => {
    function next() {
      if (idx >= items.length && active === 0) return resolve()
      while (active < concurrency && idx < items.length) {
        const item = items[idx++]
        active++
        worker(item).finally(() => {
          active--
          next()
        })
      }
    }
    next()
  })
}

async function main() {
  console.log(DRY_RUN ? "DRY RUN — no writes to Listmonk will be made." : "LIVE RUN.")
  const customers = await fetchAllCustomers()
  console.log(`Fetched ${customers.length} Medusa customers.`)

  const consented = customers.filter((c) => {
    const email = (c.email || "").trim().toLowerCase()
    return email && c.metadata?.accepts_email_marketing === true && progress[c.id] !== "done"
  })
  console.log(
    `${consented.length} customers have accepts_email_marketing === true and aren't already synced.`
  )

  let created = 0
  let updated = 0
  let errors = 0
  const segmentCounts = {}

  await runPool(
    consented,
    async (customer) => {
      const email = customer.email.trim().toLowerCase()
      const countryCode = customer.addresses?.[0]?.country_code
      const segmentKey = resolveSegmentForCountry(countryCode)
      segmentCounts[segmentKey] = (segmentCounts[segmentKey] || 0) + 1

      const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ")
      const attribs = {
        country: countryCode ? countryCode.toUpperCase() : null,
        segment_key: segmentKey,
        shopify_total_spent: customer.metadata?.shopify_total_spent ?? null,
        shopify_total_orders: customer.metadata?.shopify_total_orders ?? null,
        sales_report_orders: customer.metadata?.sales_report_orders ?? null,
        sales_report_gross_sales: customer.metadata?.sales_report_gross_sales ?? null,
        sales_report_net_sales: customer.metadata?.sales_report_net_sales ?? null,
        sales_report_total_sales: customer.metadata?.sales_report_total_sales ?? null,
      }

      try {
        if (!DRY_RUN) {
          const result = await upsertListmonkSubscriber(email, name, attribs)
          if (result === "created") created++
          else updated++
          progress[customer.id] = "done"
          saveProgress()
        } else {
          created++
        }
      } catch (e) {
        errors++
        console.error(`FAILED ${email}: ${e.message}`)
      }
    },
    CONCURRENCY
  )

  console.log("---")
  console.log(`Created: ${created}`)
  console.log(`Updated: ${updated}`)
  console.log(`Errors: ${errors}`)
  console.log("Segment breakdown:", segmentCounts)
  console.log(DRY_RUN ? "(dry run — nothing was actually written to Listmonk)" : "Done.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
