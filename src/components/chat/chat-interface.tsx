"use client"

import React, {
  useState,
  useEffect,
  useRef,
  FormEvent,
  useCallback,
  Fragment,
} from "react"
import { useChat, Message } from "ai/react"
import { useParams } from "next/navigation"
import ChatProductCards from "./product-card"
import BookingFormCard, { type BookingFormData } from "./booking-form-card"
import CheckoutSummaryCard, { type ChatCheckoutStatus } from "./checkout-summary-card"
import OrderStatusCard from "./order-status-card"
import { CONTACT, waLink } from "@lib/contact"

type PageContext = {
  currentUrl: string
  currentTitle: string
  visitedPages: { url: string; title: string }[]
  cartItems: { title: string; quantity: number; priceInr: number }[]
}

type BookingVariant = {
  id: string
  title: string
  priceInr: number | null
  priceUsd: number | null
}

/** Result of the showBookingForm tool (src/app/api/chat/route.ts). */
type BookingToolResult = {
  handle?: string
  serviceTitle?: string
  variants?: BookingVariant[]
  selectedVariantId?: string
  priceInr?: number | null
  savedAddresses?: any[]
  isLoggedIn?: boolean
  error?: string
}

type BookingSelection = {
  handle: string
  serviceTitle: string
  variant: BookingVariant
}

type CheckoutState = {
  bookingData: BookingFormData
  selection: BookingSelection
  status: ChatCheckoutStatus
  checkoutUrl?: string
  productUrl?: string
  error?: string
}

type Props = {
  countryCode?: string
  compact?: boolean
  pageContext?: PageContext
  sessionId?: string
  initialMessages?: { id: string; role: "user" | "assistant"; content: string }[]
  onConversationSave?: (messages: Message[]) => void
  conversationCount?: number
  autoSendMessage?: string
}

const SUGGESTED = [
  "Which pooja is best for conceiving a child?",
  "What is Sarpa Dosha and how is it remedied?",
  "How does prasadam delivery work internationally?",
  "What is the difference between a pooja and a homam?",
  "How do I find my nakshatram?",
  "What happens during the Garbarakshambigai Abhishekam?",
]

