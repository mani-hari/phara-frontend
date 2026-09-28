import Link from "next/link"

import { BlogAuthor } from "@lib/data/blog-authors"
import { localizeHref } from "@lib/util/localize-href"
import AuthorAvatar from "../author-avatar"

export default function AuthorCard({
  author,
  countryCode,
  children,
}: {
  author: BlogAuthor
  countryCode: string
  children?: React.ReactNode
}) {
  return (
    <section
      aria-label="About the author"
      className="flex gap-5 py-8"
      style={{ borderTop: "1px solid var(--ink-line)", borderBottom: "1px solid var(--ink-line)" }}
    >
      <AuthorAvatar author={author} size={56} />
      <div className="min-w-0">
        <p className="ph-eyebrow">Written by</p>
        <p className="ph-h4 mt-1" style={{ fontWeight: 400 }}>
          <Link
            href={localizeHref(countryCode, `/blog/author/${author.slug}`)}
            className="hover:text-[color:var(--sindoor)]"
          >
            {author.name}
          </Link>
        </p>
        <p className="ph-body-sm mt-1" style={{ fontStyle: "italic" }}>
          {author.role}
        </p>
        <p className="ph-body mt-3" style={{ color: "var(--ink-3)" }}>
          {author.bio}
        </p>
        <div className="ph-body-sm mt-4 flex flex-wrap gap-x-5 gap-y-2">
          <Link
            href={localizeHref(countryCode, `/blog/author/${author.slug}`)}
            style={{ color: "var(--sindoor)", fontWeight: 500 }}
          >
            More from {author.name.split(" ")[0] === "PariharaOnline" ? "the editorial team" : author.name} →
          </Link>
          {children}
        </div>
      </div>
    </section>
  )
}
