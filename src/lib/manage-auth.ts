import crypto from "node:crypto"
import { cookies } from "next/headers"

// Simple shared-password gate for internal /manage/* staff tools —
// deliberately NOT tied to Medusa customer/admin accounts (see
// /manage/paymentstatus's own comments for why) and deliberately NOT OAuth,
// per Mani's explicit "just a simple password" direction — same pattern
// already used for parihara-video-studio's APP_PASSWORD gate.
const COOKIE_NAME = "manage_auth"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

function expectedCookieValue(): string | null {
  const password = process.env.PAYMENT_STATUS_PASSWORD
  const pepper = process.env.NEXTAUTH_SECRET // already-present secret, reused as a signing key
  if (!password || !pepper) return null
  // The cookie never holds the plaintext password — just a signature of it,
  // so an intercepted cookie can't be used to recover the password itself.
  return crypto.createHmac("sha256", pepper).update(password).digest("hex")
}

export function checkPassword(submitted: string): boolean {
  const expected = process.env.PAYMENT_STATUS_PASSWORD
  return !!expected && submitted === expected
}

export function signedCookieValue(): string | null {
  return expectedCookieValue()
}

export async function isManageAuthed(): Promise<boolean> {
  const expected = expectedCookieValue()
  if (!expected) return false
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value === expected
}

export const MANAGE_AUTH_COOKIE = { name: COOKIE_NAME, maxAge: MAX_AGE_SECONDS }
