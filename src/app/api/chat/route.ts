import { createDataStreamResponse, formatDataStreamPart, streamText, tool } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"
import { NextRequest } from "next/server"
import { retrieveCustomer } from "@lib/data/customer"
import {
  upsertSession,
  saveMessage,
  updateSessionTitle,
  getGuardState,
  recordGuardFlag,
  getRecentMessages,
} from "@lib/chat-store"
import { generateSessionTitle } from "@lib/chat-title"
import {
  getMedusaCustomerContext,
  formatCustomerContextForPrompt,
  type SavedAddress,
} from "@lib/medusa-customer-context"
import {
  classifyMessage,
  sanitizeHistory,
  getMessageText,
  STANDARD_REPLY,
  ESCALATION_REPLY,
} from "@lib/chat/guardrail"
import { sendChatIncident, type IncidentStage } from "@lib/chat/incident"
import {
  getCatalog,
  findProduct,
  pickVariant,
  formatCatalogForPrompt,
  type CatalogProduct,
} from "@lib/chat/catalog"
import { buildSystemPrompt } from "@lib/chat/system-prompt"
import { CONTACT } from "@lib/contact"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://pariharaonline.medusajs.app"

type IncomingMessage = {
  role: "user" | "assistant"
  content: string
  parts?: unknown[]
  [k: string]: unknown
}

/** Product shape the chat product cards render (src/components/chat/product-card.tsx). */
function toCard(p: CatalogProduct) {
  const v = p.variants[0]
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: (p.subtitle || p.description || "").slice(0, 120),
    thumbnail: p.thumbnail ?? undefined,
    collectionTitle: p.collection ?? undefined,
    variantId: v.id,
    variantTitle: v.title,
    priceInr: v.priceInr,
    priceUsd: v.priceUsd,
    hasOptions: p.variants.length > 1,
  }
}

/**
 * Stream a fixed reply in the same data-stream format useChat expects from
 * streamText, without calling the model.
 */
