/**
 * gpt-4.1-mini sometimes writes its tool calls into the reply as text, e.g.
 *   "...Would you like to book? functions.suggestFollowUps({suggestions:[...]})"
 * Visitors then see raw code. Seen in 15+ live sessions, 19 Oct–6 Nov 2026.
 * Leaked calls always come at the end of a reply, so cut from the first one
 * to the end. Also catches a half-streamed call ("functions.sugg") mid-stream.
 */
const LEAK =
  /\s*(?:\bfunctions\.\w*|\b(?:suggestFollowUps|recommendProducts|showBookingForm|queryOrderStatus|suggestSignIn)\s*\()[\s\S]*$/

export function stripLeakedToolCalls(text: string): string {
  if (!text) return text
  return text.replace(LEAK, "").trimEnd()
}
