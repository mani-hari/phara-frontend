// Link-preview (Open Graph) images: what WhatsApp, iMessage, Facebook and X show when a link is shared.
// Replaces the Medusa starter image that shipped in src/app/opengraph-image.jpg (owner, 18 Oct).
// 1200×630, key content kept in the centre so WhatsApp's square crop still reads.
//   default  → src/app/opengraph-image.jpg + twitter-image.jpg (every page without its own image)
//   aarti    → public/aarti/og-index.jpg, public/aarti/og-<slug>.jpg
import sharp from "sharp"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const W = 1200, H = 630
const r = (p) => path.join(ROOT, p)
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;")

// cream pill with the logo, centred at the top
async function logoPill() {
  const logo = await sharp(r("public/logo-2x.png")).resize(300).toBuffer()
  const pill = Buffer.from(`<svg width="352" height="92"><rect width="352" height="92" rx="46" fill="#faf6ee" fill-opacity="0.95"/></svg>`)
  return sharp(pill).composite([{ input: logo, left: 26, top: 21 }]).png().toBuffer()
}
function textBlock(lines, { size = 50, sub } = {}) {
  const y0 = H - 70 - (lines.length - 1) * (size * 1.15) - (sub ? 44 : 0)
  const t = lines.map((l, i) => `<text x="${W / 2}" y="${y0 + i * size * 1.15}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${size}" fill="#fffaf0">${esc(l)}</text>`).join("")
  const s = sub ? `<text x="${W / 2}" y="${H - 52}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="600" letter-spacing="1" fill="#ecd08f">${esc(sub)}</text>` : ""
  return Buffer.from(`<svg width="${W}" height="${H}"><defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0.5" stop-color="#140a04" stop-opacity="0"/><stop offset="1" stop-color="#140a04" stop-opacity="0.8"/></linearGradient><filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.55"/></filter></defs><rect width="100%" height="100%" fill="url(#g)"/><g filter="url(#sh)">${t}${s}</g></svg>`)
}
async function save(buf, out) {
  await sharp(buf).jpeg({ quality: 84, mozjpeg: true }).toFile(r(out))
  console.log(out, Math.round((await fs.stat(r(out))).size / 1024), "KB")
}

// a deity painting composed for 1200×630: painting centred at full height, its edges reflected and softened
async function deityScene(slug, zoom = 1.2) {
  const SH = Math.round(H * zoom), SW = Math.round((SH * 2) / 3)
  const scene = await sharp(r(`public/aarti/${slug}-bg.webp`)).resize(SW, SH).toBuffer()
  const god = await sharp(r(`public/aarti/${slug}-deity.webp`)).resize(Math.round(SW * 0.84), Math.round(SH * 0.72), { fit: "contain", position: "bottom", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer()
  const painting = await sharp(scene).composite([{ input: god, left: Math.round(SW * 0.08), top: Math.round(SH * 0.18) }]).png().toBuffer()
  const mirror = await sharp(scene).flop().modulate({ brightness: 0.6 }).toBuffer()
  const CW = SW * 3
  const fill = await sharp(r(`public/aarti/${slug}-bg.webp`)).resize(CW, SH, { fit: "cover" }).blur(28).modulate({ brightness: 0.5 }).toBuffer()
  const edge = Buffer.from(`<svg width="${SW}" height="${SH}"><defs><linearGradient id="e"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.08" stop-color="#fff"/><stop offset="0.92" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#e)"/></svg>`)
  const soft = await sharp(painting).composite([{ input: edge, blend: "dest-in" }]).png().toBuffer()
  const wide = await sharp(fill).composite([{ input: mirror, left: 0, top: 0 }, { input: mirror, left: SW * 2, top: 0 }, { input: soft, left: SW, top: 0 }]).png().toBuffer()
  // window: horizontally centred; vertically from the crown to the lap
  // close-up (zoom > 1.4): crown sits just below the logo pill
  const top = zoom > 1.4 ? Math.round(SH * 0.18) - 128 : Math.round(SH * 0.14)
  return sharp(wide).extract({ left: Math.round(SW * 1.5 - W / 2), top, width: W, height: H }).png().toBuffer()
}

const pill = await logoPill()
const pillPos = { left: Math.round((W - 352) / 2), top: 26 }

// 1) site default
const homam = await sharp(r(".blog-images-raw/homam-vs-puja.png")).resize(W, H, { fit: "cover", position: "centre" }).toBuffer()
const def = await sharp(homam).composite([{ input: textBlock(["Temple poojas and Vedic homams,", "performed in your family's name"], { size: 50, sub: "PRASADAM DELIVERED WORLDWIDE" }) }, { input: pill, ...pillPos }]).png().toBuffer()
await save(def, "src/app/opengraph-image.jpg")
await save(def, "src/app/twitter-image.jpg")

// 2) aarti
const DEITIES = [["durga", "Navaratri Durga Aarti"], ["shirdi-sai-baba", "Shirdi Sai Baba Aarti"], ["mahalakshmi", "Friday Mahalakshmi Pooja"]]
for (const [slug, title] of DEITIES) {
  const sc = await deityScene(slug, 1.55)
  await save(await sharp(sc).composite([{ input: textBlock([title], { size: 54, sub: "DIGITAL AARTI · JOIN FROM WHEREVER YOU ARE" }) }, { input: pill, ...pillPos }]).png().toBuffer(), `public/aarti/og-${slug}.jpg`)
}
// index: the three paintings side by side
const tiles = await Promise.all(DEITIES.map(async ([slug]) => sharp(await deityScene(slug)).extract({ left: 400, top: 0, width: 400, height: H }).toBuffer()))
const tri = await sharp({ create: { width: W, height: H, channels: 3, background: "#1a0f08" } }).composite(tiles.map((t, i) => ({ input: t, left: i * 400, top: 0 }))).png().toBuffer()
await save(await sharp(tri).composite([{ input: textBlock(["Digital Aarti"], { size: 60, sub: "LIGHT A LAMP · OFFER FLOWERS · PLACE YOUR PRAYER" }) }, { input: pill, ...pillPos }]).png().toBuffer(), "public/aarti/og-index.jpg")
