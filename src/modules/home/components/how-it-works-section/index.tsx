import { Sparkles, ShoppingCart, CreditCard, Video } from "lucide-react"

const HowItWorksSection = () => {
  const steps = [
    {
      step: 1,
      icon: Sparkles,
      title: "Choose a Puja",
      desc: "Browse our catalog of pujas, homams, and astrology services. Select the ritual that matches your needs.",
      color: "bg-brand-600",
    },
    {
      step: 2,
      icon: ShoppingCart,
      title: "Add to Cart",
      desc: "Add the puja to your cart. Provide your name, nakshatram, gothram, and sankalpam details.",
      color: "bg-brand-500",
    },
    {
      step: 3,
      icon: CreditCard,
      title: "Pay Securely",
      desc: "Pay via UPI, cards, or wallets (Razorpay) for India. International devotees can use PayPal.",
      color: "bg-brand-600",
    },
    {
      step: 4,
      icon: Video,
      title: "Watch & Receive",
      desc: "Puja is performed at the temple. Receive video proof and sacred prasad delivered to your doorstep.",
      color: "bg-brand-500",
    },
  ]

  return (
    <section className="py-16 sm:py-20 bg-brand-700">
      <div className="content-container">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            How It Works
          </h2>
          <p className="mt-3 text-brand-200 max-w-lg mx-auto">
            Book your puja in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ step, icon: Icon, title, desc, color }) => (
            <div key={step} className="text-center">
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-500/30 mb-5">
                <Icon className="w-7 h-7 text-white" />
                <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white text-brand-700 text-sm font-bold flex items-center justify-center shadow">
                  {step}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-brand-200 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
