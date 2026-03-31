import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  Flame,
  Globe,
  Shield,
  Heart,
  ArrowRight,
  Sparkles,
  Package,
  CreditCard,
  Star,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react"

const Hero = () => {
  return (
    <div className="w-full">
      {/* Hero Banner with temple background */}
      <section className="relative overflow-hidden min-h-[480px] sm:min-h-[540px] lg:min-h-[600px] flex items-center">
        {/* Background gradient overlay - simulates the temple photo effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-800/95 via-brand-700/85 to-brand-600/70 z-10" />
        <div className="absolute inset-0 bg-[url('/temple-hero.jpg')] bg-cover bg-center" />
        {/* Fallback gradient if no image */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600" />

        <div className="content-container relative z-20 py-16 sm:py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span>Serving devotees worldwide since 2009</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight">
              Book Sacred Pujas{" "}
              <span className="text-brand-200">Performed at Renowned Temples</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-white/80 leading-relaxed max-w-xl">
              Experience the divine grace of authentic Vedic rituals performed by
              experienced priests at famous temples across India. Sacred prasad
              delivered to your doorstep, anywhere in the world.
            </p>
            <p className="mt-3 text-sm text-white/60">
              Navagraha Homam &bull; Ganapathi Homam &bull; Sudarshana Homam &bull; Lakshmi Puja &bull; Vedic Astrology &bull; Sacred Prasad
            </p>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-4 bg-brand-600">
        <div className="content-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center text-white">
            {[
              { icon: Flame, text: "Authentic Vedic Rituals" },
              { icon: Globe, text: "Worldwide Prasad Delivery" },
              { icon: Shield, text: "Secure Payments" },
              { icon: Heart, text: "Personalized Sankalpam" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center justify-center gap-2 py-2">
                <Icon className="w-4 h-4 text-brand-200" />
                <span className="text-xs sm:text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Hero
