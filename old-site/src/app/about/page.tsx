import { Card, CardContent } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about PariharaOnline and our mission to bring authentic temple services to devotees worldwide.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold text-stone-900">
          About PariharaOnline
        </h1>

        <div className="prose prose-stone max-w-none">
          <p className="text-lg text-stone-600">
            PariharaOnline is a sacred initiative by the Temple Trust to bring
            authentic temple services and divine blessings to devotees across the
            world. We bridge the gap between devotees and temples, enabling
            everyone to participate in sacred rituals regardless of distance.
          </p>

          <h2 className="mt-8 text-2xl font-semibold text-stone-900">
            Our Mission
          </h2>
          <p className="text-stone-600">
            To make authentic temple services accessible to every devotee,
            preserving the sanctity and tradition of vedic rituals while embracing
            modern convenience. We believe that devotion should know no boundaries,
            and every sincere prayer deserves to reach the divine.
          </p>

          <h2 className="mt-8 text-2xl font-semibold text-stone-900">
            What We Offer
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2 font-semibold text-stone-900">
                  Pujas & Homams
                </h3>
                <p className="text-sm text-stone-600">
                  Traditional vedic rituals performed by experienced priests with
                  proper mantras and procedures.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2 font-semibold text-stone-900">
                  Sacred Prasad
                </h3>
                <p className="text-sm text-stone-600">
                  Blessed offerings from temples delivered with care and devotion
                  to your doorstep.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2 font-semibold text-stone-900">
                  Parihara Services
                </h3>
                <p className="text-sm text-stone-600">
                  Remedial pujas for doshas, navagraha shanti, and other
                  astrological remedies.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2 font-semibold text-stone-900">
                  Special Occasions
                </h3>
                <p className="text-sm text-stone-600">
                  Services for birthdays, anniversaries, shraddha, and other
                  important life events.
                </p>
              </CardContent>
            </Card>
          </div>

          <h2 className="mt-8 text-2xl font-semibold text-stone-900">
            Our Promise
          </h2>
          <ul className="mt-4 space-y-2 text-stone-600">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
              Authentic rituals performed by qualified vedic priests
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
              Personalized sankalpam with your name, gothram, and nakshatram
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
              Timely service and transparent communication
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
              Secure payments and worldwide delivery
            </li>
          </ul>

          <h2 className="mt-8 text-2xl font-semibold text-stone-900">
            Temple Trust
          </h2>
          <p className="text-stone-600">
            PariharaOnline operates under the guidance of the Temple Trust, a
            registered charitable organization dedicated to preserving and
            promoting Hindu dharma. A portion of all proceeds goes towards temple
            maintenance, priest welfare, and dharmic education.
          </p>

          <div className="mt-8 rounded-lg bg-amber-50 p-6 text-center">
            <p className="text-lg font-medium text-amber-800">
              "May your prayers be heard and your life be filled with divine
              blessings."
            </p>
            <p className="mt-2 text-amber-600">- The PariharaOnline Team</p>
          </div>
        </div>
      </div>
    </div>
  );
}
