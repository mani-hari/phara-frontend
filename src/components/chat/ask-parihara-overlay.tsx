"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import ChatInterface from "./chat-interface"
import { usePageContext, getOrCreateSessionId } from "./use-page-context"
import {
  loadConversations,
  saveConversation,
  createConversationId,
  type StoredConversation,
} from "@lib/chat-history"
import { type Message } from "ai/react"

const CHAT_COUNT_KEY = "ph_chat_count"

function getConversationCount(): number {
  if (typeof window === "undefined") return 0
  return parseInt(window.localStorage.getItem(CHAT_COUNT_KEY) ?? "0", 10)
}

function incrementConversationCount(): void {
  if (typeof window === "undefined") return
  const n = getConversationCount()
  window.localStorage.setItem(CHAT_COUNT_KEY, String(n + 1))
}

export default function AskPariharaOverlay() {
  const [open, setOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [conversationCount, setConversationCount] = useState(0)
  const [heroVisible, setHeroVisible] = useState(false)
  const pathname = usePathname()
  const pageContext = usePageContext()

  const isFullPage = pathname?.includes("ask-parihara")
  const isHomePage = pathname === "/" || /^\/[a-z]{2}\/?$/.test(pathname ?? "")

  useEffect(() => {
    const id = getOrCreateSessionId()
    setSessionId(id)
    setConversationCount(getConversationCount())
  }, [])

  const hasCountedRef = useRef(false)
  useEffect(() => {
    if (open && !hasCountedRef.current) {
      hasCountedRef.current = true
      incrementConversationCount()
      setConversationCount(getConversationCount())
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (!isHomePage) return
    const sentinel = document.getElementById("ask-hero-sentinel")
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [isHomePage, pathname])

  const handleConversationSave = (messages: Message[]) => {
    if (!sessionId || messages.length === 0) return
    const now = new Date().toISOString()
    const userMessages = messages.filter((m) => m.role === "user")
    const firstUserMsg = userMessages[0]?.content ?? ""
    const existingConvs = loadConversations()
    const existing = existingConvs.find((c) => c.id === sessionId)
    const title = existing?.title || firstUserMsg.slice(0, 60) || "Chat conversation"

    const conv: StoredConversation = {
      id: sessionId,
      title,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        createdAt: now,
      })),
    }
    saveConversation(conv)

    if (messages.length === 4 && !existing?.title) {
      fetch("/api/chat/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.slice(0, 4).map((m) => ({ role: m.role, content: m.content })),
        }),
      })
        .then((r) => r.json())
        .then(({ title: generatedTitle }) => {
          if (generatedTitle) {
            saveConversation({ ...conv, title: generatedTitle })
          }
        })
        .catch(() => {})
    }
  }

  if (isFullPage) return null

  return (
    <>
      {/* ── Floating trigger ─────────────────────────────────────── */}
      {!(isHomePage && heroVisible) && !open && (
        <button
          type="button"
          aria-label="Open Ask Parihara"
          onClick={() => setOpen(true)}
          className="ph-ask-pill"
        >
          {/* Desktop: icon + text */}
          <span className="ph-ask-pill-inner-desktop">
            <span aria-hidden className="ph-ask-sparkle">✦</span>
            <span className="ph-ask-label">Ask Parihara</span>
          </span>
          {/* Mobile: text only */}
          <span className="ph-ask-pill-inner-mobile">ASK</span>
        </button>
      )}

      {/* Close button when panel is open */}
      {open && (
        <button
          type="button"
          aria-label="Close Ask Parihara"
          onClick={() => setOpen(false)}
          className="ph-ask-close-btn"
        >
          ✕
        </button>
      )}

      {/* ── Backdrop + Panel ──────────────────────────────────────── */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="ph-ask-backdrop"
          />

          {/* Mobile bottom sheet */}
          <div className="ph-ask-panel ph-ask-panel-mobile">
            <div className="ph-ask-drag-handle" />
            <PanelHeader onClose={() => setOpen(false)} />
            <div style={{ flex: 1, minHeight: 0 }}>
              <ChatInterface
                compact
                countryCode="in"
                pageContext={pageContext}
                sessionId={sessionId}
                conversationCount={conversationCount}
                onConversationSave={handleConversationSave}
              />
            </div>
          </div>

          {/* Desktop floating panel */}
          <div className="ph-ask-panel ph-ask-panel-desktop">
            <PanelHeader onClose={() => setOpen(false)} />
            <div style={{ flex: 1, minHeight: 0 }}>
              <ChatInterface
                compact
                countryCode="in"
                pageContext={pageContext}
                sessionId={sessionId}
                conversationCount={conversationCount}
                onConversationSave={handleConversationSave}
              />
            </div>
          </div>
        </>
      )}

      <style>{`
        /* ── Floating pill ────────────────────────────────────────── */
        .ph-ask-pill {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 60;
          border-radius: 999px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .ph-ask-pill:hover {
          transform: translateY(-2px);
        }

        /* Desktop pill — dark fill */
        .ph-ask-pill-inner-desktop {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #1a1410;
          color: #faf6ee;
          border-radius: 999px;
          padding: 12px 20px 12px 14px;
          border: none;
          box-shadow: 0 12px 32px rgba(26,20,16,0.32);
        }
        .ph-ask-pill-inner-mobile {
          display: none;
        }
        .ph-ask-sparkle {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--sindoor);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: #fff;
          font-weight: 700;
          flex-shrink: 0;
        }
        .ph-ask-label {
          font-family: var(--sans);
          font-size: 15px;
          font-weight: 500;
        }

        /* Mobile pill — outline only, no icon */
        @media (max-width: 767px) {
          .ph-ask-pill {
            bottom: 20px;
            right: 16px;
          }
          .ph-ask-pill-inner-desktop { display: none; }
          .ph-ask-pill-inner-mobile {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: var(--paper);
            color: var(--sindoor);
            border: 2px solid var(--sindoor);
            border-radius: 999px;
            padding: 9px 18px;
            font-family: var(--sans);
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.08em;
            box-shadow: 0 4px 16px rgba(182,68,46,0.18);
          }
        }

        /* ── Close button (when open) ──────────────────────────── */
        .ph-ask-close-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 90;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--sindoor);
          color: #fff;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 8px 24px rgba(182,68,46,0.4);
          transition: transform 0.15s;
        }
        .ph-ask-close-btn:hover {
          transform: scale(1.08);
        }
        @media (max-width: 767px) {
          .ph-ask-close-btn { bottom: 20px; right: 16px; }
        }

        /* ── Backdrop ──────────────────────────────────────────── */
        .ph-ask-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(26,20,16,0.4);
          z-index: 70;
          backdrop-filter: blur(2px);
          animation: phFadeIn 0.2s ease;
        }

        /* ── Panel base ────────────────────────────────────────── */
        .ph-ask-panel {
          background: var(--paper);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 80;
        }

        /* Mobile: bottom sheet */
        .ph-ask-panel-mobile {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          height: 88svh;
          border-radius: 16px 16px 0 0;
          box-shadow: 0 -8px 40px rgba(26,20,16,0.2);
          animation: phSlideUp 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .ph-ask-panel-desktop { display: none; }

        @media (min-width: 768px) {
          .ph-ask-panel-mobile { display: none; }
          .ph-ask-panel-desktop {
            display: flex;
            position: fixed;
            bottom: 84px;
            right: 24px;
            width: 480px;
            height: 560px;
            border-radius: 16px;
            box-shadow: 0 24px 80px rgba(26,20,16,0.28);
            animation: phScaleIn 0.22s cubic-bezier(0.16,1,0.3,1);
            transform-origin: bottom right;
          }
        }

        /* Drag handle on mobile sheet */
        .ph-ask-drag-handle {
          width: 36px;
          height: 4px;
          border-radius: 2px;
          background: var(--ink-line);
          margin: 10px auto 0;
          flex-shrink: 0;
        }

        @keyframes phFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes phSlideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
        @keyframes phScaleIn {
          from { opacity:0; transform:scale(0.93); }
          to   { opacity:1; transform:scale(1); }
        }
      `}</style>
    </>
  )
}

function PanelHeader({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        borderBottom: "1px solid var(--ink-line)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        gap: 8,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: "var(--sans)", fontSize: 15, fontWeight: 600, margin: 0, color: "var(--ink)" }}>
          Ask Parihara
        </p>
        <p style={{ fontSize: 10.5, color: "var(--ink-4)", margin: 0, fontFamily: "var(--sans)" }}>
          Trained on Vedic scriptures
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        <a
          href="/ask-parihara"
          style={{ fontSize: 12, color: "var(--ink-4)", textDecoration: "none", padding: "4px 8px", borderRadius: 6, fontFamily: "var(--sans)" }}
        >
          Expand ↗
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-4)", fontSize: 18, lineHeight: 1, padding: "4px 6px", borderRadius: 6 }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
