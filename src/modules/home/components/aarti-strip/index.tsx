import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { DEITIES, aartiEnabled } from "@lib/data/aarti"
import { todayIst } from "@lib/util/blog-publish"

// A slim invitation to Digital Aarti inside the home "Video snippets" section (owner: not a banner, nothing that
// competes for attention). Same paintings as the /aarti cover. Hidden while the aarti is behind its flag.
export default function AartiStrip() {
  if (!aartiEnabled()) return null
  // The festival line retires itself after the Vijayadashami week.
  const label = todayIst() <= "2026-10-27" ? "New · just launched for Vijayadashami" : "New"
  return (
    <LocalizedClientLink href="/aarti" className="ph-card ph-lift home-aarti-strip">
      <span className="home-aarti-thumbs" aria-hidden>
        {DEITIES.slice(0, 3).map((d) => (
          <span key={d.slug} className="home-aarti-thumb">
            <Image src={`/aarti/${d.slug}-bg.webp`} alt="" fill sizes="64px" className="object-cover" />
            <Image src={`/aarti/${d.slug}-deity.webp`} alt="" fill sizes="64px" className="object-contain object-bottom" style={{ padding: "14% 8% 6%" }} />
          </span>
        ))}
      </span>
      <span className="home-aarti-text">
        <span className="home-aarti-new">{label}</span>
        <span className="home-aarti-title">Digital Aarti: join the aarti from wherever you are</span>
        <span className="home-aarti-sub">{DEITIES.map((d) => d.name).join(" · ")}</span>
      </span>
      <span className="home-aarti-go" aria-hidden>→</span>
    </LocalizedClientLink>
  )
}
