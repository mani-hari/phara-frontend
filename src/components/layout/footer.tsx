import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-600">
                <span className="text-lg font-bold text-white">P</span>
              </div>
              <span className="text-xl font-semibold text-stone-900">
                PariharaOnline
              </span>
            </Link>
            <p className="mt-4 text-sm text-stone-600">
              Authentic temple services and sacred prasad delivered with devotion
              to devotees worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-900">
              Services
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/collections"
                  className="text-sm text-stone-600 hover:text-amber-600"
                >
                  All Services
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/pujas"
                  className="text-sm text-stone-600 hover:text-amber-600"
                >
                  Pujas & Homams
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/prasad"
                  className="text-sm text-stone-600 hover:text-amber-600"
                >
                  Prasad Delivery
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-900">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/how-it-works"
                  className="text-sm text-stone-600 hover:text-amber-600"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-stone-600 hover:text-amber-600"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-stone-600 hover:text-amber-600"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-900">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-stone-600 hover:text-amber-600"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-stone-600 hover:text-amber-600"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="text-sm text-stone-600 hover:text-amber-600"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-stone-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-stone-500">
              &copy; {new Date().getFullYear()} PariharaOnline. All rights
              reserved.
            </p>
            <p className="text-sm text-stone-500">
              A service of the Temple Trust
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
