import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const queryParams: HttpTypes.StoreProductListParams = {
    is_giftcard: false,
  }
  if (region?.id) queryParams.region_id = region.id
  if (product.collection_id) queryParams.collection_id = [product.collection_id]
  if (product.tags?.length) {
    queryParams.tag_id = product.tags.map((t) => t.id).filter(Boolean) as string[]
  }

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) =>
    response.products.filter((p) => p.id !== product.id).slice(0, 4)
  )

  if (!products.length) return null

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p className="ph-eyebrow ph-eyebrow-gold" style={{ marginBottom: 8 }}>
          Devotees also booked
        </p>
        <h2 className="ph-h2">Related rituals.</h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 20,
        }}
      >
        <style>{`
          @media (min-width: 768px) {
            .related-grid { grid-template-columns: repeat(4, 1fr) !important; }
          }
        `}</style>
        <div
          className="related-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 20,
            gridColumn: "1 / -1",
          }}
        >
          {products.map((p) => {
            const { cheapestPrice } = getProductPrice({ product: p })
            const thumbSrc = p.thumbnail || p.images?.[0]?.url

            return (
              <LocalizedClientLink
                key={p.id}
                href={`/products/${p.handle}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="ph-card ph-lift"
                  style={{ cursor: "pointer", overflow: "hidden" }}
                >
                  {/* Image */}
                  <div
                    style={{
                      position: "relative",
                      height: 160,
                      background:
                        "radial-gradient(circle at 50% 30%, rgba(255,200,120,0.4), transparent 50%), linear-gradient(180deg, #5a3a1a 0%, #2a1808 100%)",
                    }}
                  >
                    {thumbSrc && (
                      <Image
                        src={thumbSrc}
                        alt={p.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: 16 }}>
                    <h4
                      className="ph-h4"
                      style={{
                        fontSize: 16,
                        marginBottom: 4,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {p.title}
                    </h4>
                    {p.collection?.title && (
                      <p
                        className="ph-body-sm"
                        style={{ fontFamily: "var(--serif)", color: "var(--ink-4)" }}
                        style={{ fontSize: 13, marginBottom: 10, margin: "4px 0 10px" }}
                      >
                        {p.collection.title}
                      </p>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 12,
                      }}
                    >
                      {cheapestPrice ? (
                        <span
                          className="ph-body"
                          style={{
                            fontWeight: 600,
                            fontFeatureSettings: "'tnum' 1",
                          }}
                        >
                          {cheapestPrice.calculated_price}
                        </span>
                      ) : (
                        <span className="ph-body-sm" style={{ color: "var(--ink-4)" }}>
                          Price on request
                        </span>
                      )}
                      <span
                        className="ph-body-sm"
                        style={{ color: "var(--sindoor)", fontWeight: 600 }}
                      >
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </LocalizedClientLink>
            )
          })}
        </div>
      </div>
    </div>
  )
}
