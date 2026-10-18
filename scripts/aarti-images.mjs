// Digital Aarti art (house style "twilight tonalism"): for each deity a sanctum background and the
// deity murti on a transparent layer, so the page can move them separately (depth on tilt).
// Needs AI_GATEWAY_API_KEY (env or .env.local). Raw generations cached in .scratch-aarti/.
import fs from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"
import { MODEL } from "./lib/image-style.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const OUT = path.join(ROOT, "public", "aarti")
const RAW = path.join(ROOT, ".scratch-aarti")

// The house style avoids faces of people; a deity murti (idol) is the subject of darshan, so these
// prompts keep the painterly twilight look but allow the murti's serene face.
const LOOK = "painterly oil on linen, twilight tonalism, warm golden lamplight, soft atmospheric haze, loose brushwork, devotional and serene, rich but not garish, no text, no letters, no logos, no watermark"

const IMAGES = [
  { file: "shirdi-sai-baba-bg", transparent: false, prompt: `Interior of a serene marble shrine at dusk seen from the devotee's position: an empty raised marble platform and ornate silver-framed arch in the centre (left empty for the idol), brass oil lamps glowing on both sides, marigold and rose garlands hanging, faint incense smoke, warm golden light from the lamps, deep warm shadows at the edges. ${LOOK}` },
  { file: "shirdi-sai-baba-deity", transparent: true, prompt: `Full-figure painted marble murti (idol) of Shirdi Sai Baba seated on a simple silver throne, right leg crossed over the left knee, white robe and white head cloth, a saffron shawl over the shoulders, a fresh rose and marigold garland, serene compassionate face, softly lit by warm lamplight from below. Isolated subject on a transparent background, no floor, no scenery. ${LOOK}` },
  { file: "mahalakshmi-bg", transparent: false, prompt: `Interior of a richly decorated South Indian home shrine at dusk: an empty raised pedestal in the centre framed by a carved golden arch (left empty for the idol), red silk drapes, banana leaves and mango-leaf torans, brass lamps and a silver kalasha glowing, a few gold coins on a red cloth, warm golden light, gentle haze. ${LOOK}` },
  { file: "mahalakshmi-deity", transparent: true, prompt: `Full-figure painted golden murti (idol) of Goddess Mahalakshmi seated on a large pink lotus, four arms: two holding pink lotuses, one hand in blessing pose, one hand gently pouring a stream of gold coins, red silk saree with gold border, gold jewellery and crown, serene benevolent face, warm lamplight. Isolated subject on a transparent background, no scenery. ${LOOK}` },
]

function key() {
  if (!process.env.AI_GATEWAY_API_KEY) {
    try { process.loadEnvFile?.(path.join(ROOT, ".env.local")) } catch {}
  }
  return process.env.AI_GATEWAY_API_KEY || ""
}

async function gen({ file, prompt, transparent }) {
  const raw = path.join(RAW, `${file}.png`)
  let buf
  if (existsSync(raw)) buf = await fs.readFile(raw)
  else {
    const body = { model: MODEL, prompt, n: 1, size: "1024x1536", ...(transparent ? { background: "transparent", output_format: "png" } : {}) }
    const res = await fetch("https://ai-gateway.vercel.sh/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(240_000),
    })
    if (!res.ok) throw new Error(`${file}: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`)
    const item = (await res.json())?.data?.[0]
    if (!item?.b64_json) throw new Error(`${file}: no image`)
    buf = Buffer.from(item.b64_json, "base64")
    await fs.writeFile(raw, buf)
  }
  const meta = await sharp(buf).metadata()
  if (transparent) {
    // Keep alpha; WebP with alpha is ~5x smaller than PNG.
    const out = await sharp(buf).resize(900).webp({ quality: 86, alphaQuality: 90 }).toBuffer()
    await fs.writeFile(path.join(OUT, `${file}.webp`), out)
    console.log(file, meta.width, "x", meta.height, "alpha:", meta.hasAlpha, `${Math.round(out.length / 1024)} KB`)
  } else {
    const out = await sharp(buf).resize(1080).webp({ quality: 80 }).toBuffer()
    await fs.writeFile(path.join(OUT, `${file}.webp`), out)
    console.log(file, meta.width, "x", meta.height, `${Math.round(out.length / 1024)} KB`)
  }
}

await fs.mkdir(OUT, { recursive: true })
await fs.mkdir(RAW, { recursive: true })
await Promise.all(IMAGES.map((i) => gen(i).catch((e) => console.error("FAILED", e.message))))
