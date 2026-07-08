import { Metadata } from "next"
import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact PariharaOnline for temple services, puja bookings, and spiritual guidance. WhatsApp, phone, and email support available.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
}

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="bg-gradient-to-br from-brand-50 via-white to-warm-50 py-16 sm:py-20">
        <div className="content-container text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-grey-90 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-grey-50">
            We&apos;re here to help with your spiritual needs. Reach out via
            WhatsApp for the fastest response.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="content-container max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <a
              href="https://wa.me/919743244501"
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-4 p-6 rounded-2xl border border-grey-10 hover:border-brand-200 hover:shadow-sm transition-all bg-green-50/50"
            >
              <MessageCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-grey-90 mb-1">WhatsApp</h2>
                <p className="text-brand-600 font-medium">+91 974-324-4501</p>
                <p className="text-sm text-grey-50 mt-1">Fastest response</p>
              </div>
            </a>

            <a
              href="tel:+919743244501"
              className="flex items-start gap-4 p-6 rounded-2xl border border-grey-10 hover:border-brand-200 hover:shadow-sm transition-all"
            >
              <Phone className="w-8 h-8 text-brand-500 flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-grey-90 mb-1">Phone</h2>
                <p className="text-brand-600 font-medium">+91 974-324-4501</p>
                <p className="text-sm text-grey-50 mt-1">
                  Please have your order number ready
                </p>
              </div>
            </a>

            <a
              href="mailto:hello@pariharaonline.com"
              className="flex items-start gap-4 p-6 rounded-2xl border border-grey-10 hover:border-brand-200 hover:shadow-sm transition-all"
            >
              <Mail className="w-8 h-8 text-brand-500 flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-grey-90 mb-1">Email</h2>
                <p className="text-brand-600 font-medium">
                  hello@pariharaonline.com
                </p>
                <p className="text-sm text-grey-50 mt-1">
                  We respond within 24 hours
                </p>
              </div>
            </a>

            <div className="flex items-start gap-4 p-6 rounded-2xl border border-grey-10">
              <Clock className="w-8 h-8 text-brand-500 flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-grey-90 mb-1">
                  Response Time
                </h2>
                <p className="text-grey-60">Within 24 hours</p>
                <p className="text-sm text-grey-50 mt-1">
                  WhatsApp is typically faster
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 p-6 rounded-2xl border border-grey-10 bg-grey-5">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-brand-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-semibold text-grey-90 mb-2">
                  Registered Office
                </h2>
                <p className="text-grey-60 text-sm leading-relaxed">
                  Harkarma Enterprises LLP
                  <br />
                  1F SairajKrish, Narayana Avenue
                  <br />
                  Krishna Colony, Trichy Road
                  <br />
                  Coimbatore - 641 005
                  <br />
                  Tamil Nadu, India
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
