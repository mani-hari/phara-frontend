// Images for the Navratri series email 2 (Sunday 11 Oct 2026):
//   1. public/email/navratri-2-homam-video.jpg  - the homepage homam video's YouTube frame, letterbox
//      bars cropped, with a play button, so the email can show it as a clickable "video".
//   2. public/email/navratri-2-package.jpg      - a new house-style (twilight tonalism) Navratri scene,
//      so the package card does not reuse the product's own image.
// Needs AI_GATEWAY_API_KEY (environment or .env.local). Raw generation is cached so reruns are free.
import fs from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"
import { stylePrompt, MODEL, GEN_SIZE } from "./lib/image-style.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const OUT = path.join(ROOT, "public", "email")
const RAW = path.join(ROOT, ".scratch-navratri", "raw-package.png")
const VIDEO_ID = "1Ycn82X6VP4" // "How homams are done in PariharaOnline.com" (homepage)
const W = 1036 // 2x the 518px card image

const SCENE =
  "A home shrine on the eve of Navratri: a brass kalasha pot with mango leaves and a coconut, nine small oil lamps lit in a row, " +
  "marigold garlands, a goddess idol glowing softly in the background, and a family seen as small silhouettes from behind lighting a lamp together"

function loadKey() {
  if (!process.env.AI_GATEWAY_API_KEY) {
    try { process.loadEnvFile?.(path.join(ROOT, ".env.local")) } catch {}
  }
  return process.env.AI_GATEWAY_API_KEY || ""
}

async function videoThumb() {
  const res = await fetch(`https://img.youtube.com/vi/${VIDEO_ID}/sddefault.jpg`)
  if (!res.ok) throw new Error(`thumbnail HTTP ${res.status}`)
  const src = Buffer.from(await res.arrayBuffer())
  const { width, height } = await sharp(src).metadata() // 640x480 with black bars
  const h = Math.round((width * 9) / 16) // 360
  const top = Math.round((height - h) / 2)
  const H = Math.round((W * 9) / 16)
  const play = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="6" flood-opacity="0.45"/></filter></defs>
    <circle cx="${W / 2}" cy="${H / 2}" r="64" fill="#b6442e" fill-opacity="0.94" filter="url(#s)"/>
    <circle cx="${W / 2}" cy="${H / 2}" r="64" fill="none" stroke="#fff" stroke-opacity="0.9" stroke-width="4"/>
    <polygon points="${W / 2 - 18},${H / 2 - 32} ${W / 2 - 18},${H / 2 + 32} ${W / 2 + 34},${H / 2}" fill="#fff"/>
  </svg>`)
  const out = await sharp(src)
    .extract({ left: 0, top, width, height: h })
    .resize(W, H, { kernel: "lanczos3" })
    .composite([{ input: play, top: 0, left: 0 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer()
  await fs.writeFile(path.join(OUT, "navratri-2-homam-video.jpg"), out)
  console.log("video thumbnail:", W, "x", H, `${Math.round(out.length / 1024)} KB`)
}

async function packageImage() {
  let raw
  if (existsSync(RAW)) {
    raw = await fs.readFile(RAW)
    console.log("using cached generation")
  } else {
    const key = loadKey()
    if (!key) throw new Error("AI_GATEWAY_API_KEY is not set")
    const res = await fetch("https://ai-gateway.vercel.sh/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, prompt: stylePrompt(SCENE), n: 1, size: GEN_SIZE }),
      signal: AbortSignal.timeout(180_000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
    const item = (await res.json())?.data?.[0]
    if (!item?.b64_json) throw new Error("no image in response")
    raw = Buffer.from(item.b64_json, "base64")
    await fs.mkdir(path.dirname(RAW), { recursive: true })
    await fs.writeFile(RAW, raw)
    console.log("generated a new image")
  }
  const H = Math.round((W * 2) / 3)
  const wm = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <text x="${Math.round(W * 0.56)}" y="${Math.round(H * 0.63)}" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="40" font-weight="600" letter-spacing="3" fill="#fff" fill-opacity="0.30">pariharaonline.com</text>
  </svg>`)
  const out = await sharp(raw)
    .resize(W, H, { fit: "cover", position: sharp.strategy.attention })
    .composite([{ input: wm, top: 0, left: 0 }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer()
  await fs.writeFile(path.join(OUT, "navratri-2-package.jpg"), out)
  console.log("package image:", W, "x", H, `${Math.round(out.length / 1024)} KB`)
}

await fs.mkdir(OUT, { recursive: true })
await videoThumb()
await packageImage()
