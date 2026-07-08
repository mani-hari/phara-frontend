import { retrieveCustomer } from "@lib/data/customer"
import { Toaster } from "@medusajs/ui"

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
