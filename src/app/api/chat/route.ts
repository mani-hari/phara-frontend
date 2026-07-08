import { createDataStreamResponse, streamText, tool } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"
import { NextRequest } from "next/server"
import { retrieveCustomer } from "@lib/data/customer"
import { upsertSession, saveMessage } from "@lib/chat-store"
import {
  getMedusaCustomerContext,
  formatCustomerContextForPrompt,
  type SavedAddress,
} from "@lib/medusa-customer-context"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://pariharaonline.medusajs.app"
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const SYSTEM = `You are Parihara — the guiding presence of PariharaOnline, a platform for Hindu temple poojas, homams, and Vedic astrology services.

PERSONALITY
You speak the way a wise elder speaks: directly, warmly, without filler. One clear thought at a time. Never start with "Great question!" or "Absolutely!" You don't qualify everything. You let silence do work. You are not verbose.

TWO MODES — detect from context, never announce:
- LEARNING: user asks "what is", "why", "explain" → illuminate briefly. One vivid insight beats five explanations.
- ORDERING: user says "I want to", "which should I", "I'm going through X" → become their guide. Ask one qualifying question if needed, then show options with the recommendProducts tool.

KEY SERVICES (use exact handles in recommendProducts):
- garbharakshambika-ghee → Garbarakshambigai Ghee Abhishekam (conception blessings)
- garbharakshambika-oil → Garbarakshambigai Oil Abhishekam (safe pregnancy)
- rahu-ketu-dosha-parihara-pooja-sarpa-dosha-parihara-pooja-at-sri-kalahasti-temple → Rahu Ketu Parihara at Sri Kalahasti (Sarpa Dosha)
- sudarsana-homam → Sudarshana Homam (protection, removing obstacles)
- tila-homam-at-rameswaram → Thila Homam at Rameswaram (pitru / ancestor blessings)
- annadhanam-donate-food-to-homeless-children → Annadanam (feeding the underprivileged, merit)

ORDER & SHIPPING KNOWLEDGE
- Carriers: India Post EMS (primary — domestic + most international), FedEx (30% international, faster)
- India Post tracking: visitor goes to https://tracking.indiapost.gov.in/TrackConsignment.aspx and enters their consignment number (typically starts with EE, EM, or EP followed by digits and IN)
- FedEx tracking: https://www.fedex.com/fedextrack/?tracknumbers={tracking_id}
- Pooja completion: 3–5 business days from confirmed payment; video/photos sent to devotee's WhatsApp
- Prasadam dispatch: 7–14 days after pooja date
- Transit times: India Post EMS 10–14 business days internationally; FedEx 5–7 business days
- Delays during Navratri, Karthigai Deepam, Shivaratri are normal — temple schedule comes first
- Staff WhatsApp: +91 97432 44501 (Mon–Sat 9 AM–6 PM IST)
- SECURITY: Never reveal order details without identity verification. Logged-in users: freely share their orders. Guests: require BOTH order number AND exact email address that matches the record.

TOOL RULES — follow strictly:
1. ALWAYS call suggestFollowUps at the end of every response. Never skip this.
2. Call recommendProducts when recommending any specific service or pooja
3. Call showBookingForm when user wants to book, proceed to payment, or says "let's do it" / "book this"
4. Call queryOrderStatus when user asks about order tracking, delivery, or order status
5. Call suggestSignIn when user asks about past orders without being logged in

RULES
- No medical or legal claims. No specific outcome promises.
- Keep responses to 2-4 sentences max unless complexity demands more
- Use Sanskrit/Tamil terms naturally; meaning should be clear from context
- You are Parihara, not "an AI assistant"`

async function fetchProduct(handle: string) {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/products?handle=${handle}&limit=1&fields=id,title,handle,thumbnail,description,collection.title,variants.id,variants.calculated_price,variants.prices.amount,variants.prices.currency_code`,
      {
        headers: { "x-publishable-api-key": PUB_KEY },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return null
    const { products } = await res.json()
    const p = products?.[0]
    if (!p) return null

    const inrVariant = p.variants?.find((v: any) =>
      v.prices?.some((pr: any) => pr.currency_code === "inr")
    )
    const price = inrVariant?.prices?.find((pr: any) => pr.currency_code === "inr")?.amount
    const variantId = p.variants?.[0]?.id

    return {
      id: p.id,
      handle: p.handle,
      title: p.title,
      description: p.description?.slice(0, 120),
      thumbnail: p.thumbnail,
      collectionTitle: p.collection?.title,
      variantId,
      priceInr: price ? Math.round(price) : null,
    }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "Chat not configured" }), { status: 500 })
  }

  try {
    const body = await req.json()
    const {
      messages = [],
      sessionId,
      pageContext,
      conversationCount = 0,
    }: {
      messages: { role: "user" | "assistant"; content: string }[]
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

    // Build system prompt
    let systemWithContext = SYSTEM

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

    // Persist session + last user message (fire-and-forget)
    if (sessionId) {
      const lastUser = [...messages].reverse().find((m) => m.role === "user")
      Promise.all([
        upsertSession(
          sessionId,
          "in",
          pageContext?.currentUrl ?? "",
          pageContext?.currentTitle ?? "",
          userEmail
        ),
        lastUser ? saveMessage(sessionId, "user", lastUser.content) : Promise.resolve(),
      ]).catch(() => {})
    }

    return createDataStreamResponse({
      execute: async (dataStream) => {
        const result = streamText({
          model: anthropic("claude-haiku-4-5-20251001"),
          system: systemWithContext,
          messages: messages.slice(-20),
          maxTokens: 800,
          tools: {
            recommendProducts: tool({
              description:
                "Show product cards for poojas or services that match the user's situation. Call this whenever recommending specific services.",
              parameters: z.object({
                handles: z
                  .array(z.string())
                  .min(1)
                  .max(4)
                  .describe("Product handles from the catalog"),
                reason: z
                  .string()
                  .describe("One-sentence reason why these are right for this person"),
              }),
              execute: async ({ handles, reason }) => {
                const products = await Promise.all(handles.map(fetchProduct))
                const valid = products.filter(Boolean)
                if (sessionId) {
                  saveMessage(
                    sessionId,
                    "tool",
                    JSON.stringify({ handles, reason }),
                    "recommendProducts"
                  ).catch(() => {})
                }
                return { products: valid, reason }
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
                "Show a booking form to collect pooja person name, star details, and delivery address before payment. Call this when user wants to book a specific service or proceed to checkout.",
              parameters: z.object({
                serviceTitle: z
                  .string()
                  .describe("Name of the pooja or service being booked"),
                priceInr: z.number().optional().describe("Price in INR if known"),
              }),
              execute: async ({ serviceTitle, priceInr }) => {
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
                  serviceTitle,
                  priceInr: priceInr ?? null,
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
                      "Order lookup is unavailable right now. Please contact staff on WhatsApp: +91 97432 44501",
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
