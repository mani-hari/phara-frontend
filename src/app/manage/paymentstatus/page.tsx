import { Metadata } from "next"
import { isManageAuthed } from "@lib/manage-auth"
import PaymentStatusForm from "./payment-status-form"
import PasswordGate from "../password-gate"

export const metadata: Metadata = {
  title: "Payment Status Check",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

// Simple shared-password gate, deliberately NOT tied to Medusa customer/admin
// accounts — pariharaonline@gmail.com is a STAFF email that needs access to
// THIS tool only, not the Medusa admin dashboard or owner-only sales data.
// Same pattern as parihara-video-studio's APP_PASSWORD gate. See
// src/lib/manage-auth.ts.
export default async function PaymentStatusPage() {
  const authed = await isManageAuthed()

  if (!authed) {
    return <PasswordGate />
  }

  return <PaymentStatusForm />
}
