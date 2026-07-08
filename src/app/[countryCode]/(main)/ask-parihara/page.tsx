"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { type Message } from "ai/react"
import ChatInterface from "@/components/chat/chat-interface"
import ConversationSidebar from "@/components/chat/conversation-sidebar"
import { usePageContext } from "@/components/chat/use-page-context"
import {
  loadConversations,
  saveConversation,
  deleteConversation,
  getConversation,
  createConversationId,
  type StoredConversation,
} from "@lib/chat-history"

export default function AskPariharaPage() {
  // Auth state via the Medusa session (httpOnly cookie) — probed through /api/me.
  const [auth, setAuth] = useState<{ loggedIn: boolean; email?: string | null }>({
    loggedIn: false,
  })
  const isLoggedIn = auth.loggedIn
  const userEmail = auth.email ?? undefined
  const pageContext = usePageContext()
  const searchParams = useSearchParams()
  const autoQ = searchParams.get("q") ?? undefined

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setAuth({ loggedIn: !!d.loggedIn, email: d.email }))
      .catch(() => {})
  }, [])

  const [conversations, setConversations] = useState<StoredConversation[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const [initialMessages, setInitialMessages] = useState<
    { id: string; role: "user" | "assistant"; content: string }[] | undefined
  >(undefined)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Load conversations from localStorage on mount
  useEffect(() => {
    const local = loadConversations()
    setConversations(local)

    // Start a new conversation if none exist
    const newId = createConversationId()
    setActiveId(newId)
    setInitialMessages(undefined)
  }, [])

  // If logged in, merge DB conversations into local list
  useEffect(() => {
    if (!isLoggedIn) return
    setIsLoadingHistory(true)

    // Link any unlinked local sessions to user account
    const local = loadConversations()
    if (local.length > 0) {
      const unlinked = local.filter((c) => !c.userId).map((c) => c.id)
      if (unlinked.length > 0) {
        fetch("/api/chat/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionIds: unlinked }),
        }).catch(() => {})
      }
    }

    // Fetch DB sessions
    fetch("/api/chat/history")
      .then((r) => r.json())
      .then(({ conversations: dbConvs }) => {
        if (!Array.isArray(dbConvs)) return
        // Merge DB sessions with local — DB is authoritative for logged-in users
        const merged: StoredConversation[] = dbConvs.map((c: any) => ({
          id: c.id,
          title: c.title || "Chat conversation",
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          messages: [],
          userId: userEmail,
        }))
        // Add any local-only conversations that aren't in DB
        for (const lc of local) {
          if (!merged.find((m) => m.id === lc.id)) {
            merged.push(lc)
          }
        }
        merged.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        setConversations(merged)
      })
      .catch(() => {})
      .finally(() => setIsLoadingHistory(false))
  }, [isLoggedIn, userEmail])

  const handleNew = useCallback(() => {
    const newId = createConversationId()
    setActiveId(newId)
    setInitialMessages(undefined)
  }, [])

  const handleSelect = useCallback(
    async (id: string) => {
      if (id === activeId) return
      setActiveId(id)

      // Try to load messages from localStorage first
      const local = getConversation(id)
      if (local && local.messages.length > 0) {
        setInitialMessages(local.messages)
        return
      }

      // Fall back to DB if logged in
      if (isLoggedIn) {
        try {
          const res = await fetch(`/api/chat/history/${id}`)
          if (res.ok) {
            const data = await res.json()
            const msgs = (data.messages ?? []).map((m: any, i: number) => ({
              id: `db-${id}-${i}`,
              role: m.role,
              content: m.content,
            }))
            setInitialMessages(msgs.length > 0 ? msgs : undefined)
            return
          }
        } catch {
          // Fall through to empty
        }
      }

      setInitialMessages(undefined)
    },
    [activeId, isLoggedIn]
  )

  const handleDelete = useCallback(
    (id: string) => {
      deleteConversation(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (id === activeId) {
        handleNew()
      }
    },
    [activeId, handleNew]
  )

  const handleConversationSave = useCallback(
    (messages: Message[]) => {
      if (!activeId || messages.length === 0) return
      const now = new Date().toISOString()
      const userMessages = messages.filter((m) => m.role === "user")
      const firstUserMsg = userMessages[0]?.content ?? ""
      const existing = conversations.find((c) => c.id === activeId)
      const title = existing?.title || firstUserMsg.slice(0, 60) || "Chat conversation"

      const conv: StoredConversation = {
        id: activeId,
        title,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        messages: messages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          createdAt: now,
        })),
        userId: userEmail,
      }

      saveConversation(conv)
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === activeId)
        if (idx !== -1) {
          const updated = [...prev]
          updated[idx] = conv
          return updated.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
        }
        return [conv, ...prev].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      })

      // Generate title after 2nd exchange
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
            if (!generatedTitle) return
            saveConversation({ ...conv, title: generatedTitle })
            setConversations((prev) =>
              prev.map((c) =>
                c.id === activeId ? { ...c, title: generatedTitle } : c
              )
            )
            // Persist title in DB if logged in
            if (isLoggedIn) {
              fetch(`/api/chat/history/${activeId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: generatedTitle }),
              }).catch(() => {})
            }
          })
          .catch(() => {})
      }
    },
    [activeId, conversations, userEmail, isLoggedIn]
  )

  return (
    <div
      style={{
        height: "calc(100dvh - 64px)",
        display: "flex",
        background: "var(--paper)",
        overflow: "hidden",
      }}
    >
      {/* ── Left sidebar ──────────────────────────────────────── */}
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        isLoggedIn={isLoggedIn}
        onNew={handleNew}
        onSelect={handleSelect}
        onDelete={handleDelete}
      />

      {/* ── Main chat area ────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* Chat fills remaining height — key forces remount on conversation switch */}
        <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
          <ChatInterface
            key={activeId}
            compact={false}
            countryCode="in"
            pageContext={pageContext}
            sessionId={activeId}
            initialMessages={initialMessages}
            onConversationSave={handleConversationSave}
            conversationCount={conversations.length}
            autoSendMessage={activeId ? autoQ : undefined}
          />
        </div>
      </div>
    </div>
  )
}
