import { listCollections } from "@lib/data/collections"
import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { Phone, Mail, MessageCircle } from "lucide-react"

export default async function Footer() {
  const { collections } = await listCollections({ fields: "*products" })

  return (
    <footer className="w-full bg-[#1F2937] text-grey-20">
      <div className="content-container">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-10 px-20 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + Contact */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Image
              src="/mock-assets/logo.png"
              alt="PariharaOnline"
              width={250}
              height={56}
              className="h-auto w-[250px]"
            />
            <p className="mt-5 text-sm leading-7 text-grey-40">
              Ancient rituals, modern convenience. Authentic Hindu spiritual
              services by experienced Vedic scholars.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="https://wa.me/919743244501"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-grey-30 hover:text-brand-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: +91 974-324-4501</span>
              </a>
              <a
                href="tel:+919743244501"
                className="flex items-center gap-2 text-sm text-grey-30 hover:text-brand-400 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>+91 974-324-4501</span>
              </a>
              <a
                href="mailto:hello@pariharaonline.com"
                className="flex items-center gap-2 text-sm text-grey-30 hover:text-brand-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>hello@pariharaonline.com</span>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-grey-0 mb-4 uppercase tracking-wider">
              Services
            </h3>
            <ul className="flex flex-col gap-2.5">
              {collections?.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <LocalizedClientLink
                    href={`/collections/${c.handle}`}
                    className="text-sm text-grey-40 hover:text-brand-400 transition-colors"
                  >
                    {c.title}
                  </LocalizedClientLink>
                </li>
              ))}
              <li>
                <LocalizedClientLink
                  href="/store"
                  className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
                >
                  View All Services &rarr;
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-sm font-semibold text-grey-0 mb-4 uppercase tracking-wider">
              Information
            </h3>
            <ul className="flex flex-col gap-2.5">
              <li>
                <LocalizedClientLink
                  href="/how-it-works"
                  className="text-sm text-grey-40 hover:text-brand-400 transition-colors"
                >
                  How It Works
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/about"
                  className="text-sm text-grey-40 hover:text-brand-400 transition-colors"
                >
                  About Us
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/faq"
                  className="text-sm text-grey-40 hover:text-brand-400 transition-colors"
                >
                  FAQ
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/astrology"
                  className="text-sm text-grey-40 hover:text-brand-400 transition-colors"
                >
                  Astrology Services
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/contact"
                  className="text-sm text-grey-40 hover:text-brand-400 transition-colors"
                >
                  Contact Us
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/blog"
                  className="text-sm text-grey-40 hover:text-brand-400 transition-colors"
                >
                  Blog
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm font-semibold text-grey-0 mb-4 uppercase tracking-wider">
              Policies
            </h3>
            <ul className="flex flex-col gap-2.5">
              <li>
                <LocalizedClientLink
                  href="/terms"
                  className="text-sm text-grey-40 hover:text-brand-400 transition-colors"
                >
                  Terms of Service
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/privacy"
                  className="text-sm text-grey-40 hover:text-brand-400 transition-colors"
                >
                  Privacy Policy
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/refund"
                  className="text-sm text-grey-40 hover:text-brand-400 transition-colors"
                >
                  Refund Policy
                </LocalizedClientLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-grey-80 px-20 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Text className="text-xs text-grey-50">
            &copy; {new Date().getFullYear()} PariharaOnline (Harkarma
            Enterprises LLP). All rights reserved.
          </Text>
          <Text className="text-xs text-grey-50">
            Coimbatore, Tamil Nadu, India
          </Text>
        </div>
      </div>
    </footer>
  )
}
