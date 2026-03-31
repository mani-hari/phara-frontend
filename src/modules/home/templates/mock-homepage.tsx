import Image from "next/image"
import Link from "next/link"

import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import {
  astrologyCardCopy,
  findFeaturedProducts,
  findRightPujaCards,
  getCollectionProducts,
  getIntensityDots,
  getPrimaryProductImage,
  homepageHero,
  howItWorksSteps,
  learnExploreArticles,
  popularQuestions,
  testimonials,
} from "@lib/mock-storefront"
import {
  ArrowRight,
  ChevronDown,
  MessageCircle,
  Sparkles,
  Star,
} from "lucide-react"

type MockHomepageProps = {
  countryCode: string
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}

const intensityLabel = (intensity: "Gentle" | "Medium" | "High") => (
  <div className="flex items-center gap-1.5">
    <div className="flex items-center gap-1">
      {Array.from({ length: 3 }).map((_, index) => (
        <span
          key={index}
          className={`h-2 w-2 rounded-full ${
            index < getIntensityDots(intensity) ? "bg-brand-500" : "bg-grey-20"
          }`}
        />
      ))}
    </div>
    <span className="text-[11px] text-grey-50">{intensity}</span>
  </div>
)

const productHref = (countryCode: string, handle?: string) =>
  `/${countryCode}/products/${handle || ""}`

const pujasHref = (countryCode: string) =>
  `/${countryCode}/collections/pujas-and-homams`

const ProductArtwork = ({
  src,
  title,
  heightClass,
}: {
  src?: string | null
  title: string
  heightClass: string
}) => {
  if (src) {
    return (
      <Image
        src={src}
        alt={title}
        width={305}
        height={180}
        className={`${heightClass} w-full object-cover`}
      />
    )
  }

  return (
    <div
      className={`${heightClass} flex w-full items-center justify-center bg-gradient-to-br from-brand-100 via-[#f5ede5] to-[#eadfce] px-6 text-center`}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
          PariharaOnline
        </p>
        <p className="mt-3 font-display text-2xl leading-tight text-brand-900">
          {title}
        </p>
      </div>
    </div>
  )
}

