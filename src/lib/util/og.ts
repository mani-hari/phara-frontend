import type { Metadata } from "next"

// Link-preview image for pages without their own (WhatsApp, iMessage, Facebook, X). Built by scripts/og-images.mjs.
// Next.js replaces, not merges, a parent's openGraph when a page sets its own, so pages must carry the image.
export const DEFAULT_OG_IMAGE = {
  url: "/og-default.jpg",
  width: 1200,
  height: 630,
  alt: "PariharaOnline: temple poojas and Vedic homams, performed in your family's name",
}

type OG = NonNullable<Metadata["openGraph"]>

/** openGraph with the default preview image added when the page has none. */
export function og(o: OG = {}): OG {
  const imgs = (o as { images?: unknown }).images
  const empty = imgs == null || (Array.isArray(imgs) && imgs.length === 0)
  return { ...o, ...(empty ? { images: [DEFAULT_OG_IMAGE] } : {}) } as OG
}
