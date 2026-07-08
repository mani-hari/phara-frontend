"use client"

import { usePathname } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Ask Parihara lives next to the logo (see nav template) — these are the
// centered items.
const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Poojas & Homams", href: "/collections/pujas-and-homams" },
  { label: "Astrology", href: "/astrology" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
]

const ACTIVE_BROWN = "#8b5a2b"

export default function NavLinks() {
  const pathname = usePathname()

  const isActiveHref = (href: string) => {
    if (href === "/") {
      // home is "/" or a bare country prefix like "/us"
      return pathname === "/" || /^\/[a-z]{2}\/?$/.test(pathname)
    }
    return pathname.includes(href)
  }

  return (
    <div
      className="hidden small:flex flex-1 items-center justify-center"
      style={{ gap: 26, fontSize: 14, fontWeight: 500 }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = isActiveHref(item.href)
        return (
          <LocalizedClientLink
            key={item.label}
            href={item.href}
            className="transition-colors"
            style={{
              color: "var(--ink)",
              opacity: isActive ? 1 : 0.7,
              fontWeight: isActive ? 600 : 500,
              borderBottom: isActive
                ? `2px solid ${ACTIVE_BROWN}`
                : "2px solid transparent",
              paddingBottom: 3,
              display: "inline-flex",
              alignItems: "center",
              whiteSpace: "nowrap",
              transition: "color 0.15s, opacity 0.15s",
            }}
          >
            {item.label}
          </LocalizedClientLink>
        )
      })}
    </div>
  )
}
