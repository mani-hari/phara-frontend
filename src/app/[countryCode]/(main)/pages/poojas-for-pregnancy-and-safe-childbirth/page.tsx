import { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import BuyButtons from "./buy-buttons"

// Rendered per-request so pricing reflects the visitor's region (INR for India,
// USD otherwise). Slug preserved from the old Shopify site for SEO:
//   /pages/poojas-for-pregnancy-and-safe-childbirth
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Prasadam for Pregnancy & Safe Childbirth — Garbarakshambigai",
  description:
    "Blessed ghee prasadam (for conceiving) and oil prasadam (for safe childbirth) from the Garbarakshambigai Temple, Thirukkarugavur — sent to you in air-sealed, no-spill packaging with detailed instructions.",
  alternates: { canonical: "/pages/poojas-for-pregnancy-and-safe-childbirth" },
  openGraph: { url: "/pages/poojas-for-pregnancy-and-safe-childbirth" },
}

type Props = { params: Promise<{ countryCode: string }> }

const HANDLES = {
  ghee: "garbharakshambika-ghee",
  oil: "garbharakshambika-oil",
} as const

async function fetchProduct(handle: string, countryCode: string) {
  const product = await listProducts({ countryCode, queryParams: { handle } })
    .then(({ response }) => response.products[0])
    .catch(() => null)
  if (!product) return null

  const { cheapestPrice } = getProductPrice({ product })
  const variant =
    product.variants?.find((v: any) => (v.calculated_price?.calculated_amount ?? 0) > 0) ||
    product.variants?.[0]

  return {
    product,
    // Price is pulled live from Medusa (region-calculated) — never hardcoded.
    priceLabel: cheapestPrice?.calculated_price ?? null,
    priceNumber: cheapestPrice?.calculated_price_number ?? null,
    currency: cheapestPrice?.currency_code ?? null,
    variantId: variant?.id as string | undefined,
  }
}

