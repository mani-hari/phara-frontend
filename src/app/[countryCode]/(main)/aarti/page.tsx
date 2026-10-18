import { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { DEITIES, aartiEnabled } from "@lib/data/aarti"

// Digital Aarti index. LOCAL-ONLY until approved: 404 unless NEXT_PUBLIC_AARTI_EXP=1.
export const metadata: Metadata = {
  title: "Digital Aarti: join the aarti from wherever you are",
  description: "Ring the bell, offer flowers and wave the aarti for Shirdi Sai Baba and Mahalakshmi.",
  robots: { index: false },
}

export default function AartiIndex() {
  if (!aartiEnabled()) notFound()
  return (
    <section className="content-container" style={{ paddingTop: 28, paddingBottom: 64, maxWidth: 960 }}>
      <p className="ph-eyebrow ph-eyebrow-gold" style={{ margin: "0 0 8px" }}>
        Digital Aarti
      </p>
      <h1 className="ph-h1" style={{ margin: 0 }}>
        Join the aarti, from wherever you are
      </h1>
      <p className="ph-body" style={{ margin: "10px 0 24px", color: "var(--ink-3)" }}>
        Ring the bell, offer flowers, wave the aarti and break a coconut. A few quiet minutes of darshan, any time.
      </p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {DEITIES.map((d) => (
          <li key={d.slug}>
            <LocalizedClientLink href={`/aarti/${d.slug}`} className="ph-card ph-lift" style={{ display: "block", overflow: "hidden" }}>
              <div style={{ position: "relative", aspectRatio: "3 / 4", background: "#1a0f08" }}>
                <Image src={`/aarti/${d.slug}-bg.webp`} alt="" fill sizes="320px" className="object-cover" />
                <Image src={`/aarti/${d.slug}-deity.webp`} alt={d.name} fill sizes="320px" className="object-contain object-bottom" style={{ padding: "14% 8% 6%" }} />
              </div>
              <div style={{ padding: "14px 16px 16px" }}>
                <h2 className="ph-h4" style={{ margin: 0 }}>{d.title}</h2>
                <p className="ph-body-sm" style={{ margin: "4px 0 0", color: "var(--ink-3)" }}>{d.tagline}</p>
              </div>
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </section>
  )
}
