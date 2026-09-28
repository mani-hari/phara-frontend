import Link from "next/link"

import { BlogTag } from "@lib/data/blog"
import { localizeHref } from "@lib/util/localize-href"

/** Filter chips (plain links to /blog/tag/<slug>). */
export default function BlogFilter({
  tags,
  countryCode,
  active,
  limit = 12,
}: {
  tags: BlogTag[]
  countryCode: string
  active?: string
  limit?: number
}) {
  if (!tags.length) return null
  const shown = tags.slice(0, limit)
  if (active && !shown.some((t) => t.slug === active)) {
    const current = tags.find((t) => t.slug === active)
    if (current) shown.push(current)
  }
  return (
    <nav aria-label="Browse by topic" className="-mx-6 overflow-x-auto px-6 no-scrollbar">
      <ul className="flex gap-2 sm:flex-wrap">
        <li className="shrink-0">
          <Link
            href={localizeHref(countryCode, "/blog")}
            className={`ph-chip ${!active ? "ph-chip-filled" : ""}`}
            aria-current={!active ? "page" : undefined}
          >
            All posts
          </Link>
        </li>
        {shown.map((tag) => (
          <li key={tag.slug} className="shrink-0">
            <Link
              href={localizeHref(countryCode, `/blog/tag/${tag.slug}`)}
              className={`ph-chip ${active === tag.slug ? "ph-chip-filled" : ""}`}
              aria-current={active === tag.slug ? "page" : undefined}
            >
              {tag.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
