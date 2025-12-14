import type { GeoInfo, SupportedCurrency } from '@/types';

// Country to currency mapping for prominent currencies
const COUNTRY_CURRENCY_MAP: Record<string, SupportedCurrency> = {
  IN: 'INR',
  US: 'USD',
  CA: 'CAD',
  GB: 'GBP',
  AU: 'AUD',
  JP: 'JPY',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  IE: 'EUR',
  PT: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
};

// Default to USD for countries not in the list
const DEFAULT_INTERNATIONAL_CURRENCY: SupportedCurrency = 'USD';

interface IpApiResponse {
  country: string;
  countryCode: string;
  status: string;
}

let cachedGeoInfo: GeoInfo | null = null;

export async function detectGeoLocation(): Promise<GeoInfo> {
  // Return cached result if available
  if (cachedGeoInfo) return cachedGeoInfo;

  // Check if we have geo info stored in session storage
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('parihara_geo');
    if (stored) {
      cachedGeoInfo = JSON.parse(stored);
      return cachedGeoInfo!;
    }
  }

  try {
    // Use ip-api.com for geo detection (free tier, no API key needed)
    const response = await fetch('https://ip-api.com/json/?fields=status,country,countryCode', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch geo location');
    }

    const data: IpApiResponse = await response.json();

    if (data.status !== 'success') {
      throw new Error('Geo detection failed');
    }

    const countryCode = data.countryCode.toUpperCase();
    const isIndia = countryCode === 'IN';
    const currency = COUNTRY_CURRENCY_MAP[countryCode] || DEFAULT_INTERNATIONAL_CURRENCY;

    const geoInfo: GeoInfo = {
      country: data.country,
      countryCode,
      currency,
      isIndia,
      region: isIndia ? 'india' : 'international',
    };

    // Cache the result
    cachedGeoInfo = geoInfo;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('parihara_geo', JSON.stringify(geoInfo));
    }

    return geoInfo;
  } catch (error) {
    console.error('Error detecting geo location:', error);

    // Default to international/USD if detection fails
    const defaultGeoInfo: GeoInfo = {
      country: 'Unknown',
      countryCode: 'US',
      currency: 'USD',
      isIndia: false,
      region: 'international',
    };

    return defaultGeoInfo;
  }
}

export function clearGeoCache(): void {
  cachedGeoInfo = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('parihara_geo');
  }
}

export function getCurrencyForCountry(countryCode: string): SupportedCurrency {
  return COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] || DEFAULT_INTERNATIONAL_CURRENCY;
}

export function isIndiaCountry(countryCode: string): boolean {
  return countryCode.toUpperCase() === 'IN';
}
