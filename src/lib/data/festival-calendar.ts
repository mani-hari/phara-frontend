// Festival calendar shown at /calendar. Dates verified on drikpanchang.com (Chennai) —
// see content/blog-plan/festival-calendar-2026-27.md for sources. Lunar dates move every year:
// add next year's dates here (with a source in that file) before these run out.
export type Festival = {
  name: string
  start: string // YYYY-MM-DD (IST)
  end?: string // inclusive, for multi-day festivals
  about: string
  bestFor?: string
  products?: string[] // product handles to suggest
}

export const FESTIVALS: Festival[] = [
  {
    name: "Navratri",
    start: "2026-10-11",
    end: "2026-10-20",
    about: "Nine nights of the Goddess as Durga, Lakshmi and Saraswati. Saraswati Puja 17 Oct, Durga Ashtami and Maha Navami 19 Oct.",
    bestFor: "Strength, prosperity and learning for the family",
    products: ["navratri-poojas-online", "mantra-chanting-of-700-verses-of-durga-saptashati"],
  },
  {
    name: "Vijayadashami and Ayudha Pooja",
    start: "2026-10-20",
    about: "The victorious tenth day: the most auspicious day of the year to begin something new: learning, a business, a home.",
    bestFor: "New beginnings, children's first lessons",
    products: ["saraswati-homam", "navagraha-homam"],
  },
  {
    name: "Dhanteras (Dhanvantari Trayodashi)",
    start: "2026-11-06",
    about: "The day of Lord Dhanvantari, the divine healer, and of welcoming prosperity into the home before Deepavali.",
    bestFor: "Health and prosperity",
    products: ["dhanwantari-homam", "diwali-puja"],
  },
  {
    name: "Deepavali and Lakshmi Puja",
    start: "2026-11-08",
    about: "The festival of lights. Lamps are lit and Goddess Lakshmi is worshipped for abundance and harmony at home.",
    bestFor: "Wealth, harmony, a fresh start",
    products: ["diwali-puja"],
  },
  {
    name: "Kanda Sashti",
    start: "2026-11-10",
    end: "2026-11-15",
    about: "Six days of devotion to Lord Murugan, ending with Soorasamharam on 15 Nov, the victory of good over evil.",
    bestFor: "Courage, removing obstacles",
    products: ["palani", "palani-panchamritham"],
  },
  {
    name: "Karthigai Deepam",
    start: "2026-11-24",
    about: "Rows of lamps are lit at dusk in honour of Lord Shiva as an infinite column of light.",
    bestFor: "Light, clarity, family wellbeing",
  },
  {
    name: "Vaikunta Ekadashi",
    start: "2026-12-20",
    about: "The day the gates of Vaikuntham are said to open. Devotees fast and pray to Lord Vishnu.",
    bestFor: "Spiritual merit, protection",
    products: ["sudarsana-homam"],
  },
  {
    name: "Thai Pongal",
    start: "2027-01-15",
    about: "The harvest festival of thanksgiving to the Sun God, celebrated with the first rice of the season.",
    bestFor: "Gratitude, abundance",
  },
  {
    name: "Thaipusam",
    start: "2027-01-22",
    about: "A day of devotion to Lord Murugan, marking the Goddess giving him the Vel (spear).",
    bestFor: "Strength, removing obstacles",
    products: ["palani"],
  },
]