export default function ChatInterface({
  countryCode: countryCodeProp = "in",
  compact = false,
  pageContext,
  sessionId,
  initialMessages,
  onConversationSave,
  conversationCount = 0,
  autoSendMessage,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isScrolledToBottom = useRef(true)
  const lastSavedMsgIdRef = useRef<string | null>(null)
  const hasAutoSentRef = useRef(false)

  // The storefront region comes from the [countryCode] route segment (the
  // callers pass a hardcoded "in"), so an international visitor's chat cart
  // stays in their USD region.
  const params = useParams()
  const routeCountry = typeof params?.countryCode === "string" ? params.countryCode : ""
  const countryCode = (routeCountry || countryCodeProp || "in").toLowerCase()

  const [checkoutState, setCheckoutState] = useState<CheckoutState | null>(null)
  const checkoutLoading = checkoutState?.status === "loading"

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, setMessages } =
    useChat({
      api: "/api/chat",
      body: { sessionId, pageContext, conversationCount },
      initialMessages: initialMessages as Message[] | undefined,
      onFinish: () => {
        inputRef.current?.focus()
      },
    })

  // Auto-send pre-filled message from URL param (runs once on mount)
  useEffect(() => {
    if (autoSendMessage && !hasAutoSentRef.current) {
      hasAutoSentRef.current = true
      append({ role: "user", content: autoSendMessage })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save conversation after each completed assistant message
  useEffect(() => {
    if (isLoading) return
    const lastMsg = messages[messages.length - 1]
    if (!lastMsg || lastMsg.role !== "assistant") return
    if (lastMsg.id === lastSavedMsgIdRef.current) return
    lastSavedMsgIdRef.current = lastMsg.id
    onConversationSave?.(messages)
  }, [messages, isLoading, onConversationSave])

  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    isScrolledToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60
  }, [])

  useEffect(() => {
    if (!isScrolledToBottom.current) return
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const sendSuggested = (text: string) => {
    append({ role: "user", content: text })
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    handleSubmit(e)
  }

  // Add the booking to the shared storefront cart, then offer the storefront
  // checkout (Razorpay / PayPal live there). Every outcome is visible.
  const handleBookingSubmit = async (
    formData: BookingFormData,
    selection: BookingSelection
  ) => {
    setCheckoutState({ bookingData: formData, selection, status: "loading" })
    try {
      const res = await fetch("/api/chat/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: selection.handle,
          variantId: selection.variant.id,
          countryCode,
          bookingDetails: {
            poojaPersonName: formData.poojaPersonName,
            nakshatra: formData.nakshatra,
            gothram: formData.gothram,
          },
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.checkoutUrl) {
        setCheckoutState({
          bookingData: formData,
          selection,
          status: "error",
          error: data?.error,
          productUrl: data?.productUrl,
        })
        return
      }
      window.dispatchEvent(new Event("cart:updated"))
      setCheckoutState({
        bookingData: formData,
        selection,
        status: "ready",
        checkoutUrl: data.checkoutUrl,
        productUrl: data.productUrl,
      })
    } catch {
      setCheckoutState({
        bookingData: formData,
        selection,
        status: "error",
        error: "We couldn't reach our server.",
      })
    }
  }

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--paper)",
        overflow: "hidden",
      }}
    >
      {/* ── Messages ─────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: compact ? "16px 14px" : "24px 0",
          minHeight: 0,
        }}
      >
        <div
          style={{
            maxWidth: compact ? "100%" : 760,
            margin: "0 auto",
            padding: compact ? 0 : "0 24px",
          }}
        >
          {messages.length === 0 ? (
            <EmptyState compact={compact} onSuggest={sendSuggested} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {messages.map((m, i) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  isLoading={isLoading}
                  isLastMessage={i === messages.length - 1}
                  countryCode={countryCode}
                  onSuggestionClick={sendSuggested}
                  onBookingSubmit={handleBookingSubmit}
                  checkoutLoading={checkoutLoading}
                  onAddedToCart={(product) =>
                    append({
                      role: "user",
                      content: `I've added ${product.title} to my cart. What should I do next?`,
                    })
                  }
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <ThinkingBubble />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Input bar ─────────────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid var(--ink-line)",
          background: "var(--paper)",
          padding: compact ? "10px 14px" : "14px 0",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            maxWidth: compact ? "100%" : 760,
            margin: "0 auto",
            padding: compact ? 0 : "0 24px",
          }}
        >
          <form onSubmit={onSubmit} style={{ display: "flex", gap: 8 }}>
            <input
              ref={inputRef}
              className="ph-input"
              style={{ flex: 1, fontSize: compact ? 14 : 15 }}
              placeholder="Ask about poojas, doshas, remedies…"
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              autoFocus={!compact}
            />
            <button
              type="submit"
              className="ph-btn ph-btn-sindoor"
              disabled={!input.trim() || isLoading}
              style={{ padding: "8px 18px", fontSize: 14, flexShrink: 0 }}
            >
              {isLoading ? <Spinner /> : "Send"}
            </button>
          </form>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8,
              alignItems: "center",
            }}
          >
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setMessages([])
                  lastSavedMsgIdRef.current = null
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  color: "var(--ink-4)",
                  textDecoration: "underline",
                }}
              >
                New chat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Checkout overlay ──────────────────────────────────── */}
      {checkoutState && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--paper)",
            zIndex: 20,
            overflowY: "auto",
            padding: compact ? "16px 14px" : "24px",
          }}
        >
          <button
            type="button"
            onClick={() => setCheckoutState(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--ink-4)",
              fontSize: 13,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            ← Back to chat
          </button>
          <CheckoutSummaryCard
            serviceTitle={checkoutState.selection.serviceTitle}
            variantTitle={checkoutState.selection.variant.title}
            price={
              countryCode === "in"
                ? checkoutState.selection.variant.priceInr
                : checkoutState.selection.variant.priceUsd
            }
            currency={countryCode === "in" ? "INR" : "USD"}
            bookingDetails={{
              poojaPersonName: checkoutState.bookingData.poojaPersonName,
              nakshatra: checkoutState.bookingData.nakshatra,
              gothram: checkoutState.bookingData.gothram,
            }}
            status={checkoutState.status}
            checkoutUrl={checkoutState.checkoutUrl}
            productUrl={
              checkoutState.productUrl ??
              `${countryCode === "in" ? "" : `/${countryCode}`}/products/${checkoutState.selection.handle}`
            }
            error={checkoutState.error}
            onRetry={() =>
              handleBookingSubmit(checkoutState.bookingData, checkoutState.selection)
            }
            onSaveLater={() => {
              setCheckoutState(null)
              append({
                role: "user",
                content: "I'll complete the payment a little later.",
              })
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        .chat-msg-in { animation: fadeIn 0.2s ease; }
      `}</style>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Spinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 14,
        height: 14,
        border: "2px solid rgba(255,255,255,0.4)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
  )
}

function EmptyState({
  compact,
  onSuggest,
}: {
  compact: boolean
  onSuggest: (q: string) => void
}) {
  return (
    <div>
      <p
        style={{
          color: "var(--ink-3)",
          marginBottom: 20,
          fontFamily: "var(--serif)",
          fontSize: compact ? 14 : 16,
          lineHeight: 1.7,
        }}
      >
        I can guide you to the right pooja or homam, explain Vedic concepts, or help you
        understand what remedy fits your situation.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact ? "1fr" : "repeat(auto-fill, minmax(210px, 1fr))",
          gap: 8,
        }}
      >
        {SUGGESTED.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onSuggest(q)}
            style={{
              background: "var(--paper)",
              border: "1px solid var(--ink-line)",
              borderRadius: 10,
              padding: compact ? "10px 12px" : "11px 14px",
              textAlign: "left",
              cursor: "pointer",
              fontSize: 13,
              color: "var(--ink-3)",
              lineHeight: 1.4,
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.borderColor = "var(--sindoor)"
              el.style.color = "var(--ink)"
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.borderColor = "var(--ink-line)"
              el.style.color = "var(--ink-3)"
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

function MessageBubble({
  message: m,
  isLoading,
  isLastMessage,
  countryCode,
  onSuggestionClick,
  onBookingSubmit,
  checkoutLoading,
  onAddedToCart,
}: {
  message: Message
  isLoading: boolean
  isLastMessage: boolean
  countryCode: string
  onSuggestionClick: (s: string) => void
  onBookingSubmit: (data: BookingFormData, selection: BookingSelection) => void
  checkoutLoading: boolean
  onAddedToCart: (product: { title: string; handle: string; priceInr: number | null }) => void
}) {
  const isUser = m.role === "user"

  const productParts = m.toolInvocations?.filter(
    (t) => t.toolName === "recommendProducts" && t.state === "result"
  )
  const followUpParts = m.toolInvocations?.filter(
    (t) => t.toolName === "suggestFollowUps" && t.state === "result"
  )
  const bookingFormParts = m.toolInvocations?.filter(
    (t) => t.toolName === "showBookingForm" && t.state === "result"
  )
  const orderStatusParts = m.toolInvocations?.filter(
    (t) => t.toolName === "queryOrderStatus" && t.state === "result"
  )
  const signInParts = m.toolInvocations?.filter(
    (t) => t.toolName === "suggestSignIn" && t.state === "result"
  )

  return (
    <div
      className="chat-msg-in"
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        gap: 8,
        alignItems: "flex-start",
      }}
    >
      {!isUser && (
        <div
          aria-hidden
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "var(--sindoor)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            color: "#fff",
            fontWeight: 700,
            flexShrink: 0,
            marginTop: 3,
          }}
        >
          ✦
        </div>
      )}

      <div
        style={{
          maxWidth: isUser ? "82%" : "90%",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: isUser ? undefined : "100%",
        }}
      >
        {m.content && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
              background: isUser ? "var(--sindoor)" : "var(--paper)",
              border: isUser ? "none" : "1px solid var(--ink-line)",
              color: isUser ? "#fff" : "var(--ink)",
              fontSize: 14,
              lineHeight: 1.65,
              alignSelf: isUser ? "flex-end" : undefined,
            }}
          >
            {isUser ? m.content : <SimpleMarkdown text={m.content} />}
          </div>
        )}

        {/* Product recommendation cards */}
        {productParts?.map((t, i) =>
          t.state === "result" ? (
            <ChatProductCards
              key={i}
              products={t.result.products}
              reason={t.result.reason}
              countryCode={countryCode}
              onAddedToCart={onAddedToCart}
            />
          ) : null
        )}

        {/* Booking form card */}
        {bookingFormParts?.map((t, i) =>
          t.state === "result" ? (
            <BookingToolCard
              key={i}
              result={t.result as BookingToolResult}
              countryCode={countryCode}
              checkoutLoading={checkoutLoading}
              onBookingSubmit={onBookingSubmit}
            />
          ) : null
        )}

        {/* Order status card */}
        {orderStatusParts?.map((t, i) =>
          t.state === "result" ? (
            <OrderStatusResult key={i} result={t.result} />
          ) : null
        )}

        {/* Sign-in nudge */}
        {signInParts?.map((t, i) =>
          t.state === "result" && !t.result.isLoggedIn ? (
            <div
              key={i}
              style={{
                padding: "12px 16px",
                background: "rgba(182,68,46,0.04)",
                border: "1px solid rgba(182,68,46,0.15)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", flex: 1 }}>
                {t.result.reason}
              </p>
              <a
                href="/account/signin"
                className="ph-btn ph-btn-ghost"
                style={{ fontSize: 13, padding: "6px 14px", textDecoration: "none", flexShrink: 0 }}
              >
                Sign in →
              </a>
            </div>
          ) : null
        )}

        {/* Follow-up suggestion chips — last assistant message only */}
        {!isUser && isLastMessage && !isLoading && (followUpParts?.length ?? 0) > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {followUpParts?.map((t) =>
              t.state === "result"
                ? t.result.suggestions.map((s: string, j: number) => (
                    <FollowUpButton key={j} text={s} onClick={() => onSuggestionClick(s)} />
                  ))
                : null
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function BookingToolCard({
  result,
  countryCode,
  checkoutLoading,
  onBookingSubmit,
}: {
  result: BookingToolResult
  countryCode: string
  checkoutLoading: boolean
  onBookingSubmit: (data: BookingFormData, selection: BookingSelection) => void
}) {
  const variants = result.variants ?? []
  const [variantId, setVariantId] = useState<string>(
    result.selectedVariantId ?? variants[0]?.id ?? ""
  )
  const variant = variants.find((v) => v.id === variantId) ?? variants[0]
  const isIndia = countryCode === "in"
  const price = variant ? (isIndia ? variant.priceInr : variant.priceUsd) : null

  // Error from the tool, or a booking card saved in an older conversation
  // (before handles were passed): explain instead of rendering a dead form.
  if (result.error || !result.handle || !variant) {
    return (
      <div
        role="alert"
        style={{
          padding: "12px 16px",
          border: "1px solid var(--ink-line)",
          borderRadius: 10,
          fontSize: 13.5,
          color: "var(--ink-3)",
          lineHeight: 1.55,
        }}
      >
        {result.error ||
          "This booking card has expired. Ask me to book again, or open the product page."}{" "}
        <a
          href={waLink(`Hi, I'd like to book ${result.serviceTitle ?? "a pooja"}.`)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--sindoor)", textDecoration: "underline" }}
        >
          WhatsApp {CONTACT.whatsappDisplay}
        </a>
      </div>
    )
  }

  return (
    <div className="ph-card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--ink-line)",
          background: "rgba(182,68,46,0.04)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--serif)",
            fontSize: 15,
            fontWeight: 500,
            color: "var(--ink)",
          }}
        >
          Book: {result.serviceTitle}
        </p>
        {price != null && (
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--ink-3)" }}>
            {isIndia ? `₹${price.toLocaleString("en-IN")}` : `$${price.toLocaleString("en-US")}`}
          </p>
        )}
        {variants.length > 1 && (
          <label style={{ display: "block", marginTop: 8, fontSize: 12, color: "var(--ink-3)" }}>
            Option
            <select
              className="ph-input"
              value={variant.id}
              onChange={(e) => setVariantId(e.target.value)}
              style={{ display: "block", width: "100%", marginTop: 4, fontSize: 13 }}
            >
              {variants.map((v) => {
                const p = isIndia ? v.priceInr : v.priceUsd
                return (
                  <option key={v.id} value={v.id}>
                    {v.title}
                    {p != null ? ` (${isIndia ? "₹" : "$"}${p.toLocaleString(isIndia ? "en-IN" : "en-US")})` : ""}
                  </option>
                )
              })}
            </select>
          </label>
        )}
      </div>
      <div style={{ padding: "16px" }}>
        <BookingFormCard
          cartItems={[{ title: result.serviceTitle ?? "", priceInr: variant.priceInr, quantity: 1 }]}
          savedAddresses={result.savedAddresses}
          isLoggedIn={result.isLoggedIn}
          collectAddress={false}
          submitting={checkoutLoading}
          submitLabel="Add to cart & continue →"
          onSubmit={(data) =>
            onBookingSubmit(data, {
              handle: result.handle as string,
              serviceTitle: result.serviceTitle ?? "",
              variant,
            })
          }
          onSignInRequest={() => {
            window.location.href = "/account/signin"
          }}
        />
      </div>
    </div>
  )
}

