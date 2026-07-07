"use client"

import { createContext, useContext } from "react"
import type { SupportedCurrency } from "@/types"

// The visitor's IP-based local currency + its USD→local rate, used only to show
// a display-only "≈ €X" hint next to USD prices. Null when unknown / USD / INR.
type LocalCurrency = {
  currency: SupportedCurrency | null
  rate: number | null
}

const LocalCurrencyContext = createContext<LocalCurrency>({ currency: null, rate: null })

export function LocalCurrencyProvider({
  currency,
  rate,
  children,
}: LocalCurrency & { children: React.ReactNode }) {
  return (
    <LocalCurrencyContext.Provider value={{ currency, rate }}>
      {children}
    </LocalCurrencyContext.Provider>
  )
}

export const useLocalCurrency = () => useContext(LocalCurrencyContext)
