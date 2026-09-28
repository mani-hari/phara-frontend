"use client"

import { FormEvent, useId, useState } from "react"

type Variant = "hero" | "sidebar" | "inline"

type Props = {
  variant: Variant
  /** Post slug, or "blog-home" / "author-<slug>" / "tag-<slug>" (analytics only). */
  refSlug: string
  heading?: string
  line?: string
  className?: string
}

const PRIVACY = "Free. One or two emails a week. Unsubscribe anytime."
const SUCCESS = "You're in. Look out for the next one."

const DEFAULT_COPY: Record<Variant, { heading: string; line: string }> = {
  hero: {
    heading: "Subscribe to our blogs",
    line: "Stories, practices and festival guides from Hariharan, Archana and Manikandan — a few each week, free.",
  },
  sidebar: { heading: "Enjoying this?", line: "To get more posts like this, subscribe for free." },
  inline: { heading: "Enjoying this?", line: "To get more posts like this, subscribe for free." },
}

type Status = "idle" | "sending" | "done" | "error"

function SubscribeForm({
  refSlug,
  stacked,
  large,
}: {
  refSlug: string
  stacked?: boolean
  large?: boolean
}) {
  const id = useId()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState("")

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (status === "sending") return
    // Inline validation (noValidate: no browser tooltip bubbles).
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.")
      setStatus("error")
      return
    }
    setStatus("sending")
    setError("")
    try {
      const res = await fetch("/api/blog/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "blog", ref: refSlug }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        setStatus("done")
        return
      }
      setError(data.error || "Something went wrong. Please try again.")
      setStatus("error")
    } catch {
      setError("Something went wrong. Please try again.")
      setStatus("error")
    }
  }

  if (status === "done") {
    return (
      <p
        role="status"
        className={large ? "ph-body-lg" : "ph-body"}
        style={{ color: "var(--ink)", fontWeight: 500 }}
      >
        {SUCCESS}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className={`flex gap-2 ${stacked ? "flex-col" : "flex-col sm:flex-row"}`}>
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={status === "error" || undefined}
          aria-describedby={`${id}-note`}
          className="ph-input min-w-0 flex-1"
          style={large ? { padding: "14px 16px", fontSize: 15 } : undefined}
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className={`ph-btn ph-btn-primary ${stacked ? "ph-btn-block" : ""}`}
          style={{
            borderRadius: "var(--r-md)",
            opacity: status === "sending" ? 0.7 : 1,
            ...(large ? { padding: "14px 24px", fontSize: 15 } : {}),
          }}
        >
          {status === "sending" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      {status === "error" && error ? (
        <p role="alert" className="ph-body-sm mt-2" style={{ color: "var(--sindoor-2)" }}>
          {error}
        </p>
      ) : null}
      <p id={`${id}-note`} className="ph-body-sm mt-2.5" style={{ color: "var(--ink-4)" }}>
        {PRIVACY}
      </p>
    </form>
  )
}

export default function Subscribe({ variant, refSlug, heading, line, className = "" }: Props) {
  const copy = {
    heading: heading || DEFAULT_COPY[variant].heading,
    line: line || DEFAULT_COPY[variant].line,
  }

  if (variant === "hero") {
    return (
      <section
        aria-labelledby="subscribe-hero-heading"
        className={className}
        style={{
          background: "var(--cream)",
          borderTop: "1px solid var(--ink-line)",
          borderBottom: "1px solid var(--ink-line)",
        }}
      >
        <div className="content-container grid max-w-[1120px] gap-8 py-14 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16">
          <div>
            <span
              aria-hidden="true"
              className="block"
              style={{ width: 40, height: 2, background: "var(--sindoor)" }}
            />
            <h2
              id="subscribe-hero-heading"
              className="ph-h1 mt-6"
              style={{ fontSize: "clamp(32px, 4vw, 44px)", textWrap: "balance" }}
            >
              {copy.heading}
            </h2>
            <p className="ph-body-lg mt-4 max-w-[520px]" style={{ color: "var(--ink-3)" }}>
              {copy.line}
            </p>
          </div>
          <div className="lg:pb-1">
            <SubscribeForm refSlug={refSlug} large />
          </div>
        </div>
      </section>
    )
  }

  if (variant === "sidebar") {
    return (
      <section
        aria-label="Subscribe"
        className={className}
        style={{
          background: "var(--cream)",
          border: "1px solid var(--ink-line)",
          borderTop: "2px solid var(--sindoor)",
          borderRadius: "var(--r-md)",
          padding: "22px 20px 18px",
        }}
      >
        <p className="ph-h4" style={{ fontWeight: 400, fontSize: 22 }}>
          {copy.heading}
        </p>
        <p className="ph-body mt-2" style={{ color: "var(--ink-3)" }}>
          {copy.line}
        </p>
        <div className="mt-4">
          <SubscribeForm refSlug={refSlug} stacked />
        </div>
      </section>
    )
  }

  return (
    <section
      aria-label="Subscribe"
      className={`py-8 ${className}`}
      style={{ borderTop: "2px solid var(--sindoor)", borderBottom: "1px solid var(--ink-line)" }}
    >
      <p className="ph-h3" style={{ fontWeight: 400 }}>
        {copy.heading}
      </p>
      <p className="ph-body-lg mt-2" style={{ color: "var(--ink-3)" }}>
        {copy.line}
      </p>
      <div className="mt-5">
        <SubscribeForm refSlug={refSlug} />
      </div>
    </section>
  )
}
