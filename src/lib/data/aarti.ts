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
  // Aarti recording played during darshan (public/aarti/audio/). Owner will replace the test tracks with
  // original recordings before promoting the feature. Without one, a code-made bell/manjira rhythm plays.
  chantSrc?: string
  // Look: halo/glow tint and the petals offered (CSS colours) — kept per deity for a fitting feel.
  theme: { halo: string; petals: string[]; coins?: boolean; bgPos?: string /* CSS object-position for the sanctum; default centre */ }
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
    chantSrc: "/aarti/audio/shirdi-sai-baba.mp3",
    theme: { halo: "255,214,140", petals: ["#f6a623", "#f9c74f", "#e8590c", "#b5172e", "#d62839"] }, // marigold + red rose
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
    chantSrc: "/aarti/audio/mahalakshmi.mp3",
    theme: { halo: "255,206,150", petals: ["#f4a6c0", "#f7c6d7", "#e56b8f", "#b5172e", "#f9c74f"], coins: true }, // lotus + rose + gold
  },
  {
    // Draft for Navaratri / Vijayadashami. No recording yet: plays the temple bells and drone until the owner's
    // own Durga aarti recording is added as chantSrc.
    slug: "durga",
    name: "Maa Durga",
    title: "Navaratri Durga Aarti",
    tagline: "Light a lamp for the Mother on the nights of Navaratri.",
    place: "Navaratri evenings",
    times: [{ name: "Sandhya Aarti", time: "19:00" }],
    prayerLine: "Om Dum Durgayai Namah",
    blessing: "May Maa Durga protect your family, give you courage, and bring victory to every good thing you begin.",
    offerings: [
      { handle: "navratri-poojas-online", label: "Book Navaratri poojas" },
      { handle: "mantra-chanting-of-700-verses-of-durga-saptashati", label: "Durga Saptashati chanting in your name" },
    ],
    accent: "#ffc861",
    theme: { halo: "255,200,140", petals: ["#c1121f", "#e63946", "#9d0208", "#f6a623", "#f9c74f"], bgPos: "50% 88%" }, // red hibiscus + marigold; keep the diyas in view
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
