import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"
import AccountLayout from "@modules/account/templates/account-layout"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Medusa Store account.",
}

export default function Login() {
  // Only shown when logged out — no customer, so no account nav sidebar.
  return (
    <AccountLayout customer={null}>
      <LoginTemplate />
    </AccountLayout>
  )
}
