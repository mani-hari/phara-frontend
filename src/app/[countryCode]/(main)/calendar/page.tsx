import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Subscribe from "@modules/blog/components/subscribe"
import { listProducts } from "@lib/data/products"
import { FESTIVALS } from "@lib/data/festival-calendar"
import { todayIst } from "@lib/util/blog-publish"
import { waLink } from "@lib/contact"

export const metadata: Metadata = {
  title: "Hindu festival calendar: upcoming festivals and poojas",
  description: "Upcoming Hindu festivals with dates, what each one means, and the poojas families book for them.",
  alternates: { canonical: "/calendar" },
}

export const revalidate = 3600

const fmt = (d: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" })

export default async function CalendarPage(props: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await props.params
  const today = todayIst()
  const upcoming = FESTIVALS.filter((f) => (f.end || f.start) >= today)

  const handles = Array.from(new Set(upcoming.flatMap((f) => f.products || [])))
  const products = handles.length
    ? await listProducts({ countryCode, queryParams: { handle: handles, limit: handles.length } })
        .then(({ response }) => response.products)
        .catch(() => [])
    : []
  const byHandle = new Map(products.map((p) => [p.handle, p]))

  return (
    <div style={{ background: "var(--paper)" }}>
      <section className="content-container" style={{ paddingTop: 28, paddingBottom: 8, maxWidth: 860 }}>
        <p className="ph-eyebrow ph-eyebrow-gold" style={{ margin: "0 0 8px" }}>
          Festival calendar
        </p>
        <h1 className="ph-h1" style={{ margin: 0 }}>
          Upcoming festivals
        </h1>
        <p className="ph-body" style={{ margin: "12px 0 0", color: "var(--ink-3)" }}>
          The auspicious days ahead, what each one means, and the poojas families book for them. Dates follow the
          Tamil calendar (Chennai).
        </p>
      </section>

      <section className="content-container" style={{ paddingTop: 20, paddingBottom: 24, maxWidth: 860 }}>
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          {upcoming.map((f) => {
            const isNow = f.start <= today && today <= (f.end || f.start)
            const suggested = (f.products || []).map((h) => byHandle.get(h)).filter(Boolean)
            return (
              <li key={`${f.name}-${f.start}`} className="ph-cal-item">
                <div className="ph-cal-date" aria-hidden>
                  <span className="ph-cal-month">{fmt(f.start, { month: "short" })}</span>
                  <span className="ph-cal-day">{fmt(f.start, { day: "numeric" })}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h2 className="ph-h4" style={{ margin: 0 }}>
                      {f.name}
                    </h2>
                    {isNow && <span className="ph-chip ph-chip-sindoor">On now</span>}
                  </div>
                  <p className="ph-body-sm" style={{ margin: "4px 0 0", color: "var(--ink-4)" }}>
                    {fmt(f.start, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    {f.end ? ` – ${fmt(f.end, { weekday: "long", day: "numeric", month: "long" })}` : ""}
                  </p>
                  <p className="ph-body-sm" style={{ margin: "8px 0 0", color: "var(--ink-2)", lineHeight: 1.6 }}>
                    {f.about}
                  </p>
                  {f.bestFor && (
                    <p className="ph-body-sm" style={{ margin: "6px 0 0", color: "var(--ink-3)" }}>
                      <strong>Families pray for:</strong> {f.bestFor}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    {suggested.map((p) => (
                      <LocalizedClientLink key={p!.id} href={`/products/${p!.handle}`} className="ph-cal-link">
                        {p!.title.split(/\s[-–|]\s|[(:]/)[0].trim()} →
                      </LocalizedClientLink>
                    ))}
                    {!suggested.length && (
                      <a
                        href={waLink(`Hi, I'd like to book a pooja for ${f.name}.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="ph-cal-link"
                      >
                        Ask us about a pooja for this day →
                      </a>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="content-container" style={{ paddingBottom: 64, maxWidth: 860 }}>
        <Subscribe
          variant="inline"
          refSlug="festival-calendar"
          heading="Never miss an auspicious day"
          line="Get a short reminder before each festival, with what it means and which pooja to book."
        />
      </section>
    </div>
  )
}
