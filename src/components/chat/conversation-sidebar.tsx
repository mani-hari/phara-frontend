"use client"

import { useState, useEffect } from "react"

type Conversation = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

type ConversationSidebarProps = {
  conversations: Conversation[]
  activeId: string
  isLoggedIn: boolean
  onNew: () => void
  onSelect: (id: string) => void
  onDelete?: (id: string) => void
}

type Group = {
  label: "TODAY" | "THIS WEEK" | "EARLIER"
  items: Conversation[]
}

function groupConversations(convs: Conversation[]): Group[] {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay())

  const today: Conversation[] = []
  const thisWeek: Conversation[] = []
  const earlier: Conversation[] = []

  for (const conv of convs) {
    const d = new Date(conv.updatedAt || conv.createdAt)
    if (d >= startOfToday) {
      today.push(conv)
    } else if (d >= startOfWeek) {
      thisWeek.push(conv)
    } else {
      earlier.push(conv)
    }
  }

  const groups: Group[] = []
  if (today.length) groups.push({ label: "TODAY", items: today })
  if (thisWeek.length) groups.push({ label: "THIS WEEK", items: thisWeek })
  if (earlier.length) groups.push({ label: "EARLIER", items: earlier })
  return groups
}

function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) {
      return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    }
    if (days < 7) {
      return d.toLocaleDateString("en-IN", { weekday: "short" })
    }
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
  } catch {
    return ""
  }
}

export default function ConversationSidebar({
  conversations,
  activeId,
  isLoggedIn,
  onNew,
  onSelect,
  onDelete,
}: ConversationSidebarProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  if (isMobile) return null

  const groups = groupConversations(conversations)

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#eee5d5",
        borderRight: "1px solid var(--ink-line)",
        overflow: "hidden",
      }}
    >
      {/* New conversation button */}
      <div style={{ padding: "14px 12px 10px" }}>
        <button
          type="button"
          onClick={onNew}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            width: "100%",
            padding: "9px 14px",
            background: "var(--sindoor)",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--sans)",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = "#9e3a25"
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = "var(--sindoor)"
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          New conversation
        </button>
      </div>

      {/* Conversation list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 8px",
        }}
      >
        {conversations.length === 0 ? (
          <div
            style={{
              padding: "24px 12px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 12.5,
                color: "var(--ink-4)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Your conversations will appear here
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} style={{ marginBottom: 8 }}>
              {/* Group label */}
              <p
                style={{
                  margin: "10px 6px 4px",
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--gold-2)",
                }}
              >
                {group.label}
              </p>

              {/* Conversation items */}
              {group.items.map((conv) => {
                const isActive = conv.id === activeId
                const isHovered = hoveredId === conv.id

                return (
                  <div
                    key={conv.id}
                    onClick={() => onSelect(conv.id)}
                    onMouseEnter={() => setHoveredId(conv.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 4,
                      padding: "8px 8px 8px 10px",
                      borderRadius: 8,
                      cursor: "pointer",
                      borderLeft: isActive
                        ? "3px solid var(--sindoor)"
                        : "3px solid transparent",
                      background: isActive
                        ? "rgba(182,68,46,0.06)"
                        : isHovered
                        ? "rgba(26,20,16,0.04)"
                        : "transparent",
                      transition: "background 0.12s, border-color 0.12s",
                      marginBottom: 1,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          fontWeight: isActive ? 600 : 400,
                          color: "var(--ink)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          lineHeight: 1.35,
                        }}
                      >
                        {conv.title || "Untitled conversation"}
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: 11,
                          color: "var(--ink-4)",
                          lineHeight: 1,
                        }}
                      >
                        {formatShortDate(conv.updatedAt || conv.createdAt)}
                      </p>
                    </div>

                    {/* Delete button — only visible on hover */}
                    {isHovered && onDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(conv.id)
                        }}
                        title="Delete conversation"
                        style={{
                          flexShrink: 0,
                          width: 20,
                          height: 20,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--ink-4)",
                          fontSize: 14,
                          borderRadius: 4,
                          marginTop: 1,
                          transition: "color 0.12s",
                        }}
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLButtonElement).style.color =
                            "var(--sindoor)"
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLButtonElement).style.color =
                            "var(--ink-4)"
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>

      {/* Bottom section */}
      <div
        style={{
          flexShrink: 0,
          padding: "10px 12px 14px",
          borderTop: "1px solid var(--ink-line)",
        }}
      >
        {!isLoggedIn ? (
          <div
            style={{
              padding: "10px 12px",
              background: "var(--sindoor-soft)",
              borderRadius: 8,
              border: "1px solid rgba(182,68,46,0.15)",
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 12,
                color: "var(--ink-2)",
                lineHeight: 1.4,
              }}
            >
              Sign in to save your history across devices
            </p>
            <a
              href="/account/signin"
              className="ph-btn ph-btn-ghost"
              style={{
                display: "block",
                width: "100%",
                textAlign: "center",
                fontSize: 12,
                padding: "6px 12px",
                boxSizing: "border-box",
                textDecoration: "none",
              }}
            >
              Sign in
            </a>
          </div>
        ) : (
          <p
            style={{
              margin: 0,
              fontSize: 11.5,
              color: "var(--ink-4)",
              textAlign: "center",
            }}
          >
            Synced to your account ✓
          </p>
        )}
      </div>
    </aside>
  )
}
