// Products whose page shows a checkbox list of other products instead of a variant picker.
// Each ticked item goes into the cart as its own line (its own product, price and variant).
// Prices come from each item's own product for the visitor's region (INR in India, USD elsewhere).
// `section` names the "## " heading in the bundle product's description that explains this item;
// the bundle page shows that text beside the item's own photo and Add button.
export type BundleItem = { productId: string; variantId: string; label: string; section?: string }

export const PRODUCT_BUNDLES: Record<string, BundleItem[]> = {
  "navratri-poojas-online": [
    {
      productId: "prod_01KMYVF9DMYPX3KKW73640M0NT",
      variantId: "variant_01KN117WVJBYNYYSDH337DYWQD",
      label: "Lighting of Ghee lamps + Madurai Meenakshi Amman Pooja",
      section: "Madurai Meenakshi Amman Pooja with ghee lamps",
    },
    { productId: "prod_01KMYVF22Z6MAWTWGV0PP98G0A", variantId: "variant_01KN117V24MARQNZ56HDB32PC0", label: "Saraswati Homam for Education", section: "Saraswati Homam" },
    {
      productId: "prod_01KMYVEZP7T504E2CDJ2RF3RKP",
      variantId: "variant_01KN117NBYNBKJSKCP2A5DMF6F",
      label: "Navagraha Homam (for Navagraha or planetary doshas)",
      section: "Navagraha Homam",
    },
    {
      productId: "prod_01KMYVF2SPW7DB3SY2NZ13J8KV",
      variantId: "variant_01KN117XNKR6ZNCZHGSDK8T46D",
      label: "Sudarshana Homam: overcome obstacles, and for job and business",
      section: "Sudarshana Homam",
    },
  ],
}
