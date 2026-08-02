// backfill-chat-titles.mjs — one-off backfill for MAN-14.
//
// Every chat_sessions row previously had title = NULL because
// updateSessionTitle() existed but nothing called it (fixed alongside this
// script in src/app/api/chat/route.ts, which now auto-titles new sessions on
// their first exchange). This script backfills the ~327 pre-existing sessions
// that were created before that fix landed.
//
// For each session with title IS NULL:
//   - pull its messages (chat_messages ordered by created_at)
//   - use the first user-role message as the title-generation input; some
//     sessions only have assistant/tool messages (dropped by the FK race
//     documented in MAN-14 — also fixed alongside this script), so fall back
//     to the first message of any role, or "Chat conversation" if there are
//     no messages at all
//   - generate a 2-3 word title via the same Haiku helper used by
//     /api/chat/title and the live route (src/lib/chat-title.ts)
//   - call updateSessionTitle(sessionId, title)
//
// Concurrency-limited (small batch size) since this hits the Anthropic API
// ~327 times.
//
// Usage:
//   DATABASE_URL=$(grep '^DATABASE_URL=' .env.local | cut -d= -f2-) \
//   ANTHROPIC_API_KEY=$(grep '^ANTHROPIC_API_KEY=' .env.local | cut -d= -f2-) \
//     node scripts/backfill-chat-titles.mjs
//
// Safe to re-run: only touches sessions where title IS NULL.

import { neon } from "@neondatabase/serverless"
import Anthropic from "@anthropic-ai/sdk"

const TITLE_SYSTEM_PROMPT =
  "Generate a 2-3 word topic label for this spiritual guidance chat. Ultra-concise — like a file tag or category name. Use sacred/Sanskrit terms when fitting. Title-case, no punctuation, no articles. Examples: 'Sarpa Dosha', 'Progeny Pooja', 'Saturn Remedy', 'Pitru Homam', 'Nakshatram Guide', 'Marriage Delay', 'Health Parihara'. Reply with ONLY the label."

const CONCURRENCY = 5
const FALLBACK_TITLE = "Chat conversation"

// The model occasionally ignores "reply with ONLY the label" and continues
// the conversation instead (multi-sentence prose, markdown, embedded
// newlines) — reject anything that isn't a short, clean label rather than
// persist garbage. Mirrors src/lib/chat-title.ts.
function sanitizeTitle(raw) {
  if (!raw) return null
  const cleaned = raw.trim().replace(/^["']|["']$/g, "")
  if (!cleaned) return null
  if (cleaned.length > 40) return null
  if (/[\n\r*_<>`#]/.test(cleaned)) return null
  if (cleaned.split(/\s+/).length > 5) return null
  return cleaned
}

// IMPORTANT: the Anthropic Messages API treats a trailing `assistant`-role
// message as a "prefill" to continue/complete rather than context to
// summarize — since our transcripts almost always end on the assistant's
// reply, sending alternating user/assistant turns makes Claude literally
// continue that reply's text (or return an empty completion) instead of a
// title. Flatten into a single `user`-role message so the last (and only)
// message is always `user` and Claude generates a fresh reply. Mirrors
// src/lib/chat-title.ts.
async function generateTitle(client, messages) {
  if (messages.length === 0) return FALLBACK_TITLE
  const transcript = messages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n")
  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 20,
      temperature: 0,
      system: TITLE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: transcript }],
    })
    const raw = response.content[0]
    const text = raw?.type === "text" ? raw.text : null
    return sanitizeTitle(text) ?? FALLBACK_TITLE
  } catch (err) {
    console.warn(`  title generation failed: ${err?.message ?? err}`)
    return FALLBACK_TITLE
  }
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

async function main() {
  const dbUrl = process.env.DATABASE_URL
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!dbUrl) throw new Error("DATABASE_URL not set")
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set")

  const sql = neon(dbUrl)
  const client = new Anthropic({ apiKey })

  const before = await sql`SELECT count(*) FROM chat_sessions WHERE title IS NULL`
  console.log(`Sessions with title IS NULL (before): ${before[0].count}`)

  // Also repairs "malformed" titles left by an earlier, buggy run of this
  // script (before the trailing-assistant-message prefill bug above was
  // found): those look like truncated chat prose rather than a 2-3 word
  // label — long, containing newlines, markdown bold, or the
  // <<HUMAN_CONVERSATION_END>> sentinel some assistant replies contain.
  const sessions = await sql`
    SELECT id FROM chat_sessions
     WHERE title IS NULL
        OR title ~ E'[\\n]'
        OR title LIKE '%**%'
        OR title LIKE '%<<%'
        OR length(title) > 40
     ORDER BY created_at ASC
  `
  console.log(`Backfilling ${sessions.length} sessions (concurrency ${CONCURRENCY})...`)

  let done = 0
  await mapLimit(sessions, CONCURRENCY, async (session) => {
    const messages = await sql`
      SELECT role, content FROM chat_messages
       WHERE session_id = ${session.id}
       ORDER BY created_at ASC
       LIMIT 4
    `

    // Prefer starting from the first user message; fall back to whatever
    // exists (sessions hit by the FK race may have only assistant/tool rows).
    const firstUserIdx = messages.findIndex((m) => m.role === "user")
    const usable =
      firstUserIdx >= 0
        ? messages.slice(firstUserIdx).filter((m) => m.role !== "tool")
        : messages.filter((m) => m.role !== "tool")

    const title = await generateTitle(client, usable)
    await sql`UPDATE chat_sessions SET title = ${title}, updated_at = updated_at WHERE id = ${session.id}`

    done++
    if (done % 25 === 0 || done === sessions.length) {
      console.log(`  ${done}/${sessions.length}`)
    }
  })

  const after = await sql`SELECT count(*) FROM chat_sessions WHERE title IS NULL`
  console.log(`Sessions with title IS NULL (after): ${after[0].count}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
