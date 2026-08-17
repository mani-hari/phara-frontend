// Server-only translation utility. Uses google-translate-api-x (a free,
// unofficial wrapper around translate.google.com's own endpoints — NOT the
// official paid Google Cloud Translation API, since no API key was available
// for this build). This is a disclosed stopgap suitable for the localhost
// prototype Mani is reviewing; before scaling to the full catalog, swap
// `googleTranslateRaw` below for an official paid API (Google Cloud
// Translation or DeepL) to avoid rate limits and ToS ambiguity at volume.
//
// File-based cache (gitignored, .translation-cache/<lang>.json) so repeated
// page loads for the same content don't re-hit the translation endpoint —
// both for speed and to avoid hammering an unofficial, rate-limited service.
import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import translate from "google-translate-api-x"
import type { LangCode } from "./languages"
import { getLanguage } from "./languages"

const CACHE_DIR = path.join(process.cwd(), ".translation-cache")

function cacheFile(lang: LangCode): string {
  return path.join(CACHE_DIR, `${lang}.json`)
}

function loadCache(lang: LangCode): Record<string, string> {
  try {
    return JSON.parse(fs.readFileSync(cacheFile(lang), "utf8"))
  } catch {
    return {}
  }
}

function saveCache(lang: LangCode, cache: Record<string, string>) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
    fs.writeFileSync(cacheFile(lang), JSON.stringify(cache, null, 2))
  } catch (e) {
    console.warn("[i18n] failed to write translation cache:", e)
  }
}

function hashKey(text: string): string {
  return crypto.createHash("sha1").update(text).digest("hex")
}

// Translates a batch of strings to `lang`, using the on-disk cache for
// anything already translated and only calling the API for cache misses.
// Preserves input order. Falls back to the original English text for any
// entry that fails to translate, so a translation-service hiccup degrades
// gracefully instead of breaking the page.
export async function translateBatch(texts: string[], lang: LangCode): Promise<string[]> {
  if (lang === "en" || texts.length === 0) return texts

  const cache = loadCache(lang)
  const results: string[] = new Array(texts.length)
  const misses: { index: number; text: string; key: string }[] = []

  texts.forEach((text, index) => {
    const key = hashKey(text)
    if (cache[key] !== undefined) {
      results[index] = cache[key]
    } else {
      misses.push({ index, text, key })
    }
  })

  if (misses.length === 0) return results

  try {
    const googleCode = getLanguage(lang).googleCode
    const translated = await translate(
      misses.map((m) => m.text),
      { to: googleCode, forceBatch: true }
    )
    const responses = Array.isArray(translated) ? translated : [translated]
    responses.forEach((res, i) => {
      const miss = misses[i]
      const text = res?.text || miss.text
      results[miss.index] = text
      cache[miss.key] = text
    })
    saveCache(lang, cache)
  } catch (e) {
    console.warn(`[i18n] translateBatch failed for lang=${lang}:`, e)
    misses.forEach((m) => {
      results[m.index] = m.text // graceful fallback to English
    })
  }

  return results
}

export async function translateText(text: string, lang: LangCode): Promise<string> {
  const [result] = await translateBatch([text], lang)
  return result
}
