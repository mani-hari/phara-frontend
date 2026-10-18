// Estimated prasadam delivery outside India, shown before checkout so the total is not a surprise.
// Keep in sync with the "International Shipping (Speedpost/FedEx)" option in Medusa (USD region).
// India (INR) has free delivery, so nothing is shown there.
export const INTL_PRASAD_SHIPPING_USD = 32

export const showsIntlShipping = (currency?: string | null) => !!currency && currency.toLowerCase() !== "inr"
