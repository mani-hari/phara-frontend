import { ReactNode } from "react"
import { HttpTypes } from "@medusajs/types"
import LanguageSwitcher from "@modules/common/components/language-switcher"
import SafeImage from "@modules/common/components/safe-image"
import LiteYouTube from "@modules/common/components/lite-youtube"
import { MobileCollapse, MobileGallery } from "@modules/products/components/spread-mobile"
import { INTL_PRASAD_SHIPPING_USD, showsIntlShipping } from "@lib/shipping-estimate"
import type { LangCode } from "@lib/i18n/languages"
import { parseDescription, toSections, type DescBlock, type DescSection } from "@lib/util/description-blocks"
import {
  BundleCard,
  BundleItemToggle,
  BundleMobileBar,
  BundleProvider,
  type PricedBundleItem,
} from "@modules/products/components/bundle-checklist"

// "Product page spread": the story on the left (title, language switcher, description sections with the
// gallery photos spread through them), the booking card fixed on the right while you read. On mobile the
// card sits under the title. Pooja Bundles add one section per bundled pooja with its own Add button and a
// bottom bar on mobile. Reads only standard product fields (title, description, images) plus bundle config.

type GalleryEntry = { url: string; alt: string }

export function Blocks({ blocks, lang }: { blocks: DescBlock[]; lang?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }} lang={lang}>
      {blocks.map((b, i) => {
        if (b.kind === "sloka")
          return (
            <blockquote
              key={i}
              style={{ margin: "4px 0", padding: "14px 18px", borderLeft: "3px solid var(--sindoor)", background: "var(--paper-2)", borderRadius: 8 }}
            >
              {b.lines.map((l, k) => (
                <p key={k} className="ph-body" style={{ margin: 0, lineHeight: 1.7, color: "var(--ink-2)", fontStyle: l.startsWith("(") ? "normal" : "italic" }}>
                  {l}
                </p>
              ))}
            </blockquote>
          )
        if (b.kind === "bullet")
          return (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: "var(--sindoor)", marginTop: 9, flexShrink: 0, fontSize: 9 }}>●</span>
              <p className="ph-body" style={{ margin: 0, lineHeight: 1.75, color: "var(--ink-2)" }}>
                {b.text}
              </p>
            </div>
          )
        return (
          <p key={i} className="ph-body" style={{ margin: 0, lineHeight: 1.75, color: "var(--ink-2)" }}>
            {b.text}
          </p>
        )
      })}
    </div>
  )
}

export function Section({ section, lang }: { section: DescSection; lang?: string }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {section.heading && (
        <h2 className="ph-h3" style={{ margin: 0 }} lang={lang}>
          {section.heading}
        </h2>
      )}
      <Blocks blocks={section.blocks} lang={lang} />
    </section>
  )
}

