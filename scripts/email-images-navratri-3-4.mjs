// Images for the Navratri series emails 3 (Sat 17 Oct, Saraswati Puja + the three key dates) and
// 4 (Sun 18 Oct, Vijayadashami). House style (twilight tonalism) hero images, plus the homam loop
// GIF (public/email/navratri-homam-loop.gif) cut from the Mrityunjaya Homam video at 1:01.5.
// Needs AI_GATEWAY_API_KEY (environment or .env.local). Raw generations are cached so reruns are free.
import fs from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"
import { stylePrompt, MODEL, GEN_SIZE } from "./lib/image-style.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const OUT = path.join(ROOT, "public", "email")
const W = 1036 // 2x the 518px email column

const IMAGES = [
  {
    file: "navratri-3-saraswati.jpg",
    scene:
      "Saraswati Puja at a home shrine during Navratri: a veena, palm-leaf manuscripts and a child's school books placed before a small Goddess Saraswati idol, " +
      "white lotus flowers, brass oil lamps glowing, marigold garlands, a mother and child seen as small silhouettes from behind offering a flower",
  },
  {
    file: "navratri-4-vijayadashami.jpg",
    scene:
      "Vijayadashami morning, the victorious tenth day of Navratri: a parent guiding a small child's finger to write the first letter in a brass plate of rice, " +
      "lit brass lamps, marigolds and mango leaves at a home shrine, soft dawn light through a window with a distant temple tower silhouette",
  },
]

function loadKey() {
  if (!process.env.AI_GATEWAY_API_KEY) {
    try { process.loadEnvFile?.(path.join(ROOT, ".env.local")) } catch {}
  }
  return process.env.AI_GATEWAY_API_KEY || ""
}

async function generate({ file, scene }) {
  const raw = path.join(ROOT, ".scratch-navratri", `raw-${file.replace(/\.jpg$/, ".png")}`)
  let buf
  if (existsSync(raw)) {
    buf = await fs.readFile(raw)
    console.log(file, "using cached generation")
  } else {
    const key = loadKey()
    if (!key) throw new Error("AI_GATEWAY_API_KEY is not set")
    const res = await fetch("https://ai-gateway.vercel.sh/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, prompt: stylePrompt(scene), n: 1, size: GEN_SIZE }),
      signal: AbortSignal.timeout(180_000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
    const item = (await res.json())?.data?.[0]
    if (!item?.b64_json) throw new Error("no image in response")
    buf = Buffer.from(item.b64_json, "base64")
    await fs.mkdir(path.dirname(raw), { recursive: true })
    await fs.writeFile(raw, buf)
    console.log(file, "generated")
  }
  const H = Math.round((W * 9) / 16)
  const wm = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <text x="${Math.round(W * 0.56)}" y="${Math.round(H * 0.63)}" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="40" font-weight="600" letter-spacing="3" fill="#fff" fill-opacity="0.30">pariharaonline.com</text>
  </svg>`)
  const out = await sharp(buf)
    .resize(W, H, { fit: "cover", position: sharp.strategy.attention })
    .composite([{ input: wm, top: 0, left: 0 }])
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer()
  await fs.writeFile(path.join(OUT, file), out)
  console.log(file, W, "x", H, `${Math.round(out.length / 1024)} KB`)
}

await fs.mkdir(OUT, { recursive: true })
await Promise.all(IMAGES.map(generate))
