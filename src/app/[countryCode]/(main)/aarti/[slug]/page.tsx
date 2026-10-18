import { Metadata } from "next"
import { notFound } from "next/navigation"
import AartiExperience from "@modules/aarti/components/aarti-experience"
import { aartiEnabled, getDeity } from "@lib/data/aarti"

// Digital Aarti for one deity. LOCAL-ONLY until approved: 404 unless NEXT_PUBLIC_AARTI_EXP=1.
export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params
  const d = getDeity(slug)
  return d ? { title: `${d.title}: join the aarti online`, description: d.tagline, robots: { index: false } } : {}
}

export default async function AartiPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const deity = getDeity(slug)
  if (!aartiEnabled() || !deity) notFound()
  return <AartiExperience deity={deity} />
}
