import { Suspense } from "react"
import PaymentErrorContent from "./content"

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { reason?: string }
}) {
  // A paid customer must never see "error", not even in the tab title.
  return {
    title:
      searchParams?.reason === "paid_pending_order"
        ? "Payment Received"
        : "Payment Error",
  }
}

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
