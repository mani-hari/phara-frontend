import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { DEITIES, aartiEnabled } from "@lib/data/aarti"
import { todayIst } from "@lib/util/blog-publish"

// Digital Aarti invitation on the home page, right under the seasonal (Navratri) card and above "Most ordered".
// One painting only (the first deity, Maa Durga during Navaratri), in a small card that rises out of the
// banner (owner, 18 Oct). Hidden while the aarti is switched off.
export default function AartiStrip() {
  if (!aartiEnabled()) return null
  const d = DEITIES[0]
  // The festival line retires itself after the Vijayadashami week.
  const label = todayIst() <= "2026-10-27" ? "New · just launched for Vijayadashami" : "New"
  return (
    <LocalizedClientLink href="/aarti" className="ph-card ph-lift home-aarti-banner">
      <span className="home-aarti-pop" aria-hidden>
        <Image src={`/aarti/${d.slug}-bg.webp`} alt="" fill sizes="120px" className="object-cover" style={d.theme.bgPos ? { objectPosition: d.theme.bgPos } : undefined} />
        <Image src={`/aarti/${d.slug}-deity.webp`} alt="" fill sizes="120px" className="object-contain object-bottom" style={{ padding: "12% 6% 4%" }} />
      </span>
      <span className="home-aarti-text">
        <span className="home-aarti-new">{label}</span>
        <span className="home-aarti-title">Digital Aarti: light a lamp for {d.name}</span>
        <span className="home-aarti-sub">Join the aarti from wherever you are · {DEITIES.slice(1).map((x) => x.name).join(" · ")}</span>
      </span>
      <span className="home-aarti-go" aria-hidden>→</span>
    </LocalizedClientLink>
  )
}
