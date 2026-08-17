import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { FAQ_CATEGORIES } from "@lib/data/faq-data"
import LanguageSwitcher from "@modules/common/components/language-switcher"
import { translateBatch } from "@lib/i18n/translate"
import { isLangCode, type LangCode } from "@lib/i18n/languages"
import { getHintedLang } from "@lib/i18n/geo-hint"
import {
  Flame,
  Star,
  Sparkles,
  Calendar,
  Building2,
  Package,
  CreditCard,
  Shield,
  Heart,
  HeartPulse,
  ChevronRight,
  Search,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  Star,
  Sparkles,
  Calendar,
  Building2,
  Package,
  CreditCard,
  Shield,
  Heart,
  HeartPulse,
}

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions",
  description:
    "Find answers to common questions about Hindu pujas, homams, Vedic astrology, nakshatram, temple services, prasad delivery, and more at PariharaOnline.",
  alternates: { canonical: "/faq" },
  openGraph: { url: "/faq" },
}

export default async function FAQIndexPage(props: {
  searchParams: Promise<{ lang?: string }>
}) {
  const { lang: langParam } = await props.searchParams
  const lang: LangCode = isLangCode(langParam) ? langParam : "en"
  const hintedLang = getHintedLang()

  const previewEntries = FAQ_CATEGORIES.slice(0, 4).flatMap((cat) => cat.questions.slice(0, 1))

  const toTranslate = [
    "Frequently Asked Questions",
    "Everything you need to know about Hindu pujas, Vedic astrology, temple services, and spiritual remedies. Browse by topic below.",
    ...FAQ_CATEGORIES.flatMap((c) => [c.title, c.description]),
    ...previewEntries.flatMap((q) => [q.question, q.answer]),
  ]
  const translated = await translateBatch(toTranslate, lang)
  const [heroTitle, heroSubtitle, ...rest] = translated
  const categoryTexts = rest.slice(0, FAQ_CATEGORIES.length * 2)
  const previewTexts = rest.slice(FAQ_CATEGORIES.length * 2)
  const categories = FAQ_CATEGORIES.map((c, i) => ({
    ...c,
    title: categoryTexts[i * 2],
    description: categoryTexts[i * 2 + 1],
  }))
  const preview = previewEntries.map((q, i) => ({
    question: previewTexts[i * 2],
    answer: previewTexts[i * 2 + 1],
  }))

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-warm-50 py-16 sm:py-20">
        <div className="content-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100/60 text-brand-800 text-sm font-medium mb-6">
            <Search className="w-4 h-4" />
            <span>Knowledge Base</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-grey-90 mb-4" lang={lang}>
            {heroTitle}
          </h1>
          <div className="flex justify-center mb-4">
            <LanguageSwitcher hintedLang={hintedLang} />
          </div>
          <p className="text-lg text-grey-50 max-w-2xl mx-auto" lang={lang}>
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-12 sm:py-16">
        <div className="content-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon] || Flame
              return (
                <LocalizedClientLink
                  key={category.slug}
                  href={`/faq/${category.slug}${lang !== "en" ? `?lang=${lang}` : ""}`}
                  className="group flex flex-col p-6 rounded-2xl border border-grey-10 hover:border-brand-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-brand-50 text-brand-600">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-grey-30 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h2 className="text-lg font-semibold text-grey-90 mb-2" lang={lang}>
                    {category.title}
                  </h2>
                  <p className="text-sm text-grey-50 mb-4 leading-relaxed" lang={lang}>
                    {category.description}
                  </p>
                  <span className="text-sm text-brand-600 font-medium mt-auto">
                    {category.questions.length} questions
                  </span>
                </LocalizedClientLink>
              )
            })}
          </div>
        </div>
      </section>

      {/* Quick FAQ Preview */}
      <section className="py-12 sm:py-16 bg-grey-5">
        <div className="content-container">
          <h2 className="text-2xl font-bold text-grey-90 mb-8 text-center">
            Most Popular Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {preview.map((q, i) => (
              <details
                key={i}
                className="group bg-white rounded-xl border border-grey-10 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 text-grey-90 font-medium hover:text-brand-600 transition-colors">
                  <span lang={lang}>{q.question}</span>
                  <ChevronRight className="w-5 h-5 text-grey-30 group-open:rotate-90 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-sm text-grey-50 leading-relaxed border-t border-grey-10 pt-4" lang={lang}>
                  {q.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16">
        <div className="content-container text-center">
          <h2 className="text-2xl font-bold text-grey-90 mb-4">
            Still have questions?
          </h2>
          <p className="text-grey-50 mb-6">
            Our team is available to help via WhatsApp or email.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/919743244501"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors"
            >
              WhatsApp Us
            </a>
            <a
              href="mailto:hello@pariharaonline.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-grey-70 rounded-xl font-semibold hover:bg-grey-5 transition-colors border border-grey-20"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