function FollowUpButton({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 13px",
        background: "rgba(139, 90, 43, 0.09)",
        border: "1px solid rgba(139, 90, 43, 0.2)",
        borderRadius: 999,
        cursor: "pointer",
        fontSize: 13,
        color: "var(--ink-2)",
        transition: "background 0.15s, border-color 0.15s",
        fontFamily: "var(--sans)",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(139, 90, 43, 0.16)"
        e.currentTarget.style.borderColor = "rgba(139, 90, 43, 0.35)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(139, 90, 43, 0.09)"
        e.currentTarget.style.borderColor = "rgba(139, 90, 43, 0.2)"
      }}
    >
      {text}
    </button>
  )
}

function OrderStatusResult({ result }: { result: any }) {
  if (result.error) {
    return (
      <div
        style={{
          padding: "12px 16px",
          border: "1px solid var(--ink-line)",
          borderRadius: 10,
          fontSize: 14,
          color: "var(--ink-3)",
        }}
      >
        {result.error}
      </div>
    )
  }

  if (result.requireVerification) {
    return (
      <div
        style={{
          padding: "12px 16px",
          border: "1px solid var(--ink-line)",
          borderRadius: 10,
          fontSize: 14,
          color: "var(--ink-3)",
        }}
      >
        Please provide your order number and the email address used when placing your order.
      </div>
    )
  }

  if (result.authFailed) {
    return (
      <div
        style={{
          padding: "12px 16px",
          border: "1px solid var(--ink-line)",
          borderRadius: 10,
          fontSize: 14,
          color: "var(--ink-3)",
        }}
      >
        The order number and email don&apos;t match our records. Please check and try again, or contact
        staff on WhatsApp: +91-97432 44501
      </div>
    )
  }

  if (result.notFound) {
    return (
      <div
        style={{
          padding: "12px 16px",
          border: "1px solid var(--ink-line)",
          borderRadius: 10,
          fontSize: 14,
          color: "var(--ink-3)",
        }}
      >
        Order not found. Please double-check your order number or contact staff on WhatsApp.
      </div>
    )
  }

  // Map Medusa status to OrderStatusCard's expected values
  const statusMap: Record<string, "pending" | "processing" | "completed" | "shipped" | "delivered" | "cancelled"> = {
    pending: "pending",
    payment_pending: "pending",
    processing: "processing",
    complete: "completed",
    completed: "completed",
    shipped: "shipped",
    delivered: "delivered",
    canceled: "cancelled",
    cancelled: "cancelled",
    requires_action: "pending",
  }
  const mappedStatus = statusMap[result.status] ?? "processing"

  return (
    <OrderStatusCard
      orderId={result.orderId}
      orderNumber={result.orderNumber}
      status={mappedStatus}
      poojaPerformed={result.poojaPerformed}
      carrier={result.carrier}
      trackingId={result.trackingId}
      itemTitles={result.itemTitles ?? []}
      createdAt={result.createdAt}
      onContactStaff={() => window.open("https://wa.me/919743244501", "_blank")}
    />
  )
}

