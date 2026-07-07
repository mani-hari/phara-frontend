"use client"

import { usePathname } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Ask Parihara", href: "/ask-parihara" },
  { label: "Poojas & Homams", href: "/collections/pujas-and-homams" },
  { label: "Astrology", href: "/astrology" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
]

export default function NavLinks() {
  const pathname = usePathname()

  return (
    <div
      className="hidden small:flex flex-1 items-center justify-center"
      style={{ gap: 26, fontSize: 14, fontWeight: 500 }}
    >
      {NAV_ITEMS.map((item, idx) => {
        const isAsk = item.href === "/ask-parihara"
        const isActive =
          pathname === item.href ||
          pathname.includes(`/in${item.href}`) ||
          (item.href !== "/" && pathname.includes(item.href))

        return (
          <LocalizedClientLink
            key={item.label}
            href={item.href}
            className="transition-colors"
            style={{
              color: isAsk ? "var(--sindoor)" : "var(--ink)",
              opacity: isActive || isAsk ? 1 : 0.7,
              fontWeight: isAsk || isActive ? 600 : 500,
              borderBottom: isActive
                ? "1.5px solid var(--sindoor)"
                : "1.5px solid transparent",
              paddingBottom: 3,
              display: "inline-flex",
              alignItems: "center",
              textShadow: isActive ? "0 0 18px rgba(182,68,46,0.25)" : "none",
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
