import { retrieveCustomer } from "@lib/data/customer"
import AccountLayout from "@modules/account/templates/account-layout"

// The account chrome (nav sidebar + footer) now lives on the slots rather than
// the account layout, so full-screen auth sub-routes (signin/register/callback,
// rendered via `children`) don't inherit it.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)
  return <AccountLayout customer={customer}>{children}</AccountLayout>
}
