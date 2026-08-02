// Real, product-specific Q&A for the site's top hero product pages, phrased
// the way people actually ask AI assistants (ChatGPT, Claude, Perplexity,
// Google AI Overviews). Grounded in the live Medusa product descriptions —
// nothing here is invented. Keyed by product handle.
//
// Used for both:
//   1. FAQPage JSON-LD (schema.org) on the matching product page.
//   2. A visible, liftable Q&A block on that same page (MAN-18 item 7) —
//      so the content isn't hidden-only markup.
//
// MAN-18 (AEO/GEO). See also src/lib/data/faq-data.ts for the site-wide,
// generic /faq section.

export type ProductFaqEntry = { question: string; answer: string }

export const PRODUCT_FAQ_CONTENT: Record<string, ProductFaqEntry[]> = {
  "rahu-ketu-dosha-parihara-pooja-sarpa-dosha-parihara-pooja-at-sri-kalahasti-temple": [
    {
      question: "What is Rahu Ketu pooja and who should do it?",
      answer:
        "The Rahu Ketu Dosha Parihara Pooja (also called Sarpa Dosha Parihara Pooja) at Sri Kalahasti Temple is a Vedic remedy for the negative effects of Rahu, Ketu, and Kala Sarpa dosha in a person's horoscope. It's recommended for individuals with a Rahu/Ketu or Kala Sarpa dosha, unmarried individuals facing repeated obstacles in marriage, couples struggling to conceive, and anyone seeking to mitigate difficult planetary influences.",
    },
    {
      question: "Why is Sri Kalahasti Temple used specifically for Rahu Ketu remedies?",
      answer:
        "Sri Kalahasti is one of the Panchabhoota Sthalams (representing the element of Wind) and one of South India's most revered Shiva temples, known for its self-manifested (swayambhu) air-linga. It's considered especially powerful for Rahu-Ketu related doshas, and thousands of devotees travel there every year specifically for this parihara.",
    },
    {
      question: "How is the pooja performed if I can't travel to Sri Kalahasti myself?",
      answer:
        "A PariharaOnline representative performs the pooja on your behalf at the temple. The ritual involves worshipping a silver snake (sarpam), offering prayers to Lord Shiva, and donating the silver snake to the temple's hundi in your name — after your sankalpam (name, nakshatram, gothram) is submitted. This booking covers one person; increase the quantity for additional devotees.",
    },
  ],

  "garbharakshambika-ghee": [
    {
      question: "What is Garbarakshambigai ghee and how is it used?",
      answer:
        "Garbarakshambigai Temple ghee prasadham is sanctified ghee from the Garbarakshambigai Temple in Thirukkarugavur, Tamil Nadu — a temple renowned for blessings related to conception. To use it: mix the ghee with regular store-bought ghee to extend its quantity, and take it nightly before bed for 48 days. Most couples need 2 bottles to cover that period. There are no dietary restrictions, though it should be skipped during the menstrual cycle.",
    },
    {
      question: "Who is Garbarakshambigai ghee prasadham for?",
      answer:
        "It's intended for women trying to conceive, couples facing fertility challenges, and anyone seeking a divine blessing for a healthy pregnancy. PariharaOnline sends a representative to the temple to perform the pooja and obtain the prasadham on the devotee's behalf, along with mantras to recite while using it.",
    },
    {
      question: "Is the ghee prasadham shipped internationally?",
      answer:
        "Yes. Shipping within India is free; international shipping is available with tracking at an additional cost, packed to comply with the customs rules of the destination country.",
    },
  ],

  "garbharakshambika-oil": [
    {
      question: "How is Garbarakshambigai oil abhishekam used, and what is it for?",
      answer:
        "Garbarakshambigai Temple oil prasadham is sanctified castor oil from the Garbarakshambigai Temple in Thirukkarugavur, Tamil Nadu, believed to support safe pregnancy and easier childbirth. It's applied to the lower abdomen of the expectant mother for a safe, complication-free delivery. Most pregnancies need about 2 bottles to last the full term, and there are no dietary restrictions.",
    },
    {
      question: "Who should use Garbarakshambigai oil prasadham?",
      answer:
        "It's intended for expectant mothers, women experiencing pregnancy-related discomfort, and couples wanting spiritual support during pregnancy. As with the temple's ghee prasadham, a PariharaOnline representative performs the pooja at the temple on the devotee's behalf and ships the sanctified oil with usage mantras.",
    },
  ],

  "shirdi-sai-baba-udi-prasadham": [
    {
      question: "What is Shirdi Sai Baba Udi and how is it used?",
      answer:
        "Udi is the sacred ash from Sai Baba's dhuni (holy fire) at the Shirdi Sai Baba Temple. Devotees traditionally apply it to the forehead or take a small pinch with water. Sai Baba himself distributed Udi to devotees, and it's believed to carry healing, protective, and wish-fulfilling significance.",
    },
    {
      question: "Can I get Shirdi Sai Baba prasadham delivered if I can't visit Shirdi?",
      answer:
        "Yes. PariharaOnline sources Udi directly from the Shirdi Sai Baba temple and ships it worldwide in secure packaging, so devotees who can't make the pilgrimage can still receive authentic prasadham at their doorstep.",
    },
  ],
}
