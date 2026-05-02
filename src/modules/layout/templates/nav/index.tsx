import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Logo } from "@modules/common/components/brand"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "Poojas", href: "/collections/all-pujas" },
  { label: "Homams", href: "/collections/all-pujas" },
  { label: "Astrology", href: "/astrology" },
  { label: "Annadanam", href: "/products/annadhanam-donate-food-to-homeless-children" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
]

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

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
        <nav className="content-container flex items-center" style={{ height: 64, gap: 32 }}>
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
              <Logo size={32} />
            </LocalizedClientLink>
          </div>

          {/* Center: nav links */}
          <div
            className="hidden small:flex flex-1 items-center justify-center"
            style={{ gap: 26, fontSize: 14, fontWeight: 500 }}
          >
            {NAV_ITEMS.map((item, idx) => (
              <LocalizedClientLink
                key={item.label}
                href={item.href}
                className="transition-colors"
                style={{
                  color: "var(--ink)",
                  opacity: idx === 0 ? 1 : 0.7,
                  fontWeight: idx === 0 ? 600 : 500,
                  borderBottom:
                    idx === 0 ? "1.5px solid var(--sindoor)" : "1.5px solid transparent",
                  paddingBottom: 3,
                }}
              >
                {item.label}
              </LocalizedClientLink>
            ))}
          </div>

          {/* Right: locale + search + cart + sign-in */}
          <div className="flex items-center" style={{ gap: 12 }}>
            <span className="hidden small:inline" style={{ fontSize: 13, color: "var(--ink-3)" }}>
              EN · ₹ INR
            </span>
            <button
              type="button"
              aria-label="Search"
              className="inline-flex items-center justify-center"
              style={{ width: 32, height: 32, color: "var(--ink)" }}
            >
              <SearchIcon />
            </button>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="inline-flex items-center"
                  href="/cart"
                  data-testid="nav-cart-link"
                  style={{ color: "var(--ink)", fontSize: 13 }}
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
            <LocalizedClientLink
              href="/account"
              className="hidden small:inline-flex ph-btn ph-btn-ghost"
              style={{ padding: "8px 16px", fontSize: 13 }}
              data-testid="nav-account-link"
            >
              Sign in
            </LocalizedClientLink>
          </div>
        </nav>
      </header>
    </div>
  )
}
