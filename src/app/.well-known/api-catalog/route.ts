import { NextResponse } from "next/server"

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.pariharaonline.com").replace(/\/$/, "")

// RFC 9727 API catalog. Deliberately narrow: this storefront has no public
// developer API program, so we only advertise the safe, read-only surface
// (docs + status) rather than inventing an OpenAPI spec for one that doesn't
// exist. Cart/checkout/order endpoints are intentionally NOT listed here.
export function GET() {
  const body = {
    linkset: [
      {
        anchor: SITE,
        links: [
          { rel: "service-doc", href: `${SITE}/llms.txt` },
          { rel: "status", href: `${SITE}/api/health` },
        ],
      },
    ],
  }

  return NextResponse.json(body, {
    headers: {
      "Content-Type": "application/linkset+json",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
