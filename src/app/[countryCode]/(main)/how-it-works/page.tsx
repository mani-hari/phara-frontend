import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  Sparkles,
  Users,
  CreditCard,
  Package,
  ArrowRight,
  Clock,
  Shield,
  Globe,
  CheckCircle2,
} from "lucide-react"

export const metadata: Metadata = {
  title: "How It Works - Book Online Pujas",
  description:
    "Learn how to book authentic Hindu temple pujas and homams online at PariharaOnline. Simple 4-step process from selection to prasad delivery.",
}

export default function HowItWorksPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-warm-50 py-16 sm:py-20">
        <div className="content-container text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-grey-90 mb-4">
            How It Works
          </h1>
          <p className="text-xl text-grey-50 leading-relaxed">
            Book authentic temple services in four simple steps. From selection
            to sacred prasad at your doorstep.
          </p>
        </div>
      </section>

      {/* 4 Steps */}
      <section className="py-16 sm:py-20">
        <div className="content-container max-w-4xl">
          <div className="space-y-12">
            {[
              {
                step: 1,
                icon: Sparkles,
                title: "Browse & Select a Service",
                desc: "Explore our catalog of pujas, homams, astrology services, and sacred items. Each service includes a detailed description, benefits, and what you will receive.",
                details: [
                  "Choose from 30+ authentic services",
                  "Read detailed descriptions and benefits",
                  "Services range from ₹750 to ₹23,500",
                  "Festival-specific and dosham-specific options available",
                ],
              },
              {
                step: 2,
                icon: Users,
                title: "Provide Sankalpam Details",
                desc: "Enter the devotee details that the priest will use during the sankalpam (sacred intention). You can add up to 4 family members per booking.",
                details: [
                  "Devotee name (required for sankalpam)",
                  "Nakshatram (birth star) - 27 options with Tamil names",
                  "Rasi (zodiac sign) - 12 options",
                  "Gothram (family lineage), preferred date, and special prayers",
                ],
              },
              {
                step: 3,
                icon: CreditCard,
                title: "Make Secure Payment",
                desc: "Pay securely using your preferred method. We automatically detect your region and show the appropriate payment gateway.",
                details: [
                  "India: Razorpay (UPI, cards, wallets, net banking) in INR",
                  "International: PayPal (cards, PayPal balance) in USD",
                  "PCI-DSS compliant, encrypted transactions",
                  "Instant confirmation via email",
                ],
              },
              {
                step: 4,
                icon: Package,
                title: "Receive Blessings & Prasad",
                desc: "Your puja is scheduled and performed within 7 days at the designated temple by experienced Vedic priests. Sacred prasad is then shipped to your doorstep.",
                details: [
                  "Tentative dates provided within 1-2 days",
                  "Most pujas completed within 7 days",
                  "Video evidence provided for homams",
                  "Prasad shipped with tracking via Speed Post / EMS",
                ],
              },
            ].map(({ step, icon: Icon, title, desc, details }) => (
              <div
                key={step}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
                    <Icon className="w-7 h-7" />
                  </div>
                  {step < 4 && (
                    <div className="w-px h-12 bg-brand-200 mt-2" />
                  )}
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                      Step {step}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-grey-90 mb-2">
                    {title}
                  </h2>
                  <p className="text-grey-50 mb-4 leading-relaxed">{desc}</p>
                  <ul className="space-y-2">
                    {details.map((detail) => (
                      <li
                        key={detail}
                        className="flex items-start gap-2 text-sm text-grey-60"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 bg-grey-5">
        <div className="content-container max-w-4xl">
          <h2 className="text-2xl font-bold text-grey-90 mb-8 text-center">
            What to Expect
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: "Quick Processing",
                desc: "Most services completed within 7 days. Astrology reports delivered via email within 48 hours.",
              },
              {
                icon: Shield,
                title: "Authentic & Verified",
                desc: "15+ years of trusted service. Video evidence for homams, temple-packaged prasad for pujas.",
              },
              {
                icon: Globe,
                title: "Worldwide Delivery",
                desc: "Sacred prasad shipped to 50+ countries. International orders via EMS Speed Post with tracking.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl bg-white border border-grey-10"
              >
                <Icon className="w-8 h-8 text-brand-500 mb-3" />
                <h3 className="font-semibold text-grey-90 mb-2">{title}</h3>
                <p className="text-sm text-grey-50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-brand-600 to-brand-700">
        <div className="content-container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Begin?
          </h2>
          <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
            Browse our complete catalog of authentic temple services and book
            your puja today.
          </p>
          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-brand-700 rounded-xl font-semibold hover:bg-brand-50 transition-colors"
          >
            Explore All Services
            <ArrowRight className="w-4 h-4" />
          </LocalizedClientLink>
        </div>
      </section>
    </div>
  )
}
