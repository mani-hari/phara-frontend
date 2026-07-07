import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const TITLE_SYSTEM_PROMPT =
  "Generate a 2-3 word topic label for this spiritual guidance chat. Ultra-concise — like a file tag or category name. Use sacred/Sanskrit terms when fitting. Title-case, no punctuation, no articles. Examples: 'Sarpa Dosha', 'Progeny Pooja', 'Saturn Remedy', 'Pitru Homam', 'Nakshatram Guide', 'Marriage Delay', 'Health Parihara'. Reply with ONLY the label."

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ title: "Chat conversation" })
  }

  let messages: { role: "user" | "assistant"; content: string }[] = []
  try {
    const body = await req.json()
    messages = Array.isArray(body.messages) ? body.messages.slice(0, 4) : []
  } catch {
    return NextResponse.json({ title: "Chat conversation" }, { status: 400 })
  }

  if (messages.length === 0) {
    return NextResponse.json({ title: "Chat conversation" })
  }

  try {
    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 20,
      temperature: 0,
      system: TITLE_SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const raw = response.content[0]
    const title =
      raw.type === "text" && raw.text.trim()
        ? raw.text.trim().replace(/^["']|["']$/g, "")
        : "Chat conversation"

    return NextResponse.json({ title })
  } catch (err: any) {
    console.error("[/api/chat/title]", err?.message ?? err)
    return NextResponse.json({ title: "Chat conversation" })
  }
}
