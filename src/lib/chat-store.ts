/**
 * Chat persistence layer — Neon (PostgreSQL).
 * All calls are fire-and-forget; they never block the response stream.
 * If DATABASE_URL is not set the module no-ops silently.
 */

let sql: any = null

async function getDb() {
  if (sql) return sql
  const url = process.env.DATABASE_URL
  if (!url) return null
  try {
    const { neon } = await import("@neondatabase/serverless")
    sql = neon(url)
    return sql
  } catch {
    return null
  }
}

export async function ensureSchema() {
  const db = await getDb()
  if (!db) return
  try {
    // Core tables
    await db`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id          TEXT PRIMARY KEY,
        country     TEXT,
        page_url    TEXT,
        page_title  TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `
    await db`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id          BIGSERIAL PRIMARY KEY,
        session_id  TEXT REFERENCES chat_sessions(id) ON DELETE CASCADE,
        role        TEXT CHECK (role IN ('user','assistant','tool')),
        content     TEXT,
        tool_name   TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `
    await db`
      CREATE INDEX IF NOT EXISTS chat_messages_session_idx
        ON chat_messages(session_id, created_at)
    `

    // Schema additions for title / user linking
    await db`ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS title TEXT`
    await db`ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_id TEXT`
    await db`
      ALTER TABLE chat_sessions
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()
    `
    await db`
      CREATE INDEX IF NOT EXISTS chat_sessions_user_idx
        ON chat_sessions(user_id, updated_at DESC)
        WHERE user_id IS NOT NULL
    `
  } catch (err) {
    console.warn("[chat-store] schema init failed:", err)
  }
}

// ---------------------------------------------------------------------------
// Existing functions (unchanged)
// ---------------------------------------------------------------------------

export async function upsertSession(
  id: string,
  country: string,
  pageUrl: string,
  pageTitle: string,
  userId?: string | null
) {
  const db = await getDb()
  if (!db) return
  try {
    // Attribute to the logged-in user at write time (userId). COALESCE keeps an
    // already-linked user_id and never clobbers it back to null, so a guest
    // session that later gets linked stays linked. Guests write user_id = null.
    await db`
      INSERT INTO chat_sessions (id, country, page_url, page_title, user_id, updated_at)
      VALUES (${id}, ${country}, ${pageUrl}, ${pageTitle}, ${userId ?? null}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        page_url   = EXCLUDED.page_url,
        page_title = EXCLUDED.page_title,
        user_id    = COALESCE(chat_sessions.user_id, EXCLUDED.user_id),
        updated_at = NOW()
    `
  } catch (err) {
    console.warn("[chat-store] upsertSession:", err)
  }
}

export async function saveMessage(
  sessionId: string,
  role: "user" | "assistant" | "tool",
  content: string,
  toolName?: string
) {
  const db = await getDb()
  if (!db) return
  try {
    await db`
      INSERT INTO chat_messages (session_id, role, content, tool_name)
      VALUES (${sessionId}, ${role}, ${content}, ${toolName ?? null})
    `
  } catch (err) {
    console.warn("[chat-store] saveMessage:", err)
  }
}

// ---------------------------------------------------------------------------
// New functions
// ---------------------------------------------------------------------------

/**
 * Update the display title for a session and refresh its updated_at timestamp.
 */
export async function updateSessionTitle(
  sessionId: string,
  title: string
): Promise<void> {
  const db = await getDb()
  if (!db) return
  try {
    await db`
      UPDATE chat_sessions
         SET title      = ${title},
             updated_at = NOW()
       WHERE id = ${sessionId}
    `
  } catch (err) {
    console.warn("[chat-store] updateSessionTitle:", err)
  }
}

/**
 * Return the 30 most recent sessions for a given user, newest first.
 */
export async function getUserSessions(userId: string): Promise<
  {
    id: string
    title: string | null
    createdAt: string
    updatedAt: string
  }[]
> {
  const db = await getDb()
  if (!db) return []
  try {
    const rows = await db`
      SELECT id,
             title,
             created_at  AS "createdAt",
             updated_at  AS "updatedAt"
        FROM chat_sessions
       WHERE user_id = ${userId}
       ORDER BY updated_at DESC
       LIMIT 30
    `
    return rows as {
      id: string
      title: string | null
      createdAt: string
      updatedAt: string
    }[]
  } catch (err) {
    console.warn("[chat-store] getUserSessions:", err)
    return []
  }
}

/**
 * Return all messages for a session in chronological order.
 */
export async function getSessionMessages(sessionId: string): Promise<
  {
    role: string
    content: string
    createdAt: string
  }[]
> {
  const db = await getDb()
  if (!db) return []
  try {
    const rows = await db`
      SELECT role,
             content,
             created_at AS "createdAt"
        FROM chat_messages
       WHERE session_id = ${sessionId}
       ORDER BY created_at ASC
    `
    return rows as { role: string; content: string; createdAt: string }[]
  } catch (err) {
    console.warn("[chat-store] getSessionMessages:", err)
    return []
  }
}

/**
 * Associate a guest session with an authenticated user (called on login sync).
 */
export async function linkSessionToUser(
  sessionId: string,
  userId: string
): Promise<void> {
  const db = await getDb()
  if (!db) return
  try {
    await db`
      UPDATE chat_sessions
         SET user_id = ${userId}
       WHERE id = ${sessionId}
    `
  } catch (err) {
    console.warn("[chat-store] linkSessionToUser:", err)
  }
}
