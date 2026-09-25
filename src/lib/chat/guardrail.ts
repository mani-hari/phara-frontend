/**
 * Ask Parihara: deterministic guardrail (Layer 1).
 *
 * Pure module with no I/O. It detects messages that challenge the legitimacy or
 * permission of our temple service, or that paste a notice about it (e.g. the
 * 16 Sep 2026 paste of another operator's "The Temple Has Stopped Us..."
 * announcement). Flagged messages never reach the model; the chat route answers
 * with the owner-approved fixed replies below.
 *
 * Rules, all run on a normalised lowercase copy:
 *   A. CONTEXT term (temple / pooja / abhishekam / prasadam / Garbarakshambigai /
 *      "your service" / "you people" / "how can you" / "on behalf" ...)
 *      AND a CHALLENGE term (no longer permit, not allowed, banned, stopped us,
 *      authorities, decision is final, a notice, illegal, fraud, fake, scam,
 *      "is this legit", "really perform", "prove", "how can you sell" ...).
 *   B. A direct ACCUSATION aimed at us ("this is fraud", "you are cheating",
 *      "aap log fraud ho"), which counts even without a temple word.
 *   C. A long paste (> 350 chars) containing "temple" and one of
 *      no longer / authorities / permit / final.
 *
 * Precision matters more than recall here: an ordinary devotee must never get
 * the canned reply. scripts/test-chat-guardrail.mjs is the test set that
 * decides the rules.
 */

import { CONTACT } from "../contact"

// Owner-approved wording. Use verbatim. The phone digits are asserted against
// CONTACT.whatsapp in the test suite.
export const STANDARD_REPLY =
  "Our representatives have a long-standing relationship with the temple. They go there in person and have the pooja performed on your behalf. That is what makes our service unique. It takes more effort, but it is how we have served devotees for more than 15 years. For anything about your booking, our team is happy to help on WhatsApp at +91 97432 44501."

export const ESCALATION_REPLY =
  "I think it is best you speak with our staff directly about this. Please WhatsApp or call +91 97432 44501, Monday to Saturday, 9 AM to 6 PM IST."

/** What flagged user turns are replaced with in the model's history. */
export const REDACTED_USER_TURN = "[handled by staff protocol]"

export const GUARD_CONTACT_DIGITS = CONTACT.whatsapp

export type GuardResult = { flagged: boolean; reason: string }

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

