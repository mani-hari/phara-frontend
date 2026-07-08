import { NextRequest, NextResponse } from "next/server"
import { retrieveCustomer } from "@lib/data/customer"
import { getSessionMessages, updateSessionTitle } from "@lib/chat-store"
import { neon } from "@neondatabase/serverless"

// Identity from the Medusa customer session (httpOnly cookie), keyed by email.
async function currentUserEmail(): Promise<string | null> {
  const customer = await retrieveCustomer().catch(() => null)
  return customer?.email?.toLowerCase() ?? null
}

// ---------------------------------------------------------------------------
// Internal helper — fetch the session record to check ownership
// ---------------------------------------------------------------------------

async function getSessionRecord(
  sessionId: string
): Promise<{ userId: string | null } | null> {
  const url = process.env.DATABASE_URL
  if (!url) return null
  try {
    const db = neon(url)
    const rows = await db`
      SELECT user_id AS "userId"
        FROM chat_sessions
       WHERE id = ${sessionId}
       LIMIT 1
    `
    if (!rows.length) return null
    return { userId: (rows[0] as any).userId ?? null }
  } catch {
    return null
  }
}

type RouteContext = { params: { sessionId: string } }

// ---------------------------------------------------------------------------
// GET /api/chat/history/[sessionId] — fetch messages
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { sessionId } = params

  const sessionRecord = await getSessionRecord(sessionId)
  if (!sessionRecord) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  // If the session is linked to a user, require matching authentication
  if (sessionRecord.userId !== null) {
    const email = await currentUserEmail()
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (email !== sessionRecord.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }
  // Guest session (user_id IS NULL) — allow unauthenticated access so the
  // browser can reload its own conversation without forcing a login

  try {
    const messages = await getSessionMessages(sessionId)
    return NextResponse.json({ messages })
  } catch (err: any) {
    console.error("[/api/chat/history/[sessionId] GET]", err?.message ?? err)
    return NextResponse.json(
      { error: "Failed to load messages" },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/chat/history/[sessionId] — update session title
// ---------------------------------------------------------------------------

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { sessionId } = params

  const email = await currentUserEmail()
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let title = ""
  try {
    const body = await req.json()
    if (typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { error: "title must be a non-empty string" },
        { status: 400 }
      )
    }
    title = body.title.trim()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  // Verify the session belongs to the requesting user before allowing update
  const sessionRecord = await getSessionRecord(sessionId)
  if (!sessionRecord) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }
  if (sessionRecord.userId !== null && sessionRecord.userId !== email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    await updateSessionTitle(sessionId, title)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error(
      "[/api/chat/history/[sessionId] PATCH]",
      err?.message ?? err
    )
    return NextResponse.json(
      { error: "Failed to update title" },
      { status: 500 }
    )
  }
}
