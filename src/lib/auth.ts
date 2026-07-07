import { NextAuthOptions } from "next-auth"
import { JWT } from "next-auth/jwt"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

// ── Type augmentation ─────────────────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      role: "admin" | "customer"
      userId: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "admin" | "customer"
    userId: string
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────
const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ||
  process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
  ""
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

// ── Build providers array ─────────────────────────────────────────────────────
const providers: NextAuthOptions["providers"] = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),

  CredentialsProvider({
    id: "credentials",
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null

      try {
        const res = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        })

        if (!res.ok) return null

        const data = await res.json()
        // Medusa v2 returns { token, customer } or similar
        const customer = data.customer ?? data

        if (!customer || (!customer.id && !customer.email)) return null

        const firstName = customer.first_name ?? ""
        const lastName = customer.last_name ?? ""
        const fullName = [firstName, lastName].filter(Boolean).join(" ") || null

        return {
          id: customer.id ?? credentials.email,
          email: customer.email ?? credentials.email,
          name: fullName,
          image: null,
        }
      } catch {
        return null
      }
    },
  }),
]

// Add Facebook only when both env vars are present
if (
  process.env.FACEBOOK_CLIENT_ID &&
  process.env.FACEBOOK_CLIENT_SECRET
) {
  // Dynamic import to avoid pulling in the provider when not configured
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const FacebookProvider = require("next-auth/providers/facebook").default
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    })
  )
}

// ── Auth options ──────────────────────────────────────────────────────────────
export const authOptions: NextAuthOptions = {
  providers,

  pages: {
    signIn: "/account/signin",
  },

  callbacks: {
    // Allow ALL users to sign in (admin vs customer is handled via role, not a gate)
    async signIn() {
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        const email = (user.email ?? "").toLowerCase()
        token.role = ADMIN_EMAILS.includes(email) ? "admin" : "customer"
        token.userId = user.id ?? user.email ?? ""
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token as JWT).role ?? "customer"
        session.user.userId = (token as JWT).userId ?? ""
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}
