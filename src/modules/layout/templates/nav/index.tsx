import { Suspense } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Logo } from "@modules/common/components/brand"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import NavLinks from "@modules/layout/components/nav-links"
import NavSearch from "@modules/layout/components/nav-search"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  return (
    <div
      className="sticky top-0 inset-x-0 z-50"
      style={{
        background: "rgba(250, 246, 238, 0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--ink-line)",
      }}
    >
      <header className="mx-auto">
        <nav className="content-container flex items-center justify-between" style={{ height: 64, gap: 16 }}>
          {/* Left: side menu (mobile) + brand */}
          <div className="flex items-center" style={{ gap: 12 }}>
            <div className="small:hidden">
              <SideMenu regions={regions} />
            </div>
            <LocalizedClientLink
              href="/"
              className="inline-flex items-center"
              data-testid="nav-store-link"
              aria-label="PariharaOnline home"
            >
              <Logo size={24} />
            </LocalizedClientLink>
          </div>

          {/* Center: nav links with active state (client component) */}
          <NavLinks />

          {/* Right: search + cart + sign-in (sign-in lives in the side menu on phones) */}
          <div className="ph-hdr-actions">
            <NavSearch />
            <Suspense
              fallback={
                <LocalizedClientLink className="ph-hdr-btn ph-hdr-cart" href="/cart" data-testid="nav-cart-link" aria-label="Cart">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path d="M2 3h3l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2L21 7H6" />
                  </svg>
                  <span className="ph-hdr-label">Cart</span>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
            <LocalizedClientLink className="ph-hdr-btn ph-hdr-signin" href="/account/signin" data-testid="nav-account-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
              </svg>
              Sign in
            </LocalizedClientLink>
          </div>
        </nav>
      </header>
    </div>
  )
}
