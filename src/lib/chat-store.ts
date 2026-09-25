/**
 * Chat persistence layer — Neon (PostgreSQL).
 * All calls are fire-and-forget; they never block the response stream.
 * If DATABASE_URL is not set the module no-ops silently.
 */

let sql: any = null
let schemaReady: Promise<void> | null = null

async function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) return null
  if (!sql) {
    try {
      const { neon } = await import("@neondatabase/serverless")
      sql = neon(url)
    } catch {
      return null
    }
  }
  // Create the tables on first use (once per process) so writes never hit a
  // missing table — nothing else calls ensureSchema, so this is the guarantee.
  if (!schemaReady) schemaReady = createSchema(sql)
  await schemaReady
  return sql
}

// Back-compat export; schema is now created lazily by getDb().
export async function ensureSchema() {
  await getDb()
}

async function createSchema(db: any) {
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

  // Ask Parihara guardrail state (src/lib/chat/guardrail.ts). Own try block so
  // a failure above never skips these, and vice versa.
  try {
    await db`ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS guard_flags INT DEFAULT 0`
    await db`ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS guard_locked_at TIMESTAMPTZ NULL`
    await db`ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS guard_reason TEXT NULL`
  } catch (err) {
    console.warn("[chat-store] guard schema init failed:", err)
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

// ---------------------------------------------------------------------------
// Guardrail state (Layer 1 of the Ask Parihara legitimacy protocol)
// ---------------------------------------------------------------------------

export type GuardState = { flags: number; lockedAt: string | null }

/**
 * Current guard state for a session, or null when there is no DB / no row /
 * the query fails (caller falls back to counting flagged turns in history).
 */
export async function getGuardState(sessionId: string): Promise<GuardState | null> {
  const db = await getDb()
  if (!db) return null
  try {
    const rows = await db`
      SELECT guard_flags, guard_locked_at FROM chat_sessions WHERE id = ${sessionId}
    `
    const r = rows?.[0]
    if (!r) return { flags: 0, lockedAt: null }
    return { flags: Number(r.guard_flags ?? 0), lockedAt: r.guard_locked_at ?? null }
  } catch (err) {
    console.warn("[chat-store] getGuardState:", err)
    return null
  }
}

/**
 * Atomically record one flagged message. Creates the session row if it does
 * not exist yet (upsertSession is fire-and-forget and may not have landed).
 * The session locks on the second flag. Returns the new state, or null on
 * failure.
 */
export async function recordGuardFlag(
  sessionId: string,
  reason: string,
  pageUrl: string,
  pageTitle: string,
  userId?: string | null
): Promise<GuardState | null> {
  const db = await getDb()
  if (!db) return null
  try {
    const rows = await db`
      INSERT INTO chat_sessions (id, country, page_url, page_title, user_id, updated_at, guard_flags, guard_reason)
      VALUES (${sessionId}, 'in', ${pageUrl}, ${pageTitle}, ${userId ?? null}, NOW(), 1, ${reason})
      ON CONFLICT (id) DO UPDATE SET
        guard_flags     = COALESCE(chat_sessions.guard_flags, 0) + 1,
        guard_reason    = EXCLUDED.guard_reason,
        guard_locked_at = CASE
                            WHEN COALESCE(chat_sessions.guard_flags, 0) + 1 >= 2
                              THEN COALESCE(chat_sessions.guard_locked_at, NOW())
                            ELSE chat_sessions.guard_locked_at
                          END,
        user_id         = COALESCE(chat_sessions.user_id, EXCLUDED.user_id),
        updated_at      = NOW()
      RETURNING guard_flags, guard_locked_at
    `
    const r = rows?.[0]
    if (!r) return null
    return { flags: Number(r.guard_flags ?? 0), lockedAt: r.guard_locked_at ?? null }
  } catch (err) {
    console.warn("[chat-store] recordGuardFlag:", err)
    return null
  }
}

/** Last N messages of a session (oldest first) for incident transcripts. */
export async function getRecentMessages(
  sessionId: string,
  limit = 12
): Promise<{ role: string; content: string }[]> {
  const db = await getDb()
  if (!db) return []
  try {
    const rows = await db`
      SELECT role, content FROM (
        SELECT role, content, created_at, id FROM chat_messages
         WHERE session_id = ${sessionId} AND role IN ('user','assistant')
         ORDER BY created_at DESC, id DESC
         LIMIT ${limit}
      ) t ORDER BY created_at ASC, id ASC
    `
    return rows as { role: string; content: string }[]
  } catch (err) {
    console.warn("[chat-store] getRecentMessages:", err)
    return []
  }
}