function fixedReplyResponse(reply: string, after: () => Promise<void>) {
  return createDataStreamResponse({
    execute: async (dataStream) => {
      const usage = { promptTokens: 0, completionTokens: 0 }
      dataStream.write(formatDataStreamPart("start_step", { messageId: `guard-${Date.now()}` }))
      dataStream.write(formatDataStreamPart("text", reply))
      dataStream.write(
        formatDataStreamPart("finish_step", { finishReason: "stop", usage, isContinued: false })
      )
      dataStream.write(formatDataStreamPart("finish_message", { finishReason: "stop", usage }))
      // Persistence + incident alert run before the stream closes (a dangling
      // promise can be frozen on serverless), after the reply is already sent.
      try {
        await after()
      } catch (err) {
        console.warn("[chat guard] post-reply work failed:", err)
      }
    },
    onError: (err) => {
      console.error("[chat guard stream]", err)
      return String(err)
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      messages = [],
      sessionId,
      pageContext,
      conversationCount = 0,
    }: {
      messages: IncomingMessage[]
      sessionId?: string
      pageContext?: {
        currentUrl: string
        currentTitle: string
        visitedPages: { url: string; title: string }[]
        cartItems: { title: string; quantity: number; priceInr: number }[]
      }
      conversationCount?: number
    } = body

    // Authenticated user (if any) — identity comes from the Medusa customer
    // session (httpOnly cookie), keyed by email.
    const customer = await retrieveCustomer().catch(() => null)
    const userEmail = customer?.email?.toLowerCase() ?? null

    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    const lastUserText = lastUser ? getMessageText(lastUser) : ""

    // ── Layer 1: deterministic temple-legitimacy guardrail ──────────────────
    // Runs BEFORE the model. A locked session or a flagged message gets a
    // fixed, owner-approved reply; the model is never called.
    const guard = lastUser ? classifyMessage(lastUserText) : { flagged: false, reason: "" }
    const priorFlags = sanitizeHistory(messages.slice(0, -1)).flaggedCount
    const dbState = sessionId ? await getGuardState(sessionId) : null
    // No DB (or no session id): fall back to the flagged turns in the history.
    const alreadyLocked = dbState ? !!dbState.lockedAt : priorFlags >= 2

    if (lastUser && (alreadyLocked || guard.flagged)) {
      let reply = ESCALATION_REPLY
      let incidentStage: IncidentStage | null = null
      let reason = guard.reason || "session locked"

      if (!alreadyLocked) {
        const state = sessionId
          ? await recordGuardFlag(
              sessionId,
              guard.reason,
              pageContext?.currentUrl ?? "",
              pageContext?.currentTitle ?? "",
              userEmail
            )
          : null
        const flags = state?.flags ?? priorFlags + 1
        if (flags <= 1) {
          reply = STANDARD_REPLY
          incidentStage = "flagged"
        } else if (flags === 2 || !state) {
          incidentStage = "locked"
        }
      } else {
        reason = `locked session: ${guard.flagged ? guard.reason : "follow-up message"}`
      }

      console.warn(
        `[chat guard] session=${(sessionId || "-").slice(0, 8)} stage=${incidentStage ?? "locked-followup"} reason=${reason}`
      )

      return fixedReplyResponse(reply, async () => {
        if (sessionId) {
          await upsertSession(
            sessionId,
            "in",
            pageContext?.currentUrl ?? "",
            pageContext?.currentTitle ?? "",
            userEmail
          )
          await saveMessage(sessionId, "user", lastUserText)
          await saveMessage(sessionId, "assistant", reply)
        }
        if (incidentStage) {
          const transcript = sessionId ? await getRecentMessages(sessionId, 12) : []
          await sendChatIncident({
            sessionId: sessionId || `nosession-${Date.now()}`,
            reason,
            stage: incidentStage,
            pageUrl: pageContext?.currentUrl,
            transcript: transcript.length
              ? transcript
              : [
                  ...messages.slice(-11).map((m) => ({ role: m.role, content: getMessageText(m) })),
                  { role: "assistant", content: reply },
                ],
            customerEmail: userEmail,
          })
        }
      })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "Chat not configured" }), { status: 500 })
    }

    // Earlier flagged turns never reach the model.
    const modelMessages = sanitizeHistory(messages.slice(-20)).messages

    // Build system prompt (base + legitimacy protocol + live catalog)
    const catalog = await getCatalog()
    let systemWithContext = buildSystemPrompt(formatCatalogForPrompt(catalog))

    // Page context injection
    if (pageContext) {
      const lines: string[] = ["\n\nCURRENT CONTEXT (use naturally, don't recite it)"]
      lines.push(`Page: ${pageContext.currentTitle} (${pageContext.currentUrl})`)
      if (pageContext.cartItems?.length) {
        lines.push(
          `Cart: ${pageContext.cartItems.map((i) => `${i.title} x${i.quantity}`).join(", ")}`
        )
      }
      if (pageContext.visitedPages?.length > 1) {
        lines.push(
          `Also browsed: ${pageContext.visitedPages
            .slice(-4)
            .map((p) => p.title || p.url)
            .join(", ")}`
        )
      }
      systemWithContext += lines.join("\n")
    }

    // Customer context injection (logged-in users)
    if (userEmail) {
      try {
        const ctx = await getMedusaCustomerContext(userEmail)
        if (ctx) systemWithContext += "\n\n" + formatCustomerContextForPrompt(ctx)
      } catch {
        // Non-fatal
      }
    }

    // Hint for recurring guests
    if (!userEmail && conversationCount >= 3) {
      systemWithContext +=
        "\n\nNOTE: This visitor has had 3+ conversations without signing in. When relevant, naturally suggest they sign in using suggestSignIn."
    }

    // Persist session + last user message (fire-and-forget relative to the
    // streaming response below — but the two DB writes themselves are
    // sequenced: saveMessage(user) must wait for upsertSession's INSERT to
    // land first, otherwise the chat_messages.session_id FK race can drop the
    // very first user message when it commits before the session row exists,
    // silently swallowed by saveMessage's own try/catch. That leaves the
    // assistant's reply as the first surviving row for the session.
    // "First exchange" = no assistant messages yet in the incoming history —
    // used below (after streaming) to decide whether to auto-title the session.
    const isFirstExchange = !messages.some((m) => m.role === "assistant")
    if (sessionId) {
      upsertSession(
        sessionId,
        "in",
        pageContext?.currentUrl ?? "",
        pageContext?.currentTitle ?? "",
        userEmail
      )
        .then(() => (lastUser ? saveMessage(sessionId, "user", lastUserText) : null))
        .catch(() => {})
    }

    return createDataStreamResponse({
      execute: async (dataStream) => {
        const result = streamText({
          model: anthropic("claude-haiku-4-5-20251001"),
          system: systemWithContext,
          messages: modelMessages as any,
          maxTokens: 800,
          tools: {
            recommendProducts: tool({
              description:
                "Show product cards for poojas, homams, prasadam or services that match the user's situation. Call this whenever recommending specific products. Use exact handles from PRODUCT CATALOG.",
              parameters: z.object({
                handles: z
                  .array(z.string())
                  .min(1)
                  .max(4)
                  .describe("Product handles exactly as listed in PRODUCT CATALOG"),
                reason: z
                  .string()
                  .describe("One-sentence reason why these are right for this person"),
              }),
              execute: async ({ handles, reason }) => {
                const found = handles
                  .map((h) => findProduct(catalog, h))
                  .filter((p): p is CatalogProduct => !!p)
                const unique = found.filter(
                  (p, i) => found.findIndex((q) => q.handle === p.handle) === i
                )
                const unknown = handles.filter((h) => !findProduct(catalog, h))
                if (sessionId) {
                  saveMessage(
                    sessionId,
                    "tool",
                    JSON.stringify({ handles, reason }),
                    "recommendProducts"
                  ).catch(() => {})
                }
                return {
                  products: unique.map(toCard),
                  reason,
                  ...(unknown.length
                    ? {
                        unknownHandles: unknown,
                        note: "These handles are not in the catalog. Do not mention them as products.",
                      }
                    : {}),
                }
              },
            }),

            suggestFollowUps: tool({
              description:
                "ALWAYS call this at the end of every response. Predict the 2-3 most likely short phrases the USER would naturally say next — written in the user's voice, not yours. If you asked a question, suggest their likely answers (e.g. 'Yes, book it', 'Not yet, tell me more'). If you described a service, suggest what they'd ask next (e.g. 'What is included', 'How long does it take', 'Book for my mother'). Keep each suggestion under 6 words.",
              parameters: z.object({
                suggestions: z
                  .array(z.string())
                  .min(2)
                  .max(3)
                  .describe(
                    "2-3 user-voice response phrases — what the user would naturally say next, not questions back to them"
                  ),
              }),
              execute: async ({ suggestions }) => ({ suggestions }),
            }),

            showBookingForm: tool({
              description:
                "Show a booking card for one catalog product: collects who the pooja is for (name, nakshatra, gothram), adds it to the customer's cart and takes them to our secure checkout to pay. Call this when the user wants to book a specific product or proceed to payment.",
              parameters: z.object({
                handle: z.string().describe("Exact product handle from PRODUCT CATALOG"),
                variantTitle: z
                  .string()
                  .optional()
                  .describe("Variant/option title from the catalog if the product has several"),
              }),
              execute: async ({ handle, variantTitle }) => {
                const product = findProduct(catalog, handle)
                if (!product) {
                  return {
                    error: `I couldn't find that service to book here. Our team can help on WhatsApp at ${CONTACT.whatsappDisplay}.`,
                  }
                }
                const selected = pickVariant(product, variantTitle)
                let savedAddresses: SavedAddress[] = []
                if (userEmail) {
                  try {
                    const ctx = await getMedusaCustomerContext(userEmail)
                    savedAddresses = ctx?.savedAddresses ?? []
                  } catch {
                    // Non-fatal
                  }
                }
                return {
                  handle: product.handle,
                  serviceTitle: product.title,
                  variants: product.variants,
                  selectedVariantId: selected.id,
                  priceInr: selected.priceInr,
                  priceUsd: selected.priceUsd,
                  savedAddresses,
                  isLoggedIn: !!userEmail,
                }
              },
            }),

            queryOrderStatus: tool({
              description:
                "Look up an order's status and tracking info. Call this when the user asks about their order, delivery, or tracking number.",
              parameters: z.object({
                orderNumber: z
                  .string()
                  .describe("Order display ID or number, e.g. '1234' or 'PH-1234'"),
                email: z
                  .string()
                  .optional()
                  .describe(
                    "Customer email — required for guests, omit for logged-in users"
                  ),
              }),
              execute: async ({ orderNumber, email }) => {
                const adminJwt = process.env.MEDUSA_ADMIN_JWT
                if (!adminJwt) {
                  return {
                    error:
                      "Order lookup is unavailable right now. Please contact staff on WhatsApp: +91-97432 44501",
                  }
                }

                const verifyEmail = userEmail || email?.toLowerCase()
                if (!verifyEmail) {
                  return { requireVerification: true }
                }

                const displayId = orderNumber.replace(/\D/g, "")
                if (!displayId) {
                  return { error: "Please provide a valid order number." }
                }

                try {
                  const res = await fetch(
                    `${BACKEND_URL}/admin/orders?display_id=${displayId}&limit=1&expand=items,fulfillments,shipping_address`,
                    {
                      headers: {
                        Authorization: `Bearer ${adminJwt}`,
                        "Content-Type": "application/json",
                      },
                    }
                  )
                  if (!res.ok) return { notFound: true }
                  const data = await res.json()
                  const order = data?.orders?.[0]
                  if (!order) return { notFound: true }

                  if (order.email?.toLowerCase() !== verifyEmail) {
                    return { authFailed: true }
                  }

                  const fulfillment = order.fulfillments?.[0]
                  const trackingNumber = fulfillment?.tracking_numbers?.[0] ?? null
                  const isIndiaPost = trackingNumber
                    ? /^(EE|EM|EP)/i.test(String(trackingNumber))
                    : false

                  return {
                    orderId: order.id as string,
                    orderNumber: String(order.display_id),
                    status: order.status as string,
                    itemTitles: ((order.items ?? []) as any[]).map((i) => i.title as string),
                    carrier: trackingNumber
                      ? isIndiaPost
                        ? "indiapost"
                        : "fedex"
                      : null,
                    trackingId: trackingNumber ? String(trackingNumber) : null,
                    createdAt: order.created_at as string,
                    poojaPerformed: ["shipped", "delivered", "complete"].includes(
                      order.status as string
                    ),
                  }
                } catch {
                  return {
                    error:
                      "Failed to retrieve your order. Please try again or contact staff on WhatsApp.",
                  }
                }
              },
            }),

            suggestSignIn: tool({
              description:
                "Show an inline sign-in prompt. Call this when the user asks about past orders without being logged in, or when they'd benefit from logging in.",
              parameters: z.object({
                reason: z
                  .string()
                  .describe("One sentence explaining why signing in helps them right now"),
              }),
              execute: async ({ reason }) => ({ reason, isLoggedIn: !!userEmail }),
            }),
          },
          onFinish: ({ text }) => {
            if (sessionId && text) {
              saveMessage(sessionId, "assistant", text).catch(() => {})

              // Auto-title on the first exchange only (fire-and-forget, never
              // blocks/fails the chat response).
              if (isFirstExchange && lastUser) {
                generateSessionTitle([
                  { role: "user", content: lastUserText },
                  { role: "assistant", content: text },
                ])
                  .then((title) => updateSessionTitle(sessionId, title))
                  .catch(() => {})
              }
            }
          },
        })
        result.mergeIntoDataStream(dataStream)
      },
      onError: (err) => {
        console.error("[chat stream]", err)
        return String(err)
      },
    })
  } catch (err: any) {
    console.error("[/api/chat]", err)
    return new Response(JSON.stringify({ error: err.message || "Chat failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
