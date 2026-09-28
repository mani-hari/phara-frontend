import Image from "next/image"
import Link from "next/link"
import { HttpTypes } from "@medusajs/types"

import { BlogProducts } from "@lib/data/blog"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { localizeHref } from "@lib/util/localize-href"

async function loadProduct(handle: string, countryCode: string) {
  try {
    const { response } = await listProducts({
      countryCode,
      queryParams: { handle, limit: 1 },
    })
    const product = response.products[0]
    return product && product.handle === handle ? product : null
  } catch {
    return null
  }
}

function priceFor(product: HttpTypes.StoreProduct) {
  try {
    return getProductPrice({ product }).cheapestPrice?.calculated_price ?? null
  } catch {
    return null
  }
}

/**
 * "Relevant products" — a quiet, flat block placed after the 2nd `##` section
 * of a post. Handles that fail to load are skipped silently; with no products
 * and no search query, nothing renders.
 */
export default async function RelevantProducts({
  products,
  countryCode,
}: {
  products?: BlogProducts
  countryCode: string
}) {
  if (!products) return null

  const loaded = (
    await Promise.all(products.handles.slice(0, 2).map((h) => loadProduct(h, countryCode)))
  ).filter((p): p is HttpTypes.StoreProduct => !!p)

  if (!loaded.length && !products.query) return null

  const heading = products.heading || "Relevant products"

  return (
    <aside
      aria-label={heading}
      className="not-prose my-10 px-5 py-5 sm:px-6"
      style={{
        background: "var(--cream)",
        border: "1px solid var(--ink-line)",
        borderRadius: "var(--r-lg)",
      }}
    >
      <p className="ph-eyebrow ph-eyebrow-gold">{heading}</p>

      {loaded.length > 0 && (
        <ul className="mt-3">
          {loaded.map((product, i) => {
            const price = priceFor(product)
            const href = localizeHref(countryCode, `/products/${product.handle}`)
            return (
              <li
                key={product.id}
                style={i > 0 ? { borderTop: "1px solid var(--ink-line)" } : undefined}
              >
                <Link href={href} className="group flex items-center gap-4 py-3">
                  <span
                    className="relative block shrink-0 overflow-hidden"
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "var(--r-md)",
                      background: "var(--paper-2)",
                    }}
                  >
                    {product.thumbnail && (
                      <Image
                        src={product.thumbnail}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="ph-body block transition-colors group-hover:text-[color:var(--sindoor)]"
                      style={{
                        fontWeight: 600,
                        color: "var(--ink)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {product.title}
                    </span>
                    {product.subtitle && (
                      <span className="ph-body-sm mt-0.5 block truncate">
                        {product.subtitle}
                      </span>
                    )}
                    {price && (
                      <span
                        className="ph-body-sm ph-num mt-1 block"
                        style={{ color: "var(--sindoor)", fontWeight: 600 }}
                      >
                        {price}
                      </span>
                    )}
                  </span>
                  <span
                    aria-hidden="true"
                    className="ph-body-sm shrink-0 transition-transform group-hover:translate-x-0.5"
                    style={{ color: "var(--ink-4)" }}
                  >
                    →
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {products.query && (
        <p
          className={loaded.length ? "mt-2 pt-3" : "mt-3"}
          style={loaded.length ? { borderTop: "1px solid var(--ink-line)" } : undefined}
        >
          <Link
            href={localizeHref(
              countryCode,
              `/search?q=${encodeURIComponent(products.query)}`
            )}
            className="ph-body-sm"
            style={{ color: "var(--sindoor)", fontWeight: 500 }}
          >
            See all for &lsquo;{products.query}&rsquo; →
          </Link>
        </p>
      )}
    </aside>
  )
}
