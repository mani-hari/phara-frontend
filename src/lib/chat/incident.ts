/**
 * Ask Parihara incident alert (Layer 3), server-only.
 *
 * Tells staff (by email, via the Medusa backend route POST /store/chat-incident)
 * that a chat hit the temple-legitimacy guardrail. Best-effort: bounded by a
 * short timeout, never throws, never blocks the reply the customer sees.
 */
import { maskPII } from "./guardrail"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://pariharaonline.medusajs.app"
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export type IncidentStage = "flagged" | "locked"

export type IncidentPayload = {
  sessionId: string
  reason: string
  stage: IncidentStage
  pageUrl?: string
  transcript: { role: string; content: string }[]
  customerEmail?: string | null
}

export async function sendChatIncident(
  payload: IncidentPayload,
  timeoutMs = 2500
): Promise<{ ok: boolean; status?: number }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const transcript = payload.transcript.slice(-12).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: maskPII(String(m.content ?? "")).slice(0, 2000),
    }))
    const res = await fetch(`${BACKEND_URL}/store/chat-incident`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUB_KEY,
      },
      body: JSON.stringify({
        session_id: payload.sessionId,
        reason: payload.reason,
        stage: payload.stage,
        page_url: payload.pageUrl || "",
        transcript,
        ...(payload.customerEmail ? { customer_email: payload.customerEmail } : {}),
      }),
      signal: controller.signal,
      cache: "no-store",
    })
    if (!res.ok) {
      console.warn(`[chat incident] backend responded ${res.status}`)
    }
    return { ok: res.ok, status: res.status }
  } catch (err: any) {
    console.warn("[chat incident] send failed:", err?.name === "AbortError" ? "timeout" : err?.message ?? err)
    return { ok: false }
  } finally {
    clearTimeout(timer)
  }
}
