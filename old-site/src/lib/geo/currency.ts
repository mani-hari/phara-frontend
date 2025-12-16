import type { SupportedCurrency, CurrencyConfig } from '@/types';

export const CURRENCY_CONFIG: Record<SupportedCurrency, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimals: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
};

// Static exchange rates from USD (updated periodically)
// In production, you'd want to fetch these from an API
const STATIC_EXCHANGE_RATES: Record<SupportedCurrency, number> = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CAD: 1.36,
  AUD: 1.53,
};

// Cache for fetched exchange rates
let cachedRates: Record<string, number> | null = null;
let ratesCacheTime: number = 0;
const RATES_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function getExchangeRates(): Promise<Record<string, number>> {
  // Return cached rates if still valid
  if (cachedRates && Date.now() - ratesCacheTime < RATES_CACHE_DURATION) {
    return cachedRates;
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (!apiKey) {
    // Use static rates if no API key is provided
    return STATIC_EXCHANGE_RATES;
  }

  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();

    if (data.result !== 'success') {
      throw new Error('Exchange rate API error');
    }

    cachedRates = data.conversion_rates as Record<string, number>;
    ratesCacheTime = Date.now();

    return cachedRates as Record<string, number>;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return STATIC_EXCHANGE_RATES;
  }
}

export function convertCurrency(
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
  rates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amount;

  // Convert to USD first, then to target currency
  const amountInUSD = amount / (rates[fromCurrency] || 1);
  const convertedAmount = amountInUSD * (rates[toCurrency] || 1);

  // Round based on currency decimals
  const config = CURRENCY_CONFIG[toCurrency];
  const multiplier = Math.pow(10, config.decimals);
  return Math.round(convertedAmount * multiplier) / multiplier;
}

export function formatCurrency(
  amount: number,
  currency: SupportedCurrency,
  locale?: string
): string {
  const config = CURRENCY_CONFIG[currency];

  return new Intl.NumberFormat(locale || 'en-US', {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);
}

export function getCurrencySymbol(currency: SupportedCurrency): string {
  return CURRENCY_CONFIG[currency].symbol;
}

// Convert price from smallest unit (cents/paise) to display amount
export function fromSmallestUnit(amount: number, currency: SupportedCurrency): number {
  const config = CURRENCY_CONFIG[currency];
  return amount / Math.pow(10, config.decimals);
}

// Convert price from display amount to smallest unit
export function toSmallestUnit(amount: number, currency: SupportedCurrency): number {
  const config = CURRENCY_CONFIG[currency];
  return Math.round(amount * Math.pow(10, config.decimals));
}
