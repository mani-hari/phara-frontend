import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { ArrowRight, Mail, Shield, Sparkles, Star } from "lucide-react"

export const metadata: Metadata = {
  title: "Vedic Astrology Services - Expert Consultations",
  description:
    "Get personalized Vedic astrology consultations from experienced Kerala-Salem tradition astrologers. Career, health, marriage, and life guidance. Reports delivered within 48 hours.",
}

const TESTIMONIALS = [
  {
    stars: 5,
    quote:
      "I was torn between a safe job and a risky startup offer. The career reading didn't hand me a fairy tale — it mapped the timing, the windows to watch, and a simple Guru remedy. I made the move in the window they suggested, and eighteen months on it's the best career decision I've made.",
    name: "Rajesh M.",
    detail: "Engineering Director · Seattle · Career consultation",
  },
  {
    stars: 5,
    quote:
      "When my mother's health took a sudden turn, we felt helpless. The health reading helped us understand the difficult period ahead and gave us specific parihara to perform. It didn't replace her doctors — it gave our family a plan and a sense of calm when we needed it most. She is recovering well now.",
    name: "Divya S.",
    detail: "Chennai · Health & wellbeing consultation",
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

  const region = await getRegion(countryCode)
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
            Expert astrology guidance, grounded in tradition
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-grey-60">
            Used practically, astrology is one of the most powerful tools for
            living with clarity — a way to read timing, temperament, and the
            currents shaping your life. This isn&apos;t fortune-telling or
            superstition a rational, modern mind has to set aside. Our
            astrologers study your birth chart to give honest, useful guidance —
            and, where it helps, a remedy you can actually act on.
          </p>
        </div>
      </section>

      {/* Astrology services — real catalog cards */}
      <section className="py-16">
        <div className="content-container px-20">
          <h2 className="text-center font-serif text-[34px] text-grey-90">
            Astrology services
          </h2>
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {astrologyProducts.map((product) => (
              <ProductPreview key={product.id} product={product} region={region!} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8efe5] py-16">
        <div className="content-container max-w-6xl px-20">
          <h2 className="text-center font-serif text-[34px] text-grey-90">
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
                className="rounded-3xl border border-[#eadfd3] bg-white p-8 text-center"
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

      {/* Testimonials — 2 columns */}
      <section className="py-16">
        <div className="content-container max-w-6xl px-20">
          <h2 className="text-center font-serif text-[34px] text-grey-90">
            What devotees say
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-[28px] border border-[#e6d7cb] bg-white p-8 shadow-[0_24px_50px_rgba(47,36,29,0.08)]"
              >
                <div style={{ color: "#c99a3f", letterSpacing: 2 }}>
                  {"★".repeat(t.stars)}
                </div>
                <p className="mt-4 font-serif text-[21px] leading-snug text-grey-90">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="mt-6 text-sm font-semibold text-grey-90">{t.name}</p>
                <p className="text-sm text-grey-50">{t.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-900 py-16">
        <div className="content-container px-20 text-center">
          <h2 className="font-serif text-[36px] text-white">
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
