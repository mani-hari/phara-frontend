"use client"

import { useState, useRef, useEffect, KeyboardEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import { localizeHref } from "@lib/util/localize-href"

export default function NavSearch({ countryCode: countryCodeProp = "in" }: { countryCode?: string }) {
  // Follow the current route's region (like LocalizedClientLink); prop is the fallback.
  const params = useParams()
  const countryCode =
    (typeof params?.countryCode === "string" && params.countryCode) || countryCodeProp
  const [expanded, setExpanded] = useState(false)
  const [value, setValue] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [active, setActive] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Live suggestions: debounced 250ms, top 5 titles, stale requests aborted.
  useEffect(() => {
    const q = value.trim()
    if (!expanded || q.length < 2) {
      setSuggestions([])
      setActive(-1)
      return
    }
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}&countryCode=${countryCode}&limit=5`, {
        signal: ctrl.signal,
      })
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .then((d: { results?: Suggestion[] }) => {
          setSuggestions((d.results ?? []).slice(0, 5))
          setActive(-1)
        })
        .catch(() => {})
    }, 250)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [value, expanded, countryCode])

  const open = () => {
    setExpanded(true)
    // defer focus so the width transition starts first
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const close = () => {
    setExpanded(false)
    setValue("")
    setSuggestions([])
    setActive(-1)
  }

  const submit = () => {
    const q = value.trim()
    if (!q) { close(); return }
    router.push(localizeHref(countryCode, `/search?q=${encodeURIComponent(q)}`))
    close()
  }

  const openProduct = (s: Suggestion) => {
    router.push(localizeHref(countryCode, `/products/${s.handle}`))
    close()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault()
      setActive((i) => (i + 1) % suggestions.length)
      return
    }
    if (e.key === "ArrowUp" && suggestions.length) {
      e.preventDefault()
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
      return
    }
    if (e.key === "Enter") {
      if (active >= 0 && suggestions[active]) openProduct(suggestions[active])
      else submit()
    }
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
          role="combobox"
          aria-expanded={suggestions.length > 0}
          aria-controls="nav-search-suggestions"
          aria-autocomplete="list"
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

      {/* Live suggestions — outside the overflow:hidden wrapper so it isn't clipped */}
      {expanded && suggestions.length > 0 && (
        <ul
          id="nav-search-suggestions"
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            width: 280,
            margin: 0,
            padding: 4,
            listStyle: "none",
            background: "var(--cream)",
            border: "1px solid var(--ink-line)",
            borderRadius: 8,
            boxShadow: "var(--shadow-md)",
            zIndex: 60,
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              role="option"
              aria-selected={i === active}
              // Keep input focus so its onBlur doesn't close the menu first.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => openProduct(s)}
              onMouseEnter={() => setActive(i)}
              className="ph-body-sm"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                cursor: "pointer",
                color: "var(--ink)",
                background: i === active ? "var(--paper-2)" : "transparent",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {s.title}
            </li>
          ))}
          <li
            role="option"
            aria-selected={false}
            onMouseDown={(e) => e.preventDefault()}
            onClick={submit}
            className="ph-body-sm"
            style={{
              padding: "8px 10px",
              marginTop: 2,
              borderTop: "1px solid var(--ink-line)",
              cursor: "pointer",
              color: "var(--sindoor)",
              fontWeight: 600,
            }}
          >
            See all results for “{value.trim()}”
          </li>
        </ul>
      )}

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

type Suggestion = { id: string; handle: string; title: string }

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
