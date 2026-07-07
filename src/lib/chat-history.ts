/**
 * Client-side localStorage conversation history manager.
 * All operations are guarded for SSR safety (typeof window checks + try/catch).
 */

const STORAGE_KEY = "ph_chat_history"
const MAX_CONVERSATIONS = 30

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StoredMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

export type StoredConversation = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: StoredMessage[]
  userId?: string
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function readRaw(): StoredConversation[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRaw(conversations: StoredConversation[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  } catch {
    // Storage quota exceeded or private browsing — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Load all stored conversations from localStorage.
 * Returns an empty array if localStorage is unavailable or data is corrupt.
 */
export function loadConversations(): StoredConversation[] {
  return readRaw()
}

/**
 * Upsert a conversation by id. Keeps only the newest MAX_CONVERSATIONS
 * entries (pruned by updatedAt, oldest first).
 */
export function saveConversation(conv: StoredConversation): void {
  try {
    const existing = readRaw()
    const idx = existing.findIndex((c) => c.id === conv.id)
    if (idx !== -1) {
      existing[idx] = conv
    } else {
      existing.push(conv)
    }

    // Prune to MAX_CONVERSATIONS — keep the most recently updated
    const pruned = existing
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, MAX_CONVERSATIONS)

    writeRaw(pruned)
  } catch {
    // Silently ignore errors — chat history is a convenience, not critical
  }
}

/**
 * Delete a conversation by id.
 */
export function deleteConversation(id: string): void {
  try {
    const existing = readRaw()
    writeRaw(existing.filter((c) => c.id !== id))
  } catch {
    // no-op
  }
}

/**
 * Retrieve a single conversation by id, or null if not found.
 */
export function getConversation(id: string): StoredConversation | null {
  try {
    const existing = readRaw()
    return existing.find((c) => c.id === id) ?? null
  } catch {
    return null
  }
}

/**
 * Generate a new conversation id using the Web Crypto API.
 */
export function createConversationId(): string {
  return crypto.randomUUID()
}

/**
 * Returns a grouping label for a conversation based on its ISO date string.
 *
 * - "Today"     — created/updated today
 * - "This week" — within the past 7 days (but not today)
 * - "Earlier"   — older than 7 days
 */
export function formatConversationDate(
  isoDate: string
): "Today" | "This week" | "Earlier" {
  try {
    const date = new Date(isoDate)
    const now = new Date()

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfToday.getDate() - 6) // 7-day rolling window

    if (date >= startOfToday) return "Today"
    if (date >= startOfWeek) return "This week"
    return "Earlier"
  } catch {
    return "Earlier"
  }
}
