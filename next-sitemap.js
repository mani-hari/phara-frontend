const fs = require("fs")
const path = require("path")

const excludedPaths = ["/checkout", "/account/*"]
const blogDirectory = path.join(process.cwd(), "content", "blog")

const getBlogSlugs = () => {
  try {
    return fs
      .readdirSync(blogDirectory)
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(/\.md$/, ""))
  } catch {
    return []
  }
}

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_VERCEL_URL || "https://pariharaonline.com",
  generateRobotsTxt: true,
  exclude: excludedPaths.concat(["/[sitemap]"]),
  additionalPaths: async () => {
    const staticPages = [
      "/about",
      "/how-it-works",
      "/astrology",
      "/contact",
      "/faq",
      "/blog",
      "/terms",
      "/privacy",
      "/refund",
    ]

    const faqSlugs = [
      "hindu-pujas-rituals",
      "vedic-astrology",
      "nakshatram-rasi",
      "festival-calendar",
      "temple-services",
      "prasad-delivery",
      "payment-ordering",
      "parihara-remedies",
      "marriage-compatibility",
      "health-wellness-rituals",
    ]

    const paths = []
    const blogSlugs = getBlogSlugs()

    for (const countryCode of ["in", "us"]) {
      for (const page of staticPages) {
        paths.push({
          loc: `/${countryCode}${page}`,
          changefreq: "monthly",
          priority: 0.7,
        })
      }
      for (const slug of faqSlugs) {
        paths.push({
          loc: `/${countryCode}/faq/${slug}`,
          changefreq: "monthly",
          priority: 0.6,
        })
      }
      for (const slug of blogSlugs) {
        paths.push({
          loc: `/${countryCode}/blog/${slug}`,
          changefreq: "monthly",
          priority: 0.7,
        })
      }
    }

    return paths
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "*",
        disallow: excludedPaths,
      },
    ],
    additionalSitemaps: [],
  },
}
