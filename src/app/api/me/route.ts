import { NextResponse } from "next/server"
import { retrieveCustomer } from "@lib/data/customer"

// Lightweight auth-state probe for client components (the Medusa session lives
// in an httpOnly cookie, so the browser can't read it directly).
export async function GET() {
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) return NextResponse.json({ loggedIn: false })
  return NextResponse.json({
    loggedIn: true,
    email: customer.email,
    name: [customer.first_name, customer.last_name].filter(Boolean).join(" ") || null,
  })
}
