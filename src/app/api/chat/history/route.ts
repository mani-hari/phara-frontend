import { NextRequest, NextResponse } from "next/server"
import { retrieveCustomer } from "@lib/data/customer"
import { getUserSessions, linkSessionToUser } from "@lib/chat-store"

// Identity comes from the Medusa customer session (httpOnly cookie), keyed by
// email — same key the chat route uses, so history stays matched.

// ---------------------------------------------------------------------------
// GET /api/chat/history — list conversations for the logged-in user
// ---------------------------------------------------------------------------

export async function GET(_req: NextRequest) {
  const customer = await retrieveCustomer().catch(() => null)
  const email = customer?.email?.toLowerCase()
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const conversations = await getUserSessions(email)
    return NextResponse.json({ conversations })
  } catch (err: any) {
    console.error("[/api/chat/history GET]", err?.message ?? err)
    return NextResponse.json(
      { error: "Failed to load history" },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// POST /api/chat/history — claim localStorage sessions for the logged-in user
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const customer = await retrieveCustomer().catch(() => null)
  const email = customer?.email?.toLowerCase()
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let sessionIds: string[] = []
  try {
    const body = await req.json()
    if (!Array.isArray(body.sessionIds)) {
      return NextResponse.json(
        { error: "sessionIds must be an array" },
        { status: 400 }
      )
    }
    sessionIds = body.sessionIds.filter(
      (id: unknown) => typeof id === "string" && id.trim().length > 0
    )
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  try {
    await Promise.all(sessionIds.map((id) => linkSessionToUser(id, email)))
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[/api/chat/history POST]", err?.message ?? err)
    return NextResponse.json(
      { error: "Failed to link sessions" },
      { status: 500 }
    )
  }
}
