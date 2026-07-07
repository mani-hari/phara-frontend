"use client"

type OrderStatusCardProps = {
  orderId: string
  orderNumber?: string
  status: "pending" | "processing" | "completed" | "shipped" | "delivered" | "cancelled"
  poojaPerformed?: boolean
  carrier?: "indiapost" | "fedex" | null
  trackingId?: string | null
  itemTitles: string[]
  createdAt: string
  estimatedDelivery?: string
  onContactStaff: () => void
}

type TimelineStep = {
  label: string
  done: boolean
  active: boolean
  note?: string
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function buildTimeline(
  status: OrderStatusCardProps["status"],
  poojaPerformed?: boolean,
  trackingId?: string | null,
  estimatedDelivery?: string
): TimelineStep[] {
  const isShipped = status === "shipped" || status === "delivered"
  const isDelivered = status === "delivered"

  return [
    {
      label: "Order Placed",
      done: true,
      active: false,
    },
    {
      label: poojaPerformed ? "Pooja Performed ✓" : "Pooja Scheduled",
      done: !!poojaPerformed,
      active: !poojaPerformed && (status === "processing" || status === "completed"),
      note:
        !poojaPerformed && (status === "pending" || status === "processing")
          ? "Usually performed within 3–5 days"
          : undefined,
    },
    {
      label: isShipped ? "Prasadam Dispatched ✓" : "Prasadam Dispatch",
      done: isShipped,
      active: status === "completed" && !isShipped,
    },
    {
      label: isDelivered ? "Delivered ✓" : "Delivery",
      done: isDelivered,
      active: isShipped && !isDelivered,
      note:
        estimatedDelivery && !isDelivered
          ? `Est. ${formatDate(estimatedDelivery)}`
          : undefined,
    },
  ]
}

function trackingUrl(
  carrier: "indiapost" | "fedex",
  trackingId: string
): string {
  if (carrier === "indiapost") {
    return "https://tracking.indiapost.gov.in/TrackConsignment.aspx"
  }
  return `https://www.fedex.com/fedextrack/?tracknumbers=${encodeURIComponent(trackingId)}`
}

function carrierLabel(carrier: "indiapost" | "fedex"): string {
  return carrier === "indiapost" ? "India Post" : "FedEx"
}

const STATUS_COLOR: Record<OrderStatusCardProps["status"], string> = {
  pending: "var(--gold)",
  processing: "var(--gold)",
  completed: "var(--sage)",
  shipped: "var(--sage)",
  delivered: "var(--sage)",
  cancelled: "var(--sindoor)",
}

const STATUS_LABEL: Record<OrderStatusCardProps["status"], string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export default function OrderStatusCard({
  orderId,
  orderNumber,
  status,
  poojaPerformed,
  carrier,
  trackingId,
  itemTitles,
  createdAt,
  estimatedDelivery,
  onContactStaff,
}: OrderStatusCardProps) {
  const timeline = buildTimeline(status, poojaPerformed, trackingId, estimatedDelivery)
  const isShipped = status === "shipped" || status === "delivered"

  return (
    <div
      style={{
        background: "var(--cream)",
        border: "1px solid var(--ink-line)",
        borderRadius: 12,
        padding: "20px",
        boxShadow: "var(--shadow-sm)",
        maxWidth: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 16,
          paddingBottom: 14,
          borderBottom: "1px solid var(--ink-line)",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3
            style={{
              margin: "0 0 2px",
              fontSize: 16,
              fontWeight: 600,
              fontFamily: "var(--serif)",
              color: "var(--ink)",
            }}
          >
            Order Status
          </h3>
          {orderNumber && (
            <p
              style={{
                margin: 0,
                fontSize: 11.5,
                color: "var(--ink-4)",
                fontFeatureSettings: "'tnum' 1",
              }}
            >
              #{orderNumber}
            </p>
          )}
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "3px 10px",
            borderRadius: 999,
            fontSize: 11.5,
            fontWeight: 600,
            background: `color-mix(in srgb, ${STATUS_COLOR[status]} 15%, transparent)`,
            color: STATUS_COLOR[status],
            border: `1px solid color-mix(in srgb, ${STATUS_COLOR[status]} 30%, transparent)`,
          }}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      {/* Timeline */}
      <div style={{ marginBottom: 16 }}>
        {timeline.map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              marginBottom: i < timeline.length - 1 ? 2 : 0,
            }}
          >
            {/* Dot + line */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 18,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: step.done
                    ? "var(--sage)"
                    : step.active
                    ? "var(--gold)"
                    : "var(--ink-line-2)",
                  border: step.active
                    ? "2px solid var(--gold)"
                    : "2px solid transparent",
                  boxSizing: "border-box",
                  flexShrink: 0,
                  marginTop: 3,
                }}
              />
              {i < timeline.length - 1 && (
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 18,
                    background: step.done ? "var(--sage)" : "var(--ink-line)",
                    margin: "3px 0",
                  }}
                />
              )}
            </div>

            {/* Label + note */}
            <div style={{ paddingBottom: i < timeline.length - 1 ? 14 : 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: step.done || step.active ? 600 : 400,
                  color: step.done
                    ? "var(--sage)"
                    : step.active
                    ? "var(--ink)"
                    : "var(--ink-4)",
                  lineHeight: 1.4,
                }}
              >
                {step.label}
              </p>
              {step.note && (
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 11.5,
                    color: "var(--ink-4)",
                    fontStyle: "italic",
                  }}
                >
                  {step.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Items */}
      {itemTitles.length > 0 && (
        <div
          style={{
            padding: "10px 12px",
            background: "var(--paper)",
            border: "1px solid var(--ink-line)",
            borderRadius: 8,
            marginBottom: 14,
          }}
        >
          <p
            style={{
              margin: "0 0 5px",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--ink-4)",
            }}
          >
            Services booked
          </p>
          {itemTitles.map((title, i) => (
            <p
              key={i}
              style={{
                margin: "0 0 2px",
                fontSize: 12.5,
                color: "var(--ink-2)",
                lineHeight: 1.4,
              }}
            >
              · {title}
            </p>
          ))}
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 11.5,
              color: "var(--ink-4)",
            }}
          >
            Ordered {formatDate(createdAt)}
          </p>
        </div>
      )}

      {/* Tracking */}
      {isShipped && (
        <div
          style={{
            padding: "10px 12px",
            background: "var(--paper)",
            border: "1px solid var(--ink-line)",
            borderRadius: 8,
            marginBottom: 14,
          }}
        >
          {carrier && trackingId ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 2px",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--ink-4)",
                  }}
                >
                  {carrierLabel(carrier)}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "var(--ink-2)",
                    fontFeatureSettings: "'tnum' 1",
                    letterSpacing: "0.03em",
                  }}
                >
                  {trackingId}
                </p>
              </div>
              <a
                href={trackingUrl(carrier, trackingId)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "var(--sindoor)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Track →
              </a>
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                fontSize: 12.5,
                color: "var(--ink-4)",
                fontStyle: "italic",
              }}
            >
              Tracking number will be updated shortly
            </p>
          )}
        </div>
      )}

      {/* Estimated delivery (if set and not delivered) */}
      {estimatedDelivery && status !== "delivered" && (
        <p
          style={{
            margin: "0 0 14px",
            fontSize: 12.5,
            color: "var(--ink-3)",
          }}
        >
          Estimated delivery:{" "}
          <strong>{formatDate(estimatedDelivery)}</strong>
        </p>
      )}

      {/* Pending/processing notice */}
      {(status === "pending" || status === "processing") && !poojaPerformed && (
        <p
          style={{
            margin: "0 0 14px",
            fontSize: 12.5,
            color: "var(--ink-4)",
            fontStyle: "italic",
          }}
        >
          Pooja is usually performed within 3–5 days
        </p>
      )}

      {/* Contact staff */}
      <button
        type="button"
        onClick={() => {
          onContactStaff()
          window.open("https://wa.me/919743244501", "_blank", "noopener,noreferrer")
        }}
        className="ph-btn ph-btn-ghost ph-btn-block"
        style={{ fontSize: 13, fontWeight: 500 }}
      >
        Contact our team →
      </button>
    </div>
  )
}
