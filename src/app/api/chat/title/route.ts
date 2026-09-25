import { NextRequest, NextResponse } from "next/server"
import { generateSessionTitle, type TitleMessage } from "@lib/chat-title"
import { classifyMessage } from "@lib/chat/guardrail"

export async function POST(req: NextRequest) {
  let messages: TitleMessage[] = []
  try {
    const body = await req.json()
    messages = Array.isArray(body.messages) ? body.messages.slice(0, 4) : []
  } catch {
    return NextResponse.json({ title: "Chat conversation" }, { status: 400 })
  }

  // A message caught by the legitimacy guardrail never goes to a model, and
  // must not become the sidebar title either.
  if (messages.some((m: any) => m?.role === "user" && classifyMessage(String(m?.content ?? "")).flagged)) {
    return NextResponse.json({ title: "Question for our team" })
  }

  const title = await generateSessionTitle(messages)
  return NextResponse.json({ title })
}
