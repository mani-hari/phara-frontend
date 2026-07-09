import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for PariharaOnline temple services and puja bookings.",
  alternates: { canonical: "/terms" },
  openGraph: { url: "/terms" },
}

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="bg-gradient-to-br from-brand-50 via-white to-warm-50 py-12">
        <div className="content-container max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-grey-90">Terms of Service</h1>
          <p className="text-grey-50 mt-2">Last updated: March 2026</p>
        </div>
      </section>
      <section className="py-12">
        <div className="content-container max-w-3xl prose prose-grey">
          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">1. Service Description</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">PariharaOnline (operated by Harkarma Enterprises LLP) provides an online platform for booking Hindu temple services including pujas, homams, astrology consultations, and prasad delivery. We function as a foundation with temple representatives, not as an official temple entity. We enable devotees who cannot visit temples personally to arrange authentic ritual services.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">2. Ordering Process</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">When you place an order, you agree to provide accurate sankalpam details (devotee name, nakshatram, rasi, gothram) required for the ritual. Orders are confirmed upon successful payment. You will receive an email confirmation with estimated service dates within 1-2 business days.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">3. Payment Terms</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">We accept payments via Razorpay (for Indian customers in INR) and PayPal (for international customers in USD). All prices are listed inclusive of temple fees, ritual materials, priest dakshina, and prasad packaging. Shipping charges for prasad delivery may apply separately.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">4. Service Delivery</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">Most pujas and homams are completed within 7 days of ordering. Astrology reports are delivered via email within 48 hours. Tentative dates for rituals are provided within 1-2 business days. Video evidence is provided for homams (fire rituals). Sacred prasad is shipped after the ritual with tracking information.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">5. Cancellation & Refunds</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">Cancellations before the puja is performed qualify for a full refund. Once a puja has been performed, the service is non-refundable. Prasad delivery issues (damage, non-delivery) will be addressed with replacement or refund. See our Refund Policy for complete details.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">6. Intellectual Property</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">All content on PariharaOnline including text, images, logos, and design elements is the property of Harkarma Enterprises LLP. Reproduction or distribution without permission is prohibited.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">7. Limitation of Liability</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">PariharaOnline provides spiritual services based on Hindu traditions. We do not guarantee specific outcomes from pujas or astrological advice. Our liability is limited to the amount paid for the specific service in question.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">8. Governing Law</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Tamil Nadu, India.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">9. Contact</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">For questions about these terms, contact us at hello@pariharaonline.com or WhatsApp +91-97432 44501.</p>
        </div>
      </section>
    </div>
  )
}
