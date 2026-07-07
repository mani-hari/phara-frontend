export default function medusaError(error: any): never {
  // Medusa JS SDK v2 throws FetchError (has .status, no .response/.request)
  if (typeof error?.status === "number") {
    throw new Error(error.message || `Request failed with status ${error.status}`)
  }
  // Legacy axios-style errors
  if (error.response) {
    const message = error.response.data?.message || error.response.data || error.message
    throw new Error(String(message))
  }
  // Generic JS error
  throw new Error(error.message || "An unexpected error occurred")
}
