import { HttpTypes } from "@medusajs/types"

export type MockProductCardMeta = {
  key: string
  titleMatch: string[]
  tags: { label: string; color: string; bg: string }[]
  effectiveFor: string
  intensity: "Gentle" | "Medium" | "High"
  image: string
}

export type MockArticlePreview = {
  title: string
  href: string
  image: string
}

export type AstrologyCardCopy = {
  description: string
  feature: string
}

export type MockProductDetailContent = {
  heroTags: { label: string; color: string; bg: string }[]
  effectiveFor: string[]
  intensity: "Gentle" | "Medium" | "High"
  review: {
    text: string
    author: string
  }
  description: string
  included: string[]
  gallery?: string[]
}

export const homepageHero = {
  eyebrow: "Chaitra Navratri Special",
  title: "Book Sacred Pujas\nPerformed at\nRenowned Temples",
  description:
    "Authentic Vedic rituals by experienced scholars.\nLive streaming • Prasad delivery • 10,000+ devotees served",
  image: "/mock-assets/hero-temple.png",
}

export const featuredProductMocks: MockProductCardMeta[] = [
  {
    key: "navagraha",
    titleMatch: ["navagraha"],
    tags: [
      { label: "Planetary Relief", color: "#92400E", bg: "#FEF3C7" },
      { label: "Prosperity", color: "#1E40AF", bg: "#DBEAFE" },
    ],
    effectiveFor: "Career blocks, health issues, delayed marriage",
    intensity: "Medium",
    image: "/mock-assets/featured-navagraha.png",
  },
  {
    key: "lakshmi",
    titleMatch: ["lakshmi"],
    tags: [
      { label: "Wealth", color: "#065F46", bg: "#D1FAE5" },
      { label: "Business Growth", color: "#92400E", bg: "#FEF3C7" },
    ],
    effectiveFor: "Financial stability, new ventures, debt relief",
    intensity: "Gentle",
    image: "/mock-assets/featured-lakshmi.png",
  },
  {
    key: "sudarshana",
    titleMatch: ["sudarshana"],
    tags: [
      { label: "Protection", color: "#991B1B", bg: "#FEE2E2" },
      { label: "Fire Ritual", color: "#5B21B6", bg: "#EDE9FE" },
    ],
    effectiveFor: "Evil eye removal, black magic, enemy protection",
    intensity: "High",
    image: "/mock-assets/featured-sudarshana.png",
  },
  {
    key: "ganapathi",
    titleMatch: ["ganapathi", "ganesha"],
    tags: [{ label: "New Beginnings", color: "#92400E", bg: "#FEF3C7" }],
    effectiveFor: "Starting new job, business, removing obstacles",
    intensity: "Medium",
    image: "/mock-assets/featured-ganapathi.png",
  },
]

export const astrologyCardCopy: Record<string, AstrologyCardCopy> = {
  "ask-our-astrologer": {
    description:
      "A practical consultation for timing, family matters, travel, and general clarity.",
    feature: "2-page guidance report",
  },
  "astrology-health-report": {
    description:
      "Focused reading on chronic concerns, planetary influences, and remedial support.",
    feature: "Health-focused analysis",
  },
  "career-astrology-analysis": {
    description:
      "Detailed forecast for career moves, promotions, business growth, and obstacles.",
    feature: "Career direction and timing",
  },
}

export const testimonials = [
  {
    text: "The Navagraha puja was streamed beautifully and the prasad reached us in Chennai within a week.",
    author: "Vijayalakshmi",
    location: "Chennai",
  },
  {
    text: "Booking from New Jersey was simple. The pandit explained the sankalpam and everything felt authentic.",
    author: "Ramesh Iyer",
    location: "New Jersey",
  },
  {
    text: "We booked Lakshmi Puja for our store opening and the experience was clear, timely, and deeply respectful.",
    author: "Meena Krishnan",
    location: "Coimbatore",
  },
]

export const findRightPujaCards = [
  { title: "Prosperity & Wealth", desc: "Financial growth, business stability" },
  { title: "Marriage & Love", desc: "Delays, compatibility, harmony" },
  { title: "Career & Business", desc: "Progress, success, new beginnings" },
  { title: "Health & Protection", desc: "Healing, peace, warding negativity" },
  { title: "New Home / Travel", desc: "Auspicious starts, safety, blessings" },
]

export const howItWorksSteps = [
  {
    title: "Choose a Puja",
    description: "Browse our catalog and pick the service that fits your need.",
  },
  {
    title: "Add to Cart",
    description: "Add the puja to your cart. Enter devotee details at checkout.",
  },
  {
    title: "Pay Securely",
    description:
      "Pay via UPI, cards, or net banking. International via PayPal.",
  },
  {
    title: "Watch & Receive",
    description:
      "Watch the puja via live video. Prasad delivered to your doorstep.",
  },
]

export const learnExploreArticles: MockArticlePreview[] = [
  {
    title: "How Navagraha and Vedic Remedies Affect Your Daily Life",
    href: "/blog/understanding-navagraha-homam",
    image: "/mock-assets/featured-navagraha.png",
  },
  {
    title: "Understanding Your Nakshatram for Better Timing",
    href: "/blog/when-to-book-an-astrology-consultation-before-a-puja",
    image: "/mock-assets/featured-lakshmi.png",
  },
  {
    title: "What to Expect from Prasad Delivery Worldwide",
    href: "/blog/what-prasad-delivery-means-for-online-puja-bookings",
    image: "/mock-assets/featured-ganapathi.png",
  },
]

