import Link from "next/link"

/** Server-rendered ?page= pagination: "Newer / Older" plus page numbers. */
export default function BlogPagination({
  basePath,
  page,
  totalPages,
}: {
  /** Already localized path, e.g. "/blog" or "/us/blog/tag/navratri". */
  basePath: string
  page: number
  totalPages: number
}) {
  if (totalPages <= 1) return null
  const href = (n: number) => (n <= 1 ? basePath : `${basePath}?page=${n}`)
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav
      aria-label="Pagination"
      className="mt-16 flex flex-wrap items-center justify-between gap-4 pt-8"
      style={{ borderTop: "1px solid var(--ink-line)" }}
    >
      <div className="w-24">
        {page > 1 && (
          <Link href={href(page - 1)} className="ph-body-sm" style={{ color: "var(--ink-2)" }}>
            ← Newer
          </Link>
        )}
      </div>
      <ol className="flex items-center gap-1">
        {pages.map((n) => (
          <li key={n}>
            <Link
              href={href(n)}
              aria-current={n === page ? "page" : undefined}
              className="ph-body-sm ph-num inline-flex h-9 w-9 items-center justify-center rounded-full"
              style={
                n === page
                  ? { background: "var(--ink)", color: "var(--paper)" }
                  : { color: "var(--ink-3)" }
              }
            >
              {n}
            </Link>
          </li>
        ))}
      </ol>
      <div className="w-24 text-right">
        {page < totalPages && (
          <Link href={href(page + 1)} className="ph-body-sm" style={{ color: "var(--ink-2)" }}>
            Older →
          </Link>
        )}
      </div>
    </nav>
  )
}
