import { Suspense } from "react"
import PaymentErrorContent from "./content"

export const metadata = { title: "Payment Error" }

export default function PaymentErrorPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "var(--paper)", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p className="ph-body" style={{ color: "var(--ink-4)" }}>Loading…</p>
      </div>
    }>
      <PaymentErrorContent />
    </Suspense>
  )
}
