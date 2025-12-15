import type { Metadata } from 'next';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with PariharaOnline for questions about temple services.',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold text-stone-900">Contact Us</h1>
        <p className="mb-8 text-stone-600">
          Have questions about our services? We are here to help. Reach out to us through
          any of the following methods.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Mail className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">Email</h3>
                <p className="text-stone-600">support@pariharaonline.com</p>
                <p className="mt-1 text-sm text-stone-500">We respond within 24 hours</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Phone className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">Phone</h3>
                <p className="text-stone-600">+91 XXXXX XXXXX</p>
                <p className="mt-1 text-sm text-stone-500">Mon-Sat, 9am-6pm IST</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardContent className="flex items-start gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <MapPin className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">Address</h3>
              <p className="text-stone-600">
                PariharaOnline<br />
                Temple Trust Office<br />
                Chennai, Tamil Nadu, India
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 rounded-lg bg-amber-50 p-6">
          <h3 className="mb-2 font-semibold text-amber-800">Before You Contact Us</h3>
          <p className="text-amber-700">
            Please check our <a href="/faq" className="underline">FAQ page</a> for answers to
            common questions about bookings, payments, and prasad delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
