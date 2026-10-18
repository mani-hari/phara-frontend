import { ReactNode } from "react"
import LanguageSwitcher from "@modules/common/components/language-switcher"
import BackLink from "@modules/products/components/back-link"
import SafeImage from "@modules/common/components/safe-image"
import { MobileCollapse } from "@modules/products/components/spread-mobile"
import type { LangCode } from "@lib/i18n/languages"
import { parseDescription, toSections, type DescSection } from "@lib/util/description-blocks"
import { INTL_PRASAD_SHIPPING_USD, showsIntlShipping } from "@lib/shipping-estimate"
import type { LandingConfig } from "@lib/data/landing-products"
import { Blocks, BookingCard, Review, Section } from "./product-spread"

// Special landing page for top-selling prasadam (Garbharakshambigai ghee/oil): one column, written for a
// visitor arriving from Google who knows the temple. Order: title → hero → temple (short) → worldwide
// delivery promise → what's in the parcel (photos) → how to use → book → more photos → review → details.

type GalleryEntry = { url: string; alt: string }

const find = (sections: DescSection[], re: RegExp) => sections.find((s) => s.heading && re.test(s.heading))

function Photo({ e, caption, priority }: { e: GalleryEntry; caption?: string; priority?: boolean }) {
  return (
    <figure style={{ margin: 0 }}>
      <SafeImage src={e.url} alt={e.alt} priority={priority} />
      {caption && (
        <figcaption className="ph-body-sm" style={{ margin: "8px 2px 0", color: "var(--ink-3)", lineHeight: 1.5 }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="ph-h3" style={{ margin: 0 }}>
      {children}
    </h2>
  )
}

export default function LandingSpread({
  title,
  lang = "en",
  hintedLang,
  description,
  gallery,
  actions,
  review,
  currency,
  config,
}: {
  title: string
  lang?: LangCode
  hintedLang?: LangCode | null
  description: string | null | undefined
  gallery: GalleryEntry[]
  actions: ReactNode
  review?: { text: string; author: string }
  currency?: string
  config: LandingConfig
}) {
  const langAttr = lang !== "en" ? lang : undefined
  const sections = toSections(parseDescription(description))
  const significance =
    find(sections, /significance/i) || find(sections, /^about /i) || sections.find((s) => s.heading === null) || sections.find((s) => s.heading)
  const howToUse = find(sections, /how to use/i)
  const whoFor = find(sections, /who is it for/i)
  const history = find(sections, /historical/i)
  const howPerformed = find(sections, /how your pooja|how .*performed/i)
  const altNames = find(sections, /alternative names/i)
  const shown = new Set([significance, howToUse, whoFor, history, howPerformed, altNames].filter(Boolean))
  const extra = sections.filter((s) => s.heading && !shown.has(s))

  // Significance: lead with the first paragraph only; shipping lines in it are covered by the delivery block.
  const sigParas = (significance?.blocks || []).filter((b) => b.kind === "para" && !/\bshipping\b|\bwhatsapp\b/i.test(b.text))
  const sigLead = sigParas[0]

  const urls = gallery.map((g) => g.url)
  const byPattern = (re: RegExp) => gallery.find((g) => re.test(g.url)) || null
  const hero = gallery[0]
  const pack = byPattern(/packag/i)
  const guide = byPattern(/booklet|guide/i)
  const rest = gallery.slice(1).filter((g) => g !== pack && g !== guide)
  void urls

  const intl = showsIntlShipping(currency)
  const deliveryLine = intl
    ? `Delivered worldwide with tracking: about $${INTL_PRASAD_SHIPPING_USD} to your country, added at checkout.`
    : "Free delivery anywhere in India, with tracking."

  return (
    <section className="content-container pland-wrap" style={{ paddingTop: 20, paddingBottom: 64 }} data-testid="product-container">
      {/* Phones: one column with the card after "How to use". Desktop: story left, card frozen on the right. */}
      <div className="pland">
        <header className="pland-head" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <BackLink />
          <h1 className="ph-h1" style={{ margin: 0 }} data-testid="product-title" lang={langAttr}>
            {title}
          </h1>
          {config.chips?.length ? (
            <div className="ph-landing-chips">
              {config.chips.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
          ) : null}
          <LanguageSwitcher hintedLang={hintedLang} />
        </header>

        <div className="pland-top">
        {hero && <Photo e={hero} priority />}

        {sigLead && (
          <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <H2>The temple and its blessing</H2>
            <p className="ph-body" style={{ margin: 0, lineHeight: 1.75, color: "var(--ink-2)" }} lang={langAttr}>
              {sigLead.kind === "para" ? sigLead.text : ""}
            </p>
          </section>
        )}


        {(pack || guide || config.receive.length > 0) && (
          <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <H2>{config.receiveHeading || "What you receive"}</H2>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {config.receive.map((r) => (
                <li key={r} className="ph-body" style={{ display: "flex", gap: 10, color: "var(--ink-2)" }}>
                  <span style={{ color: "var(--sindoor)", fontWeight: 700 }}>✓</span>
                  {r}
                </li>
              ))}
            </ul>
            {pack && <Photo e={pack} caption="Your parcel: the sealed prasadam bottle and temple prasadam, packed for safe travel." />}
            {guide && <Photo e={guide} caption="The detailed usage guide, with the mantras to recite, comes with every order." />}
          </section>
        )}

        {(howToUse || whoFor) && (
          <section style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {whoFor && <Section section={{ heading: "Who it is for", blocks: whoFor.blocks }} lang={langAttr} />}
            {howToUse && <Section section={{ heading: "How to use it", blocks: howToUse.blocks }} lang={langAttr} />}
          </section>
        )}

        </div>

        <aside id="book" className="pland-card" style={{ scrollMarginTop: 80 }}>
          <BookingCard heading={config.kind === "pooja" ? "Book this pooja" : "Order this prasadam"} note={config.kind === "pooja" ? "Names and star can be added in the cart or sent later on WhatsApp." : deliveryLine}>
            {config.quantityTip && (
              <p className="ph-body-sm" style={{ margin: "0 0 12px", color: "var(--ink-2)", background: "var(--paper-2)", borderRadius: 8, padding: "8px 10px" }}>
                💡 {config.quantityTip}
              </p>
            )}
            {actions}
          </BookingCard>
        </aside>

        <div className="pland-bottom">
        {rest.map((e) => (
          <Photo key={e.url} e={e} />
        ))}

        {review && <Review review={review} />}

        {/* "How your pooja is performed" is intentionally not shown here: the Important note covers it. */}
        {(history || altNames || extra.length > 0) && (
          <MobileCollapse label="More about the temple and our service">
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {history && <Section section={history} lang={langAttr} />}
              {extra.map((s, i) => (
                <Section key={i} section={s} lang={langAttr} />
              ))}
              {altNames && <Section section={altNames} lang={langAttr} />}
              {significance && sigParas.length > 1 && <Blocks blocks={sigParas.slice(1)} lang={langAttr} />}
            </div>
          </MobileCollapse>
        )}
        </div>
      </div>
    </section>
  )
}
