/*
 * Bare layout for Keystatic admin — no nav, no footer, no Ask Parihara pill.
 * The admin UI is self-contained.
 */
export default function KeystaticLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
