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
  "astrology-health": {
    description:
      "Focused reading on chronic concerns, planetary influences, and remedial support.",
    feature: "Health-focused analysis",
  },
  "career-astrology": {
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
  garbarakshambigai_ghee: {
    heroTags: [
      { label: "Conception Blessings", color: "#7C3AED", bg: "#EDE9FE" },
      { label: "Fertility", color: "#065F46", bg: "#D1FAE5" },
      { label: "Garba Rakshambigai", color: "#92400E", bg: "#FEF3C7" },
    ],
    effectiveFor: [
      "Couples trying to conceive",
      "Delayed pregnancy",
      "Pregnancy complications",
      "Newborn blessings",
    ],
    intensity: "Gentle",
    review: {
      text: '"We had been trying for four years. After this abhishekam in the name of both of us, we conceived within two months. I can\'t explain it rationally — I just know it worked."',
      author: "Priya S., London",
    },
    description:
      "Garbarakshambigai Devi at Tiru Kkarugavur is worshipped as the divine protector of the womb. The Ghee Abhishekam — anointing the Devi with pure ghee — is the most traditional and potent form of worship offered here.\n\nThis ritual is specifically sought by couples longing for a child, those experiencing repeated pregnancy loss, or mothers seeking divine protection for a current pregnancy. The vibration of pure ghee offered to Devi with sincere prayers is believed to invoke her direct blessings upon the devotee's wish.\n\nPriest-performed with full sankalpam, the ritual takes approximately 45 minutes at the main sanctum.",
    included: [
      "Ghee Abhishekam at Garbarakshambigai temple",
      "Personalized sankalpam with devotee's name & nakshatram",
      "Ritual completion photos sent via WhatsApp",
      "Temple prasadam dispatched by Speed Post",
      "Kumkuma prasad for the couple",
    ],
  },
  garbarakshambigai_oil: {
    heroTags: [
      { label: "Safe Delivery", color: "#DB2777", bg: "#FCE7F3" },
      { label: "Pregnancy Protection", color: "#065F46", bg: "#D1FAE5" },
      { label: "Garba Rakshambigai", color: "#92400E", bg: "#FEF3C7" },
    ],
    effectiveFor: [
      "Safe and smooth delivery",
      "High-risk pregnancies",
      "Protection during pregnancy",
      "New mother blessings",
    ],
    intensity: "Gentle",
    review: {
      text: '"My pregnancy was high-risk and my family was very anxious. We booked the oil abhishekam in week 32. My delivery was smooth and my daughter is perfectly healthy. The temple team kept us informed throughout."',
      author: "Kavitha R., Singapore",
    },
    description:
      "The Tailabhishekam (oil abhishekam) at Garbarakshambigai temple is traditionally performed for the protection of mother and child during pregnancy and childbirth.\n\nGarbarakshambigai — literally 'She who protects the womb' — is approached by expectant families to seek a complication-free delivery and the good health of both mother and newborn. The anointing with medicated oil is considered deeply protective and nurturing.\n\nThis service is booked by families on behalf of a pregnant devotee and is performed with full sankalpam and prayers naming both the mother and the expected child.",
    included: [
      "Tailabhishekam (oil abhishekam) at Garbarakshambigai temple",
      "Full sankalpam with mother's name & nakshatram",
      "Ritual photos and completion confirmation via WhatsApp",
      "Blessed oil and temple prasadam dispatched",
      "Priest's blessings prayer for mother and child",
    ],
  },
  rahu_ketu: {
    heroTags: [
      { label: "Sarpa Dosha Relief", color: "#1E40AF", bg: "#DBEAFE" },
      { label: "Kalahasti Temple", color: "#92400E", bg: "#FEF3C7" },
      { label: "Rahu-Ketu Parihara", color: "#7C3AED", bg: "#EDE9FE" },
    ],
    effectiveFor: [
      "Sarpa Dosha (Naga Dosha) relief",
      "Delayed marriage",
      "Childlessness issues",
      "Recurring family problems",
    ],
    intensity: "High",
    review: {
      text: '"Our astrologer had told us our eldest son had severe Sarpa Dosha. After the Rahu-Ketu Parihara at Kalahasti, his delayed marriage situation resolved within 8 months. We did the full-day parihara — absolutely worth it."',
      author: "Venkataraman N., Chennai",
    },
    description:
      "Sri Kalahasti in Andhra Pradesh is one of the most sacred Pancha Bhuta Sthalam temples and the foremost centre in India for Rahu-Ketu Dosha parihara. The Rahu-Ketu Dosha — often called Sarpa Dosha or Naga Dosha — manifests as persistent obstacles in marriage, childbearing, career, and family harmony.\n\nThis parihara involves special abhishekam, archana, and homa performed in the name of the affected devotee by temple-authorized priests at the main sanctum. The ritual specifically addresses malefic effects of Rahu and Ketu in the natal chart.\n\nBased on the severity of the dosha, we offer half-day and full-day parihara packages. Our team will review your requirements and coordinate with the temple for the appropriate ritual.",
    included: [
      "Rahu-Ketu Dosha parihara at Sri Kalahasteeswara temple",
      "Personalized sankalpam with name, nakshatram & gothram",
      "Archana, abhishekam and ritual homa as applicable",
      "Ritual completion photos & video sent via WhatsApp",
      "Sacred prasadam dispatched from the temple",
    ],
  },
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
  const handle = product.handle?.toLowerCase() || ""

  if (title.includes("navagraha")) {
    return productSpecificContent.navagraha
  }
  if (handle.includes("garbharakshambika-ghee") || (title.includes("garbarakshambigai") && title.includes("ghee"))) {
    return productSpecificContent.garbarakshambigai_ghee
  }
  if (handle.includes("garbharakshambika-oil") || (title.includes("garbarakshambigai") && title.includes("oil"))) {
    return productSpecificContent.garbarakshambigai_oil
  }
  if (handle.includes("rahu-ketu") || title.includes("rahu") || title.includes("sarpa dosha") || title.includes("kalahasti")) {
    return productSpecificContent.rahu_ketu
  }

  return {
    ...genericProductContent,
    description: product.description || genericProductContent.description,
  }
}
