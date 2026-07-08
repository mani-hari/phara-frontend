import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "Refund and cancellation policy for PariharaOnline temple services, puja bookings, and prasad delivery.",
  alternates: { canonical: "/refund" },
  openGraph: { url: "/refund" },
}

export default function RefundPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="bg-gradient-to-br from-brand-50 via-white to-warm-50 py-12">
        <div className="content-container max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-grey-90">Refund & Cancellation Policy</h1>
          <p className="text-grey-50 mt-2">Last updated: March 2026</p>
        </div>
      </section>
      <section className="py-12">
        <div className="content-container max-w-3xl prose prose-grey">
          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">1. Cancellation Before Service</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">If you cancel your order before the puja or homam has been performed, you are eligible for a full refund. Cancellation requests must be submitted via email (hello@pariharaonline.com) or WhatsApp (+91 974-324-4501).</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">2. After Service Completion</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">Once a puja, homam, or ritual has been performed at the temple, the service is considered delivered and is non-refundable. This is because the ritual materials have been used and the priest&apos;s service has been rendered.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">3. Astrology Reports</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">Astrology reports can be cancelled for a full refund if the astrologer has not yet begun the analysis. Once the report has been prepared and delivered via email, refunds are not available. If you are unsatisfied with the report, contact us to discuss a complimentary follow-up.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">4. Prasad Delivery Issues</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">If your prasad is damaged during shipping, lost in transit, or not delivered within the expected timeframe, we will either ship a replacement or issue a full refund for the prasad component. Please report delivery issues within 7 days of the expected delivery date with supporting evidence (photos of damage, tracking information).</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">5. Refund Processing</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">Approved refunds are processed within 5-7 business days. Razorpay refunds are credited back to the original payment method (UPI, card, or bank account). PayPal refunds are returned to the PayPal account or card used for payment. Processing times may vary depending on your bank or payment provider.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">6. Partial Refunds</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">In cases where a service has been partially completed (e.g., puja performed but prasad not yet shipped), partial refunds may be issued for the undelivered component. The refund amount will be determined on a case-by-case basis.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">7. How to Request a Refund</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">To request a refund or cancellation, contact us with your order number via: Email: hello@pariharaonline.com | WhatsApp: +91 974-324-4501 | We aim to respond to all refund requests within 24 hours.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">8. Exceptions</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">Festival-specific services (e.g., Navratri, Maha Shivaratri packages) booked during the festival period may have different cancellation windows due to advance temple scheduling. These exceptions will be clearly noted on the product page at the time of booking.</p>
        </div>
      </section>
    </div>
  )
}
