// Temporary launch banner shown on every page (mounted in the root layout,
// above the sticky header). Remove this component + its usage in
// src/app/layout.tsx once the migration settles.
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
          href="tel:+919743244502"
          style={{ color: "#fff", fontWeight: 700, textDecoration: "underline", whiteSpace: "nowrap" }}
        >
          call or WhatsApp us at +91&nbsp;97432&nbsp;44502
        </a>
        .
      </span>
    </div>
  )
}
