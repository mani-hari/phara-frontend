import { BlogAuthor } from "@lib/data/blog-authors"

/** Initials avatar — no photos, by design. */
export default function AuthorAvatar({
  author,
  size = 40,
}: {
  author: BlogAuthor
  size?: number
}) {
  return (
    <span
      aria-hidden="true"
      className="ph-serif inline-flex shrink-0 select-none items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: author.tone.bg,
        color: author.tone.fg,
        fontSize: Math.round(size * (author.initials.length > 1 ? 0.36 : 0.46)),
        lineHeight: 1,
        border: "1px solid var(--ink-line)",
      }}
    >
      {author.initials}
    </span>
  )
}
