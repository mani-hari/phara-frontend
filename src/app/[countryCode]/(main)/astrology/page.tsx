import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import SampleReportModal from "@modules/astrology/components/sample-report-modal"
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  Shield,
  Sparkles,
  Star,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Vedic Astrology Services - Expert Consultations",
  description:
    "Get personalized Vedic astrology consultations from experienced Kerala-Salem tradition astrologers. Career, health, marriage, and life guidance. Reports delivered within 48 hours.",
}

const serviceCopy: Record<
  string,
  { description: string; features: string[]; badge?: string }
> = {
  "ask-our-astrologer": {
    description:
      "General consultation for timing, relationships, family decisions, and practical spiritual guidance.",
    features: [
      "Any life question",
      "2-page detailed report",
      "Action steps and timing",
      "48-hour delivery",
    ],
  },
  "astrology-health": {
    description:
      "Focused reading on health concerns, planetary influences, and remedial support for recovery periods.",
    features: [
      "Health-focused analysis",
      "Remedial measures",
      "Treatment timing",
      "Lifestyle guidance",
    ],
  },
  "career-astrology": {
    description:
      "Comprehensive guidance on job moves, business growth, promotions, obstacles, and supportive remedies.",
    features: [
      "2-3 year forecast",
      "Career direction",
      "Business prospects",
      "Job change timing",
    ],
    badge: "Most Popular",
  },
}

const sampleReports = [
  {
    title: "Client with marital problems",
    summary:
      "Masked sample showing compatibility concerns, timing analysis, and remedial guidance.",
    file: "/sample-reports/marital-problems-sample.pdf",
  },
  {
    title: "Client with business enemies and growth issues",
    summary:
      "Sample report covering competitive pressure, expansion timing, and protection-oriented remedies.",
    file: "/sample-reports/business-growth-sample.pdf",
  },
  {
    title: "Client with ill health of family member",
    summary:
      "Illustrative report focused on family wellbeing, health periods, and suitable parihara recommendations.",
    file: "/sample-reports/family-health-sample.pdf",
  },
]

type AstrologyPageProps = {
  params: Promise<{ countryCode: string }>
}

export default async function AstrologyPage(props: AstrologyPageProps) {
  const { countryCode } = await props.params
  const { collections } = await listCollections({ fields: "*products" })
  const astrologyCollection = collections?.find(
    (collection) => collection.handle === "astrology-services"
  )

  const astrologyProducts = astrologyCollection
    ? await listProducts({
        countryCode,
        queryParams: {
          collection_id: [astrologyCollection.id],
          limit: 12,
        },
      }).then(({ response }) => response.products)
    : []

  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <section className="border-t border-brand-200 bg-gradient-to-br from-[#fbf3eb] via-white to-[#efe0cf] py-16 sm:py-20">
        <div className="content-container mx-auto max-w-5xl px-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-800">
            <Star className="h-4 w-4" />
            <span>Vedic Astrology (Jyotish Shastra)</span>
          </div>
          <h1 className="font-display text-4xl leading-tight text-grey-90 sm:text-5xl">
            Expert astrology guidance in the same PariharaOnline experience
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-grey-60">
            Brown, grounded, and consistent with the rest of the brand. These
            services pull their actual products and region-specific pricing from
            Medusa.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="content-container px-20">
          <h2 className="text-center font-display text-[34px] text-grey-90">
            Astrology services
          </h2>
          <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
            {astrologyProducts.map((product) => {
              const copy = serviceCopy[product.handle || ""] || {
                description:
                  "Personalized astrology service with practical timing and remedies.",
                features: [
                  "Personalized reading",
                  "Traditional remedies",
                  "Detailed guidance",
                  "Email delivery",
                ],
              }
              const { cheapestPrice } = getProductPrice({ product })

              return (
                <div
                  key={product.id}
                  className="flex flex-col rounded-[28px] border border-[#e6d7cb] bg-white p-7 shadow-[0_24px_50px_rgba(47,36,29,0.08)]"
                >
                  {copy.badge && (
                    <span className="mb-4 w-fit rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
                      {copy.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-semibold text-grey-90">
                    {product.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-grey-60">
                    {copy.description}
                  </p>
                  <p className="mt-5 text-3xl font-bold text-brand-700">
                    {cheapestPrice?.calculated_price || ""}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {copy.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-grey-70"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <LocalizedClientLink
                    href={`/products/${product.handle}`}
                    className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-brand-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
                  >
                    Book consultation
                    <ArrowRight className="h-4 w-4" />
                  </LocalizedClientLink>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f8efe5] py-16">
        <div className="content-container max-w-4xl px-20">
          <h2 className="text-center font-display text-[34px] text-grey-90">
            How astrology consultation works
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Sparkles,
                title: "Choose service",
                desc: "Select the kind of guidance you need from the catalog.",
              },
              {
                icon: Star,
                title: "Share birth details",
                desc: "Provide date, time, place, and the situation you want help with.",
              },
              {
                icon: Shield,
                title: "Expert analysis",
                desc: "An astrologer studies the chart and prepares remedies and timing.",
              },
              {
                icon: Mail,
                title: "Receive report",
                desc: "Your personalized document arrives by email within the stated window.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-3xl border border-[#eadfd3] bg-white p-6 text-center"
              >
                <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-grey-90">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-grey-50">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="content-container px-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
              Sample Reports
            </p>
            <h2 className="mt-3 font-display text-[34px] text-grey-90">
              Download sample astrology reports
            </h2>
            <p className="mt-4 text-sm leading-7 text-grey-50">
              These are masked placeholder PDF reports for the experience. You
              can replace each PDF later with real examples.
            </p>
          </div>
          <div className="mt-10">
            <SampleReportModal reports={sampleReports} />
          </div>
        </div>
      </section>

      <section className="bg-brand-900 py-16">
        <div className="content-container px-20 text-center">
          <h2 className="font-display text-[36px] text-white">
            Need a recommendation before you book?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-brand-100/90">
            Tell us the issue you are facing and we will help you pick the right
            report or ritual from the live catalog.
          </p>
          <a
            href="https://wa.me/919743244501"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
          >
            Contact us on WhatsApp
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  )
}
