// "Special landing pages": top-selling products whose page is laid out as a single-column conversion page
// (no breadcrumb; temple story → delivery promise → what's in the parcel → how to use → book → proof).
// Photos are picked by file name so reordering the gallery in Medusa doesn't break the layout.
export type LandingConfig = {
  place: string // where the prasadam comes from, for the delivery promise
  receive: string[] // short "in every parcel" lines
  quantityTip?: string
}

export const LANDING_PRODUCTS: Record<string, LandingConfig> = {
  "garbharakshambika-ghee": {
    place: "Sri Garbarakshambigai Temple, Thirukkarugavur",
    receive: [
      "Sealed bottle of the temple's ghee prasadam",
      "Temple prasadam packets",
      "A detailed usage guide with mantras, sent with your order",
    ],
    quantityTip: "Most couples order 2 bottles, enough for the full 48 days.",
  },
  "garbharakshambika-oil": {
    place: "Sri Garbarakshambigai Temple, Thirukkarugavur",
    receive: [
      "Sealed bottle of the temple's castor oil prasadam",
      "Temple prasadam packets",
      "A detailed usage guide with mantras, sent with your order",
    ],
    quantityTip: "Most mothers order 2 bottles to last until delivery.",
  },
}

export const pickImage = (urls: string[], pattern: RegExp) => urls.find((u) => pattern.test(u)) || null
