import Link from "next/link"
import { localizeHref } from "@lib/util/localize-href"

export default function AskPariharaBanner({
  query,
  countryCode,
  compact = false,
}: {
  query: string
  countryCode: string
  compact?: boolean
}) {
  const href = localizeHref(countryCode, `/ask-parihara?q=${encodeURIComponent(query)}`)

  return (
    <div
      data-testid={compact ? "ask-parihara-banner-compact" : "ask-parihara-banner"}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: compact ? 12 : 16,
        padding: compact ? "12px 16px" : "24px 28px",
        background: compact ? "var(--cream)" : "var(--sindoor-soft)",
        border: "1px solid var(--ink-line)",
        borderRadius: "var(--r-lg)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p
          className={compact ? "ph-body-sm" : "ph-h4"}
          style={{ margin: 0, color: "var(--ink)", fontWeight: compact ? 600 : undefined }}
        >
          Have more questions about “{query}”?
        </p>
        {!compact && (
          <p className="ph-body-sm" style={{ margin: "6px 0 0", color: "var(--ink-3)" }}>
            Ask Parihara can explain which pooja or remedy fits your situation.
          </p>
        )}
      </div>
      <Link
        href={href}
        className={compact ? "ph-btn ph-btn-ghost" : "ph-btn ph-btn-sindoor"}
        style={{ textDecoration: "none", flexShrink: 0 }}
      >
        Ask Parihara
      </Link>
    </div>
  )
}
