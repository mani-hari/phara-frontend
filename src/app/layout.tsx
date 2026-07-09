import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import Script from "next/script"
import { DM_Serif_Display, DM_Serif_Text, Inter } from "next/font/google"
import "@styles/globals.css"
import { cookies } from "next/headers"
import AdminBar from "@/components/admin/admin-bar"
import TopBanner from "@/components/top-banner"
import { retrieveCustomer } from "@lib/data/customer"
import { GA4_ID, CLARITY_ID } from "@lib/analytics"

const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ||
  process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
  ""
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

// Single serif superfamily — DM Serif.
// Display: hero banners + page titles / top-level H1s.
// Text: section headers and every other serif spot (varied by size).
// Only the regular (400) style is loaded — no bold exists in DM Serif, and
// italics are unused site-wide by design.
const dmDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal"],
  variable: "--font-display",
})

const dmText = DM_Serif_Text({
  subsets: ["latin"],
  weight: "400",
  style: ["normal"],
  variable: "--font-serif",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "PariharaOnline - Ancient Rituals, Modern Convenience",
    template: "%s | PariharaOnline",
  },
  description:
    "Book authentic Hindu temple pujas, homams, and astrology services online. Sacred prasad delivered worldwide. Serving devotees globally since 2009.",
  keywords: [
    "online puja booking",
    "hindu temple services",
    "homam fire ritual",
    "prasad delivery worldwide",
    "vedic astrology consultation",
    "navagraha homam",
    "parihara remedies",
    "nakshatram puja",
    "temple pooja online",
    "sacred rituals india",
  ],
  openGraph: {
    type: "website",
    siteName: "PariharaOnline",
    title: "PariharaOnline - Ancient Rituals, Modern Convenience",
    description:
      "Book authentic Hindu temple pujas, homams, and astrology services online. Sacred prasad delivered worldwide.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PariharaOnline - Ancient Rituals, Modern Convenience",
    description:
      "Book authentic Hindu temple pujas, homams, and astrology services online.",
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ga4Id = GA4_ID
  const clarityId = CLARITY_ID

  // Admin toolbar visibility: only fetch the customer when a session cookie is
  // present (avoids an auth call for every anonymous visitor), then gate on
  // ADMIN_EMAILS.
  const hasSession = !!(await cookies()).get("_medusa_jwt")?.value
  const customer = hasSession ? await retrieveCustomer().catch(() => null) : null
  const adminEmail = customer?.email?.toLowerCase() ?? ""
  const admin =
    adminEmail && ADMIN_EMAILS.includes(adminEmail)
      ? {
          email: customer?.email,
          name: [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || null,
        }
      : null

  return (
    <html lang="en" data-mode="light">
      <head>
        {ga4Id && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${ga4Id}');
              `}
            </Script>
          </>
        )}
        {clarityId && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `}
          </Script>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "PariharaOnline",
              url: "https://pariharaonline.com",
              logo: "https://pariharaonline.com/logo.png",
              description:
                "Authentic Hindu temple services, pujas, homams, and sacred prasad delivered worldwide since 2009.",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+91-97432 44501",
                contactType: "customer service",
                availableLanguage: ["English", "Tamil", "Hindi"],
              },
              sameAs: [],
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${dmDisplay.variable} ${dmText.variable} font-sans`}
        style={{ background: "var(--paper)", color: "var(--ink-2)" }}
      >
        <TopBanner />
        <main className="relative">{children}</main>
        <AdminBar admin={admin} />
      </body>
    </html>
  )
}
