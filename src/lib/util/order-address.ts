// Order address helpers for the confirmation page + account order detail.
//
// For cross-region orders (a USD buyer shipping prasadam to India, or an INR
// buyer shipping abroad) the Medusa shipping address holds the region-valid
// BILLING address; the real destination rides in order metadata
// (`alt_delivery_address`, JSON — written by the one-page checkout). Prefer it.

export type DisplayAddress = {
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  country_code?: string | null
  phone?: string | null
}

export function countryDisplayName(cc?: string | null): string {
  const code = (cc || "").toUpperCase()
  if (!code) return ""
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code
  } catch {
    return code
  }
}

/** Where the prasadam actually ships: alt-delivery metadata, else shipping_address. */
export function deliveryAddressFor(order: {
  metadata?: Record<string, unknown> | null
  shipping_address?: DisplayAddress | null
}): DisplayAddress | null {
  const m = (order.metadata || {}) as Record<string, any>
  if (m.alt_delivery && m.alt_delivery_address) {
    try {
      const s =
        typeof m.alt_delivery_address === "string"
          ? JSON.parse(m.alt_delivery_address)
          : m.alt_delivery_address
      if (s && typeof s === "object") return s as DisplayAddress
    } catch {
      // fall through to the Medusa shipping address
    }
  }
  return order.shipping_address || null
}

/** Address as display lines: street lines, "City, State Postcode", country name. */
export function addressLines(a: DisplayAddress | null | undefined): string[] {
  if (!a) return []
  const statePostal = [a.province, a.postal_code].filter(Boolean).join(" ")
  return [
    [a.first_name, a.last_name].filter(Boolean).join(" "),
    a.address_1,
    a.address_2,
    [a.city, statePostal].filter(Boolean).join(", "),
    countryDisplayName(a.country_code),
  ].filter((l): l is string => !!l && !!String(l).trim())
}