function ThinkingBubble() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "var(--sindoor)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          color: "#fff",
          fontWeight: 700,
          flexShrink: 0,
          marginTop: 3,
        }}
      >
        ✦
      </div>
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "4px 18px 18px 18px",
          border: "1px solid var(--ink-line)",
          background: "var(--paper)",
          display: "flex",
          gap: 5,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--sindoor)",
              opacity: 0.5,
              display: "inline-block",
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
        <style>{`
          @keyframes pulse {
            0%,100% { opacity:0.3; transform:scale(0.8); }
            50% { opacity:1; transform:scale(1.1); }
          }
        `}</style>
      </div>
    </div>
  )
}

function SimpleMarkdown({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/)
  return (
    <Fragment>
      {paragraphs.map((para, pi) => {
        const lines = para.split(/\n/)
        return (
          <p key={pi} style={{ margin: pi === 0 ? 0 : "8px 0 0" }}>
            {lines.map((line, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {renderInline(line)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </Fragment>
  )
}

function renderInline(text: string): React.ReactNode[] {
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\))/g
  const nodes: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    if (match[0].startsWith("**")) {
      nodes.push(<strong key={match.index}>{match[2]}</strong>)
    } else if (match[0].startsWith("*")) {
      nodes.push(<em key={match.index}>{match[3]}</em>)
    } else {
      nodes.push(
        <a
          key={match.index}
          href={match[5]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--sindoor)", textDecoration: "underline" }}
        >
          {match[4]}
        </a>
      )
    }
    last = match.index + match[0].length
  }

  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}
