export interface Review {
  id: string
  name: string
  location: string
  rating: number
  text: string
  date: string
  isNRI: boolean
}

const indianCities = [
  "Chennai",
  "Mumbai",
  "Hyderabad",
  "Bangalore",
  "Coimbatore",
  "Delhi",
  "Kolkata",
  "Pune",
  "Madurai",
  "Kochi",
]

const nriLocations = [
  "Houston, USA",
  "London, UK",
  "Toronto, Canada",
  "Sydney, Australia",
  "Singapore",
  "Kuala Lumpur, Malaysia",
  "Dubai, UAE",
  "Frankfurt, Germany",
  "San Jose, USA",
  "Auckland, New Zealand",
]

const hinduNames = [
  "Rajesh Kumar",
  "Priya Sharma",
  "Venkatesh Iyer",
  "Lakshmi Narayanan",
  "Anand Krishnamurthy",
  "Meenakshi Sundaram",
  "Srinivas Rao",
  "Deepa Ranganathan",
  "Ganesh Subramanian",
  "Kavitha Ramesh",
  "Arun Prakash",
  "Saraswathi Devi",
  "Mohan Raman",
  "Padma Viswanathan",
  "Karthik Venkataraman",
  "Bhavani Shankar",
  "Suresh Babu",
  "Revathi Chandran",
  "Ashok Nair",
  "Geetha Krishnan",
  "Ramachandran Pillai",
  "Sangeetha Murali",
  "Vijay Anand",
  "Janaki Srinivasan",
  "Mahesh Hegde",
  "Radha Gopalan",
  "Narayanan Menon",
  "Uma Maheshwari",
  "Balaji Seshadri",
  "Shanthi Ravi",
]

