/**
 * Server-side utility to fetch Medusa customer context for injecting into
 * the Parihara chat system prompt.
 *
 * Requires MEDUSA_ADMIN_JWT to be set; returns null gracefully if not.
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "https://pariharaonline.medusajs.app"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SavedAddress = {
  id: string
  label: string // "Home", "Work", or the city name
  firstName: string
  lastName: string
  address1: string
  city: string
  countryCode: string
  phone?: string
}

export type CustomerContext = {
  name: string
  email: string
  city?: string
  country?: string
  recentOrders: { title: string; date: string }[]
  savedAddresses: SavedAddress[]
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildAdminHeaders(): HeadersInit {
  const jwt = process.env.MEDUSA_ADMIN_JWT
  return {
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  }
}

function deriveAddressLabel(address: any): string {
  const metadata = address.metadata as Record<string, string> | undefined
  if (metadata?.label) return metadata.label
  // Fall back to province/city as a natural identifier
  return address.city || address.province || "Address"
}

function formatDate(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      year: "numeric",
    }).format(new Date(isoDate))
  } catch {
    return isoDate.slice(0, 7) // "YYYY-MM" fallback
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Fetch a Medusa customer record by email using the admin API.
 * Returns null if MEDUSA_ADMIN_JWT is not set or the customer cannot be found.
 */
export async function getMedusaCustomerContext(
  email: string
): Promise<CustomerContext | null> {
  const adminJwt = process.env.MEDUSA_ADMIN_JWT
  if (!adminJwt) return null

  let customer: any = null

  // Step 1: Search for the customer by email
  try {
    const res = await fetch(
      `${BACKEND_URL}/admin/customers?email=${encodeURIComponent(email)}&limit=1&expand=addresses`,
      {
        headers: buildAdminHeaders(),
        next: { revalidate: 60 },
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    customer = data?.customers?.[0] ?? null
  } catch (err: any) {
    console.warn("[medusa-customer-context] customer fetch failed:", err?.message)
    return null
  }

  if (!customer) return null

  // Step 2: Fetch recent orders for this customer
  let recentOrders: { title: string; date: string }[] = []
  try {
    const ordersRes = await fetch(
      `${BACKEND_URL}/admin/orders?customer_id=${customer.id}&limit=3&order=-created_at&expand=items`,
      {
        headers: buildAdminHeaders(),
        next: { revalidate: 60 },
      }
    )
    if (ordersRes.ok) {
      const ordersData = await ordersRes.json()
      const orders: any[] = ordersData?.orders ?? []
      recentOrders = orders
        .slice(0, 3)
        .map((order) => {
          const firstItem = order.items?.[0]
          return {
            title: firstItem?.title ?? "Pooja service",
            date: formatDate(order.created_at),
          }
        })
        .filter((o) => o.title)
    }
  } catch (err: any) {
    console.warn("[medusa-customer-context] orders fetch failed:", err?.message)
    // Non-fatal; continue with empty orders
  }

  // Step 3: Map saved addresses
  const addresses: SavedAddress[] = (customer.shipping_addresses ?? []).map(
    (addr: any) => ({
      id: addr.id,
      label: deriveAddressLabel(addr),
      firstName: addr.first_name ?? customer.first_name ?? "",
      lastName: addr.last_name ?? customer.last_name ?? "",
      address1: addr.address_1 ?? "",
      city: addr.city ?? "",
      countryCode: addr.country_code ?? "",
      phone: addr.phone ?? undefined,
    })
  )

  // Determine primary location from first address or billing address
  const primaryAddress = addresses[0] ?? null

  return {
    name:
      [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
      email,
    email,
    city: primaryAddress?.city || undefined,
    country: primaryAddress?.countryCode || undefined,
    recentOrders,
    savedAddresses: addresses,
  }
}

// ---------------------------------------------------------------------------
// Prompt formatter
// ---------------------------------------------------------------------------

/**
 * Formats a CustomerContext as a concise plain-text block suitable for
 * injection into the Parihara AI system prompt.
 *
 * Example output:
 *
 *   CUSTOMER PROFILE
 *   Name: Sunita Sharma
 *   Location: Coimbatore, India
 *   Previous poojas: Garbarakshambigai Abhishekam (Jan 2024), Annadanam (Mar 2024)
 *   Saved address: 12 Main Street, Coimbatore, Tamil Nadu, India
 */
export function formatCustomerContextForPrompt(ctx: CustomerContext): string {
  const lines: string[] = ["CUSTOMER PROFILE"]

  lines.push(`Name: ${ctx.name}`)

  if (ctx.city || ctx.country) {
    const countryName = ctx.country
      ? new Intl.DisplayNames(["en"], { type: "region" }).of(
          ctx.country.toUpperCase()
        ) ?? ctx.country
      : undefined
    const location = [ctx.city, countryName].filter(Boolean).join(", ")
    lines.push(`Location: ${location}`)
  }

  if (ctx.recentOrders.length > 0) {
    const orderList = ctx.recentOrders
      .map((o) => `${o.title} (${o.date})`)
      .join(", ")
    lines.push(`Previous poojas: ${orderList}`)
  }

  if (ctx.savedAddresses.length > 0) {
    const addr = ctx.savedAddresses[0]
    const addrParts = [
      addr.address1,
      addr.city,
      addr.countryCode
        ? new Intl.DisplayNames(["en"], { type: "region" }).of(
            addr.countryCode.toUpperCase()
          ) ?? addr.countryCode
        : undefined,
    ].filter(Boolean)
    lines.push(`Saved address: ${addrParts.join(", ")}`)
  }

  return lines.join("\n")
}
