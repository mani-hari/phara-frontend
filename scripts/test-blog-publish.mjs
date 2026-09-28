// node --import tsx --test scripts/test-blog-publish.mjs
import assert from "node:assert/strict"
import { test } from "node:test"

import {
  daysSinceEpochIst,
  isPublished,
  pickFeatured,
  todayIst,
  unlinkUnpublished,
} from "../src/lib/util/blog-publish.ts"

test("todayIst flips at 18:30 UTC (IST midnight)", () => {
  assert.equal(todayIst(new Date("2026-09-28T18:29:59Z")), "2026-09-28")
  assert.equal(todayIst(new Date("2026-09-28T18:30:00Z")), "2026-09-29")
  assert.equal(todayIst(new Date("2026-09-28T00:00:00Z")), "2026-09-28")
  assert.equal(todayIst(new Date("2026-12-31T19:00:00Z")), "2027-01-01")
})

test("daysSinceEpochIst flips at the same instant as todayIst", () => {
  const before = daysSinceEpochIst(new Date("2026-09-28T18:29:59Z"))
  const after = daysSinceEpochIst(new Date("2026-09-28T18:30:00Z"))
  assert.equal(after - before, 1)
  // Day number agrees with the IST calendar date.
  const d = new Date("2026-09-28T18:30:00Z")
  assert.equal(new Date(daysSinceEpochIst(d) * 86400000).toISOString().slice(0, 10), todayIst(d))
})

test("isPublished", () => {
  const today = "2026-09-28"
  assert.equal(isPublished({ publishedAt: "2026-09-27" }, today), true)
  assert.equal(isPublished({ publishedAt: "2026-09-28" }, today), true, "same day is live")
  assert.equal(isPublished({ publishedAt: "2026-09-29" }, today), false, "tomorrow is hidden")
  assert.equal(isPublished({ publishedAt: "2027-01-01" }, today), false)
  assert.equal(isPublished({ publishedAt: "2026-09-01", draft: true }, today), false, "drafts hidden")
  assert.equal(isPublished({ publishedAt: "2026-09-01", draft: false }, today), true)
  assert.equal(isPublished({ publishedAt: "" }, today), false)
})

test("isPublished defaults to the current IST date", () => {
  assert.equal(isPublished({ publishedAt: todayIst() }), true)
  assert.equal(isPublished({ publishedAt: "9999-12-31" }), false)
})

const posts = [
  { slug: "a", image: "/blog/a.webp" },
  { slug: "understanding-navagraha-homam", image: "/blog/legacy.webp" },
  { slug: "b" }, // no hero
  { slug: "c", image: "/blog/c.webp" },
  { slug: "d", image: "/blog/d.webp" },
]

test("pickFeatured is stable within a 3-day window and rotates at the boundary", () => {
  // eligible = a, c, d (legacy and hero-less excluded)
  assert.equal(pickFeatured(posts, 0).slug, "a")
  assert.equal(pickFeatured(posts, 1).slug, "a")
  assert.equal(pickFeatured(posts, 2).slug, "a")
  assert.equal(pickFeatured(posts, 3).slug, "c")
  assert.equal(pickFeatured(posts, 5).slug, "c")
  assert.equal(pickFeatured(posts, 6).slug, "d")
  assert.equal(pickFeatured(posts, 9).slug, "a", "wraps around")
  const today = daysSinceEpochIst(new Date("2026-09-28T12:00:00Z"))
  const window = Math.floor(today / 3)
  const picks = [0, 1, 2].map((i) => pickFeatured(posts, window * 3 + i).slug)
  assert.equal(new Set(picks).size, 1)
})

test("pickFeatured never picks legacy or hero-less posts", () => {
  for (let d = 0; d < 60; d++) {
    const p = pickFeatured(posts, d)
    assert.ok(p.image && p.slug !== "understanding-navagraha-homam" && p.slug !== "b")
  }
})

test("pickFeatured falls back to the newest post when nothing is eligible", () => {
  assert.equal(pickFeatured([{ slug: "x" }, { slug: "y" }], 7).slug, "x")
  assert.equal(pickFeatured([], 7), undefined)
})

test("unlinkUnpublished flattens links to posts that are not live", () => {
  const live = new Set(["live-post"])
  const md =
    "See [the live one](/blog/live-post), [a future one](/blog/future-post#why), " +
    "[a topic](/blog/tag/diwali), [an author](/blog/author/archana) and [shop](/store)."
  assert.equal(
    unlinkUnpublished(md, live),
    "See [the live one](/blog/live-post), a future one, " +
      "[a topic](/blog/tag/diwali), [an author](/blog/author/archana) and [shop](/store)."
  )
})
