import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for PariharaOnline - how we collect, use, and protect your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="bg-gradient-to-br from-brand-50 via-white to-warm-50 py-12">
        <div className="content-container max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-grey-90">Privacy Policy</h1>
          <p className="text-grey-50 mt-2">Last updated: March 2026</p>
        </div>
      </section>
      <section className="py-12">
        <div className="content-container max-w-3xl prose prose-grey">
          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">1. Information We Collect</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">We collect personal information necessary for providing our services: name, email address, phone number, shipping address, and puja-specific details (nakshatram, rasi, gothram, date of birth for astrology). We also automatically receive your IP address for region detection and currency selection.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">2. How We Use Information</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">Your personal information is used solely for: processing orders, performing pujas with correct sankalpam, delivering prasad, sending order confirmations and updates, providing astrology reports, and improving our services. We do not sell or share your personal data with third parties for marketing purposes.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">3. Payment Security</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">We use Razorpay (for INR payments) and PayPal (for USD payments). Card data is encrypted through the Payment Card Industry Data Security Standard (PCI-DSS). We do not store your card details on our servers. All payment processing is handled by certified payment gateways.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">4. Third-Party Services</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">We use third-party services for payment processing (Razorpay, PayPal), analytics (Google Analytics, Microsoft Clarity), and hosting (Vercel, Medusa Cloud). Each third-party service operates under its own privacy policy. We recommend reviewing their policies separately.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">5. Cookies</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">We use cookies to maintain your shopping session, remember your region preference, and improve site performance. Cookies are not used for cross-site tracking or identification. You can disable cookies in your browser settings, though this may affect site functionality.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">6. Data Retention</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">We retain your order information for accounting and service purposes. Puja details (sankalpam information) are kept for the duration needed to perform the service. You may request deletion of your personal data at any time.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">7. Your Rights</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">You have the right to access, correct, or delete your personal information. You can withdraw consent for marketing communications at any time. To exercise these rights, contact us at customercare@parihara.com or hello@pariharaonline.com.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">8. Age Requirements</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">Users must be of legal age in their jurisdiction to use our services. If you are ordering on behalf of a minor, you accept responsibility for the transaction.</p>

          <h2 className="text-xl font-bold text-grey-90 mt-8 mb-3">9. Contact</h2>
          <p className="text-grey-60 mb-4 leading-relaxed">For privacy-related questions: hello@pariharaonline.com | WhatsApp: +91 974-324-4501 | Harkarma Enterprises LLP, 1F Narayana Avenue, Krishna Colony, Trichy Road, Coimbatore 641005, Tamil Nadu, India.</p>
        </div>
      </section>
    </div>
  )
}
