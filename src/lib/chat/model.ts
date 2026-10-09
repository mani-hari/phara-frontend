import { anthropic } from "@ai-sdk/anthropic"
import { createOpenAI } from "@ai-sdk/openai"
import type { LanguageModel } from "ai"

export type ChatProvider = "anthropic" | "openai"

const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001"
const OPENAI_DEFAULT_MODEL = "gpt-4.1-mini"

/**
 * Which provider powers Ask Parihara. CHAT_PROVIDER forces one ("openai" or
 * "anthropic"); otherwise OpenAI is used whenever OPENAI_API_KEY is set, and
 * Anthropic whenever only ANTHROPIC_API_KEY is. Returns null when neither key
 * is configured.
 */
export function chatProvider(): ChatProvider | null {
  const forced = process.env.CHAT_PROVIDER?.toLowerCase()
  if (forced === "openai" && process.env.OPENAI_API_KEY) return "openai"
  if (forced === "anthropic" && process.env.ANTHROPIC_API_KEY) return "anthropic"
  if (process.env.OPENAI_API_KEY) return "openai"
  if (process.env.ANTHROPIC_API_KEY) return "anthropic"
  return null
}

export function chatModel(): LanguageModel | null {
  const provider = chatProvider()
  if (provider === "openai") {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
    return openai(process.env.OPENAI_CHAT_MODEL || OPENAI_DEFAULT_MODEL)
  }
  if (provider === "anthropic") return anthropic(ANTHROPIC_MODEL)
  return null
}
