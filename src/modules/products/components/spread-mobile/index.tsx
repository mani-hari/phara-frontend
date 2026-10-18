"use client"

import Image from "next/image"
import { ReactNode, useRef, useState } from "react"

type Photo = { url: string; alt: string }

/** Mobile-only swipe gallery: all product photos in one strip with a counter (desktop spreads them instead). */
export function MobileGallery({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  if (!photos.length) return null
  return (
    <div className="pspread-mgallery">
      <div
        ref={ref}
        className="pspread-mgallery-track"
        onScroll={(e) => {
          const el = e.currentTarget
          setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)))
        }}
      >
        {photos.map((p, i) => (
          <div key={`${p.url}-${i}`} className="pspread-mgallery-slide">
            <Image src={p.url} alt={p.alt} fill sizes="100vw" className="object-contain" priority={i === 0} />
          </div>
        ))}
      </div>
      {photos.length > 1 && (
        <div className="pspread-mgallery-dots" aria-hidden>
          {photos.map((_, i) => (
            <span key={i} className={i === index ? "on" : ""} />
          ))}
        </div>
      )}
    </div>
  )
}

/** On phones, long content is folded with a "Read more" button; on desktop it is always open. */
export function MobileCollapse({ children, label = "Read more" }: { children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`pspread-collapse${open ? " open" : ""}`}>
      <div className="pspread-collapse-body">{children}</div>
      {!open && (
        <button type="button" className="pspread-collapse-btn" onClick={() => setOpen(true)}>
          {label} ↓
        </button>
      )}
    </div>
  )
}
