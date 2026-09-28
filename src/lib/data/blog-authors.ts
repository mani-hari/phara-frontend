// Blog authors. Each post has exactly one author (frontmatter `author: <slug>`).
// Bios are public copy: they describe each author's lens and role only.
// No photos — the avatar is rendered from `initials` on a warm tone.

export type BlogAuthor = {
  slug: string
  name: string
  /** One-line role, shown under the name in bylines and author cards. */
  role: string
  /** Two sentences, shown on the author card and author page. */
  bio: string
  initials: string
  /** Avatar background / foreground (design tokens). */
  tone: { bg: string; fg: string }
}

export const BLOG_AUTHORS: Record<string, BlogAuthor> = {
  hariharan: {
    slug: "hariharan",
    name: "Hariharan",
    role: "Reads the old stories for what they still mean",
    bio: "Hariharan writes about the myths, symbols and festival stories that most of us grew up hearing but were rarely asked to think about. He tells the story first, then asks what it is really about, and leaves the conclusion to you.",
    initials: "H",
    tone: { bg: "var(--gold-soft)", fg: "var(--gold-2)" },
  },
  archana: {
    slug: "archana",
    name: "Archana",
    role: "Writes about practice: attention, breath, the body, the lamp",
    bio: "Archana writes about ritual as something you do rather than something you believe: the lamp, the breath, the fast, the few quiet minutes before the day begins. Her pieces usually end with a small practice to try for a week and notice what changes.",
    initials: "A",
    tone: { bg: "var(--sage-soft)", fg: "var(--sage)" },
  },
  manikandan: {
    slug: "manikandan",
    name: "Manikandan",
    role: "The Sunday column: festivals and rituals meeting ordinary weeks",
    bio: "Manikandan writes the Sunday column, where festivals and rituals meet commutes, hospital corridors and video calls with parents far away. Each piece closes with one small thing to carry into the week ahead.",
    initials: "M",
    tone: { bg: "var(--sindoor-soft)", fg: "var(--sindoor)" },
  },
  editorial: {
    slug: "editorial",
    name: "PariharaOnline Editorial Team",
    role: "Practical guides to poojas, prasadam and booking",
    bio: "The PariharaOnline editorial team writes the practical guides: how a pooja is booked and performed, what arrives with prasadam, and what to check before you choose a remedy. We have been helping families in India and abroad with temple services since 2009.",
    initials: "PO",
    tone: { bg: "var(--paper-3)", fg: "var(--ink-2)" },
  },
}

export const DEFAULT_AUTHOR_SLUG = "editorial"

export const getAllBlogAuthors = () => Object.values(BLOG_AUTHORS)

/**
 * Resolve an author from frontmatter. Accepts a slug ("hariharan") or a display
 * name ("Hariharan"); anything unrecognised (e.g. "PariharaOnline Editorial
 * Team", free text from the editor) falls back to the editorial team.
 */
export const resolveBlogAuthor = (value: unknown): BlogAuthor => {
  const raw = String(value ?? "").trim().toLowerCase()
  if (raw && BLOG_AUTHORS[raw]) return BLOG_AUTHORS[raw]
  const byName = Object.values(BLOG_AUTHORS).find(
    (a) => a.name.toLowerCase() === raw
  )
  return byName || BLOG_AUTHORS[DEFAULT_AUTHOR_SLUG]
}

export const getBlogAuthor = (slug: string): BlogAuthor | null =>
  BLOG_AUTHORS[slug] || null
