import { Metadata } from "next"
import { notFound } from "next/navigation"
import AartiExperience from "@modules/aarti/components/aarti-experience"
import { aartiEnabled, getDeity } from "@lib/data/aarti"

// Digital Aarti for one deity. Live since 18 Oct 2026; hidden again if NEXT_PUBLIC_AARTI_EXP is unset.
export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params
  const d = getDeity(slug)
  if (!d) return {}
  // Link previews (WhatsApp etc.): the deity's own painting, from scripts/og-images.mjs
  const image = { url: `/aarti/og-${d.slug}.jpg`, width: 1200, height: 630, alt: d.title }
  return {
    title: `${d.title}: join the aarti online`,
    description: d.tagline,
    alternates: { canonical: `/aarti/${d.slug}` },
    openGraph: { title: `${d.title} · Digital Aarti`, description: `${d.tagline} Light a diya, offer flowers and place your prayer.`, url: `/aarti/${d.slug}`, images: [image] },
    twitter: { card: "summary_large_image", title: `${d.title} · Digital Aarti`, description: d.tagline, images: [image.url] },
  }
}

export default async function AartiPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const deity = getDeity(slug)
  if (!aartiEnabled() || !deity) notFound()
  return <AartiExperience deity={deity} />
}
