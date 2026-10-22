import type { Metadata } from "next"
import { og } from "@lib/util/og"

// The page is a client component, so its metadata lives here. One canonical URL for every ?q=… variant
// (Search Console flagged them as duplicates without a canonical, 22 Oct 2026).
export const metadata: Metadata = {
  title: "Ask Parihara: find the right pooja for your need",
  description: "Tell us what you are praying for and our guide suggests the right pooja or homam, with the temple and what happens next.",
  alternates: { canonical: "/ask-parihara" },
  openGraph: og({ url: "/ask-parihara" }),
}

export default function AskPariharaLayout({ children }: { children: React.ReactNode }) {
  return children
}