const generalTestimonials: Review[] = [
  {
    id: "t1",
    name: "Rajesh Kumar",
    location: "Houston, USA",
    rating: 5,
    text: "Living away from India, I always worried about performing pujas for my family. PariharaOnline made it so easy - I booked a Navagraha Homam and received the prasad within two weeks. The video of the ritual was beautiful.",
    date: "2025-12-15",
    isNRI: true,
  },
  {
    id: "t2",
    name: "Meenakshi Sundaram",
    location: "Chennai",
    rating: 5,
    text: "I have been using PariharaOnline for over 3 years now. Every puja is performed with utmost devotion and the prasad quality is excellent. The priests are very knowledgeable and follow all proper Vedic procedures.",
    date: "2025-11-20",
    isNRI: false,
  },
  {
    id: "t3",
    name: "Priya Sharma",
    location: "London, UK",
    rating: 5,
    text: "Booked a Lakshmi Puja during Diwali from London. The entire experience was seamless. Got regular updates, video proof of the puja, and prasad delivered right to my doorstep. Highly recommended for NRIs!",
    date: "2025-10-28",
    isNRI: true,
  },
  {
    id: "t4",
    name: "Srinivas Rao",
    location: "Hyderabad",
    rating: 4,
    text: "The Ganapathi Homam I booked for my new business inauguration was performed perfectly. Within a few months, my business started showing positive results. Very satisfied with the service.",
    date: "2025-09-10",
    isNRI: false,
  },
  {
    id: "t5",
    name: "Deepa Ranganathan",
    location: "Toronto, Canada",
    rating: 5,
    text: "After my father's health scare, I booked a Maha Mrityunjaya Homam. The team was compassionate and performed the ritual within 3 days of booking. My father is recovering well now. Grateful for this service.",
    date: "2025-08-22",
    isNRI: true,
  },
  {
    id: "t6",
    name: "Kavitha Ramesh",
    location: "Bangalore",
    rating: 5,
    text: "The astrology consultation was incredibly accurate. The pandit identified issues in my horoscope and recommended specific pujas. After performing them through PariharaOnline, I noticed a significant positive shift in my life.",
    date: "2025-07-14",
    isNRI: false,
  },
  {
    id: "t7",
    name: "Anand Krishnamurthy",
    location: "Singapore",
    rating: 5,
    text: "Being in Singapore, finding authentic puja services was always a challenge. PariharaOnline bridges that gap perfectly. The Sudarshana Homam I ordered was performed at a renowned temple and the prasad arrived in perfect condition.",
    date: "2025-06-30",
    isNRI: true,
  },
  {
    id: "t8",
    name: "Padma Viswanathan",
    location: "Coimbatore",
    rating: 4,
    text: "I have ordered multiple pujas for various occasions - Ayush Homam for my grandson, Navagraha puja for dosham correction, and regular Sankatahara Chaturthi pujas. Always reliable and authentic.",
    date: "2025-06-05",
    isNRI: false,
  },
  {
    id: "t9",
    name: "Ganesh Subramanian",
    location: "Dubai, UAE",
    rating: 5,
    text: "The Swayamvara Parvathi Homam I booked for my daughter worked wonders. Within 6 months, she found a wonderful match. The pandit took time to explain the significance of each ritual step. Truly blessed service.",
    date: "2025-05-18",
    isNRI: true,
  },
  {
    id: "t10",
    name: "Saraswathi Devi",
    location: "Madurai",
    rating: 5,
    text: "My family has been booking Saraswathi Puja every year before exams for our children. The results speak for themselves - all three children have excelled in their studies. Thank you PariharaOnline!",
    date: "2025-04-12",
    isNRI: false,
  },
  {
    id: "t11",
    name: "Karthik Venkataraman",
    location: "San Jose, USA",
    rating: 5,
    text: "I was skeptical at first about online puja booking, but PariharaOnline exceeded my expectations. The transparency - from booking to video evidence to prasad delivery - is unmatched. Now I recommend it to all my Indian friends in the Bay Area.",
    date: "2025-03-25",
    isNRI: true,
  },
  {
    id: "t12",
    name: "Geetha Krishnan",
    location: "Kochi",
    rating: 4,
    text: "Ordered a Durga Puja for protection and peace of mind during a difficult period. The priests were very understanding and performed additional prayers. The sacred ash and prasad were of excellent quality.",
    date: "2025-03-01",
    isNRI: false,
  },
  {
    id: "t13",
    name: "Mahesh Hegde",
    location: "Sydney, Australia",
    rating: 5,
    text: "From Australia, getting authentic temple prasad seemed impossible until I found PariharaOnline. The packaging is excellent and the prasad arrives fresh. I now order monthly for our home puja room.",
    date: "2025-02-14",
    isNRI: true,
  },
  {
    id: "t14",
    name: "Bhavani Shankar",
    location: "Mumbai",
    rating: 5,
    text: "The customer service team is exceptional. They helped me choose the right puja for my daughter's health issues and scheduled it at an auspicious time. The entire process was smooth and professional.",
    date: "2025-01-20",
    isNRI: false,
  },
  {
    id: "t15",
    name: "Vijay Anand",
    location: "Kuala Lumpur, Malaysia",
    rating: 5,
    text: "I booked a series of Navagraha pujas to remedy my Saturn dasha period. The astrologer's advice was spot-on and the pujas were performed at the correct temples. Things have been looking up since then.",
    date: "2025-01-05",
    isNRI: true,
  },
  {
    id: "t16",
    name: "Revathi Chandran",
    location: "Delhi",
    rating: 4,
    text: "Very impressed with how professional and organized the whole service is. From puja booking to prasad delivery, every step is communicated clearly. The video of the homam was a wonderful touch.",
    date: "2024-12-18",
    isNRI: false,
  },
  {
    id: "t17",
    name: "Narayanan Menon",
    location: "Frankfurt, Germany",
    rating: 5,
    text: "As a devotee living in Germany for 20 years, this service is a blessing. I can now ensure all the important pujas are performed at proper temples back in India. The prasad delivery to Europe is surprisingly fast.",
    date: "2024-11-22",
    isNRI: true,
  },
  {
    id: "t18",
    name: "Shanthi Ravi",
    location: "Pune",
    rating: 5,
    text: "Booked Ayush Homam for my newborn granddaughter. The ritual was performed beautifully at the temple and we received the full prasad kit including sacred thread and kumkum. Highly recommended for new parents.",
    date: "2024-11-08",
    isNRI: false,
  },
  {
    id: "t19",
    name: "Balaji Seshadri",
    location: "Auckland, New Zealand",
    rating: 5,
    text: "PariharaOnline has become our family's go-to for all temple services. Whether it is annual Satyanarayan Puja or special occasion homams, they deliver consistently. The sankalpam personalization makes it feel authentic.",
    date: "2024-10-30",
    isNRI: true,
  },
  {
    id: "t20",
    name: "Uma Maheshwari",
    location: "Kolkata",
    rating: 4,
    text: "I appreciate the detailed information provided for each puja - what it involves, the benefits, and when it should be performed. It helped me make an informed decision. The service was excellent as always.",
    date: "2024-10-15",
    isNRI: false,
  },
]

