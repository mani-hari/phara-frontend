import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div style={{ background: "var(--paper)" }} data-testid="category-container">
      {/* Hero banner */}
      <section
        style={{
          borderTop: "1px solid var(--ink-line)",
          background: "linear-gradient(135deg, #2f241d 0%, #5a3a1a 50%, #6b3d1e 100%)",
          color: "#fff",
        }}
      >
        <div className="content-container" style={{ padding: "56px 0" }}>
          <p className="ph-eyebrow" style={{ color: "rgba(250,246,238,0.55)", marginBottom: 12 }}>
            Complete Catalog
          </p>
          <h1
            className="ph-h1"
            style={{ color: "var(--paper)", margin: 0, maxWidth: 600 }}
          >
            Sacred rituals for every prayer.
          </h1>
          <p
            className="ph-body"
            style={{
              color: "rgba(250,246,238,0.75)",
              marginTop: 16,
              maxWidth: 540,
              marginBottom: 0,
            }}
          >
            Poojas, homams, astrology readings, and prasadam — performed at
            temples across India, in your name.
          </p>
        </div>
      </section>

      <section className="content-container" style={{ padding: "40px 0 64px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div>
            <p className="ph-eyebrow ph-eyebrow-gold" style={{ marginBottom: 6 }}>
              All services
            </p>
            <h2 className="ph-h3" style={{ margin: 0 }}>
              Browse everything
            </h2>
          </div>
          <RefinementList sortBy={sort} />
        </div>

        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
          />
        </Suspense>
      </section>
    </div>
  )
}

export default StoreTemplate
