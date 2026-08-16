"use client"

type QuantitySelectorProps = {
  quantity: number
  onChange: (quantity: number) => void
  min?: number
  max?: number
  disabled?: boolean
  "data-testid"?: string
}

// Shared +/- stepper — visual pattern mirrors the cart line-item stepper
// (src/modules/cart/templates/items-v3.tsx) so quantity controls look the
// same everywhere on the site. Never allows going below `min` (default 1).
export default function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max,
  disabled = false,
  "data-testid": dataTestId,
}: QuantitySelectorProps) {
  const canDecrement = !disabled && quantity > min
  const canIncrement = !disabled && (max === undefined || quantity < max)

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid var(--ink-line)",
        borderRadius: 8,
        overflow: "hidden",
        width: "fit-content",
      }}
      data-testid={dataTestId}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => canDecrement && onChange(quantity - 1)}
        disabled={!canDecrement}
        style={{
          width: 36,
          height: 36,
          background: "none",
          border: "none",
          cursor: canDecrement ? "pointer" : "default",
          color: canDecrement ? "var(--ink-3)" : "var(--ink-line-2)",
          fontSize: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        −
      </button>
      <span
        className="ph-num"
        style={{
          minWidth: 32,
          textAlign: "center",
          fontSize: 15,
          fontWeight: 600,
          color: "var(--ink)",
        }}
        data-testid="quantity-value"
      >
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => canIncrement && onChange(quantity + 1)}
        disabled={!canIncrement}
        style={{
          width: 36,
          height: 36,
          background: "none",
          border: "none",
          cursor: canIncrement ? "pointer" : "default",
          color: canIncrement ? "var(--ink-3)" : "var(--ink-line-2)",
          fontSize: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        +
      </button>
    </div>
  )
}
