"use client"

import { ReactNode, useEffect, useState } from "react"

// Dotted-underlined term with a short explanation (used for "Vedic homams" in the home hero).
// Desktop (mouse): bubble on hover. Phones/touch: tap opens a centred pop-up with an ✕ and a dimmed
// backdrop (a bubble anchored to the word ran off the screen on narrow phones).
export default function TermTip({ children, tip, title }: { children: ReactNode; tip: string; title?: string }) {
  const [hover, setHover] = useState(false)
  const [modal, setModal] = useState(false)

  useEffect(() => {
    if (!modal) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setModal(false)
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [modal])

  return (
    <>
      <span
        className="term-tip"
        tabIndex={0}
        role="button"
        aria-haspopup="dialog"
        onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
        onClick={() => {
          // Touch (or keyboard): open the centred pop-up. Mouse users already see the hover bubble.
          if (!hover) setModal(true)
        }}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setModal(true))}
      >
        {children}
        {hover && (
          <span role="tooltip" className="term-tip-bubble">
            {tip}
          </span>
        )}
      </span>

      {modal && (
        <span className="term-tip-modal-root" role="dialog" aria-modal="true" aria-label={title || "Explanation"}>
          <span className="term-tip-backdrop" onClick={() => setModal(false)} />
          <span className="term-tip-modal">
            <button type="button" className="term-tip-close" aria-label="Close" onClick={() => setModal(false)}>
              ✕
            </button>
            {title && <span className="term-tip-modal-title">{title}</span>}
            <span className="term-tip-modal-text">{tip}</span>
          </span>
        </span>
      )}
    </>
  )
}
