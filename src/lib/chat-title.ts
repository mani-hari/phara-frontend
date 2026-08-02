/**
 * Shared Haiku-based session title generator.
 * Used by both /api/chat/title (client-triggered) and the onFinish hook in
 * /api/chat (server-side, first-exchange auto-title) so the prompt/model
 * only lives in one place.
 */
import Anthropic from "@anthropic-ai/sdk"

export const TITLE_SYSTEM_PROMPT =
  "Generate a 2-3 word topic label for this spiritual guidance chat. Ultra-concise — like a file tag or category name. Use sacred/Sanskrit terms when fitting. Title-case, no punctuation, no articles. Examples: 'Sarpa Dosha', 'Progeny Pooja', 'Saturn Remedy', 'Pitru Homam', 'Nakshatram Guide', 'Marriage Delay', 'Health Parihara'. Reply with ONLY the label."

export type TitleMessage = { role: "user" | "assistant"; content: string }

const FALLBACK_TITLE = "Chat conversation"

/**
 * Reject anything that isn't a short, clean label — the model occasionally
 * ignores the "reply with ONLY the label" instruction and continues the
 * conversation instead (multi-sentence prose, markdown, embedded newlines).
 * Better to fall back to a generic title than persist that as a "title".
 */
function sanitizeTitle(raw: string | undefined | null): string | null {
  if (!raw) return null
  const cleaned = raw.trim().replace(/^["']|["']$/g, "")
  if (!cleaned) return null
  if (cleaned.length > 40) return null
  if (/[\n\r*_<>`#]/.test(cleaned)) return null
  if (cleaned.split(/\s+/).length > 5) return null
  return cleaned
}

/**
 * Generate a short (2-3 word) session title from the first few messages of a
 * conversation. Falls back to "Chat conversation" on any failure or if
 * ANTHROPIC_API_KEY is missing — never throws.
 *
 * IMPORTANT: the Anthropic Messages API treats a trailing `assistant`-role
 * message as a "prefill" to continue/complete, not as context to summarize.
 * Since our transcripts almost always end on the assistant's reply, passing
 * them through as alternating user/assistant turns makes Claude literally
 * continue that reply's text (or return an empty completion) instead of
 * producing a label. To avoid that, we flatten the transcript into a single
 * `user`-role message with role labels inlined as plain text, so the last
 * (and only) message is always `user` and Claude generates a fresh reply.
 */
export async function generateSessionTitle(
  messages: TitleMessage[]
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return FALLBACK_TITLE

  const trimmed = messages.slice(0, 4).filter((m) => m.content?.trim())
  if (trimmed.length === 0) return FALLBACK_TITLE

  const transcript = trimmed
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n")

  try {
    const client = new Anthropic({ apiKey })
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
  } catch (err: any) {
    console.warn("[chat-title] generateSessionTitle:", err?.message ?? err)
    return FALLBACK_TITLE
  }
}
