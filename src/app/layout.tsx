import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import "@styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "PariharaOnline - Temple Services & Sacred Prasad",
    template: "%s | PariharaOnline",
  },
  description:
    "Book authentic temple services, pujas, homams, and receive sacred prasad from renowned temples. Serving devotees worldwide with devotion.",
  keywords: [
    "temple services",
    "puja booking",
    "homam",
    "prasad delivery",
    "online temple",
    "hindu rituals",
    "parihara",
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-mode="light">
      <body className="bg-white text-ui-fg-base">
        <main className="relative">{children}</main>
      </body>
    </html>
  )
}
