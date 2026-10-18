// Digital Aarti: one entry per deity. Adding a deity = art in public/aarti/<slug>-bg.webp and
// <slug>-deity.webp (scripts/aarti-images.mjs), plus an entry here. Times are IST (temple local time).
// LOCAL-ONLY until approved: pages 404 unless NEXT_PUBLIC_AARTI_EXP=1 (set in .env.local only).
export type AartiTime = { name: string; time: string /* HH:MM IST */; days?: number[] /* 0=Sun..6=Sat; all days if absent */ }

export type Deity = {
  slug: string
  name: string // "Shirdi Sai Baba"
  title: string // page heading
  tagline: string
  place: string // shown as context, never as an official/affiliated claim
  times: AartiTime[]
  // Short prayer shown at the end. Original wording or public-domain verses only.
  blessing: string
  prayerLine?: string
  // Optional chant recording (our own recording only; leave empty until one exists).
  chantSrc?: string
  // Real-world follow-ups shown after the aarti (product handles).
  offerings: { handle: string; label: string }[]
  accent: string // flame/glow tint
}

export const DEITIES: Deity[] = [
  {
    slug: "shirdi-sai-baba",
    name: "Shirdi Sai Baba",
    title: "Shirdi Sai Baba Aarti",
    tagline: "Join Baba's aarti from wherever you are.",
    place: "Shirdi, Maharashtra",
    times: [
      { name: "Kakad Aarti", time: "04:30" },
      { name: "Madhyan Aarti", time: "12:00" },
      { name: "Dhoop Aarti", time: "18:30" },
      { name: "Shej Aarti", time: "22:00" },
    ],
    prayerLine: "Om Sai Ram",
    blessing: "Shraddha and saburi: faith and patience. May Baba's grace walk with you and your family today.",
    offerings: [
      { handle: "shirdi-sai-baba-udi-prasadham", label: "Receive Baba's udi prasadam at home" },
      { handle: "temple-coconut-breaking-online", label: "Offer a real coconut at the temple" },
    ],
    accent: "#ffb54a",
  },
  {
    slug: "mahalakshmi",
    name: "Mahalakshmi",
    title: "Friday Mahalakshmi Pooja",
    tagline: "Welcome the Goddess of prosperity into your home.",
    place: "Every Friday evening",
    times: [{ name: "Friday Lakshmi Pooja", time: "18:30", days: [5] }],
    prayerLine: "Om Shreem Mahalakshmyai Namah",
    blessing: "May Mahalakshmi bless your home with abundance, harmony and success in all you begin.",
    offerings: [
      { handle: "diwali-puja", label: "Book a Maha Lakshmi Homam" },
      { handle: "temple-coconut-breaking-online", label: "Offer a real coconut at the temple" },
    ],
    accent: "#ffc861",
  },
]

export const getDeity = (slug: string) => DEITIES.find((d) => d.slug === slug)

export const aartiEnabled = () => process.env.NEXT_PUBLIC_AARTI_EXP === "1"

/** Next aarti at or after `now`, computed in IST (UTC+5:30). Returns the slot and its start Date. */
export function nextAarti(d: Deity, now: Date = new Date()): { slot: AartiTime; at: Date } | null {
  const IST = 330 * 60_000
  let best = null as { slot: AartiTime; at: Date } | null
  for (let add = 0; add < 8; add++) {
    for (const slot of d.times) {
      const [h, m] = slot.time.split(":").map(Number)
      const istNow = new Date(now.getTime() + IST)
      const day = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate() + add, h, m))
      if (slot.days && !slot.days.includes(day.getUTCDay())) continue
      const at = new Date(day.getTime() - IST)
      if (at.getTime() + 20 * 60_000 < now.getTime()) continue // still "on" for 20 minutes after it starts
      if (!best || at < best.at) best = { slot, at }
    }
    if (best) break
  }
  return best
}
