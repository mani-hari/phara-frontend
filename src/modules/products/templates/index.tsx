import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import {
  getIntensityDots,
  getProductGalleryImages,
  getMockProductDetailContent,
  howItWorksSteps,
} from "@lib/mock-storefront"
import { Info } from "lucide-react"

import ProductActionsWrapper from "./product-actions-wrapper"
import RelatedProducts from "../components/related-products"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const intensityLabel = (intensity: "Gentle" | "Medium" | "High") => (
  <div className="flex items-center gap-2">
    <span className="text-xs font-medium text-grey-50">Intensity</span>
    <div className="flex items-center gap-1">
      {Array.from({ length: 3 }).map((_, index) => (
        <span
          key={index}
          className={`h-2.5 w-2.5 rounded-full ${
            index < getIntensityDots(intensity) ? "bg-brand-500" : "bg-grey-20"
          }`}
        />
      ))}
    </div>
    <span className="text-xs font-medium text-brand-600">{intensity}</span>
  </div>
)

export default function ProductTemplate({
  product,
  region,
  countryCode,
  images,
}: ProductTemplateProps) {
  const content = getMockProductDetailContent(product)
  const { cheapestPrice } = getProductPrice({ product })
  const gallery = getProductGalleryImages(product)
  const displayGallery = gallery.length
    ? gallery
    : images.slice(0, 3).map((image) => image.url).filter(Boolean)

  return (
    <div className="bg-white">
      <div className="border-t border-brand-200" />

      <section className="content-container flex h-16 items-center justify-between px-20">
        <nav className="flex items-center gap-2 text-xs text-grey-50">
          <Link href={`/${countryCode}`} className="hover:text-brand-700">
            Home
          </Link>
          <span>/</span>
          <Link
            href={
              product.collection?.handle
                ? `/${countryCode}/collections/${product.collection.handle}`
                : `/${countryCode}/store`
            }
            className="hover:text-brand-700"
          >
            {product.collection?.title || "Pujas"}
          </Link>
          <span>/</span>
          <span className="font-semibold text-brand-800">{product.title}</span>
        </nav>
      </section>

      <section className="content-container grid gap-12 px-20 py-10 lg:grid-cols-[minmax(0,1fr)_520px]">
        <div className="space-y-4">
          {displayGallery.length ? (
            displayGallery.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className={`relative overflow-hidden rounded-xl bg-brand-50 ${
                  index === 0 ? "h-[420px]" : "h-[320px]"
                }`}
              >
                <Image
                  src={src}
                  alt={`${product.title} image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 720px"
                  priority={index === 0}
                />
              </div>
            ))
          ) : (
            <div className="flex h-[420px] items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 via-[#f5ede5] to-[#eadfce] p-8 text-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">
                  PariharaOnline
                </p>
                <p className="mt-4 font-display text-4xl leading-tight text-brand-900">
                  {product.title}
                </p>
                <p className="mt-4 text-sm leading-6 text-brand-800/80">
                  Product imagery will appear here as soon as it is available in
                  the Medusa backend.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-wrap gap-2">
            {content.heroTags.map((tag) => (
              <span
                key={tag.label}
                className="rounded px-2.5 py-1 text-[10px] font-medium"
                style={{ backgroundColor: tag.bg, color: tag.color }}
              >
                {tag.label}
              </span>
            ))}
          </div>

          <h1
            className="font-playfair text-[40px] leading-tight text-grey-80"
            data-testid="product-title"
          >
            {product.title}
          </h1>

          <div className="text-[42px] font-bold leading-none text-brand-600">
            {cheapestPrice?.calculated_price || ""}
          </div>

          {intensityLabel(content.intensity)}

          <div className="h-px bg-grey-10" />

          <div>
            <h2 className="text-sm font-semibold text-grey-80">Effective For</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {content.effectiveFor.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-brand-200 bg-[#FAFAF8] px-3 py-1.5 text-xs text-brand-800"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="h-px bg-grey-10" />

          <div>
            <h2 className="text-base font-semibold text-grey-80">
              About This Puja
            </h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-grey-50">
              {content.description}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-grey-80">
              What&apos;s Included
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-grey-50">
              {content.included.map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
          </div>

          <div className="h-px bg-grey-10" />

          <Suspense fallback={<div className="h-[52px] rounded-xl bg-brand-500" />}>
            <ProductActionsWrapper
              id={product.id}
              region={region}
              showPujaDetails={false}
              showPrice={false}
              buttonText="Add to Cart"
              buttonClassName="h-[52px] w-full rounded-xl bg-brand-500 text-base font-semibold text-white hover:bg-brand-600"
            />
          </Suspense>

          <div className="flex items-center justify-center gap-2 text-xs text-grey-50">
            <Info className="h-3.5 w-3.5" />
            Devotee details can be added in the cart before checkout
          </div>

          <div className="h-px bg-grey-10" />

          <div>
            <h2 className="text-sm font-semibold text-grey-80">Devotee Review</h2>
            <div className="mt-3 rounded-xl border border-brand-200 bg-[#FAFAF8] p-5">
              <div className="text-sm tracking-[0.2em] text-brand-500">
                ★★★★★
              </div>
              <p className="mt-3 text-sm italic leading-7 text-grey-50">
                {content.review.text}
              </p>
              <p className="mt-3 text-xs font-semibold text-grey-80">
                — {content.review.author}
              </p>
            </div>
          </div>
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
                <div className="mx-auto mb-5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-bold">
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

      <section className="content-container px-20 py-[72px]">
        <RelatedProducts product={product} countryCode={countryCode} />
      </section>
    </div>
  )
}