export function normalize(text: string): string {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[‘’‛′`]/g, "'")
    .replace(/[“”‟″]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
}

// ---------------------------------------------------------------------------
// Term lists
// ---------------------------------------------------------------------------

// Service / temple context.
const CONTEXT: RegExp[] = [
  /\btemples?\b/,
  /\bmandir\b/,
  /\bkovil\b|\bkoil\b/,
  /\bp(?:oo|u)jas?\b|\bp(?:oo|u)ja'?s\b|\bpoojai\b/,
  /\bhomams?\b|\bhavans?\b/,
  /\babh?ishek(?:am|ham)?\b/,
  /\bprasad(?:am|ham|h)?\b/,
  /\bgar?bh?a\s?raksh?amb(?:i|h)?(?:ga|gai|ka|kai|igai|ikai)\b|\bgarbh?araksh/,
  /\byour (?:service|services|company|business|website|site|team|people|priests?)\b/,
  /\byou (?:people|guys|all)\b|\bu people\b|\baap log\b|\btum log\b/,
  /\bhow can (?:you|u)\b/,
  /\bon (?:my |our |their )?behalf\b/,
  /\bproxy\b/,
  /\bpriests?\b/,
]

// Challenge / legitimacy terms (only count when a CONTEXT term is present).
// Deliberately narrow: bare "not allowed", "stopped", "cheat", "fraud",
// "impossible" or "permission" appear in ordinary devotee questions ("women
// are not allowed in the temple during periods", "my husband cheated on me",
// "it is impossible for me to travel"), so each is scoped to phrasing that is
// about us or our service.
const SUBJ = String.raw`(?:you|u|we|us|they|them|anyone|outsiders|agents?|agenc(?:y|ies)|third[- ]part(?:y|ies)|online (?:bookings?|services?|p(?:oo|u)jas?)|proxy(?: p(?:oo|u)jas?)?|p(?:oo|u)jas|poojas|abhishekams?|devotees)`
const NEG = String.raw`(?:(?:are|is|were|was|will be|be) )?(?:not|no longer|never)|aren't|isn't|weren't|wasn't|won't be`
const CHALLENGE: { re: RegExp; label: string }[] = [
  { re: /\bno longer (?:be )?(?:permit|permits|permitted|permitting|allow|allows|allowed|allowing|conduct|perform)\b/, label: "no longer permitted" },
  { re: new RegExp(String.raw`\b${SUBJ} (?:${NEG}) (?:be )?(?:allowed|permitted|authori[sz]ed)\b`), label: "not allowed/permitted" },
  { re: /\bnot (?:allowed|permitted|authori[sz]ed) to (?:conduct|perform|do|sell|offer|book|take)\b/, label: "not allowed/permitted" },
  { re: /\b(?:does|do|did|will|would) ?(?:not|n't) (?:permit|allow) (?:you|u|anyone|outsiders|agents|proxy|online|p(?:oo|u)jas|poojas)\b/, label: "does not permit" },
  { re: /\bunauthori[sz]ed\b/, label: "unauthorised" },
  { re: /\bbann(?:ed|ing)\b|\bbans\b|\bprohibit(?:ed|s|ing)?\b|\bforbidden\b/, label: "banned/prohibited" },
  { re: /\bstopped (?:us|you|u|them|performing|conducting|allowing|permitting|proxy|online|(?:all |the )?(?:p(?:oo|u)jas|poojas|abhishekams))\b/, label: "stopped us/performing" },
  { re: /\btemple (?:has |have |had |is |authorities (?:have |has )?)?stopped\b/, label: "temple has stopped" },
  { re: /\bauthorities\b/, label: "authorities" },
  { re: /\bdecision is final\b/, label: "decision is final" },
  { re: /\b(?:a|an|the|this|that|official|public|temple|their|recent|your) notice\b|\bnotice (?:from|by|says|issued|board)\b/, label: "notice" },
  { re: /\billegal(?:ly)?\b|\bunlawful\b/, label: "illegal" },
  { re: /\bfake\b/, label: "fake" },
  { re: /\bscam(?:s|mer|mers)?\b/, label: "scam" },
  { re: /\blegit(?:imate)?\b|\blegitimacy\b/, label: "legit" },
  { re: /\b(?:is (?:it|this|that)|are (?:you|u|they)|you are|you're|really|truly) (?:even |actually |really )?genuine\b|\bgenuine (?:service|company|business|website|site|people)\b|\byour \w+(?: \w+)? (?:is|are) genuine\b/, label: "genuine (about us)" },
  { re: /\b(?:really|actually|truly) (?:perform|performs|performed|conduct|conducts|conducted|go|goes|went|visit|visits)\b|\b(?:really|actually|truly) (?:do|does|did) (?:the|this|it|p(?:oo|u)ja|poojas|pujas|abhishekam)\b/, label: "really perform" },
  { re: /\bprove\b|\bproof (?:that|you|of (?:the |this )?(?:pooja|puja|it) (?:being )?(?:done|performed))\b|\b(?:what|any|real|give (?:me |us )?|show (?:me |us )?)proof\b/, label: "proof" },
  { re: /\bhow (?:can|could) (?:you|u) (?:still |even )?(?:sell|claim|keep (?:selling|offering)|do this|be doing this)\b/, label: "how can you sell" },
  { re: /\bhow (?:are|r) (?:you|u) (?:still |even )?(?:doing (?:it|this|that)|allowed|permitted|getting away)\b/, label: "how are you doing this" },
  { re: /\bhow (?:is|'s) (?:this|it|that) (?:even )?(?:possible|allowed|legal|permitted)\b|\bhow's (?:this|it|that) (?:even )?(?:possible|allowed|legal)\b/, label: "how is this possible" },
  { re: /\bnot possible (?:for (?:you|u|anyone|outsiders|agents)|to (?:perform|conduct) (?:it|this|the|p(?:oo|u)jas?) (?:on behalf|by proxy|remotely))\b/, label: "not possible" },
  { re: /\b(?:even )?allowed (?:by|from) (?:the )?(?:temple|authorities|devasthanam|management|trust)\b|\bis (?:this|it|that) even allowed\b|\bare (?:you|u) (?:even |really )?(?:allowed|permitted|authori[sz]ed)\b/, label: "allowed by the temple" },
  { re: /\b(?:who|which authority) (?:has )?(?:allowed|authori[sz]ed|permitted) (?:you|u)\b|\b(?:whose|what|any|have|has|got|get|taken|official|temple'?s?|written) permission\b|\bpermission (?:from|of) (?:the )?(?:temple|authorities|devasthanam|trust)\b|\bauthori[sz]ed (?:by|channel|agent)/, label: "permission" },
  { re: /\bnot (?:real|true|genuine)\b.*\b(?:pooja|puja|service)\b|\bis (?:this|it) (?:real|true)\?/, label: "not real" },
  // Indian-English / Hinglish / Tanglish variants.
  { re: /\bmana kar (?:diya|di|diye|dia)\b|\bband kar (?:diya|di|diye|dia|diya hai)\b|\bband ho (?:gaya|gayi|gai)\b|\bnahi karne (?:dete|dega|degi|denge)\b|\ballow nahi\b|\bijazat\b/, label: "hinglish: stopped/banned" },
  { re: /\bjh?oo?th\b|\bjhuth\b|\bdhokh?a\b|\bthagi\b/, label: "hinglish: lie/cheat" },
  { re: /\ballow panna? ?(?:maat|mat)|\banumathi\b|\banumati\b/, label: "tanglish/hindi: not allowed/permission" },
]

// Direct accusation aimed at us (rule B): counts without a temple word.
// The accusation word must follow a target ("this is fraud", "you are
// cheating", "aap log fraud ho") so "my husband cheated on me" or "I lost
// money in a fraud" never match.
const ACCUSE = String.raw`(?:fraud(?:s|ulent|ster|sters)?|scam(?:s|mer|mers)?|fake|cheat(?:s|ing|er|ers)?|liars?|lying|dhokh?a(?:baaz|baz)?|thugs?|looting|looters?|420)`
const TARGET = String.raw`(?:this|that|it|you|u|your \w+|ur \w+|you're|youre|site|website|company|business|service|services|parihara|pariharaonline|log|aap|tum|they|people|guys|all|prasadam|prasad|ghee|oil|udi|video)`
const FILLER = String.raw`(?:is|are|r|ho|hai|hain|seem|seems|look|looks|sound|sounds|must|be|all|just|really|totally|clearly|definitely|a|an|total|complete|big|pure|clear|such|so|also|only|another|one|of|those)`
const ACCUSATIONS: RegExp[] = [
  new RegExp(String.raw`\b${TARGET}(?: ${FILLER}){0,4} ${ACCUSE}\b`),
  new RegExp(String.raw`\b${ACCUSE} (?:company|site|website|service|people|business|operators?|agents?|log)\b`),
  new RegExp(String.raw`\b(?:are|is) (?:you|u|this|it|parihara|the site|this site|this website) (?:a |an |just |really )?${ACCUSE}\b`),
  /\b(?:you|u)(?:'re| are| r) (?:lying|cheating|looting)\b|\bcheating (?:us|people|devotees|customers)\b/,
  /\b(?:is|are) (?:this|you|u|parihara|pariharaonline|this site|this website|your (?:site|website|company|service|business)) (?:even |really |actually )?(?:legit|legitimate)\b/,
]

// ---------------------------------------------------------------------------
// Classifier
// ---------------------------------------------------------------------------

export function classifyMessage(text: string): GuardResult {
  const raw = String(text ?? "")
  const t = normalize(raw)
  if (!t) return { flagged: false, reason: "" }

  // Rule C: long paste of a notice.
  if (
    t.length > 350 &&
    /\btemple/.test(t) &&
    /\bno longer\b|\bauthorities\b|\bpermit|\bfinal\b/.test(t)
  ) {
    return { flagged: true, reason: "long notice paste (temple + no longer/authorities/permit/final)" }
  }

  const hasContext = CONTEXT.some((re) => re.test(t))

  // Rule A: context + challenge.
  if (hasContext) {
    const hit = CHALLENGE.find((c) => c.re.test(t))
    if (hit) return { flagged: true, reason: `legitimacy challenge: ${hit.label}` }
  }

  // Rule B: direct accusation at us.
  if (ACCUSATIONS.some((re) => re.test(t))) {
    return { flagged: true, reason: "direct accusation (fraud/scam/fake/cheat)" }
  }

  return { flagged: false, reason: "" }
}

// ---------------------------------------------------------------------------
// History helpers (pure)
// ---------------------------------------------------------------------------

type AnyMessage = { role: string; content?: unknown; parts?: unknown; [k: string]: unknown }

function messageText(m: AnyMessage): string {
  if (typeof m.content === "string" && m.content) return m.content
  if (Array.isArray(m.parts)) {
    return (m.parts as any[])
      .filter((p) => p && p.type === "text" && typeof p.text === "string")
      .map((p) => p.text)
      .join("\n")
  }
  return typeof m.content === "string" ? m.content : ""
}

/**
 * Replace flagged user turns (and the fixed assistant reply that followed
 * them) so a pasted notice never reaches the model. Both `content` and the
 * ai-sdk `parts` array are rewritten, because the SDK prefers `parts`.
 */
export function sanitizeHistory<T extends AnyMessage>(
  messages: T[]
): { messages: T[]; flaggedCount: number } {
  let flaggedCount = 0
  const out = messages.map((m) => {
    if (m.role !== "user") return m
    if (!classifyMessage(messageText(m)).flagged) return m
    flaggedCount++
    return {
      ...m,
      content: REDACTED_USER_TURN,
      ...(Array.isArray(m.parts) ? { parts: [{ type: "text", text: REDACTED_USER_TURN }] } : {}),
    } as T
  })
  return { messages: out, flaggedCount }
}

export function getMessageText(m: AnyMessage): string {
  return messageText(m)
}

/** Mask emails and phone numbers before a transcript leaves the site. */
export function maskPII(text: string): string {
  return String(text ?? "")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, (m) => (m.replace(/\D/g, "").length >= 8 ? "[phone]" : m))
}
