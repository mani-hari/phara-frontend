"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type BrowseItem = { id: string; handle: string; title: string; price: string | null; image: string | null; needs: string[] }
export type Need = { key: string; label: string }

/** Need chips + product grid. Chips only list needs that have products in this collection. */
export default function NeedBrowser({ items, needs }: { items: BrowseItem[]; needs: Need[] }) {
  const [active, setActive] = useState<string>("all")
  // Links like /collections/pujas-and-homams?need=health open with that chip selected.
  useEffect(() => {
    const need = new URLSearchParams(window.location.search).get("need")
    if (need && needs.some((n) => n.key === need)) setActive(need)
  }, [needs])
  const shown = useMemo(() => (active === "all" ? items : items.filter((i) => i.needs.includes(active))), [active, items])
  const chips = [{ key: "all", label: "All" }, ...needs]

  return (
    <div>
      <div className="ph-need-chips" role="tablist" aria-label="Filter by need">
        {chips.map((c) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            aria-selected={active === c.key}
            className={`ph-need-chip${active === c.key ? " on" : ""}`}
            onClick={() => setActive(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="ph-body-sm" style={{ margin: "14px 0 18px", color: "var(--ink-4)" }}>
        {shown.length} {shown.length === 1 ? "pooja" : "poojas"}
      </p>

      <ul className="ph-browse-grid" data-testid="products-list">
        {shown.map((p) => (
          <li key={p.id}>
            <LocalizedClientLink href={`/products/${p.handle}`} className="ph-browse-card">
              <div className="ph-browse-img">
                {p.image ? (
                  <Image src={p.image} alt={p.title} fill sizes="(max-width: 640px) 50vw, 300px" className="object-cover" />
                ) : null}
              </div>
              <div className="ph-browse-body">
                <h3 className="ph-browse-title">{p.title}</h3>
                {p.price && <p className="ph-browse-price">{p.price}</p>}
              </div>
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
