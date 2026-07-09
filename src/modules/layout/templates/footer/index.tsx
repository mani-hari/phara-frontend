import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Logo } from "@modules/common/components/brand"

type FooterColumn = {
  title: string
  links: { label: string; href: string }[]
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Services",
    links: [
      { label: "Temple Poojas", href: "/collections/pujas-and-homams" },
      { label: "Homams", href: "/collections/pujas-and-homams" },
      { label: "Astrology", href: "/astrology" },
      { label: "Prasadam", href: "/products/garbharakshambika-ghee" },
      { label: "Annadanam", href: "/products/annadhanam-donate-food-to-homeless-children" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Ask Parihara", href: "/ask-parihara" },
      { label: "About", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Refunds", href: "/refund" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Contact", href: "/contact" },
    ],
  },
]

export default async function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        background: "#1a1410",
        color: "rgba(250, 246, 238, 0.75)",
        padding: "48px 0 32px",
      }}
    >
      <div className="content-container">
        <div
          className="grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr repeat(3, 1fr)",
            gap: 40,
          }}
        >
          <div className="col-span-full small:col-span-1" style={{ minWidth: 240 }}>
            <Logo size={44} dark showTagline />
            <p
              className="ph-body-sm"
              style={{ color: "rgba(250,246,238,0.6)", maxWidth: 320, marginTop: 16 }}
            >
              Sacred rituals, performed in your name. Trusted by 4,200+ devotees across 18
              countries.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <div
                className="ph-eyebrow ph-eyebrow-gold"
                style={{ marginBottom: 12 }}
              >
                {col.title}
              </div>
              <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <LocalizedClientLink
                      href={link.href}
                      style={{
                        fontSize: 13,
                        color: "rgba(250,246,238,0.75)",
                      }}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col small:flex-row items-start small:items-center justify-between gap-3"
          style={{
            borderTop: "1px solid rgba(250,246,238,0.1)",
            paddingTop: 16,
            marginTop: 32,
            fontSize: 11,
            color: "rgba(250,246,238,0.4)",
          }}
        >
          <span>© {year} PariharaOnline · Made with देवोत्त</span>
          <span>Privacy · Terms · Cookies</span>
        </div>
      </div>
    </footer>
  )
}