export default async function PregnancyPoojasPage(props: Props) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)
  if (!region) notFound()

  const [ghee, oil] = await Promise.all([
    fetchProduct(HANDLES.ghee, countryCode),
    fetchProduct(HANDLES.oil, countryCode),
  ])
  if (!ghee && !oil) notFound()

  const stages = [
    {
      key: "ghee",
      tag: "Stage 1 · Trying to conceive",
      heading: "Garbarakshambigai Ghee Prasadam",
      body:
        "Blessed ghee prasadam from the Garbarakshambigai Temple, for women trying to conceive and couples facing fertility challenges. Devotees believe it helps remove obstacles on the path to conception and invites the goddess's blessings for a healthy pregnancy.",
      howToUse:
        "Mix with your regular ghee and take before bedtime for 48 days (skip during your menstrual cycle). Most devotees need 2 bottles for the full period. No dietary restrictions.",
      data: ghee,
    },
    {
      key: "oil",
      tag: "Stage 2 · Expecting a child",
      heading: "Garbarakshambigai Oil Prasadam",
      body:
        "Blessed, energised prasadam oil for expectant mothers — traditionally used to support a safe and complication-free delivery for both mother and child.",
      howToUse:
        "Gently apply on the lower abdomen of the expectant mother. Most devotees need 2 bottles for the full period. No dietary restrictions.",
      data: oil,
    },
  ].filter((s) => s.data)

  // Gallery pulled from the product images (includes the packaging shots).
  const galleryImages = Array.from(
    new Set([
      ...((ghee?.product.images as { url: string }[]) ?? []).map((i) => i.url),
      ...((oil?.product.images as { url: string }[]) ?? []).map((i) => i.url),
    ])
  ).filter(Boolean)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Prasadam for Pregnancy & Safe Childbirth",
    itemListElement: stages.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: s.data!.product.title,
        description: s.data!.product.description || s.body,
        image: s.data!.product.thumbnail || undefined,
        brand: { "@type": "Brand", name: "PariharaOnline" },
        ...(s.data!.priceNumber && {
          offers: {
            "@type": "Offer",
            price: s.data!.priceNumber,
            priceCurrency: s.data!.currency?.toUpperCase(),
            availability: "https://schema.org/InStock",
          },
        }),
      },
    })),
  }

  return (
    <div className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-warm-50 py-16 sm:py-20">
        <div className="content-container max-w-3xl mx-auto text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600">
            Garbarakshambigai Temple · Thirukkarugavur
          </p>
          <h1 className="mb-4 text-4xl font-bold text-grey-90 sm:text-5xl">
            Prasadam for Pregnancy &amp; Safe Childbirth
          </h1>
          <p className="text-xl leading-relaxed text-grey-50">
            The Garbarakshambigai Temple is revered for its blessings for conception and safe
            childbirth. We are devotees — not the temple: for every order, our representative
            visits the temple, offers the pooja on your behalf, and sends you the blessed
            prasadam. Two prasadams, for two stages of the journey.
          </p>
        </div>
      </section>

      {/* Stages */}
      <section className="py-14 sm:py-20">
        <div className="content-container max-w-5xl space-y-16">
          {stages.map((s, idx) => {
            const d = s.data!
            const imageRight = idx % 2 === 1
            return (
              <div
                key={s.key}
                className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12"
              >
                {/* Image */}
                <div
                  className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-warm-50 ${
                    imageRight ? "md:order-2" : ""
                  }`}
                >
                  {d.product.thumbnail && (
                    <Image
                      src={d.product.thumbnail}
                      alt={d.product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}
                </div>

                {/* Content */}
                <div className={imageRight ? "md:order-1" : ""}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-600">
                    {s.tag}
                  </p>
                  <h2 className="mb-3 text-2xl font-bold text-grey-90 sm:text-3xl">
                    {s.heading}
                  </h2>
                  <p className="mb-4 leading-relaxed text-grey-60">{s.body}</p>

                  <p className="mb-2 text-sm font-semibold text-grey-90">How to use</p>
                  <p className="mb-4 text-sm leading-relaxed text-grey-60">{s.howToUse}</p>

                  <p className="mb-5 rounded-lg bg-warm-50 p-3 text-sm leading-relaxed text-grey-60">
                    <span className="font-semibold text-grey-90">What you receive:</span> the
                    blessed {s.key === "ghee" ? "ghee" : "oil"} prasadam and kumkum from the
                    temple, with detailed usage instructions and mantras — delivered in
                    air-sealed, no-spill packaging. Free shipping within India; safe
                    international shipping with tracking (at additional cost).
                  </p>

                  {d.priceLabel && (
                    <p className="mb-4 text-2xl font-bold text-grey-90">{d.priceLabel}</p>
                  )}

                  <BuyButtons variantId={d.variantId} countryCode={countryCode} />

                  <div className="mt-4">
                    <LocalizedClientLink
                      href={`/products/${d.product.handle}`}
                      className="text-sm font-medium text-brand-600 hover:underline"
                    >
                      Full details →
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Packaging gallery */}
      {galleryImages.length > 0 && (
        <section className="bg-warm-50 py-14">
          <div className="content-container max-w-5xl">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-2xl font-bold text-grey-90">
                Carefully packed, delivered to your door
              </h2>
              <p className="text-grey-60">
                Every prasadam is sealed in air-tight, no-spill packaging and shipped with
                tracking.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {galleryImages.map((url) => (
                <div
                  key={url}
                  className="relative aspect-square overflow-hidden rounded-xl border border-grey-10 bg-white"
                >
                  <Image
                    src={url}
                    alt="Prasadam packaging"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-14">
        <div className="content-container max-w-4xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <figure className="rounded-2xl border border-grey-10 bg-white p-6 shadow-sm">
              <blockquote className="leading-relaxed text-grey-70">
                “The packaging was incredibly professional — vacuum-sealed, with no leaks at
                all. Communication over WhatsApp was prompt, payment was effortless, and the
                whole experience felt trustworthy from start to finish.”
              </blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-grey-90">
                Anjali R. <span className="font-normal text-grey-50">· New Jersey, USA</span>
              </figcaption>
            </figure>
            <figure className="rounded-2xl border border-grey-10 bg-white p-6 shadow-sm">
              <blockquote className="leading-relaxed text-grey-70">
                “The team was so responsive to every question, and the ghee and oil reached me
                beautifully packed. I've since recommended Parihara to all my relatives.”
              </blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-grey-90">
                Lakshmi N. <span className="font-normal text-grey-50">· Bengaluru, India</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Close */}
      <section className="bg-warm-50 py-14">
        <div className="content-container max-w-2xl mx-auto text-center">
          <h2 className="mb-3 text-2xl font-bold text-grey-90">
            A spiritual concierge you can trust
          </h2>
          <p className="mb-6 leading-relaxed text-grey-60">
            We are devotees who bring the temple's blessings to you, wherever you are — experts
            in safe packaging and international shipping. Many families begin with the ghee
            prasadam and return for the oil once their pregnancy is confirmed.
          </p>
          <p className="text-sm text-grey-50">
            Questions? WhatsApp{" "}
            <strong className="text-brand-600">+91 97432 44501</strong> or ask on{" "}
            <LocalizedClientLink href="/ask-parihara" className="text-brand-600 hover:underline">
              Ask Parihara
            </LocalizedClientLink>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
