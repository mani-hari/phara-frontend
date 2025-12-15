import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for PariharaOnline temple services.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold text-stone-900">Privacy Policy</h1>

        <div className="prose prose-stone max-w-none space-y-6">
          <p className="text-stone-600">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">Information We Collect</h2>
            <p className="text-stone-600">
              We collect information you provide when booking services, including your name, email,
              phone number, shipping address, and puja details (devotee name, nakshatram, gothram, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">How We Use Your Information</h2>
            <p className="text-stone-600">
              Your information is used to:
            </p>
            <ul className="list-disc pl-6 text-stone-600">
              <li>Process your orders and perform pujas with accurate sankalpam</li>
              <li>Send order confirmations and updates</li>
              <li>Deliver prasad to your address</li>
              <li>Respond to your inquiries</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">Data Security</h2>
            <p className="text-stone-600">
              We use industry-standard security measures to protect your personal information.
              Payment processing is handled securely by Razorpay and PayPal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">Cookies</h2>
            <p className="text-stone-600">
              We use essential cookies to maintain your shopping cart and remember your region
              preferences. We do not use tracking cookies for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">Third-Party Services</h2>
            <p className="text-stone-600">
              We use trusted third-party services for payment processing (Razorpay, PayPal) and
              hosting (Vercel, Medusa Cloud). These services have their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">Contact Us</h2>
            <p className="text-stone-600">
              For privacy-related questions, please contact us through our Contact page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
