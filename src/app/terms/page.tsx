import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for PariharaOnline temple services.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold text-stone-900">Terms of Service</h1>

        <div className="prose prose-stone max-w-none space-y-6">
          <p className="text-stone-600">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">1. Acceptance of Terms</h2>
            <p className="text-stone-600">
              By accessing and using PariharaOnline, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">2. Services</h2>
            <p className="text-stone-600">
              PariharaOnline provides online booking for temple services including pujas, homams,
              and prasad delivery. All services are performed by qualified priests following
              traditional vedic procedures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">3. Booking and Payment</h2>
            <p className="text-stone-600">
              All bookings must be paid in full at the time of order. We accept payments via
              Razorpay (for India) and PayPal (for international customers). Prices are displayed
              in your local currency based on your location.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">4. Service Delivery</h2>
            <p className="text-stone-600">
              Pujas and homams are typically performed within 3-7 days of booking. You will receive
              email confirmation once the service is completed. Prasad delivery times vary based on
              location.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">5. Cancellation</h2>
            <p className="text-stone-600">
              Cancellation requests must be made within 24 hours of booking. Once a puja has been
              scheduled or performed, cancellations may not be possible. Please refer to our
              Refund Policy for more details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">6. Contact</h2>
            <p className="text-stone-600">
              For any questions regarding these terms, please contact us through our Contact page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
