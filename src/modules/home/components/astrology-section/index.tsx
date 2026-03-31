import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Star, FileText, Heart, ArrowRight } from "lucide-react"

const AstrologySection = () => {
  const services = [
    {
      icon: Star,
      title: "Birth Chart Analysis",
      desc: "Get a comprehensive analysis of your birth chart (Kundli) based on Vedic astrology principles.",
      price: "From ₹2,501",
    },
    {
      icon: Heart,
      title: "Marriage Consultation",
      desc: "Horoscope matching (Kundli Milan) and marriage timing analysis by expert astrologers.",
      price: "From ₹2,501",
    },
    {
      icon: FileText,
      title: "Ask an Astrologer",
      desc: "Get personalized answers to your specific life questions from experienced Vedic astrologers.",
      price: "From ₹2,501",
    },
  ]

  return (
    <section className="py-16 sm:py-20 bg-grey-5">
      <div className="content-container">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-brand-600" />
              <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
                Astrology Consultations
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-grey-90">
              Guidance from Vedic Scholars
            </h2>
          </div>
          <LocalizedClientLink
            href="/astrology"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </LocalizedClientLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, title, desc, price }) => (
            <LocalizedClientLink
              key={title}
              href="/astrology"
              className="group bg-white rounded-2xl border border-grey-10 p-6 hover:border-brand-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-brand-50 text-brand-600 flex-shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-grey-90 mb-1 group-hover:text-brand-700 transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-grey-50 leading-relaxed mb-3">
                    {desc}
                  </p>
                  <span className="text-sm font-semibold text-brand-600">
                    {price}
                  </span>
                </div>
              </div>
            </LocalizedClientLink>
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <LocalizedClientLink
            href="/astrology"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View All Astrology Services
            <ArrowRight className="w-4 h-4" />
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default AstrologySection
