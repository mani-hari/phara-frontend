import { Suspense } from "react"
import Image from "next/image"

import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import { User, ShoppingBag } from "lucide-react"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative mx-auto h-20 border-b border-brand-200 bg-white/95 backdrop-blur-sm duration-200">
        <nav className="content-container flex h-full items-center justify-between px-20">
          {/* Left: Brand */}
          <div className="flex items-center h-full">
            <div className="h-full small:hidden mr-4">
              <SideMenu regions={regions} />
            </div>
            <LocalizedClientLink
              href="/"
              className="flex items-center transition-opacity hover:opacity-90"
              data-testid="nav-store-link"
            >
              <Image
                src="/mock-assets/logo.png"
                alt="PariharaOnline"
                width={286}
                height={64}
                className="h-auto w-[260px] lg:w-[286px]"
                priority
              />
            </LocalizedClientLink>
          </div>

          {/* Center: Nav links */}
          <div className="hidden small:flex items-center gap-x-8 h-full text-sm font-medium text-grey-60">
            <LocalizedClientLink
              href="/collections/pujas-and-homams"
              className="transition-colors hover:text-grey-90"
            >
              Pujas
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/collections/pujas-and-homams"
              className="transition-colors hover:text-grey-90"
            >
              Homams
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/astrology"
              className="transition-colors hover:text-grey-90"
            >
              Astrology
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/about"
              className="transition-colors hover:text-grey-90"
            >
              About
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/faq"
              className="transition-colors hover:text-grey-90"
            >
              FAQ
            </LocalizedClientLink>
          </div>

          {/* Right: Account + Cart */}
          <div className="flex items-center gap-x-4 h-full">
            <div className="hidden small:flex items-center gap-x-4 h-full">
              <LocalizedClientLink
                className="flex items-center gap-1.5 text-sm text-grey-60 transition-colors hover:text-grey-90"
                href="/account"
                data-testid="nav-account-link"
              >
                <User className="w-4 h-4" />
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="flex items-center gap-1.5 text-sm text-grey-60 transition-colors hover:text-grey-90"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Cart (0)</span>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
