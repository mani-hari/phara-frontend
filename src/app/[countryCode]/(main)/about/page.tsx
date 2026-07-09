import { Metadata } from "next"
import { Clock, Globe, Flame, CheckCircle2, Phone, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us - PariharaOnline",
  description:
    "Learn about PariharaOnline - connecting devotees worldwide with authentic Hindu temple services since 2009. Operated by Harkarma Enterprises LLP.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
}

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-warm-50 py-16 sm:py-20">
        <div className="content-container max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-grey-90 mb-4">
            About <span className="text-brand-600">PariharaOnline</span>
          </h1>
          <p className="text-xl text-grey-50 leading-relaxed">
            &ldquo;Parihara&rdquo; derives from Sanskrit, meaning
            &ldquo;Remedy&rdquo; &mdash; the performance of pujas or offerings
            as solutions to life&apos;s challenges.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="content-container max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-grey-90 mb-4">Our Story</h2>
            <p className="text-grey-60 leading-relaxed mb-6">
              Since 2009, PariharaOnline has been bridging modern lives with
              sacred Hindu traditions worldwide. We facilitate authentic Vedic
              rituals through temple pujas and personalized homams, delivering
              blessed prasadham to devotees across 50+ countries.
            </p>
            <p className="text-grey-60 leading-relaxed mb-6">
              For over 15 years, our honesty and transparency has earned the
              trust of thousands of customers. We function as a foundation with
              temple representatives, enabling people who are unable to visit
              temples personally to arrange ritual services with complete
              authenticity.
            </p>
            <p className="text-grey-60 leading-relaxed">
              Our service costs encompass temple fees, ritual materials, priest
              donations (dakshina), and worldwide shipping of sacred prasadham.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-grey-5">
        <div className="content-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "15+", label: "Years of Service", icon: Clock },
              { value: "10,000+", label: "Pujas Performed", icon: Flame },
              { value: "50+", label: "Countries Served", icon: Globe },
              { value: "100%", label: "Authentic Rituals", icon: CheckCircle2 },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center">
                <Icon className="w-8 h-8 text-brand-500 mb-3" />
                <span className="text-3xl font-bold text-grey-90">{value}</span>
                <span className="mt-1 text-sm text-grey-50">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vedic Scholars */}
      <section className="py-16">
        <div className="content-container max-w-4xl">
          <h2 className="text-2xl font-bold text-grey-90 mb-6">
            Guided by Vedic Scholars
          </h2>
          <p className="text-grey-60 mb-8">
            Our organization is guided by experienced Vedic scholars who ensure
            every ritual is performed with utmost authenticity and devotion.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Shri Parthasarathy Srinivasan",
              "Shri Ganapati Shastrigal",
              "Shri Satyanarayana Sharma",
              "Shri Gayatri Shastrigal",
            ].map((name) => (
              <div
                key={name}
                className="p-4 rounded-xl border border-grey-10 bg-brand-50/30"
              >
                <p className="font-medium text-grey-80">{name}</p>
                <p className="text-sm text-grey-50">Vedic Scholar & Priest</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-grey-5">
        <div className="content-container max-w-4xl">
          <h2 className="text-2xl font-bold text-grey-90 mb-6">
            Get in Touch
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <a
              href="https://wa.me/919743244501"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border border-grey-10 bg-white hover:border-brand-200 transition-colors"
            >
              <Phone className="w-5 h-5 text-brand-500" />
              <div>
                <p className="text-sm font-medium text-grey-80">WhatsApp</p>
                <p className="text-xs text-grey-50">+91 974-324-4501</p>
              </div>
            </a>
            <a
              href="mailto:hello@pariharaonline.com"
              className="flex items-center gap-3 p-4 rounded-xl border border-grey-10 bg-white hover:border-brand-200 transition-colors"
            >
              <Mail className="w-5 h-5 text-brand-500" />
              <div>
                <p className="text-sm font-medium text-grey-80">Email</p>
                <p className="text-xs text-grey-50">
                  hello@pariharaonline.com
                </p>
              </div>
            </a>
          </div>

          <div className="mt-8 p-6 rounded-xl bg-white border border-grey-10">
            <h3 className="font-semibold text-grey-80 mb-2">
              Business Entity
            </h3>
            <p className="text-sm text-grey-60">
              Harkarma Enterprises LLP (LLP ID: AAM-1863)
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
