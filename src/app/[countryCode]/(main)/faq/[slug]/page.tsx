import { Metadata } from "next"
import { notFound } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { FAQ_CATEGORIES } from "@lib/data/faq-data"
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
  ArrowLeft,
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

export async function generateStaticParams() {
  return FAQ_CATEGORIES.map((cat) => ({ slug: cat.slug }))
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await props.params
  const category = FAQ_CATEGORIES.find((c) => c.slug === slug)
  if (!category) return {}

  return {
    title: `${category.title} - FAQ`,
    description: category.description,
    alternates: { canonical: `/faq/${slug}` },
    openGraph: { url: `/faq/${slug}` },
  }
}

export default async function FAQCategoryPage(props: {
  params: Promise<{ slug: string; countryCode: string }>
}) {
  const { slug } = await props.params
  const category = FAQ_CATEGORIES.find((c) => c.slug === slug)

  if (!category) {
    notFound()
  }

  const IconComponent = iconMap[category.icon] || Flame

  // JSON-LD FAQPage schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: category.questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  }

  return (
    <div className="bg-white min-h-screen">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-warm-50 py-12 sm:py-16">
        <div className="content-container">
          <LocalizedClientLink
            href="/faq"
            className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All FAQ Topics
          </LocalizedClientLink>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-brand-100 text-brand-600 flex-shrink-0">
              <IconComponent className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-grey-90 mb-3">
                {category.title}
              </h1>
              <p className="text-lg text-grey-50 max-w-2xl">
                {category.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="py-12 sm:py-16">
        <div className="content-container max-w-3xl">
          <div className="space-y-4">
            {category.questions.map((q, i) => (
              <details
                key={i}
                className="group bg-white rounded-xl border border-grey-10 hover:border-brand-200 overflow-hidden transition-colors"
                open={i === 0}
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 text-grey-90 font-medium hover:text-brand-600 transition-colors">
                  <span className="pr-4">{q.question}</span>
                  <ChevronRight className="w-5 h-5 text-grey-30 group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-5 pb-5 text-sm text-grey-60 leading-relaxed border-t border-grey-10 pt-4">
                  {q.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related Topics */}
      <section className="py-12 sm:py-16 bg-grey-5">
        <div className="content-container">
          <h2 className="text-xl font-bold text-grey-90 mb-6 text-center">
            Explore Other Topics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {FAQ_CATEGORIES.filter((c) => c.slug !== slug)
              .slice(0, 3)
              .map((cat) => {
                const Icon = iconMap[cat.icon] || Flame
                return (
                  <LocalizedClientLink
                    key={cat.slug}
                    href={`/faq/${cat.slug}`}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-grey-10 hover:border-brand-200 hover:shadow-sm transition-all"
                  >
                    <Icon className="w-5 h-5 text-brand-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-grey-70">
                      {cat.title}
                    </span>
                  </LocalizedClientLink>
                )
              })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className="content-container text-center">
          <p className="text-grey-50 mb-4">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <a
            href="https://wa.me/919743244501"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors"
          >
            Chat with us on WhatsApp
          </a>
        </div>
      </section>
    </div>
  )
}
