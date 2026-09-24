// State / province lists for the address forms (checkout + account).
// Plain data + pure helpers — NO "use server" here, so client components and
// server actions can both import it. Medusa stores the state in the address
// `province` field; we always store the FULL NAME (e.g. "Tamil Nadu"), never a
// code, so emails / admin / fulfilment read it as-is.

// India: 28 states + 8 union territories.
export const INDIA_STATES: string[] = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
]

// United States: 50 states + District of Columbia, keyed by USPS code so a
// code typed/stored earlier ("CA") can be normalised to the full name.
export const US_STATES: [code: string, name: string][] = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
  ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
  ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"],
  ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"],
  ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
  ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
  ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"],
  ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"],
  ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"],
  ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"],
  ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"],
  ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
]

// Canada: 10 provinces + 3 territories.
export const CANADA_PROVINCES: [code: string, name: string][] = [
  ["AB", "Alberta"], ["BC", "British Columbia"], ["MB", "Manitoba"],
  ["NB", "New Brunswick"], ["NL", "Newfoundland and Labrador"],
  ["NT", "Northwest Territories"], ["NS", "Nova Scotia"], ["NU", "Nunavut"],
  ["ON", "Ontario"], ["PE", "Prince Edward Island"], ["QC", "Quebec"],
  ["SK", "Saskatchewan"], ["YT", "Yukon"],
]

// Australia: 6 states + 2 mainland territories.
export const AUSTRALIA_STATES: [code: string, name: string][] = [
  ["ACT", "Australian Capital Territory"], ["NSW", "New South Wales"],
  ["NT", "Northern Territory"], ["QLD", "Queensland"], ["SA", "South Australia"],
  ["TAS", "Tasmania"], ["VIC", "Victoria"], ["WA", "Western Australia"],
]

const CODED: Record<string, [string, string][]> = {
  us: US_STATES,
  ca: CANADA_PROVINCES,
  au: AUSTRALIA_STATES,
}

/** Full-name options for countries with a fixed list, else null (free text). */
export function getProvinceOptions(countryCode?: string | null): string[] | null {
  const cc = (countryCode || "").toLowerCase()
  if (cc === "in") return INDIA_STATES
  const coded = CODED[cc]
  return coded ? coded.map(([, name]) => name) : null
}

/** Field label for the country. */
export function provinceLabel(countryCode?: string | null): string {
  const cc = (countryCode || "").toLowerCase()
  if (cc === "in" || cc === "us" || cc === "au") return "State"
  if (cc === "ca") return "Province"
  return "State / Province / Region"
}

/**
 * Canonicalise a stored/typed province for the given country:
 *  • list countries → the matching FULL NAME (case-insensitive, also accepts the
 *    postal code, e.g. "ca" → "California"), or "" if it isn't in the list;
 *  • free-text countries → the trimmed value, unchanged.
 */
export function normalizeProvince(value: string | null | undefined, countryCode?: string | null): string {
  const v = (value || "").trim()
  if (!v) return ""
  const options = getProvinceOptions(countryCode)
  if (!options) return v
  const lower = v.toLowerCase()
  const byName = options.find((o) => o.toLowerCase() === lower)
  if (byName) return byName
  const coded = CODED[(countryCode || "").toLowerCase()]
  const byCode = coded?.find(([code]) => code.toLowerCase() === lower)
  return byCode ? byCode[1] : ""
}

// Unicode letter count (so "Zürich", "München", non-Latin names pass). Built
// with the RegExp constructor because the tsconfig target is ES2017.
const LETTER_RE = new RegExp("\\p{L}", "gu")
function letterCount(s: string): number {
  return (s.match(LETTER_RE) || []).length
}

/** City: required, trimmed, at least 2 letters (so digits-only fails). "" = OK. */
export function validateCity(value: string | null | undefined): string {
  const v = (value || "").trim()
  if (!v) return "Required"
  if (letterCount(v) < 2) return "Enter a valid city name"
  return ""
}

/** State / province: required; must be in the list for list countries, else ≥ 2 letters. "" = OK. */
export function validateProvince(value: string | null | undefined, countryCode?: string | null): string {
  const v = (value || "").trim()
  const options = getProvinceOptions(countryCode)
  const pick = `Please select a ${provinceLabel(countryCode).toLowerCase()}`
  if (!v) return options ? pick : "Required"
  if (options) return options.includes(v) ? "" : pick
  if (letterCount(v) < 2) return "Enter a valid state / province / region"
  return ""
}
