"use client"

import Image from "next/image"
import { useState } from "react"

/** YouTube embed that loads only a thumbnail until tapped (the real player is ~0.5–1 MB of script). */
export default function LiteYouTube({ id, title, radius = 12 }: { id: string; title: string; radius?: number }) {
  const [play, setPlay] = useState(false)
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: radius, overflow: "hidden", background: "var(--ink)" }}>
      {play ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlay(true)}
          aria-label={`Play video: ${title}`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, padding: 0, cursor: "pointer", background: "transparent" }}
        >
          <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
          <span
            aria-hidden
            style={{
              position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
              width: 68, height: 48, borderRadius: 12, background: "rgba(204,0,0,0.92)",
              display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            }}
          >
            <span style={{ width: 0, height: 0, borderTop: "10px solid transparent", borderBottom: "10px solid transparent", borderLeft: "17px solid #fff", marginLeft: 4 }} />
          </span>
        </button>
      )}
    </div>
  )
}
