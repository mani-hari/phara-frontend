import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { parseDescription, toSections, type DescBlock, type DescSection } from "@lib/util/description-blocks"
import {
  BundleCard,
  BundleItemToggle,
  BundleMobileBar,
  BundleProvider,
  type PricedBundleItem,
} from "@modules/products/components/bundle-checklist"

// "Spread" layout for a Pooja Bundle: rich content on the left (one story section per bundled pooja,
// photos spread through the scroll), the booking card fixed on the right while you read, and a bottom
// bar on mobile. Reads only standard product fields (title, description, images) plus the bundle config.

function Blocks({ blocks }: { blocks: DescBlock[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
            {b.kind === "para" || b.kind === "heading" ? b.text : ""}
          </p>
        )
      })}
    </div>
  )
}

function Photo({ src, alt, height = 420, priority = false }: { src: string; alt: string; height?: number; priority?: boolean }) {
  return (
    <div style={{ position: "relative", height, borderRadius: 14, overflow: "hidden", background: "var(--paper-2)" }}>
      <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 760px" priority={priority} />
    </div>
  )
}

function GeneralSection({ section }: { section: DescSection }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {section.heading && (
        <h2 className="ph-h3" style={{ margin: 0 }}>
          {section.heading}
        </h2>
      )}
      <Blocks blocks={section.blocks} />
    </section>
  )
}

function ItemSection({ item, section }: { item: PricedBundleItem; section?: DescSection }) {
  return (
    <article
      id={`pooja-${item.handle}`}
      style={{ border: "1px solid var(--ink-line)", borderRadius: 16, overflow: "hidden", background: "#fff", scrollMarginTop: 90 }}
    >
      {item.image && (
        <div style={{ position: "relative", height: 300, background: "var(--paper-2)" }}>
          <Image src={item.image} alt={item.label} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 760px" />
        </div>
      )}
      <div style={{ padding: "22px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        <h3 className="ph-h3" style={{ margin: 0 }}>
          {section?.heading || item.label}
        </h3>
        {section && <Blocks blocks={section.blocks} />}
        <div>
          <BundleItemToggle variantId={item.variantId} />
        </div>
      </div>
    </article>
  )
}

export default function BundleSpread({
  product,
  items,
  description,
  gallery,
}: {
  product: HttpTypes.StoreProduct
  items: PricedBundleItem[]
  description: string | null | undefined
  gallery: string[]
}) {
  const sections = toSections(parseDescription(description))
  const intro = sections.find((s) => s.heading === null)
  const itemHeadings = new Set(items.map((i) => i.section).filter(Boolean) as string[])
  const named = sections.filter((s) => s.heading !== null)
  const firstItemIdx = named.findIndex((s) => itemHeadings.has(s.heading as string))
  const before = named.filter((s, i) => !itemHeadings.has(s.heading as string) && (firstItemIdx < 0 || i < firstItemIdx))
  const after = named.filter((s, i) => !itemHeadings.has(s.heading as string) && firstItemIdx >= 0 && i > firstItemIdx)
  const sectionFor = (item: PricedBundleItem) => named.find((s) => s.heading === item.section)

  // Photos spread through the page: hero first, then one between groups of content.
  const [hero, ...breaks] = gallery
  let b = 0
  const nextBreak = () => (b < breaks.length ? breaks[b++] : null)

  return (
    <BundleProvider items={items}>
      <section className="content-container" style={{ paddingTop: 24, paddingBottom: 96 }} data-testid="product-container">
        <style>{`
          .bundle-spread { display: grid; grid-template-columns: 1fr; gap: 40px; }
          .bundle-aside { display: none; }
          .bundle-mobile-bar {
            position: fixed; left: 0; right: 0; bottom: 0; z-index: 40;
            display: flex; align-items: center; gap: 12px; padding: 12px 16px;
            background: var(--paper); border-top: 1px solid var(--ink-line);
            box-shadow: 0 -6px 20px rgba(0,0,0,0.06);
          }
          @media (max-width: 1023px) {
            body:has(.bundle-mobile-bar) .ph-ask-pill { bottom: 84px !important; }
          }
          @media (min-width: 1024px) {
            .bundle-spread { grid-template-columns: minmax(0, 1fr) 380px; gap: 56px; align-items: start; }
            .bundle-aside { display: block; position: sticky; top: 88px; }
            .bundle-mobile-bar { display: none; }
          }
        `}</style>

        <div className="bundle-spread">
          {/* LEFT: the story */}
          <div style={{ display: "flex", flexDirection: "column", gap: 36, minWidth: 0 }}>
            <header style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <h1 className="ph-h1" style={{ margin: 0 }} data-testid="product-title">
                {product.title}
              </h1>
              {intro && <Blocks blocks={intro.blocks} />}
            </header>

            {hero && <Photo src={hero} alt={product.title} height={460} priority />}

            {before.map((s, i) => (
              <GeneralSection key={`b${i}`} section={s} />
            ))}

            {items.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div>
                  <p className="ph-eyebrow ph-eyebrow-gold" style={{ margin: "0 0 6px" }}>
                    Choose your poojas
                  </p>
                  <h2 className="ph-h2" style={{ margin: 0 }}>
                    Read about each, then add the ones you want
                  </h2>
                </div>
                {items.map((item, i) => {
                  const photo = i % 2 === 1 && i < items.length - 1 ? nextBreak() : null
                  return (
                    <div key={item.variantId} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                      <ItemSection item={item} section={sectionFor(item)} />
                      {photo && <Photo src={photo} alt={product.title} height={320} />}
                    </div>
                  )
                })}
              </div>
            )}

            {after.map((s, i) => {
              const photo = nextBreak()
              return (
                <div key={`a${i}`} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  {photo && <Photo src={photo} alt={product.title} height={320} />}
                  <GeneralSection section={s} />
                </div>
              )
            })}
          </div>

          {/* RIGHT: booking card, fixed while scrolling (desktop) */}
          <aside className="bundle-aside">
            <div style={{ border: "1px solid var(--ink-line)", borderRadius: 14, overflow: "hidden", background: "var(--paper)" }}>
              <div style={{ padding: "12px 20px", background: "var(--sindoor-soft, var(--paper-2))", borderBottom: "1px solid var(--ink-line)" }}>
                <p className="ph-label" style={{ margin: 0 }}>
                  ● Book this bundle
                </p>
              </div>
              <div style={{ padding: 20 }}>
                <BundleCard />
                <p className="ph-body-sm" style={{ margin: "14px 0 0", color: "var(--ink-3)", textAlign: "center" }}>
                  Devotee details (name, nakshatra, gothram) are added in the cart
                </p>
              </div>
            </div>
          </aside>
        </div>
        <BundleMobileBar />
      </section>
    </BundleProvider>
  )
}

/** Server loader: prices the bundle items for the region, then renders the spread. */
export async function BundleSpreadSection(props: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  description: string | null | undefined
  gallery: string[]
}) {
  const { getPricedBundle } = await import("@modules/products/components/bundle-checklist/wrapper")
  const items = await getPricedBundle(props.product.handle || "", props.region)
  return <BundleSpread product={props.product} items={items} description={props.description} gallery={props.gallery} />
}
