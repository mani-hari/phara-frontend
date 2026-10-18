// Home first screen (approved by the owner 19 Oct 2026). Order: proof line → hero line (with the
// "Vedic homams" explainer) → "What are you praying for?" intent tiles → seasonal banner (from home-v3's
// SEASONAL_CALENDAR / product metadata featured_until) → "Most ordered" top sellers → Ask Parihara chat.
// Tiles link to real products, the browse page filtered by need (?need=), or the calendar.
import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import HeroChatInput from "@modules/home/components/hero-chat-input"
import { getProductPrice } from "@lib/util/get-product-price"
import { ReactNode } from "react"
import TermTip from "@modules/home/components/term-tip"

const TILES: { label: string; sub: string; href: string; image: string }[] = [
  { label: "Trying to conceive", sub: "Garbharakshambigai ghee", href: "/products/garbharakshambika-ghee", image: "garbharakshambika-ghee" },
  { label: "Safe delivery", sub: "Garbharakshambigai oil", href: "/products/garbharakshambika-oil", image: "garbharakshambika-oil" },
  { label: "Rahu-Ketu & doshas", sub: "Pooja at Sri Kalahasti", href: "/products/rahu-ketu-dosha-parihara-pooja-sarpa-dosha-parihara-pooja-at-sri-kalahasti-temple", image: "rahu-ketu-dosha-parihara-pooja-sarpa-dosha-parihara-pooja-at-sri-kalahasti-temple" },
  { label: "Health & healing", sub: "Mrityunjaya, Dhanwantari", href: "/collections/pujas-and-homams?need=health", image: "mrityunjaya-homam" },
  { label: "Marriage", sub: "Swayamvara Parvathi, Kamakshi", href: "/collections/pujas-and-homams?need=marriage", image: "swayamvara-parvathi-homam" },
  { label: "Festivals", sub: "Upcoming auspicious days", href: "/calendar", image: "diwali-puja" },
]

const TOP = [
  "garbharakshambika-ghee",
  "garbharakshambika-oil",
  "rahu-ketu-dosha-parihara-pooja-sarpa-dosha-parihara-pooja-at-sri-kalahasti-temple",
  "shirdi-sai-baba-udi-prasadham",
]

export default function HomeHero({
  products,
  countryCode,
  seasonal,
}: {
  products: HttpTypes.StoreProduct[]
  countryCode: string
  /** The seasonal feature banner (built in home-v3), shown above "Most ordered". */
  seasonal?: ReactNode
}) {
  const byHandle = new Map(products.map((p) => [p.handle, p]))
  const img = (h: string) => byHandle.get(h)?.thumbnail || byHandle.get(h)?.images?.[0]?.url || null
  const price = (p: HttpTypes.StoreProduct) => {
    try {
      return getProductPrice({ product: p }).cheapestPrice?.calculated_price ?? null
    } catch {
      return null
    }
  }
  const top = TOP.map((h) => byHandle.get(h)).filter(Boolean) as HttpTypes.StoreProduct[]

  return (
    <section className="hx">
      <div className="content-container hx-inner">
        <p className="hx-proof">Since 2009 · 4,200+ families · 18 countries</p>
        {/* Hero line chosen by the owner (option 1 of 3). Alternatives considered: "Poojas at renowned temples.
            Vedic homams for every need." / "Sacred poojas and Vedic homams for every need in life". */}
        <h1 className="hx-title">
          Temple poojas and{" "}
          <TermTip title="What is a Vedic homam?" tip="A homam (also called a yagna) is a Vedic fire ritual: priests chant mantras and make offerings into a sacred fire, with a sankalpam (intention) taken in your family's name.">
            Vedic homams
          </TermTip>
          , performed in <span style={{ color: "var(--sindoor)" }}>your family&apos;s name</span>
        </h1>
        <p className="hx-sub">Prasadam delivered to your door, anywhere in the world.</p>

        <h2 className="hx-h2">What are you praying for?</h2>
        <ul className="hx-tiles">
          {TILES.map((t) => (
            <li key={t.label}>
              <LocalizedClientLink href={t.href} className="hx-tile">
                <div className="hx-tile-img">
                  {img(t.image) && <Image src={img(t.image)!} alt="" fill sizes="(max-width: 640px) 50vw, 220px" className="object-cover" />}
                </div>
                <div className="hx-tile-body">
                  <span className="hx-tile-label">{t.label}</span>
                  <span className="hx-tile-sub">{t.sub}</span>
                </div>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>

        {seasonal && <div style={{ marginTop: 28 }}>{seasonal}</div>}

        {top.length > 0 && (
          <>
            <h2 className="hx-h2">Most ordered</h2>
            <ul className="hx-top">
              {top.map((p) => (
                <li key={p.id}>
                  <LocalizedClientLink href={`/products/${p.handle}`} className="hx-top-card">
                    <div className="hx-top-img">
                      {img(p.handle!) && <Image src={img(p.handle!)!} alt={p.title} fill sizes="160px" className="object-cover" />}
                    </div>
                    <span className="hx-top-title">{p.title.split(/\s[-–|/]\s|[(:]/)[0].trim()}</span>
                    {price(p) && <span className="hx-top-price">{price(p)}</span>}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </>
        )}

        <div id="hx-ask" className="hx-ask">
          <h2 className="hx-h2" style={{ marginTop: 0 }}>Not sure which pooja?</h2>
          <p className="hx-sub" style={{ marginBottom: 16 }}>Tell us what&apos;s on your mind and we&apos;ll suggest the right prayer.</p>
          <HeroChatInput countryCode={countryCode} />
        </div>
      </div>
      {/* Sentinel: the Ask overlay watches this to know when the hero has scrolled out */}
      <div id="ask-hero-sentinel" style={{ height: 0 }} aria-hidden />
    </section>
  )
}
