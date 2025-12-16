import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Refund Policy for PariharaOnline temple services.',
};

export default function RefundPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold text-stone-900">Refund Policy</h1>

        <div className="prose prose-stone max-w-none space-y-6">
          <p className="text-stone-600">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">Cancellation Window</h2>
            <p className="text-stone-600">
              You may request a full refund within 24 hours of placing your order, provided the
              puja has not yet been scheduled or commenced.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">After Puja is Scheduled</h2>
            <p className="text-stone-600">
              Once a puja has been scheduled with the temple priests, we cannot offer refunds as
              preparations will have already begun. However, you may request to reschedule to a
              different date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">Prasad Delivery</h2>
            <p className="text-stone-600">
              For orders including prasad delivery:
            </p>
            <ul className="list-disc pl-6 text-stone-600">
              <li>Refunds for prasad are available only if cancelled before shipping</li>
              <li>If prasad is damaged during delivery, we will send a replacement or issue a refund</li>
              <li>International shipping delays are not eligible for refunds</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">How to Request a Refund</h2>
            <p className="text-stone-600">
              To request a refund, please contact us through our Contact page with your order ID
              and reason for the refund request. We will respond within 2-3 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">Refund Processing</h2>
            <p className="text-stone-600">
              Approved refunds will be processed within 5-7 business days. The refund will be
              credited to your original payment method (Razorpay or PayPal).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
