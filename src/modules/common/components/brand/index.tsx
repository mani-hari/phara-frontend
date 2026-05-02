import React, { CSSProperties, ReactNode } from "react"

/* =====================================================================
   Parihara V3 — Brand primitives (ported from hifi/brand.jsx)
   These are visual atoms used across the site: logo, ornaments,
   stars, image placeholders, section header.
   ===================================================================== */

type LogoProps = {
  size?: number
  dark?: boolean
  showTagline?: boolean
}

export const Logo = ({ size = 36, dark = false, showTagline = false }: LogoProps) => {
  const fg = dark ? "#faf6ee" : "#1a1410"
  const accent = "#b6442e"
  const gold = "#b88746"
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
        <circle cx="32" cy="32" r="29" fill="none" stroke={gold} strokeWidth={1.4} />
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * 22.5 * Math.PI) / 180
          const x1 = 32 + Math.cos(a) * 22
          const y1 = 32 + Math.sin(a) * 22
          const x2 = 32 + Math.cos(a) * 28
          const y2 = 32 + Math.sin(a) * 28
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={gold}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
          )
        })}
        <circle cx="32" cy="32" r="18" fill={accent} />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * 45 * Math.PI) / 180
          const cx = 32 + Math.cos(a) * 11
          const cy = 32 + Math.sin(a) * 11
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={3.2}
              ry={1.6}
              fill="#fae3b8"
              transform={`rotate(${i * 45} ${cx} ${cy})`}
            />
          )
        })}
        <circle cx="32" cy="32" r={3.5} fill="#fae3b8" />
        <circle cx="32" cy="32" r={1.5} fill={accent} />
      </svg>
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span
          className="font-serif"
          style={{
            fontWeight: 600,
            fontSize: size * 0.55,
            color: fg,
            letterSpacing: "-0.01em",
          }}
        >
          Parihara<span style={{ color: accent }}>·</span>Online
        </span>
        {showTagline && (
          <span
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: gold,
              marginTop: 4,
            }}
          >
            Guided since 2009
          </span>
        )}
      </span>
    </span>
  )
}

type KolamCornerProps = {
  size?: number
  color?: string
  style?: CSSProperties
}

export const KolamCorner = ({ size = 64, color = "#b88746", style }: KolamCornerProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={style} aria-hidden>
    <g fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M2 2 L62 2" opacity={0.4} />
      <path d="M2 2 L2 62" opacity={0.4} />
      <path d="M2 14 Q 14 14 14 2" />
      <path d="M2 26 Q 26 26 26 2" opacity={0.6} />
      <circle cx="8" cy="8" r={1.2} fill={color} stroke="none" />
      <circle cx="20" cy="8" r={0.8} fill={color} stroke="none" opacity={0.6} />
      <circle cx="8" cy="20" r={0.8} fill={color} stroke="none" opacity={0.6} />
      <path d="M20 20 Q 26 14 32 20 Q 26 26 20 20" opacity={0.7} />
    </g>
  </svg>
)

export const CenterSigil = ({ size = 22, color = "#b88746" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <g fill="none" stroke={color} strokeWidth={1.1}>
      <circle cx="12" cy="12" r={3.5} />
      <path d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12" />
      <path
        d="M5 5 L7.5 7.5 M16.5 7.5 L19 5 M5 19 L7.5 16.5 M16.5 16.5 L19 19"
        opacity={0.6}
      />
    </g>
    <circle cx="12" cy="12" r={1.5} fill={color} />
  </svg>
)

export const GoldRule = ({ style }: { style?: CSSProperties }) => (
  <div className="ph-gold-rule" style={style}>
    <span className="diamond" />
  </div>
)

type SectionHeaderProps = {
  eyebrow?: string
  title: ReactNode
  sub?: ReactNode
  align?: "left" | "center"
  children?: ReactNode
}

export const SectionHeader = ({
  eyebrow,
  title,
  sub,
  align = "left",
  children,
}: SectionHeaderProps) => (
  <div style={{ textAlign: align }}>
    {eyebrow && (
      <div
        className="flex items-center gap-2"
        style={{
          justifyContent: align === "center" ? "center" : "flex-start",
          marginBottom: 12,
        }}
      >
        <CenterSigil size={14} />
        <span className="ph-eyebrow ph-eyebrow-gold">{eyebrow}</span>
        <CenterSigil size={14} />
      </div>
    )}
    <div className="ph-h2">{title}</div>
    {sub && (
      <div
        className="ph-body-lg"
        style={{
          color: "var(--ink-3)",
          maxWidth: 560,
          marginLeft: align === "center" ? "auto" : 0,
          marginRight: align === "center" ? "auto" : 0,
          marginTop: 12,
        }}
      >
        {sub}
      </div>
    )}
    {children}
  </div>
)

type StarsProps = { value?: number; count?: number; size?: number }

export const Stars = ({ value = 5, count, size = 13 }: StarsProps) => {
  const full = Math.floor(value)
  const empty = 5 - Math.ceil(value)
  const half = value % 1 ? "⯨" : ""
  return (
    <span className="inline-flex items-center gap-2">
      <span style={{ color: "var(--gold)", letterSpacing: 1, fontSize: size }}>
        {"★".repeat(full)}
        {half}
        {"☆".repeat(empty)}
      </span>
      {count != null && (
        <span className="ph-body-sm ph-num">
          {value.toFixed(1)} · {count.toLocaleString()} reviews
        </span>
      )}
    </span>
  )
}

type ImgProps = {
  children?: ReactNode
  deep?: boolean
  style?: CSSProperties
  className?: string
}

export const Img = ({ children, deep, style, className = "" }: ImgProps) => (
  <div className={`ph-imgph ${deep ? "ph-imgph-deep" : ""} ${className}`} style={style}>
    {children}
  </div>
)

export const Pulse = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12,
      color: "var(--sage)",
      fontWeight: 500,
    }}
  >
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: "var(--sage)",
        boxShadow: "0 0 0 3px rgba(111,122,90,0.25)",
      }}
    />
    {children}
  </span>
)

export const TrustRow = () => (
  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
    {(
      [
        ["Performed by certified priests", "✓"],
        ["HD video sent within 24 hours", "▶"],
        ["Prasadam shipped worldwide", "✈"],
        ["4,200+ devotees · 18 countries", "⌘"],
      ] as const
    ).map(([t, ic]) => (
      <span key={t} className="inline-flex items-center gap-2">
        <span style={{ color: "var(--sindoor)", fontSize: 14 }}>{ic}</span>
        <span className="ph-body-sm" style={{ color: "var(--ink-3)" }}>
          {t}
        </span>
      </span>
    ))}
  </div>
)
