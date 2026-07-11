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
  title: "Poojas for Pregnancy & Safe Childbirth — Garbarakshambigai",
  description:
    "Sacred Garbarakshambigai abhishekams performed at the temple on your behalf — the Ghee Abhishekam to invoke the blessing of a child, and the Oil Abhishekam to protect the pregnancy through to a safe delivery.",
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
  // Prefer a real priced variant over any $0 placeholder variant.
  const variant =
    product.variants?.find((v: any) => (v.calculated_price?.calculated_amount ?? 0) > 0) ||
    product.variants?.[0]

  return {
    product,
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
      tag: "Stage 1 · Praying for a child",
      heading: "Garbarakshambigai Ghee Abhishekam",
      body:
        "If you are trying to conceive, begin here. Ghee — the purest of offerings — is poured over the Goddess as the priests invoke her grace for conception. Ghee carries warmth and nourishment; this is the invocation that opens the door.",
      data: ghee,
    },
    {
      key: "oil",
      tag: "Stage 2 · Once you are expecting",
      heading: "Garbarakshambigai Oil Abhishekam",
      body:
        "Once your pregnancy is confirmed, this abhishekam safeguards the months ahead. Sacred oil bathes the Goddess to invoke protection, strength, and a safe delivery. Oil is cooling and grounding — the blessing that steadies and protects.",
      data: oil,
    },
  ].filter((s) => s.data)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Poojas for Pregnancy & Safe Childbirth",
    itemListElement: stages.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: s.data!.product.title,
        description: s.data!.product.description || s.heading,
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
            Garbarakshambigai · Thirukarugavur
          </p>
          <h1 className="mb-4 text-4xl font-bold text-grey-90 sm:text-5xl">
            Poojas for Pregnancy &amp; Safe Childbirth
          </h1>
          <p className="text-xl leading-relaxed text-grey-50">
            Goddess Garbarakshambigai — the divine protector of the womb — has blessed
            couples for generations. We perform her sacred abhishekam at the temple on your
            behalf, in two stages: one to invoke the blessing of a child, and one to protect
            the pregnancy through to a safe delivery.
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
                  <p className="mb-5 leading-relaxed text-grey-60">{s.body}</p>

                  <p className="mb-5 text-sm text-grey-50">
                    You&apos;ll receive a video and photos of the abhishekam performed in your
                    name, and the blessed {s.key === "ghee" ? "ghee" : "oil"} prasadam
                    delivered to your home.
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

      {/* Reassurance / close */}
      <section className="bg-warm-50 py-14">
        <div className="content-container max-w-2xl mx-auto text-center">
          <h2 className="mb-3 text-2xl font-bold text-grey-90">
            Performed at the temple, on your behalf
          </h2>
          <p className="mb-6 leading-relaxed text-grey-60">
            Both poojas are performed by temple priests at the Garbarakshambigai temple.
            Distance is no barrier — the blessing travels to you. Many couples begin with the
            ghee abhishekam and return for the oil once their pregnancy is confirmed.
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
