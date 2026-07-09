import { CONTACT, waLink } from "@lib/contact"

// Temporary launch banner shown on every page (mounted in the root layout,
// above the sticky header). Remove this component + its usage in
// src/app/layout.tsx once the migration settles. Uses the shared CONTACT config
// so the support number stays correct in one place.
export default function TopBanner() {
  return (
    <div
      style={{
        background: "var(--sindoor)",
        color: "#fff",
        textAlign: "center",
        fontSize: 12.5,
        lineHeight: 1.45,
        padding: "7px 16px",
      }}
    >
      <span>
        🙏 We&rsquo;ve just moved to a brand-new website. If anything looks off or
        you need a hand,{" "}
        <a
          href={waLink("Hi, I need help with the new PariharaOnline website.")}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#fff", fontWeight: 700, textDecoration: "underline", whiteSpace: "nowrap" }}
        >
          message us on WhatsApp at {CONTACT.whatsappDisplay}
        </a>
        .
      </span>
    </div>
  )
}
