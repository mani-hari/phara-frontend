import medusaClient from './client';

export interface Region {
  id: string;
  name: string;
  currency_code: string;
  countries: { iso_2: string; name: string }[];
}

let cachedRegions: Region[] | null = null;

export async function getRegions(): Promise<Region[]> {
  if (cachedRegions) return cachedRegions;

  try {
    const { regions } = await medusaClient.store.region.list();
    cachedRegions = regions as unknown as Region[];
    return cachedRegions;
  } catch (error) {
    console.error('Error fetching regions:', error);
    return [];
  }
}

export async function getRegionByCountry(countryCode: string): Promise<Region | null> {
  try {
    const regions = await getRegions();

    // Find region that includes this country
    const region = regions.find((r) =>
      r.countries.some((c) => c.iso_2.toLowerCase() === countryCode.toLowerCase())
    );

    return region || null;
  } catch (error) {
    console.error('Error finding region for country:', error);
    return null;
  }
}

export async function getIndiaRegion(): Promise<Region | null> {
  return getRegionByCountry('IN');
}

export async function getInternationalRegion(): Promise<Region | null> {
  // Try to get a USD region for international customers
  const regions = await getRegions();

  // First try to find a region with USD currency
  const usdRegion = regions.find((r) => r.currency_code.toLowerCase() === 'usd');
  if (usdRegion) return usdRegion;

  // Fall back to any non-INR region
  const internationalRegion = regions.find((r) => r.currency_code.toLowerCase() !== 'inr');
  return internationalRegion || null;
}

export function clearRegionCache(): void {
  cachedRegions = null;
}
