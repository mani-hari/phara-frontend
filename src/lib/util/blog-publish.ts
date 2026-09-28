// Drip publishing + featured rotation for the blog. Pure functions (no fs, no
// "server-only") so they can be unit-tested with plain node:
//   node --import tsx --test scripts/test-blog-publish.mjs
//
// A post is live when it is not a draft AND its publishedAt (YYYY-MM-DD) is on
// or before today's date in India (Asia/Kolkata, a fixed UTC+05:30 with no
// DST). Always compute "today" per call — never cache it in a module constant,
// or a long-lived server would freeze the date at boot.

const IST_OFFSET_MS = 330 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

/** Today's date in Asia/Kolkata as YYYY-MM-DD. */
export const todayIst = (now: Date = new Date()): string =>
  new Date(now.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10)

/** Whole days since 1970-01-01 in IST; flips at IST midnight, same instant as todayIst. */
export const daysSinceEpochIst = (now: Date = new Date()): number =>
  Math.floor((now.getTime() + IST_OFFSET_MS) / DAY_MS)

export type PublishablePost = { draft?: boolean; publishedAt: string }

/** Published = not a draft and publishedAt <= today (IST), compared as YYYY-MM-DD strings. */
export const isPublished = (post: PublishablePost, today: string = todayIst()): boolean =>
  post.draft !== true && !!post.publishedAt && post.publishedAt.slice(0, 10) <= today

/** The five original posts (older frontmatter shape, no hero); never featured. */
export const LEGACY_BLOG_SLUGS = new Set([
  "how-to-choose-the-right-puja-for-life-obstacles",
  "nri-guide-to-booking-temple-pujas-online",
  "understanding-navagraha-homam",
  "what-prasad-delivery-means-for-online-puja-bookings",
  "when-to-book-an-astrology-consultation-before-a-puja",
])

export const FEATURED_ROTATION_DAYS = 3

type FeaturablePost = { slug: string; image?: string }

/**
 * Deterministic featured pick that changes every 3 IST days:
 * eligible = posts with a hero image, excluding legacy posts, in the order given
 * (newest first); index = floor(days / 3) % eligible.length. Falls back to the
 * first post when nothing is eligible.
 */
export const pickFeatured = <T extends FeaturablePost>(
  posts: T[],
  days: number = daysSinceEpochIst()
): T | undefined => {
  const eligible = posts.filter((p) => !!p.image && !LEGACY_BLOG_SLUGS.has(p.slug))
  if (!eligible.length) return posts[0]
  const index = Math.floor(days / FEATURED_ROTATION_DAYS) % eligible.length
  return eligible[index]
}

// Internal post links look like [text](/blog/<slug>) (optionally with /#anchor).
// Tag and author links (/blog/tag/x, /blog/author/x) never match.
const INTERNAL_POST_LINK = /\[([^\]]+)\]\(\/blog\/([a-z0-9-]+)\/?(?:#[^)\s]*)?\)/g

/** Flatten links to posts that are not live (not in `live`) to their anchor text. */
export const unlinkUnpublished = (markdown: string, live: Set<string>): string =>
  markdown.replace(INTERNAL_POST_LINK, (match, text: string, slug: string) =>
    live.has(slug) ? match : text
  )
