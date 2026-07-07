"use client"

import { useState, useRef, KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { localizeHref } from "@lib/util/localize-href"

export default function NavSearch({ countryCode = "in" }: { countryCode?: string }) {
  const [expanded, setExpanded] = useState(false)
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const open = () => {
    setExpanded(true)
    // defer focus so the width transition starts first
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const close = () => {
    setExpanded(false)
    setValue("")
  }

  const submit = () => {
    const q = value.trim()
    if (!q) { close(); return }
    router.push(localizeHref(countryCode, `/ask-parihara?q=${encodeURIComponent(q)}`))
    close()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit()
    if (e.key === "Escape") close()
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* Expanding input — zero width when collapsed, visible when expanded */}
      <div
        style={{
          overflow: "hidden",
          width: expanded ? 200 : 0,
          transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
          opacity: expanded ? 1 : 0,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={(e) => {
            // Only close if focus didn't move to the search icon button
            if (!e.relatedTarget) close()
          }}
          placeholder="Search poojas, remedies…"
          style={{
            width: 200,
            height: 32,
            padding: "0 10px",
            background: "rgba(26,20,16,0.06)",
            border: "1px solid var(--ink-line)",
            borderRadius: 6,
            outline: "none",
            fontSize: 13,
            fontFamily: "var(--sans)",
            color: "var(--ink)",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Search icon / submit button */}
      <button
        type="button"
        onClick={expanded ? submit : open}
        aria-label={expanded ? "Search" : "Open search"}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "6px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ink)",
          opacity: 0.7,
          borderRadius: 6,
          transition: "opacity 0.15s",
          flexShrink: 0,
          marginLeft: expanded ? 4 : 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
      >
        <SearchIcon />
      </button>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="22" y2="22" />
    </svg>
  )
}
