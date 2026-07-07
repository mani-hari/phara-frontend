"use client"

import { useState } from "react"
import Image from "next/image"
import { localizeHref } from "@lib/util/localize-href"

type Product = {
  id: string
  handle: string
  title: string
  description?: string
  thumbnail?: string
  collectionTitle?: string
  variantId?: string
  priceInr?: number | null
}

type ChatProductCardsProps = {
  products: Product[]
  reason?: string
  countryCode?: string
  onAddedToCart?: (product: {
    title: string
    handle: string
    priceInr: number | null
  }) => void
}

export default function ChatProductCards({
  products,
  reason,
  countryCode = "in",
  onAddedToCart,
}: ChatProductCardsProps) {
  if (!products?.length) return null

  return (
    <div style={{ marginTop: 4 }}>
      {reason && (
        <p
          style={{
            fontSize: 12,
            color: "var(--ink-4)",
            marginBottom: 10,
            fontFamily: "var(--serif)",
          }}
        >
          {reason}
        </p>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            products.length === 1 ? "1fr" : "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 10,
        }}
      >
        {products.map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            countryCode={countryCode}
            isMostRelevant={i === 0 && products.length > 1}
            onAddedToCart={onAddedToCart}
          />
        ))}
      </div>
    </div>
  )
}

type ProductCardProps = {
  product: Product
  countryCode: string
  isMostRelevant?: boolean
  onAddedToCart?: (product: {
    title: string
    handle: string
    priceInr: number | null
  }) => void
}

function ProductCard({
  product: p,
  countryCode,
  isMostRelevant = false,
  onAddedToCart,
}: ProductCardProps) {
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const addToCart = async () => {
    if (!p.variantId || adding || added) return
    setAdding(true)
    try {
      const cartRes = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: p.variantId, quantity: 1 }),
      })
      if (cartRes.ok) {
        setAdded(true)
        onAddedToCart?.({
          title: p.title,
          handle: p.handle,
          priceInr: p.priceInr ?? null,
        })
        setTimeout(() => setAdded(false), 2000)
      }
    } catch {
      // silent
    } finally {
      setAdding(false)
    }
  }

  const productHref = localizeHref(countryCode, `/products/${p.handle}`)

  return (
    <div
      className="ph-card"
      style={{
        overflow: "hidden",
        cursor: "default",
        transition: "transform 0.15s, box-shadow 0.15s",
        border: "1px solid var(--ink-line)",
        transform: isHovered ? "translateY(-2px)" : undefined,
        boxShadow: isHovered ? "var(--shadow-md)" : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <a
        href={productHref}
        style={{ display: "block", textDecoration: "none" }}
        tabIndex={-1}
      >
        <div
          style={{
            position: "relative",
            height: 120,
            background:
              "radial-gradient(circle at 50% 30%, rgba(255,200,120,0.35), transparent 60%), linear-gradient(180deg,#5a3a1a 0%,#2a1808 100%)",
            flexShrink: 0,
          }}
        >
          {p.thumbnail && (
            <Image
              src={p.thumbnail}
              alt={p.title}
              fill
              className="object-cover"
              sizes="240px"
            />
          )}

          {/* Most relevant badge */}
          {isMostRelevant && (
            <span
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                padding: "3px 8px",
                borderRadius: 999,
                background: "rgba(26,20,16,0.82)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "var(--sans)",
                letterSpacing: "0.04em",
                backdropFilter: "blur(4px)",
                whiteSpace: "nowrap",
              }}
            >
              Most relevant
            </span>
          )}
        </div>
      </a>

      {/* Info */}
      <div style={{ padding: "12px 12px 10px" }}>
        {p.collectionTitle && (
          <p
            className="ph-eyebrow"
            style={{ marginBottom: 4, fontSize: 9, color: "var(--gold-2)" }}
          >
            {p.collectionTitle}
          </p>
        )}

        {/* Clickable title */}
        <a
          href={productHref}
          style={{ textDecoration: "none" }}
        >
          <h4
            className="ph-body"
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 500,
              fontSize: 14,
              lineHeight: 1.3,
              marginBottom: 8,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              color: "var(--ink)",
            }}
          >
            {p.title}
          </h4>
        </a>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 6,
            marginBottom: 8,
          }}
        >
          {p.priceInr ? (
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--ink)",
                fontFamily: "var(--sans)",
                fontFeatureSettings: "'tnum' 1",
              }}
            >
              ₹{p.priceInr.toLocaleString("en-IN")}
            </span>
          ) : (
            <span style={{ fontSize: 12, color: "var(--ink-4)" }}>
              See price →
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              addToCart()
            }}
            disabled={adding}
            className="ph-btn ph-btn-primary"
            style={{
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 600,
              minWidth: 72,
              background: added ? "var(--sage)" : undefined,
              borderColor: added ? "var(--sage)" : undefined,
              transition: "background 0.2s, border-color 0.2s",
            }}
          >
            {added ? "Added ✓" : adding ? "…" : "Book"}
          </button>
        </div>

        {/* View details link */}
        <a
          href={productHref}
          style={{
            display: "block",
            fontSize: 11,
            color: "var(--sindoor)",
            textDecoration: "none",
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.textDecoration =
              "underline"
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.textDecoration =
              "none"
          }}
        >
          View details →
        </a>
      </div>
    </div>
  )
}
