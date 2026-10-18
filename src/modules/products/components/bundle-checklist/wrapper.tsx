import { listProducts } from "@lib/data/products"
import { PRODUCT_BUNDLES } from "@lib/data/product-bundles"
import { HttpTypes } from "@medusajs/types"
import type { PricedBundleItem } from "./context"

/** Prices each bundle item for the visitor's region; items without a price there are left out. */
export async function getPricedBundle(handle: string, region: HttpTypes.StoreRegion): Promise<PricedBundleItem[]> {
  const items = PRODUCT_BUNDLES[handle] || []
  if (!items.length) return []
  const { response } = await listProducts({
    queryParams: { id: items.map((i) => i.productId), limit: items.length },
    regionId: region.id,
  })
  return items.flatMap((item) => {
    const product = response.products.find((p) => p.id === item.productId)
    const variant = product?.variants?.find((v) => v.id === item.variantId)
    const amount = variant?.calculated_price?.calculated_amount
    const currency = variant?.calculated_price?.currency_code
    if (!product || !variant || typeof amount !== "number" || amount <= 0 || !currency) return []
    return [{ ...item, handle: product.handle || "", amount, currency, image: product.thumbnail || product.images?.[0]?.url || null }]
  })
}
