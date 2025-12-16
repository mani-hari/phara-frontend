import Link from 'next/link';
import { ShoppingCart, CreditCard, Send, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Learn how to book temple services and receive sacred prasad through PariharaOnline.',
};

const steps = [
  {
    icon: ShoppingCart,
    title: 'Browse & Select',
    description:
      'Explore our collection of pujas, homams, and prasad services. Each service includes detailed information about the ritual and its benefits.',
  },
  {
    icon: Sparkles,
    title: 'Provide Details',
    description:
      'Enter your puja details including devotee name, nakshatram, rasi, gothram, and any special requests for the sankalpam.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description:
      'Pay securely using Razorpay (India) or PayPal (International). We support cards, UPI, net banking, and more.',
  },
  {
    icon: Send,
    title: 'Receive Blessings',
    description:
      'Our priests perform the puja with your details. You receive confirmation and prasad (if applicable) is shipped to you.',
  },
];

const faqs = [
  {
    question: 'How long does it take to perform the puja?',
    answer:
      'Most pujas are performed within 3-7 days of booking. Special or elaborate pujas may take longer. You will receive an email confirmation once the puja is completed.',
  },
  {
    question: 'Can I request a specific date for the puja?',
    answer:
      'Yes, you can provide your preferred date during checkout. We will try our best to accommodate your request based on temple schedules and auspicious timings.',
  },
  {
    question: 'How is the prasad delivered?',
    answer:
      'Prasad is carefully packed and shipped via courier. For India, delivery typically takes 5-7 business days. International delivery may take 2-3 weeks depending on the destination.',
  },
  {
    question: 'What if I need to modify or cancel my order?',
    answer:
      'Please contact us within 24 hours of placing your order if you need to make changes. Once the puja has been scheduled, modifications may not be possible.',
  },
  {
    question: 'Are the priests qualified?',
    answer:
      'All our priests are trained vedic scholars with years of experience in performing traditional rituals. They follow proper procedures and mantras as prescribed in the scriptures.',
  },
  {
    question: 'How will I know the puja was performed?',
    answer:
      'You will receive an email confirmation once the puja is completed. For some services, we may also share photos or videos of the ritual.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <h1 className="mb-4 text-3xl font-bold text-stone-900">How It Works</h1>
        <p className="text-lg text-stone-600">
          Booking temple services with PariharaOnline is simple and convenient.
          Follow these easy steps to receive divine blessings.
        </p>
      </div>

      {/* Steps */}
      <div className="mb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Card key={step.title} className="relative">
              <CardContent className="pt-8">
                <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <step.icon className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="mb-2 font-semibold text-stone-900">
                  {step.title}
                </h3>
                <p className="text-sm text-stone-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-center text-2xl font-bold text-stone-900">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.question}>
              <CardContent className="p-6">
                <h3 className="mb-2 font-semibold text-stone-900">
                  {faq.question}
                </h3>
                <p className="text-stone-600">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-lg text-stone-600">
            Ready to receive divine blessings?
          </p>
          <Button size="lg" asChild>
            <Link href="/collections">
              Browse Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
