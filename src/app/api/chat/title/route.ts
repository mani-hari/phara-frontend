import { NextRequest, NextResponse } from "next/server"
import { generateSessionTitle, type TitleMessage } from "@lib/chat-title"

export async function POST(req: NextRequest) {
  let messages: TitleMessage[] = []
  try {
    const body = await req.json()
    messages = Array.isArray(body.messages) ? body.messages.slice(0, 4) : []
  } catch {
    return NextResponse.json({ title: "Chat conversation" }, { status: 400 })
  }

  const title = await generateSessionTitle(messages)
  return NextResponse.json({ title })
}
