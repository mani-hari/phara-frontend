import crypto from "node:crypto"
import { cookies } from "next/headers"

// Simple email + shared-password gate for internal /manage/* staff tools —
// deliberately NOT tied to Medusa customer/admin accounts (see
// /manage/paymentstatus's own comments for why) and deliberately NOT OAuth,
// per explicit "simple, plain string checks" direction — same pattern
// already used for parihara-video-studio's APP_PASSWORD gate, plus an email
// allowlist on top for a second, independent check.
const COOKIE_NAME = "manage_auth"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

function allowedEmails(): string[] {
  return (process.env.STAFF_TOOLS_ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function checkCredentials(email: string, password: string): boolean {
  const expectedPassword = process.env.STAFF_PASSWORD_FOR_TOOLS
  if (!expectedPassword || password !== expectedPassword) return false
  const normalizedEmail = email.trim().toLowerCase()
  return allowedEmails().includes(normalizedEmail)
}

// Cookie holds the validated email + an HMAC signature (keyed by the
// existing NEXTAUTH_SECRET) proving OUR server issued it — never the
// password itself, so an intercepted cookie can't reveal it. Re-checking
// the email against the allowlist on every request (not just at login)
// means removing someone from STAFF_TOOLS_ALLOWED_EMAILS immediately
// revokes any cookie they already have, with no separate revocation step.
function sign(email: string): string | null {
  const pepper = process.env.NEXTAUTH_SECRET
  if (!pepper) return null
  return crypto.createHmac("sha256", pepper).update(email).digest("hex")
}

export function signedCookieValue(email: string): string | null {
  const sig = sign(email)
  return sig ? `${email}.${sig}` : null
}

export async function isManageAuthed(): Promise<boolean> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_NAME)?.value
  if (!raw) return false

  const dotIndex = raw.lastIndexOf(".")
  if (dotIndex === -1) return false
  const email = raw.slice(0, dotIndex)
  const signature = raw.slice(dotIndex + 1)

  const expectedSignature = sign(email)
  if (!expectedSignature || signature !== expectedSignature) return false

  return allowedEmails().includes(email.toLowerCase())
}

export const MANAGE_AUTH_COOKIE = { name: COOKIE_NAME, maxAge: MAX_AGE_SECONDS }
