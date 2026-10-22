import type { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { Toaster } from "@medusajs/ui"

// Account pages (sign-in, register, password reset, orders) are private: keep them out of search results.
export const metadata: Metadata = { robots: { index: false, follow: true } }

export default async function AccountPageLayout({
  children,
  dashboard,
  login,
}: {
  children?: React.ReactNode
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)

  return (
    <>
      {/* Regular sub-routes (signin, register, google-callback, …) render here,
          full-screen, without account chrome. */}
      {children}
      {/* The /account index shows login-or-dashboard; each slot brings its own
          AccountLayout chrome. On sub-routes both slots resolve to null defaults. */}
      {customer ? dashboard : login}
      <Toaster />
    </>
  )
}