function ItemSection({ item, section, lang }: { item: PricedBundleItem; section?: DescSection; lang?: string }) {
  return (
    <article
      id={`pooja-${item.handle}`}
      style={{ border: "1px solid var(--ink-line)", borderRadius: 16, overflow: "hidden", background: "#fff", scrollMarginTop: 90 }}
    >
      {item.image && <SafeImage src={item.image} alt={item.label} radius={0} />}
      <div style={{ padding: "22px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        <h3 className="ph-h3" style={{ margin: 0 }} lang={lang}>
          {section?.heading || item.label}
        </h3>
        {section && <Blocks blocks={section.blocks} lang={lang} />}
        <div>
          <BundleItemToggle variantId={item.variantId} />
        </div>
      </div>
    </article>
  )
}

export function VideoEmbed({ video }: { video: { youtubeId: string; title: string } }) {
  return <LiteYouTube id={video.youtubeId} title={video.title} />
}

export function Review({ review }: { review: { text: string; author: string } }) {
  return (
    <div className="ph-card" style={{ padding: 20, background: "var(--paper-2)" }}>
      <p className="ph-label" style={{ margin: "0 0 8px", color: "var(--ink-4)" }}>
        Devotee review
      </p>
      <div style={{ color: "var(--gold)", letterSpacing: 2 }}>★★★★★</div>
      <p className="ph-body-sm" style={{ marginTop: 10, marginBottom: 0, lineHeight: 1.65, fontSize: 14 }}>
        {review.text}
      </p>
      <p className="ph-label" style={{ marginTop: 10, marginBottom: 0, color: "var(--ink-3)" }}>
        — {review.author}
      </p>
    </div>
  )
}

export function BookingCard({ heading, children, note }: { heading: string; children: ReactNode; note: string }) {
  return (
    <div style={{ border: "1px solid var(--ink-line)", borderRadius: 14, overflow: "hidden", background: "var(--paper)", boxShadow: "0 2px 20px rgba(26,20,16,0.07)" }}>
      <div style={{ padding: "14px 20px", background: "rgba(182,68,46,0.04)", borderBottom: "1px solid var(--ink-line)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--sindoor)", flexShrink: 0 }} />
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", margin: 0 }}>{heading}</p>
      </div>
      <div style={{ padding: 20 }}>
        {children}
        <p className="ph-body-sm" style={{ color: "var(--ink-4)", textAlign: "center", marginTop: 12, marginBottom: 0 }}>
          {note}
        </p>
      </div>
    </div>
  )
}

export default function ProductSpread({
  product,
  title,
  lang = "en",
  hintedLang,
  description,
  gallery,
  actions,
  bundleItems,
  review,
  video,
  currency,
  isPrasad = false,
}: {
  product: HttpTypes.StoreProduct
  /** Visitor's region currency: decides the delivery note (free in India, estimate elsewhere). */
  currency?: string
  /** Prasadam (a physical item) rather than a pooja: changes the card wording. */
  isPrasad?: boolean
  title: string
  lang?: LangCode
  hintedLang?: LangCode | null
  description: string | null | undefined
  gallery: GalleryEntry[]
  /** Booking controls for a normal product (variant picker, price, add to cart). */
  actions?: ReactNode
  /** Present for a Pooja Bundle: the priced items, shown as story sections plus the checklist card. */
  bundleItems?: PricedBundleItem[]
  review?: { text: string; author: string }
  video?: { youtubeId: string; title: string } | null
}) {
  const langAttr = lang !== "en" ? lang : undefined
  const isBundle = !!bundleItems
  const items = bundleItems || []
  const sections = toSections(parseDescription(description))
  const intro = sections.find((s) => s.heading === null)
  const named = sections.filter((s) => s.heading !== null)
  const itemHeadings = new Set(items.map((i) => i.section).filter(Boolean) as string[])
  const isItem = (s: DescSection) => itemHeadings.has(s.heading as string)
  const firstItemIdx = named.findIndex(isItem)
  const before = named.filter((s, i) => !isItem(s) && (firstItemIdx < 0 || i < firstItemIdx))
  const after = named.filter((s, i) => !isItem(s) && firstItemIdx >= 0 && i > firstItemIdx)
  const sectionFor = (item: PricedBundleItem) => named.find((s) => s.heading === item.section)

  // Photos spread through the story: hero first, then one after each section; any left over at the end.
  const [hero, ...rest] = gallery
  let p = 0
  const nextPhoto = () => (p < rest.length ? rest[p++] : null)
  const photo = (e: GalleryEntry | null) =>
    e ? (
      <div className="pspread-photo-desktop">
        <SafeImage src={e.url} alt={e.alt} />
      </div>
    ) : null
  const deliveryNote = showsIntlShipping(currency)
    ? `Prasadam delivery outside India: about $${INTL_PRASAD_SHIPPING_USD}, added at checkout (free if donated at the temple).`
    : currency
      ? "Free prasadam delivery within India."
      : ""

  const card = isBundle ? (
    <BookingCard heading="Book this bundle" note={[deliveryNote, "Names and star can be added in the cart or sent later on WhatsApp."].filter(Boolean).join(" ")}>
      <BundleCard />
    </BookingCard>
  ) : (
    <BookingCard
      heading={isPrasad ? "Order this prasadam" : "Book this ritual"}
      note={[deliveryNote, isPrasad ? "" : "Names and star can be added in the cart or sent later on WhatsApp."].filter(Boolean).join(" ")}
    >
      {actions}
    </BookingCard>
  )

  const body = (
    <section className="content-container" style={{ paddingTop: 24, paddingBottom: isBundle ? 96 : 64 }} data-testid="product-container">

      <div className={`pspread${isBundle ? " pspread-bundle" : ""}`}>
        <header className="pspread-head">
          <h1 className="ph-h1" style={{ margin: 0 }} data-testid="product-title" lang={langAttr}>
            {title}
          </h1>
          <LanguageSwitcher hintedLang={hintedLang} />
          {intro && <Blocks blocks={intro.blocks} lang={langAttr} />}
        </header>

        <div className="pspread-hero">
          <MobileGallery photos={gallery} />
          {hero && (
            <div className="pspread-hero-desktop">
              <SafeImage src={hero.url} alt={hero.alt} priority />
            </div>
          )}
        </div>

        <aside className="pspread-card">{card}</aside>

        <div className="pspread-story" id="about-ritual">

          {before.length > 0 && (
            <MobileCollapse>
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {before.map((s, i) => (
                  <div key={`b${i}`} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                    <Section section={s} lang={langAttr} />
                    {i === 0 && video && <VideoEmbed video={video} />}
                    {photo(nextPhoto())}
                  </div>
                ))}
              </div>
            </MobileCollapse>
          )}
          {before.length === 0 && video && <VideoEmbed video={video} />}

          {isBundle && items.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <p className="ph-eyebrow ph-eyebrow-gold" style={{ margin: "0 0 6px" }}>
                  Choose your poojas
                </p>
                <h2 className="ph-h2" style={{ margin: 0 }}>
                  Read about each, then add the ones you want
                </h2>
              </div>
              {items.map((item, i) => (
                <div key={item.variantId} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <ItemSection item={item} section={sectionFor(item)} lang={langAttr} />
                  {i % 2 === 1 && i < items.length - 1 ? photo(nextPhoto()) : null}
                </div>
              ))}
            </div>
          )}

          {after.length > 0 && (
            <MobileCollapse>
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {after.map((s, i) => (
                  <div key={`a${i}`} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                    <Section section={s} lang={langAttr} />
                    {photo(nextPhoto())}
                  </div>
                ))}
              </div>
            </MobileCollapse>
          )}

          {p < rest.length && (
            <div className="pspread-photo-desktop" style={{ display: undefined }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {rest.slice(p).map((e, i) => (
                <SafeImage key={`${e.url}-${i}`} src={e.url} alt={e.alt} radius={10} sizes="380px" />
              ))}
              </div>
            </div>
          )}

          {review && <Review review={review} />}
        </div>
      </div>
      {isBundle && <BundleMobileBar />}
    </section>
  )

  return isBundle ? <BundleProvider items={items}>{body}</BundleProvider> : body
}

/** Server loader for a Pooja Bundle: prices its items for the region, then renders the spread. */
export async function BundleProductSpread(
  props: Omit<Parameters<typeof ProductSpread>[0], "bundleItems" | "actions"> & { region: HttpTypes.StoreRegion }
) {
  const { getPricedBundle } = await import("@modules/products/components/bundle-checklist/wrapper")
  const { region, ...rest } = props
  const bundleItems = await getPricedBundle(props.product.handle || "", region)
  return <ProductSpread {...rest} bundleItems={bundleItems} />
}