export default function MockHomepage({
  countryCode,
  products,
  region,
}: MockHomepageProps) {
  const featuredProducts = findFeaturedProducts(products)
  const featuredIds = new Set(featuredProducts.map((entry) => entry.product.id))
  const popularProducts = products
    .filter((product) => !featuredIds.has(product.id))
    .slice(0, 6)
  const astrologyProducts = getCollectionProducts(
    products,
    "astrology-services"
  ).slice(0, 3)

  return (
    <div className="bg-[#fffdf9]">
      <section className="border-t border-brand-200 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700">
        <div className="content-container grid gap-10 px-20 py-8 lg:grid-cols-[1fr_520px] lg:items-center">
          <div className="max-w-[540px]">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-brand-200">
              <Sparkles className="h-3.5 w-3.5" />
              {homepageHero.eyebrow}
            </div>
            <h1 className="mt-5 whitespace-pre-line font-display text-[52px] leading-[1.05] text-white">
              {homepageHero.title}
            </h1>
            <p className="mt-5 whitespace-pre-line text-[15px] leading-7 text-brand-100/90">
              {homepageHero.description}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl shadow-[0_24px_60px_rgba(17,24,39,0.22)]">
            <Image
              src={homepageHero.image}
              alt="Temple ritual at PariharaOnline"
              width={520}
              height={340}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="content-container px-20 py-[72px]">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-[32px] text-grey-80">
            Featured Pujas & Services
          </h2>
          <Link
            href={pujasHref(countryCode)}
            className="text-sm font-medium text-brand-600"
          >
            View All →
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-4">
          {featuredProducts.map(({ product, meta }) => {
            const { cheapestPrice } = getProductPrice({ product })

            return (
              <Link
                key={product.id}
                href={productHref(countryCode, product.handle)}
                className="overflow-hidden rounded-xl border border-grey-10 bg-white transition-transform duration-200 hover:-translate-y-1"
              >
                <ProductArtwork
                  src={getPrimaryProductImage(product)}
                  title={product.title}
                  heightClass="h-[180px]"
                />
                <div className="space-y-3 px-4 pb-5 pt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {meta.tags.map((tag) => (
                      <span
                        key={tag.label}
                        className="rounded border border-grey-30 px-2 py-1 text-[10px] font-medium"
                        style={{ color: tag.color, backgroundColor: tag.bg }}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-[17px] font-semibold text-grey-80">
                    {product.title}
                  </h3>
                  <p className="text-xs leading-5 text-grey-50">
                    Effective for: {meta.effectiveFor}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-brand-600">
                      {cheapestPrice?.calculated_price || ""}
                    </span>
                    {intensityLabel(meta.intensity)}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="bg-[#fff0e8]">
        <div className="content-container px-20 py-[72px]">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 fill-brand-500 text-brand-500" />
              <h2 className="font-display text-[32px] text-grey-80">
                Astrology Consultations
              </h2>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {astrologyProducts.map((product) => {
              const copy = astrologyCardCopy[product.handle || ""] || {
                description:
                  "Personalized Jyotish guidance with practical timing and remedial insight.",
                feature: "Detailed astrology reading",
              }
              const { cheapestPrice } = getProductPrice({ product })

              return (
                <article
                  key={product.id}
                  className="rounded-2xl border border-[#f1ded2] bg-white p-6"
                >
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold text-grey-80">
                    {product.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-grey-50">
                    {copy.description}
                  </p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-brand-700">
                    {copy.feature}
                  </p>
                  <p className="mt-4 text-lg font-bold text-brand-600">
                    {cheapestPrice?.calculated_price || ""}
                  </p>
                  <Link
                    href={productHref(countryCode, product.handle)}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
                  >
                    View Service
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              )
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <a
              href="https://wa.me/919743244501"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-brand-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              <MessageCircle className="h-4 w-4" />
              Contact Us on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="content-container px-20 py-16">
        <h2 className="font-display text-[32px] text-grey-80">
          What Devotees Say
        </h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {testimonials.map((review) => (
            <article
              key={`${review.author}-${review.location}`}
              className="rounded-2xl border border-grey-10 bg-white p-6"
            >
              <div className="text-brand-500">★★★★★</div>
              <p className="mt-4 text-sm leading-7 text-grey-50">
                “{review.text}”
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-brand-500/15" />
                <div>
                  <p className="text-sm font-semibold text-grey-80">
                    {review.author}
                  </p>
                  <p className="text-xs text-grey-50">{review.location}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-container px-20 py-12">
        <h2 className="font-display text-[32px] text-grey-80">
          Find the Right Puja for You
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {findRightPujaCards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-grey-10 bg-white p-5"
            >
              <div className="mb-4 h-8 w-8 rounded-full bg-brand-50" />
              <h3 className="text-sm font-semibold text-grey-80">
                {card.title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-grey-50">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-900">
        <div className="content-container px-20 py-[72px]">
          <h2 className="font-display text-[32px] text-white">How It Works</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-4">
            {howItWorksSteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-2xl bg-white/8 p-6 text-center text-white"
              >
                <div className="mx-auto mb-5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="text-sm font-semibold">{step.title}</h3>
                <p className="mt-3 text-xs leading-6 text-brand-100/85">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="content-container grid gap-16 px-20 py-[72px] lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-[32px] text-grey-80">
              Learn & Explore
            </h2>
            <Link
              href={`/${countryCode}/blog`}
              className="text-sm font-medium text-brand-600"
            >
              Read the Blog →
            </Link>
          </div>
          <div className="space-y-5">
            {learnExploreArticles.map((article) => (
              <Link
                key={article.title}
                href={`/${countryCode}${article.href}`}
                className="flex items-center gap-4"
              >
                <Image
                  src={article.image}
                  alt={article.title}
                  width={92}
                  height={64}
                  className="h-16 w-[92px] rounded-lg object-cover"
                />
                <div>
                  <p className="text-sm font-semibold leading-6 text-grey-80">
                    {article.title}
                  </p>
                  <p className="mt-1 text-xs text-brand-600">Read more</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-grey-50">
            Popular Questions
          </h3>
          <div className="mt-5 divide-y divide-grey-10 rounded-2xl border border-grey-10">
            {popularQuestions.map((question) => (
              <details key={question} className="group px-5 py-4">
                <summary className="flex cursor-pointer items-center justify-between list-none text-sm font-medium text-grey-80">
                  {question}
                  <ChevronDown className="h-4 w-4 text-grey-50 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 pr-8 text-sm leading-7 text-grey-50">
                  Our team will guide you toward the right service and collect
                  the correct sankalpam details before the ritual is performed.
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="content-container px-20 pb-[88px] pt-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-[32px] text-grey-80">
            Pujas & Homams that are popular this month
          </h2>
          <Link
            href={pujasHref(countryCode)}
            className="text-sm font-medium text-brand-600"
          >
            View All Services →
          </Link>
        </div>

        <div className="grid gap-x-8 gap-y-6 lg:grid-cols-3">
          {popularProducts.map((product) => {
            const { cheapestPrice } = getProductPrice({ product })
            const image = getPrimaryProductImage(product)

            return (
              <Link
                key={product.id}
                href={productHref(countryCode, product.handle)}
                className="flex items-center gap-4"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-brand-50">
                  {image ? (
                    <Image
                      src={image}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-100 to-[#eadfce] px-2 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-brand-800">
                      Puja
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-grey-80">
                    {product.title}
                  </p>
                  <p className="mt-1 text-xs text-grey-50">
                    {product.collection?.title || region.name}
                  </p>
                  <p className="mt-2 text-sm font-bold text-brand-600">
                    {cheapestPrice?.calculated_price || ""}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
