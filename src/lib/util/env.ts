export const getBaseURL = () => {
  // Explicit override wins.
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }

  // Vercel injects VERCEL_URL per deploy (preview + production), without
  // protocol. Use it as the default so preview deploys work without any
  // env var configuration.
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return "http://localhost:8000"
}

