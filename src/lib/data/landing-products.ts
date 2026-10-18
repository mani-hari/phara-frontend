// "Special landing pages": top-selling products whose page is laid out as a single-column conversion page
// (no breadcrumb; temple story → delivery promise → what's in the parcel → how to use → book → proof).
// Photos are picked by file name so reordering the gallery in Medusa doesn't break the layout.
export type LandingConfig = {
  kind: "prasadam" | "pooja"
  place: string // the temple
  receive: string[] // short lines: what's in the parcel (prasadam) or what happens (pooja)
  receiveHeading?: string
  chips?: string[] // small trust chips under the title
  quantityTip?: string
}

const GARBHA_CHIPS = ["Serving devotees since 2009", "Ships worldwide", "Usage guide with every order"]

export const LANDING_PRODUCTS: Record<string, LandingConfig> = {
  "garbharakshambika-ghee": {
    kind: "prasadam",
    chips: GARBHA_CHIPS,
    place: "Sri Garbarakshambigai Temple, Thirukkarugavur",
    receive: [
      "Sealed bottle of the temple's ghee prasadam",
      "Temple prasadam packets",
      "A detailed usage guide with mantras, sent with your order",
    ],
    quantityTip: "Most couples order 2 bottles, enough for the full 48 days.",
  },
  "garbharakshambika-oil": {
    kind: "prasadam",
    chips: GARBHA_CHIPS,
    place: "Sri Garbarakshambigai Temple, Thirukkarugavur",
    receive: [
      "Sealed bottle of the temple's castor oil prasadam",
      "Temple prasadam packets",
      "A detailed usage guide with mantras, sent with your order",
    ],
    quantityTip: "Most mothers order 2 bottles to last until delivery.",
  },
  "rahu-ketu-dosha-parihara-pooja-sarpa-dosha-parihara-pooja-at-sri-kalahasti-temple": {
    kind: "pooja",
    chips: ["Serving devotees since 2009", "Performed at Sri Kalahasti", "Book from anywhere"],
    place: "Sri Kalahasti Temple",
    receiveHeading: "What happens when you book",
    receive: [
      "Our representative performs the pooja for you at Sri Kalahasti Temple",
      "A silver snake (sarpam) is worshipped, prayers are offered to Lord Shiva, and the sarpam is offered to the temple hundi",
      "Best on Sundays or Tuesdays during Rahu Kalam; it can be done any day, 6:30 AM to 9 PM",
    ],
    quantityTip: "This pooja is for one person. Booking for more people? Increase the quantity.",
  },
  "shirdi-sai-baba-udi-prasadham": {
    kind: "prasadam",
    chips: ["Serving devotees since 2009", "Sourced from Shirdi", "Ships worldwide"],
    place: "Shirdi Sai Baba Temple",
    receive: ["Udi (sacred ash) from the Shirdi Sai Baba temple", "Carefully packed so it reaches you in pristine condition"],
  },
}

export const pickImage = (urls: string[], pattern: RegExp) => urls.find((u) => pattern.test(u)) || null
