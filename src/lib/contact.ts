// Single source of truth for support contact details.
export const CONTACT = {
  whatsapp: "919743244501", // wa.me format (no + or spaces)
  whatsappDisplay: "+91 97432 44501",
  email: "hello@pariharaonline.com",
  hours: "Mon–Sat, 9 AM–6 PM IST",
} as const

/** Build a prefilled wa.me link. */
export const waLink = (text: string) =>
  `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`

/** Build a mailto link with subject/body. */
export const mailLink = (subject: string, body?: string) =>
  `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}${
    body ? `&body=${encodeURIComponent(body)}` : ""
  }`
