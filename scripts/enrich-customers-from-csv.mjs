// One-off migration: enrich existing Medusa customers with address/country
// and order-history data from two Shopify exports, so Medusa becomes the
// complete source of truth (used afterward to sync into Listmonk).
//
// Reuses the exact same Keychain + time-boxed-arm security model as
// scripts/medusa-admin.sh (this repeats those checks itself rather than
// shelling out per-call, since shelling out ~11,000 times would be far too
// slow and would blow the arm window).
//
// Usage:
//   node scripts/enrich-customers-from-csv.mjs --dry-run   # no writes, just report
//   node scripts/enrich-customers-from-csv.mjs             # real run
//
// Resumable: writes progress to .enrichment-progress.json (gitignored) after
// each customer, keyed by customer id -> "done". Re-running skips those.
import fs from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { parse } from "node:path"

const __dirname = fileURLToPath(new URL(".", import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const ARM_FILE = path.join(ROOT, ".medusa-admin.armed")
const PROGRESS_FILE = path.join(ROOT, ".enrichment-progress.json")
const BACKEND = "https://pariharaonline.medusajs.app"
const SERVICE = "parihara-medusa-admin"
const ACCOUNT = "medusa-admin"
const CONCURRENCY = 8

const DRY_RUN = process.argv.includes("--dry-run")

function die(msg, code = 1) {
  console.error(msg)
  process.exit(code)
}

// --- 1. Same gate as medusa-admin.sh ---
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
const AUTH = "Basic " + Buffer.from(`${key}:`).toString("base64")

// --- 2. Minimal robust CSV parser (handles quoted fields, embedded commas/quotes) ---
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ""
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else {
      if (c === '"') inQuotes = true
      else if (c === ",") {
        row.push(field)
        field = ""
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++
        row.push(field)
        field = ""
        if (row.length > 1 || row[0] !== "") rows.push(row)
        row = []
      } else {
        field += c
      }
    }
  }
  if (field !== "" || row.length) {
    row.push(field)
    rows.push(row)
  }
  const header = rows[0]
  return rows.slice(1).map((r) => Object.fromEntries(header.map((h, idx) => [h, r[idx] ?? ""])))
}

function loadCsv(filePath) {
  return parseCsv(fs.readFileSync(filePath, "utf8"))
}

// --- 3. Build merged per-email enrichment map from both CSVs ---
const CSV_DIR = "/Users/lynda/Documents/FOR_AGENTS/02_agenticcoding"
const shopifyRows = loadCsv(path.join(CSV_DIR, "customers_export.csv"))
const salesRows = loadCsv(
  path.join(CSV_DIR, "Sales by customer name - 2024-06-01 - 2026-07-10.csv")
)

const enrichment = new Map() // email -> { address?, metadata }

for (const row of shopifyRows) {
  const email = (row["Email"] || "").trim().toLowerCase()
  if (!email) continue

  const countryCode = (row["Default Address Country Code"] || "").trim()
  const acceptsMarketing = (row["Accepts Email Marketing"] || "").trim().toLowerCase() === "yes"

  const entry = enrichment.get(email) || {}
  if (countryCode) {
    entry.address = {
      first_name: row["First Name"] || undefined,
      last_name: row["Last Name"] || undefined,
      company: row["Default Address Company"] || undefined,
      address_1: row["Default Address Address1"] || undefined,
      address_2: row["Default Address Address2"] || undefined,
      city: row["Default Address City"] || undefined,
      province: row["Default Address Province Code"] || undefined,
      country_code: countryCode.toLowerCase(),
      postal_code: row["Default Address Zip"] || undefined,
      phone: row["Default Address Phone"] || row["Phone"] || undefined,
      is_default_shipping: true,
      is_default_billing: true,
    }
  }
  entry.metadata = {
    ...entry.metadata,
    shopify_total_spent: row["Total Spent"] || undefined,
    shopify_total_orders: row["Total Orders"] || undefined,
    accepts_email_marketing: acceptsMarketing,
    shopify_accepts_sms_marketing: (row["Accepts SMS Marketing"] || "").trim().toLowerCase() === "yes",
    shopify_accepts_whatsapp_marketing:
      (row["Accepts WhatsApp Marketing"] || "").trim().toLowerCase() === "yes",
    shopify_tags: row["Tags"] || undefined,
  }
  enrichment.set(email, entry)
}

