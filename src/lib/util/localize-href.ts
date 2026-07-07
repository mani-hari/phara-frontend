const DEFAULT_COUNTRY =
  (process.env.NEXT_PUBLIC_DEFAULT_REGION || "in").toLowerCase()

/**
 * Build a localized href. For the default country (India / "in") the country
 * code prefix is omitted so URLs stay clean. All other regions get the
 * standard `/{countryCode}{href}` prefix.
 */
export function localizeHref(countryCode: string, href: string): string {
  return countryCode.toLowerCase() === DEFAULT_COUNTRY
    ? href
    : `/${countryCode}${href}`
}

export { DEFAULT_COUNTRY }
