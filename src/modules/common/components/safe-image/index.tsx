"use client"

import Image from "next/image"
import { useState } from "react"

// Product photo frame that never crops the subject.
// - Starts as a 3:2 frame (most product images are 3:2, so they fill it exactly).
// - Wider landscape images (e.g. 16:9) switch the frame to their own shape once loaded: no padding, no crop.
// - Square/portrait images stay in the 3:2 frame, shown whole ("contain") over a blurred, enlarged copy of
//   themselves, so heads are never cut off and there are no bare bars.
const BASE = 3 / 2
const WIDEST = 21 / 9

export default function SafeImage({
  src,
  alt,
  radius = 14,
  sizes = "(max-width: 1024px) 100vw, 760px",
  priority = false,
}: {
  src: string
  alt: string
  radius?: number
  sizes?: string
  priority?: boolean
}) {
  const [ratio, setRatio] = useState<number | null>(null)
  const wide = ratio !== null && ratio > BASE
  const frame = wide ? Math.min(ratio as number, WIDEST) : BASE

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: String(frame),
        borderRadius: radius,
        overflow: "hidden",
        background: "var(--paper-2)",
      }}
    >
      {!wide && (
        <Image
          src={src}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          className="object-cover"
          style={{ filter: "blur(22px) saturate(1.1)", transform: "scale(1.15)", opacity: 0.55 }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={wide ? "object-cover" : "object-contain"}
        onLoad={(e) => {
          const img = e.currentTarget
          if (img.naturalWidth && img.naturalHeight) setRatio(img.naturalWidth / img.naturalHeight)
        }}
      />
    </div>
  )
}
