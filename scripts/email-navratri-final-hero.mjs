// Hero for the final Navratri email (19 Oct): Maa Durga in her gentle form, Navaratri lamps lit, in the deity-art
// look the owner approved (/aarti cover; prompts in scripts/aarti-images.mjs). Landscape for email.
import fs from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"
import { MODEL } from "./lib/image-style.mjs"
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
try { process.loadEnvFile?.(path.join(ROOT, ".env.local")) } catch {}
const LOOK = "painterly oil on linen, twilight tonalism, warm golden lamplight, soft atmospheric haze, loose brushwork, devotional and serene, rich but not garish, no text, no letters, no logos, no watermark"
const prompt = `A serene South Indian temple sanctum on the last night of Navaratri: a painted golden murti of Goddess Durga in her gentle, motherly form seated calmly on a peaceful resting lion, eight arms, one hand raised in blessing, holding a pink lotus, conch and discus softly, red silk saree with gold border, gold crown, a soft kind smile, garlands of marigold and jasmine, and in the foreground many small earthen clay diyas lit in rows on the stone steps, a brass lamp glowing either side, warm golden light. No demon, nothing fierce. ${LOOK}`
const RAW = path.join(ROOT, ".scratch-aarti", "navratri-final-hero.png")
let buf
if (existsSync(RAW)) buf = await fs.readFile(RAW)
else {
  const res = await fetch("https://ai-gateway.vercel.sh/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt, n: 1, size: "1536x1024" }),
    signal: AbortSignal.timeout(240_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 300)}`)
  buf = Buffer.from((await res.json()).data[0].b64_json, "base64")
  await fs.writeFile(RAW, buf)
}
const out = path.join(ROOT, "public", "email", "navratri-final-durga.jpg")
await sharp(buf).resize(1040).jpeg({ quality: 82, mozjpeg: true }).toFile(out)
console.log(out, Math.round((await fs.stat(out)).size / 1024), "KB")
