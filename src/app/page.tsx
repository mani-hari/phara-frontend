import Link from 'next/link';
import { ArrowRight, Sparkles, Globe, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Sparkles,
    title: 'Authentic Rituals',
    description:
      'Traditional pujas and homams performed by experienced priests following vedic traditions.',
  },
  {
    icon: Globe,
    title: 'Worldwide Delivery',
    description:
      'Sacred prasad delivered to devotees across the globe with care and devotion.',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description:
      'Safe and secure payment options with Razorpay for India and PayPal internationally.',
  },
  {
    icon: Heart,
    title: 'Personalized Service',
    description:
      'Each puja includes sankalpam with your name, nakshatram, gothram, and special prayers.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-stone-900 md:text-5xl lg:text-6xl">
              Sacred Temple Services
              <span className="block text-amber-600">Delivered with Devotion</span>
            </h1>
            <p className="mb-8 text-lg text-stone-600 md:text-xl">
              Book authentic pujas, homams, and receive blessed prasad from
              renowned temples. Serving devotees worldwide with traditional
              rituals and sacred offerings.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/collections">
                  Explore Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-amber-100 opacity-50 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-orange-100 opacity-50 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-stone-900">
              Why Choose PariharaOnline
            </h2>
            <p className="mx-auto max-w-2xl text-stone-600">
              We bring the blessings of sacred temples to your doorstep with
              authenticity and devotion.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                    <feature.icon className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-stone-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-stone-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="bg-stone-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-stone-900">
              Our Services
            </h2>
            <p className="mx-auto max-w-2xl text-stone-600">
              Choose from a wide range of temple services and sacred offerings
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="overflow-hidden">
              <div className="aspect-[4/3] bg-gradient-to-br from-amber-100 to-orange-100 p-8">
                <div className="flex h-full items-center justify-center">
                  <span className="text-6xl">🪔</span>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-semibold text-stone-900">
                  Pujas & Homams
                </h3>
                <p className="mb-4 text-stone-600">
                  Traditional vedic rituals performed with devotion for your
                  well-being and prosperity.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/collections/pujas">View All Pujas</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="aspect-[4/3] bg-gradient-to-br from-green-100 to-emerald-100 p-8">
                <div className="flex h-full items-center justify-center">
                  <span className="text-6xl">🙏</span>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-semibold text-stone-900">
                  Sacred Prasad
                </h3>
                <p className="mb-4 text-stone-600">
                  Blessed offerings from temples delivered to your home with
                  sacred mantras.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/collections/prasad">View Prasad</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-pink-100 p-8">
                <div className="flex h-full items-center justify-center">
                  <span className="text-6xl">⭐</span>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-semibold text-stone-900">
                  Special Services
                </h3>
                <p className="mb-4 text-stone-600">
                  Navagraha pujas, dosham pariharas, and special occasion rituals.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/collections/special">View Special</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button size="lg" asChild>
              <Link href="/collections">
                View All Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-stone-900">
              Trusted by Devotees Worldwide
            </h2>
            <p className="mb-8 text-lg text-stone-600">
              PariharaOnline is a service of the Temple Trust, dedicated to
              bringing authentic temple experiences to devotees everywhere. Our
              priests perform each ritual with utmost devotion, ensuring your
              prayers reach the divine.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">10,000+</div>
                <div className="text-sm text-stone-600">Pujas Performed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">50+</div>
                <div className="text-sm text-stone-600">Countries Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">100%</div>
                <div className="text-sm text-stone-600">Authentic Rituals</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-amber-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Ready to Begin Your Spiritual Journey?
          </h2>
          <p className="mb-8 text-lg text-amber-100">
            Book a puja today and receive blessings from sacred temples.
          </p>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="bg-white text-amber-600 hover:bg-amber-50"
          >
            <Link href="/collections">
              Book a Puja Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