// Simple seeded random number generator
function seededRandom(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return () => {
    hash = ((hash << 13) ^ hash) | 0
    hash = (hash * 2246822507) | 0
    hash = ((hash << 3) ^ hash) | 0
    return (hash >>> 0) / 4294967296
  }
}

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function getRandomReviews(count: number, seed = "default"): Review[] {
  const rng = seededRandom(seed)
  const shuffled = shuffleArray(generalTestimonials, rng)
  return shuffled.slice(0, count)
}

export function getHomepageTestimonials(): Review[] {
  return getRandomReviews(4, "homepage-2026")
}

// Product-specific review templates
const productReviewTemplates = {
  nri: [
    (title: string, name: string, loc: string) => ({
      text: `After the ${title}, I got a breakthrough within two months. The pandit was very knowledgeable and the live streaming was a great touch. Prasad arrived in ${loc.split(",")[0]} within 10 days.`,
      name,
      location: loc,
    }),
    (title: string, name: string, loc: string) => ({
      text: `Being away from India, performing ${title} seemed impossible. PariharaOnline made it happen seamlessly. The video evidence and timely prasad delivery made the experience feel authentic and complete.`,
      name,
      location: loc,
    }),
    (title: string, name: string, loc: string) => ({
      text: `I booked the ${title} for my parents back in India. The coordination was excellent - they kept me updated at every step. The ritual was performed exactly as described. Very professional service.`,
      name,
      location: loc,
    }),
    (title: string, name: string, loc: string) => ({
      text: `Highly recommend the ${title} from PariharaOnline. The priests follow proper Vedic procedures and the prasad quality is authentic. As an NRI in ${loc.split(",")[0]}, this service is a blessing.`,
      name,
      location: loc,
    }),
  ],
  indian: [
    (title: string, name: string, loc: string) => ({
      text: `The ${title} was performed with complete devotion and adherence to Vedic traditions. I received the prasad within a week. The entire family felt blessed. Will definitely book again.`,
      name,
      location: loc,
    }),
    (title: string, name: string, loc: string) => ({
      text: `Very satisfied with the ${title}. The pandit explained the entire procedure and its significance. The video recording of the ritual was a wonderful keepsake. Highly recommended.`,
      name,
      location: loc,
    }),
    (title: string, name: string, loc: string) => ({
      text: `I have been performing ${title} annually through PariharaOnline for the past 2 years. The consistency in quality and devotion is remarkable. The team in ${loc} appreciates this service greatly.`,
      name,
      location: loc,
    }),
    (title: string, name: string, loc: string) => ({
      text: `Booked ${title} during a difficult phase in life. The positive energy shift was noticeable within weeks. The temple priests were thorough and the sankalpam was done with my complete details. Grateful for this service.`,
      name,
      location: loc,
    }),
  ],
}

export function generateProductReviews(
  productTitle: string,
  count = 3
): Review[] {
  const rng = seededRandom(productTitle)
  const reviews: Review[] = []

  for (let i = 0; i < count; i++) {
    const isNRI = i % 2 === 0
    const templates = isNRI
      ? productReviewTemplates.nri
      : productReviewTemplates.indian

    const templateIdx = Math.floor(rng() * templates.length)
    const template = templates[templateIdx]

    const nameIdx = Math.floor(rng() * hinduNames.length)
    const name = hinduNames[nameIdx]

    const location = isNRI
      ? nriLocations[Math.floor(rng() * nriLocations.length)]
      : indianCities[Math.floor(rng() * indianCities.length)]

    const result = template(productTitle, name, location)
    const rating = rng() > 0.3 ? 5 : 4

    // Generate a plausible date in the last year
    const monthsAgo = Math.floor(rng() * 12) + 1
    const date = new Date()
    date.setMonth(date.getMonth() - monthsAgo)
    const dateStr = date.toISOString().split("T")[0]

    reviews.push({
      id: `pr-${i}-${productTitle.slice(0, 10)}`,
      name: result.name,
      location: result.location,
      rating,
      text: result.text,
      date: dateStr,
      isNRI,
    })
  }

  return reviews
}
