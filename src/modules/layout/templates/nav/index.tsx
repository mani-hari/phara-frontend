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
              <Logo size={24} />
            </LocalizedClientLink>
            {/* Ask Parihara — outline pill, sits next to the logo */}
            <LocalizedClientLink
              href="/ask-parihara"
              className="hidden small:inline-flex items-center"
              style={{
                border: "1.5px solid var(--ink)",
                color: "var(--ink)",
                background: "transparent",
                borderRadius: 999,
                padding: "6px 16px",
                fontWeight: 600,
                fontSize: 14,
                whiteSpace: "nowrap",
                marginLeft: 4,
              }}
            >
              Ask Parihara
            </LocalizedClientLink>
          </div>

          {/* Center: nav links with active state (client component) */}
          <NavLinks />

          {/* Right: search + cart + sign-in */}
          <div className="flex items-center" style={{ gap: 10 }}>
            <NavSearch />
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
            {/* Sign in hidden for now — accounts to be enabled later. */}
          </div>
        </nav>
      </header>
    </div>
  )
}