for (const row of salesRows) {
  const email = (row["Customer email"] || "").trim().toLowerCase()
  if (!email) continue
  const entry = enrichment.get(email) || {}
  entry.metadata = {
    ...entry.metadata,
    sales_report_period: "2024-06-01_to_2026-07-10",
    sales_report_orders: row["Orders"] || undefined,
    sales_report_gross_sales: row["Gross sales"] || undefined,
    sales_report_net_sales: row["Net sales"] || undefined,
    sales_report_total_sales: row["Total sales"] || undefined,
  }
  enrichment.set(email, entry)
}

console.log(`Loaded enrichment data for ${enrichment.size} unique emails from both CSVs.`)

// --- 4. Fetch all current Medusa customers (paginated) ---
async function medusaFetch(reqPath, options = {}) {
  const res = await fetch(`${BACKEND}${reqPath}`, {
    ...options,
    headers: {
      Authorization: AUTH,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(`${res.status} ${JSON.stringify(json).slice(0, 300)}`)
    err.status = res.status
    throw err
  }
  return json
}

async function fetchAllCustomers() {
  const all = []
  let offset = 0
  const limit = 1000
  while (true) {
    const json = await medusaFetch(
      `/admin/customers?limit=${limit}&offset=${offset}&fields=id,email,metadata,addresses.id`
    )
    all.push(...json.customers)
    if (json.customers.length < limit) break
    offset += limit
  }
  return all
}

// --- 5. Progress tracking (resumable) ---
let progress = {}
if (fs.existsSync(PROGRESS_FILE)) {
  try {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"))
  } catch {}
}
function saveProgress() {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress))
}

// --- 6. Simple concurrency-limited pool ---
async function runPool(items, worker, concurrency) {
  let idx = 0
  let active = 0
  return new Promise((resolve) => {
    let results = []
    function next() {
      if (idx >= items.length && active === 0) return resolve(results)
      while (active < concurrency && idx < items.length) {
        const item = items[idx++]
        active++
        worker(item)
          .then((r) => results.push(r))
          .catch((e) => results.push({ error: e?.message || String(e) }))
          .finally(() => {
            active--
            next()
          })
      }
    }
    next()
  })
}

async function main() {
  console.log(DRY_RUN ? "DRY RUN — no writes will be made." : "LIVE RUN.")
  const customers = await fetchAllCustomers()
  console.log(`Fetched ${customers.length} Medusa customers.`)

  const toProcess = customers.filter((c) => {
    const email = (c.email || "").trim().toLowerCase()
    return email && enrichment.has(email) && progress[c.id] !== "done"
  })
  console.log(`${toProcess.length} customers to enrich (matched + not already processed).`)

  let addressesCreated = 0
  let metadataUpdated = 0
  let errors = 0

  await runPool(
    toProcess,
    async (customer) => {
      const email = customer.email.trim().toLowerCase()
      const entry = enrichment.get(email)

      try {
        if (entry.address && (!customer.addresses || customer.addresses.length === 0)) {
          if (!DRY_RUN) {
            await medusaFetch(`/admin/customers/${customer.id}/addresses`, {
              method: "POST",
              body: JSON.stringify(entry.address),
            })
          }
          addressesCreated++
        }

        const mergedMetadata = { ...(customer.metadata || {}), ...entry.metadata }
        if (!DRY_RUN) {
          await medusaFetch(`/admin/customers/${customer.id}`, {
            method: "POST",
            body: JSON.stringify({ metadata: mergedMetadata }),
          })
        }
        metadataUpdated++

        if (!DRY_RUN) {
          progress[customer.id] = "done"
          saveProgress()
        }
      } catch (e) {
        errors++
        console.error(`FAILED ${email} (${customer.id}): ${e.message}`)
      }
    },
    CONCURRENCY
  )

  console.log("---")
  console.log(`Addresses created: ${addressesCreated}`)
  console.log(`Metadata updated: ${metadataUpdated}`)
  console.log(`Errors: ${errors}`)
  console.log(DRY_RUN ? "(dry run — nothing was actually written)" : "Done.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
