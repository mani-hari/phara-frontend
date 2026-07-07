"use client"

import { useLocalCurrency } from "@lib/context/local-currency"
import { formatCurrency } from "@lib/geo/currency"

/**
 * Display-only "≈ €X" hint shown under a USD price for international visitors,
 * converted to their IP-based local currency. Renders nothing unless the price
 * is in USD and the visitor's local currency is known and different from USD.
 */
export default function PriceSubscript({
  amount,
  currencyCode,
}: {
  amount?: number | null
  currencyCode?: string | null
}) {
  const { currency, rate } = useLocalCurrency()

  if (typeof amount !== "number" || !currency || !rate) return null
  if ((currencyCode || "").toUpperCase() !== "USD") return null
  if (currency === "USD") return null

  return (
    <span
      style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--ink-4)", whiteSpace: "nowrap" }}
      data-testid="price-local-hint"
      title="Approximate, for reference only. You are charged in USD."
    >
      ≈ {formatCurrency(amount * rate, currency)}
    </span>
  )
}
