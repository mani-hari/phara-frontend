import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import Script from "next/script"
import {
  Cormorant_Garamond,
  DM_Serif_Display,
  Inter,
  Playfair_Display,
} from "next/font/google"
import "@styles/globals.css"
import Providers from "@/components/providers"
import AdminBar from "@/components/admin/admin-bar"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  variable: "--font-serif",
})

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-playfair",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID

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
                telephone: "+91-974-324-4501",
                contactType: "customer service",
                availableLanguage: ["English", "Tamil", "Hindi"],
              },
              address: {
                "@type": "PostalAddress",
                streetAddress: "1F Narayana Avenue, Krishna Colony, Trichy Road",
                addressLocality: "Coimbatore",
                addressRegion: "Tamil Nadu",
                postalCode: "641005",
                addressCountry: "IN",
              },
              sameAs: [],
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${cormorant.variable} ${dmSerif.variable} ${playfair.variable} font-sans`}
        style={{ background: "var(--paper)", color: "var(--ink-2)" }}
      >
        <Providers>
          <main className="relative">{children}</main>
          <AdminBar />
        </Providers>
      </body>
    </html>
  )
}
