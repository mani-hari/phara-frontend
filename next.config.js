const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "react-markdown",
    "remark-gfm",
    "remark-parse",
    "unified",
    "bail",
    "is-plain-obj",
    "trough",
    "vfile",
    "vfile-message",
    "unist-util-stringify-position",
    "mdast-util-from-markdown",
    "mdast-util-to-string",
    "mdast-util-gfm",
    "micromark",
    "micromark-extension-gfm",
    "decode-named-character-reference",
    "character-entities",
  ],
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Import .md files as raw strings (Ask Parihara system prompt is bundled
  // from src/lib/parihara-soul.md at build time, so it can never be missing
  // at runtime).
  webpack: (config) => {
    config.module.rules.push({ test: /\.md$/, type: "asset/source" })
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
}

module.exports = nextConfig
