import { Metadata } from "next"
import { redirect } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { localizeHref } from "@lib/util/localize-href"

export const metadata: Metadata = {
  title: "Admin — PariharaOnline",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

// Admin = a signed-in Medusa customer whose email is in ADMIN_EMAILS.
const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ||
  process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
  ""
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export default async function AdminPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const customer = await retrieveCustomer().catch(() => null)
  const email = customer?.email?.toLowerCase() ?? ""
  const isAdmin = !!email && ADMIN_EMAILS.includes(email)

  if (!isAdmin) {
    // Not a signed-in admin — send to sign-in.
    redirect(localizeHref(countryCode, "/account/signin"))
  }

  const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ")
  return <AdminDashboard email={customer?.email ?? ""} name={name} countryCode={countryCode} />
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid var(--ink-line)",
        fontSize: 13,
      }}
    >
      <span style={{ color: "var(--ink-4)" }}>{label}</span>
      <span className="ph-num" style={{ fontWeight: 600, color: "var(--ink)" }}>
        {value ?? "—"}
      </span>
    </div>
  )
}

function AdminDashboard({
  email,
  name,
  countryCode,
}: {
  email: string
  name: string
  countryCode: string
}) {
  const envVars = [
    { label: "Medusa backend", value: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL },
    { label: "Medusa pub key", value: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY?.slice(0, 20) + "…" },
    { label: "Razorpay key ID", value: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID },
    { label: "Razorpay secret", value: process.env.RAZORPAY_KEY_SECRET ? "✓ set" : "✗ missing" },
    { label: "PayPal client ID", value: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.slice(0, 16) + "…" },
    { label: "PayPal secret", value: process.env.PAYPAL_CLIENT_SECRET ? "✓ set" : "✗ missing" },
    { label: "PayPal sandbox", value: process.env.NEXT_PUBLIC_PAYPAL_SANDBOX },
    { label: "Anthropic API key", value: process.env.ANTHROPIC_API_KEY ? "✓ set" : "✗ missing" },
    { label: "Admin emails", value: process.env.ADMIN_EMAILS ? "✓ set" : "✗ missing" },
    { label: "GA4 ID", value: process.env.NEXT_PUBLIC_GA4_ID || "not set" },
    { label: "Clarity ID", value: process.env.NEXT_PUBLIC_CLARITY_ID || "not set" },
  ]

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh", padding: "40px 0" }}>
      <div className="content-container" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div className="ph-eyebrow" style={{ color: "var(--sindoor)", marginBottom: 8 }}>
            ADMIN PANEL
          </div>
          <h1 className="ph-h2" style={{ margin: 0 }}>
            PariharaOnline Debug
          </h1>
          <p className="ph-body-sm" style={{ color: "var(--ink-4)", marginTop: 6 }}>
            {name} · {email} · {countryCode.toUpperCase()} region
          </p>
          <p className="ph-body-sm" style={{ color: "var(--ink-4)", marginTop: 4 }}>
            Use the ⚙ button (bottom-right) for the floating admin panel on any page.
          </p>
        </div>

        {/* Environment */}
        <div className="ph-card" style={{ marginBottom: 24, padding: 20, border: "1px solid var(--ink-line)" }}>
          <h2 className="ph-h4" style={{ marginBottom: 16 }}>
            Environment Variables
          </h2>
          {envVars.map((v) => (
            <Row key={v.label} label={v.label} value={v.value} />
          ))}
        </div>

        {/* Quick links */}
        <div className="ph-card" style={{ padding: 20, border: "1px solid var(--ink-line)" }}>
          <h2 className="ph-h4" style={{ marginBottom: 16 }}>
            Quick Links
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { label: "Medusa Admin", href: "https://pariharaonline.medusajs.app/app" },
              { label: "All Poojas", href: localizeHref(countryCode, "/collections/pujas-and-homams") },
              { label: "Store", href: localizeHref(countryCode, "/store") },
              { label: "Cart", href: localizeHref(countryCode, "/cart") },
              { label: "Ask Parihara", href: localizeHref(countryCode, "/ask-parihara") },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="ph-btn ph-btn-ghost"
                style={{ fontSize: 13, padding: "8px 14px" }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
