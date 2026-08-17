"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { LANGUAGES, isLangCode, type LangCode } from "@lib/i18n/languages"

// iOS-segmented-control-style pill group. English is ALWAYS shown first and
// is the default/selected state whenever no ?lang= param is present — this
// component never auto-selects a non-English language on its own, even when
// `hintedLang` is passed in (that only reorders which pill appears second,
// per Mani's explicit "don't auto-switch" instruction).
export default function LanguageSwitcher({ hintedLang }: { hintedLang?: LangCode | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentLangParam = searchParams.get("lang")
  const currentLang: LangCode = isLangCode(currentLangParam) ? currentLangParam : "en"

  // English first, always. Then the hinted regional language (if any and not
  // English) right after it, then the rest — reordering only, never hiding.
  const ordered = [...LANGUAGES]
  if (hintedLang && hintedLang !== "en") {
    const hintedIndex = ordered.findIndex((l) => l.code === hintedLang)
    if (hintedIndex > 1) {
      const [hinted] = ordered.splice(hintedIndex, 1)
      ordered.splice(1, 0, hinted)
    }
  }

  const selectLang = (code: LangCode) => {
    const params = new URLSearchParams(searchParams.toString())
    if (code === "en") {
      params.delete("lang") // English = canonical URL, no param at all
    } else {
      params.set("lang", code)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <div className="ph-lang-switcher" role="group" aria-label="Select language">
      {ordered.map((lang) => (
        <button
          key={lang.code}
          type="button"
          className="ph-lang-pill"
          aria-pressed={currentLang === lang.code}
          onClick={() => selectLang(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
