import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Common questions about PariharaOnline temple services.',
};

const faqs = [
  {
    question: 'How do I book a puja?',
    answer: 'Browse our services, select the puja you want, fill in your details (name, nakshatram, gothram, etc.), and complete the payment. You will receive a confirmation email once your booking is confirmed.',
  },
  {
    question: 'How long does it take to perform the puja?',
    answer: 'Most pujas are performed within 3-7 days of booking. For specific date requests, please mention your preferred date during checkout and we will try to accommodate it.',
  },
  {
    question: 'Will I receive any confirmation after the puja?',
    answer: 'Yes, you will receive an email confirmation once the puja is completed. For some services, we may also share photos or videos of the ritual.',
  },
  {
    question: 'How is prasad delivered?',
    answer: 'Prasad is carefully packed and shipped via courier. Delivery takes 5-7 business days within India and 2-3 weeks for international orders.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'For customers in India, we accept all payment methods via Razorpay (UPI, cards, net banking, wallets). For international customers, we accept PayPal and international cards.',
  },
  {
    question: 'Can I book a puja for someone else?',
    answer: 'Yes, you can book a puja for family members or friends. Just enter their details (name, nakshatram, gothram) in the puja details section during checkout.',
  },
  {
    question: 'What if I need to cancel my order?',
    answer: 'You can request a cancellation within 24 hours of booking if the puja has not been scheduled. Please refer to our Refund Policy for more details.',
  },
  {
    question: 'Are the priests qualified?',
    answer: 'Yes, all our priests are trained vedic scholars with years of experience. They follow traditional procedures and mantras as prescribed in the scriptures.',
  },
  {
    question: 'Do you ship prasad internationally?',
    answer: 'Yes, we ship prasad to most countries worldwide. International shipping charges apply and delivery times vary by destination.',
  },
  {
    question: 'How can I track my prasad delivery?',
    answer: 'Once your prasad is shipped, you will receive a tracking number via email. You can use this to track your delivery status.',
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold text-stone-900">Frequently Asked Questions</h1>
        <p className="mb-8 text-stone-600">
          Find answers to common questions about our temple services and prasad delivery.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <h3 className="mb-2 font-semibold text-stone-900">{faq.question}</h3>
                <p className="text-stone-600">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
