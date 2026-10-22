// Search titles and descriptions for the pages that matter most in Google (top 20 by clicks/impressions,
// Search Console, 3 months to 19 Oct 2026). Only what Google shows changes; page headings and Medusa titles stay.
//
// Rules (owner, 22 Oct 2026):
// - Title ~60 chars max, the words people actually search first ("online booking", "order online", "price").
//   Google shows the site name separately, so titles here are absolute (no " | PariharaOnline" suffix).
// - Description ~155 chars: what it is, where, for whom, price, delivery.
// - Garbarakshambigai ghee/oil are sensitive: devotional wording only (what devotees pray for), never a medical
//   promise ("for conceiving", "guaranteed"). Never imply we are the temple or its official site/tickets.
// - {price} is replaced with the live price ("From ₹1,800"); the phrase is dropped if no price is available.
export type SeoOverride = { title: string; description: string }

export const SEO_OVERRIDES: Record<string, SeoOverride> = {
  "/products/garbharakshambika-ghee": {
    title: "Garbarakshambigai Temple Ghee Prasadam: Order Online",
    description:
      "Ghee prasadam from Sri Garbarakshambigai Temple, Thirukkarugavur, traditionally taken by couples praying for a child. {price}. Delivered worldwide.",
  },
  "/products/garbharakshambika-oil": {
    title: "Garbarakshambigai Temple Oil Prasadam: Order Online",
    description:
      "Garbarakshambigai (கர்ப்பரட்சாம்பிகை) oil prasadam from Thirukkarugavur, used by expectant mothers praying for a safe delivery. {price}. Ships worldwide.",
  },
  "/": {
    title: "PariharaOnline: Temple Poojas & Homams in Your Name",
    description:
      "Temple poojas and Vedic homams performed by our priests with sankalpam in your family's name. Prasadam delivered worldwide. Serving families since 2009.",
  },
  "/pages/poojas-for-pregnancy-and-safe-childbirth": {
    title: "Garbarakshambigai Prasadam for Pregnancy: Ghee & Oil",
    description:
      "Ghee and oil prasadam from Sri Garbarakshambigai Temple, Thirukkarugavur, for couples praying for a child and for a safe delivery. Delivered worldwide.",
  },
  "/products/shirdi-sai-baba-udi-prasadham": {
    title: "Shirdi Sai Baba Udi Prasadam: Order Online",
    description:
      "Sacred udi (vibhuti) prasadam from Shirdi Sai Baba, packed and delivered to your home in India or abroad. {price}. Order online in a few minutes.",
  },
  "/products/rahu-ketu-dosha-parihara-pooja-sarpa-dosha-parihara-pooja-at-sri-kalahasti-temple": {
    title: "Rahu Ketu Pooja at Srikalahasti: Online Booking",
    description:
      "Rahu-Ketu and Kala Sarpa dosha pooja at Sri Kalahasti, performed in your name with sankalpam. {price}. Book online; prasadam sent to your home.",
  },
  "/faq/parihara-remedies": {
    title: "What Is Parihara? Remedies for Doshas Explained",
    description:
      "Parihara means remedy: poojas, homams and temple offerings for planetary doshas and life obstacles. How they work and how to choose the right one.",
  },
  "/products/annadhanam-donate-food-to-homeless-children": {
    title: "Annadhanam Online: Donate Food to Children in Need",
    description:
      "Offer annadhanam, the sacred gift of food, to children in need in your family's name on a birthday, anniversary or remembrance day. {price}. Book online.",
  },
  "/products/temple-coconut-breaking-online": {
    title: "Temple Coconut Breaking Online for New Beginnings",
    description:
      "A coconut broken at the temple in your name before a new job, home, business or journey, to remove obstacles. {price}. Booked online, done for you.",
  },
  "/products/saturn-transit-shani-peyarchi": {
    title: "Shani Peyarchi Pooja at Thirunallar: Book Online",
    description:
      "Saturn transit (Sani Peyarchi) poojas at Thirunallar Saneeswaran temple, performed in your name to ease Shani dosha. {price}. Book online.",
  },
  "/products/kanchi-kamakshi": {
    title: "Kamakshi Amman Temple Pooja for Marriage: Book Online",
    description:
      "Pooja at Kanchi Kamakshi Amman temple, Kanchipuram, in your name, traditionally offered for delays in marriage. {price}. Book online; prasadam delivered.",
  },
  "/products/navagraha-homam": {
    title: "Navagraha Homam Online: For Planetary Doshas",
    description:
      "Navagraha homam performed by our priests in your name, for harmony of the nine planets and relief from graha doshas. {price}. Book online.",
  },
  "/products/swayamvara-parvathi-homam": {
    title: "Swayamvara Parvathi Homam for Marriage: Book Online",
    description:
      "Swayamvara Parvathi homam performed in your name for those seeking a suitable life partner or facing delays in marriage. {price}. Book online.",
  },
  "/faq/prasad-delivery-worldwide": {
    title: "Prasad Delivery Worldwide: Shipping & Tracking",
    description:
      "How we send temple prasadam from India to the USA, UK, Canada, Australia and more: packing, tracking, delivery times and costs.",
  },
  "/products/sudarsana-homam": {
    title: "Sudarshana Homam Online: Remove Obstacles",
    description:
      "Sudarshana homam performed by our priests in your name, for protection from negativity and to overcome obstacles in work and life. {price}. Book online.",
  },
  "/products/palani-panchamritham": {
    title: "Palani Panchamritham Prasadam: Order Online",
    description:
      "Panchamritham prasadam from the Palani Murugan temple, the sacred fruit and jaggery offering used in abhishekam. {price}. Delivered to your home.",
  },
  "/products/tila-homam-at-rameswaram": {
    title: "Tila Homam at Rameswaram for Ancestors: Book Online",
    description:
      "Tila (thila) homam at Rameswaram for departed ancestors, performed in your family's name for peace and pitru blessings. {price}. Book online.",
  },
  "/products/hayagreeva-homam": {
    title: "Hayagreeva Homam for Studies & Memory: Book Online",
    description:
      "Hayagreeva homam performed in your name for students: focus, memory and success in exams and learning. {price}. Book online.",
  },
  "/blog/how-to-choose-the-right-puja-for-life-obstacles": {
    title: "How to Choose the Right Puja for a Life Obstacle",
    description:
      "A practical guide to matching marriage delays, career blocks, health worries and money pressure with the right puja or homam.",
  },
  "/aarti": {
    title: "Digital Aarti: Durga, Shirdi Sai Baba & Lakshmi",
    description:
      "Join the aarti from wherever you are: light a diya, offer flowers and place your prayer before Maa Durga, Shirdi Sai Baba and Mahalakshmi.",
  },
}

/** Override for a clean path, with {price} filled in (or its phrase removed). */
export function seoFor(path: string, price?: string | null): SeoOverride | null {
  const o = SEO_OVERRIDES[path]
  if (!o) return null
  const p = price ? price.replace(/\.00(?=\D|$)/, "") : null // "₹2,470.00" → "₹2,470"
  const description = p ? o.description.replace("{price}", `From ${p}`) : o.description.replace(/\s*\{price\}\.?/, "")
  return { title: o.title, description }
}

// Visible page heading (H1) on product pages, when it should differ from the Medusa product title.
// The Medusa title still shows in cart, checkout and order emails until it is changed in Medusa too.
// Ghee/oil (owner, 22 Oct 2026): no "(For Conceiving)" / "(For Safe Childbirth)" labels; devotional context
// stays in the page text. Headings lead with the words people search ("Garbarakshambigai temple ghee").
export const PRODUCT_HEADINGS: Record<string, string> = {
  "garbharakshambika-ghee": "Garbarakshambigai Temple Ghee Prasadam, Thirukkarugavur",
  "garbharakshambika-oil": "Garbarakshambigai Temple Oil Prasadam, Thirukkarugavur",
}
