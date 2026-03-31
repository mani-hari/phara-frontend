"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight, Sparkles } from "lucide-react"

const categories = [
  { id: "all", label: "All" },
  { id: "prosperity", label: "Prosperity & Wealth" },
  { id: "health", label: "Health & Wellness" },
  { id: "marriage", label: "Marriage & Relationships" },
  { id: "career", label: "Career & Education" },
  { id: "protection", label: "Protection & Peace" },
]

const pujaGuide = [
  {
    category: "prosperity",
    title: "Lakshmi Puja",
    problem: "Financial difficulties, business losses",
    benefit: "Attracts wealth and prosperity",
  },
  {
    category: "health",
    title: "Maha Mrityunjaya Homam",
    problem: "Health issues, chronic illness, surgery recovery",
    benefit: "Healing and longevity",
  },
  {
    category: "marriage",
    title: "Swayamvara Parvathi Homam",
    problem: "Marriage delays, partner compatibility issues",
    benefit: "Removes obstacles to marriage",
  },
  {
    category: "career",
    title: "Saraswathi Puja",
    problem: "Education struggles, exam preparation, creative blocks",
    benefit: "Wisdom and academic success",
  },
  {
    category: "protection",
    title: "Sudarshana Homam",
    problem: "Negative energies, obstacles, enemies, evil eye",
    benefit: "Divine protection and removal of negativity",
  },
  {
    category: "prosperity",
    title: "Navagraha Shanti Puja",
    problem: "Planetary doshas, general misfortune",
    benefit: "Balances all nine planetary influences",
  },
  {
    category: "health",
    title: "Ayush Homam",
    problem: "Illness in children, general health concerns",
    benefit: "Long life and good health",
  },
  {
    category: "career",
    title: "Ganapathi Homam",
    problem: "New ventures, starting a business, removing obstacles",
    benefit: "Success in new beginnings",
  },
  {
    category: "protection",
    title: "Durga Puja",
    problem: "Fear, anxiety, feeling threatened or unsafe",
    benefit: "Courage and divine protection",
  },
  {
    category: "marriage",
    title: "Mangal Dosha Nivaran Puja",
    problem: "Mangal dosha in horoscope, marital discord",
    benefit: "Harmonious married life",
  },
]

const FindRightPuja = () => {
  const [activeCategory, setActiveCategory] = useState("all")

  const filtered =
    activeCategory === "all"
      ? pujaGuide
      : pujaGuide.filter((p) => p.category === activeCategory)

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="content-container">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
              Find Your Remedy
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-grey-90">
            Find the Right Puja for You
          </h2>
          <p className="mt-3 text-grey-50 max-w-xl mx-auto">
            Match your life situation with the most effective Vedic remedy
          </p>
        </div>

        {/* Category filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-brand-600 text-white"
                  : "bg-grey-5 text-grey-60 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Puja cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((puja) => (
            <div
              key={puja.title}
              className="bg-grey-5 rounded-xl p-5 hover:bg-brand-50/50 transition-colors border border-transparent hover:border-brand-100"
            >
              <h3 className="text-base font-semibold text-grey-90 mb-2">
                {puja.title}
              </h3>
              <p className="text-sm text-grey-50 mb-2">
                <span className="font-medium text-grey-70">Problem: </span>
                {puja.problem}
              </p>
              <p className="text-sm text-brand-700">
                <span className="font-medium">Benefit: </span>
                {puja.benefit}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors text-sm"
          >
            Browse All Services
            <ArrowRight className="w-4 h-4" />
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default FindRightPuja
