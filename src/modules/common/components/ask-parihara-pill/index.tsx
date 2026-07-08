/* =====================================================================
   Ask Parihara — floating chat pill (idle state)
   Visible on every page. Clicking opens the chat. The full chat panel /
   immersive overlay will be wired up when the chat agent ships (Sprint 4).
   ===================================================================== */

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function AskPariharaPill() {
  return (
    <LocalizedClientLink
      href="/ask-parihara"
      aria-label="Ask Parihara"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 60,
        background: "#1a1410",
        color: "#faf6ee",
        borderRadius: 999,
        padding: "12px 20px 12px 16px",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 12px 32px rgba(26,20,16,0.3)",
        textDecoration: "none",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "var(--sindoor)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          color: "#fff",
        }}
      >
        ✦
      </span>
      <span
        style={{
          fontFamily: "var(--font-serif), 'DM Serif Text', serif",
          fontSize: 18,
          fontWeight: 500,
        }}
      >
        Ask Parihara
      </span>
    </LocalizedClientLink>
  )
}