export const popularQuestions = [
  "What is the right puja for Saturn transit?",
  "How long does prasad delivery take?",
  "Can I book a puja for my parents in India?",
  "What details do I need for sankalpam?",
  "Can I book multiple devotees in one order?",
]

const productSpecificContent: Record<string, MockProductDetailContent> = {
  navagraha: {
    heroTags: [
      { label: "Planetary Relief", color: "#92400E", bg: "#FEF3C7" },
      { label: "Prosperity", color: "#1E40AF", bg: "#DBEAFE" },
      { label: "Most Popular", color: "#065F46", bg: "#D1FAE5" },
    ],
    effectiveFor: [
      "Career blocks",
      "Health issues",
      "Delayed marriage",
      "Financial loss",
    ],
    intensity: "Medium",
    review: {
      text: '"After the Navagraha puja, I got a promotion within two months. The pandit was very knowledgeable and the live streaming was crystal clear. Prasad arrived in 5 days."',
      author: "Suresh K., Hyderabad",
    },
    description:
      "The Navagraha Shanti Puja is one of the most powerful Vedic rituals to appease all nine planetary deities — Surya, Chandra, Mangal, Budha, Guru, Shukra, Shani, Rahu, and Ketu.\n\nThis puja is especially recommended for those experiencing challenging planetary periods (dashas), career stagnation, health concerns, or relationship difficulties. The ritual involves specific mantras for each graha, offerings of particular flowers and grains, and a systematic invocation that brings planetary harmony to your life.\n\nOur experienced Vedic scholars perform this puja at renowned temples following strict traditional protocols. The entire ritual takes approximately 2-3 hours.",
    included: [
      "Full Navagraha Shanti Puja by experienced Vedic scholar",
      "Live video streaming link (WhatsApp/Zoom)",
      "Sacred prasad delivered to your doorstep",
      "Puja completion photos & video recording",
      "Personalized sankalpam with your name & nakshatram",
    ],
    gallery: [
      "/mock-assets/pdp-navagraha-1.png",
      "/mock-assets/pdp-navagraha-2.png",
      "/mock-assets/pdp-navagraha-3.png",
    ],
  },
}

const genericProductContent: MockProductDetailContent = {
  heroTags: [
    { label: "Temple Ritual", color: "#92400E", bg: "#FEF3C7" },
    { label: "Guided Seva", color: "#1E40AF", bg: "#DBEAFE" },
  ],
  effectiveFor: [
    "Spiritual peace",
    "Auspicious beginnings",
    "Family wellbeing",
    "Divine blessings",
  ],
  intensity: "Medium",
  review: {
    text: '"The process was clear from booking to prasad delivery. The sankalpam felt personal and the temple team handled everything respectfully."',
    author: "Anand V., Bengaluru",
  },
  description:
    "This puja is performed by experienced Vedic scholars following traditional temple procedure. It is intended for devotees seeking blessings, clarity, and spiritual support for an important phase of life.\n\nOnce booked, our team uses your sankalpam details to personalize the ritual. Depending on the seva, you may receive live streaming, ritual photos, video confirmation, and prasad delivery.",
  included: [
    "Puja performed by experienced Vedic scholar",
    "Personalized sankalpam with devotee details",
    "Ritual completion update via WhatsApp or email",
    "Sacred prasad dispatch where applicable",
  ],
}

export const getIntensityDots = (intensity: "Gentle" | "Medium" | "High") => {
  if (intensity === "Gentle") return 1
  if (intensity === "High") return 3
  return 2
}

export const getPrimaryProductImage = (product: HttpTypes.StoreProduct) =>
  product.thumbnail || product.images?.[0]?.url || null

export const getProductGalleryImages = (product: HttpTypes.StoreProduct) => {
  const urls = (product.images || [])
    .map((image) => image.url)
    .filter(Boolean) as string[]

  if (urls.length) {
    return Array.from(new Set(urls))
  }

  const fallback = getPrimaryProductImage(product)

  return fallback ? [fallback] : []
}

export const getCollectionProducts = (
  products: HttpTypes.StoreProduct[],
  handle: string
) =>
  products.filter((product) => product.collection?.handle === handle)

export const findFeaturedProducts = (
  products: HttpTypes.StoreProduct[],
  limit = 4
) => {
  const usedIds = new Set<string>()
  const selected: {
    product: HttpTypes.StoreProduct
    meta: MockProductCardMeta
  }[] = []

  for (const meta of featuredProductMocks) {
    const match = products.find((product) => {
      const title = product.title?.toLowerCase() || ""
      return (
        !usedIds.has(product.id) &&
        meta.titleMatch.some((fragment) => title.includes(fragment))
      )
    })

    if (match) {
      selected.push({ product: match, meta })
      usedIds.add(match.id)
    }
  }

  if (selected.length < limit) {
    for (const product of products) {
      if (usedIds.has(product.id)) continue
      selected.push({
        product,
        meta:
          featuredProductMocks[selected.length] || featuredProductMocks[0],
      })
      usedIds.add(product.id)
      if (selected.length === limit) break
    }
  }

  return selected.slice(0, limit)
}

export const getMockProductDetailContent = (product: HttpTypes.StoreProduct) => {
  const title = product.title.toLowerCase()

  if (title.includes("navagraha")) {
    return productSpecificContent.navagraha
  }

  return {
    ...genericProductContent,
    description: product.description || genericProductContent.description,
  }
}
