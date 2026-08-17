// Config for the FAQ + product-page language switcher. English is always the
// default/canonical view (no query param) — the other three are opt-in via
// ?lang=, never auto-selected, never change the canonical URL.
export type LangCode = "en" | "ta" | "te" | "hi"

export interface LanguageOption {
  code: LangCode
  label: string // native-script label shown on the pill
  googleCode: string // code passed to the translation API
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", googleCode: "en" },
  { code: "ta", label: "தமிழ்", googleCode: "ta" },
  { code: "te", label: "తెలుగు", googleCode: "te" },
  { code: "hi", label: "हिन्दी", googleCode: "hi" },
]

export const LANG_CODES = LANGUAGES.map((l) => l.code)

export function isLangCode(value: string | null | undefined): value is LangCode {
  return !!value && (LANG_CODES as string[]).includes(value)
}

export function getLanguage(code: LangCode): LanguageOption {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0]
}

// Indian state/region codes (Vercel's x-vercel-ip-country-region header, ISO
// 3166-2 subdivision codes without the "IN-" prefix) mapped to the language
// most relevant there. Used ONLY to reorder/highlight which pill appears
// second in the switcher — never to auto-select or auto-redirect.
const STATE_TO_LANG: Record<string, LangCode> = {
  TN: "ta", // Tamil Nadu
  PY: "ta", // Puducherry (large Tamil-speaking population)
  AP: "te", // Andhra Pradesh
  TG: "te", // Telangana
  DL: "hi", // Delhi
  UP: "hi", // Uttar Pradesh
  MP: "hi", // Madhya Pradesh
  BR: "hi", // Bihar
  RJ: "hi", // Rajasthan
  HR: "hi", // Haryana
  UK: "hi", // Uttarakhand
  JH: "hi", // Jharkhand
  CH: "hi", // Chandigarh
  HP: "hi", // Himachal Pradesh
}

export function hintedLangForRegion(
  countryCode: string | null | undefined,
  regionCode: string | null | undefined
): LangCode | null {
  if ((countryCode || "").toUpperCase() !== "IN") return null
  if (!regionCode) return null
  return STATE_TO_LANG[regionCode.toUpperCase()] || null
}
