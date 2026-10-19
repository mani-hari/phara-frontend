// Profile picture + covers for PariharaOnline's Facebook, Instagram and YouTube (house style; logo emblem).
// Output: marketing/social-kit/
import sharp from "sharp"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const r = (p) => path.join(ROOT, p)
const OUT = r("marketing/social-kit")
await fs.mkdir(OUT, { recursive: true })

// emblem only: the left 82×84 of logo.svg
const svg = await fs.readFile(r("public/logo.svg"), "utf8")
const emblemSvg = svg.replace(/<svg[^>]*>/, (m) => m.replace(/width="[^"]*"/, 'width="820"').replace(/height="[^"]*"/, 'height="840"').replace(/viewBox="[^"]*"/, 'viewBox="0 0 82 84"'))
const emblem = (size) => sharp(Buffer.from(emblemSvg)).resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()

// 1) profile picture 1080×1080: emblem on warm cream (shown as a circle on all three platforms)
const cream = { r: 250, g: 246, b: 238 }
await sharp({ create: { width: 1080, height: 1080, channels: 3, background: cream } })
  .composite([{ input: await emblem(700), gravity: "centre" }])
  .png().toFile(path.join(OUT, "profile-1080.png"))

const esc = (s) => s.replace(/&/g, "&amp;")
const wordmark = await sharp(r("public/logo-2x.png")).resize(560).toBuffer()
const pill = async (w, h) => {
  const bg = Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${h / 2}" fill="#faf6ee" fill-opacity="0.95"/></svg>`)
  const lw = Math.round(w * 0.82)
  return sharp(bg).composite([{ input: await sharp(r("public/logo-2x.png")).resize(lw).toBuffer(), gravity: "centre" }]).png().toBuffer()
}
const line = (w, h, text, y, size) => Buffer.from(`<svg width="${w}" height="${h}"><defs><filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.6"/></filter></defs><text x="${w / 2}" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-size="${size}" fill="#fffaf0" filter="url(#s)">${esc(text)}</text></svg>`)
const shade = (w, h) => Buffer.from(`<svg width="${w}" height="${h}"><rect width="100%" height="100%" fill="#140a04" fill-opacity="0.28"/></svg>`)
const painting = r(".blog-images-raw/homam-vs-puja.png")

// 2) Facebook cover 1640×624 (phones crop the sides: keep content in the middle ~1100 px)
{
  const W = 1640, H = 624
  const p = await pill(520, 130)
  await sharp(painting).resize(W, H, { fit: "cover", position: "centre" })
    .composite([{ input: shade(W, H) }, { input: p, left: Math.round((W - 520) / 2), top: 170 }, { input: line(W, H, "Temple poojas and Vedic homams, performed in your family's name", 380, 40) }, { input: line(W, H, "Prasadam delivered worldwide · pariharaonline.com", 432, 28) }])
    .jpeg({ quality: 86 }).toFile(path.join(OUT, "facebook-cover-1640x624.jpg"))
}
// 3) YouTube banner 2560×1440 (safe area for all devices: centre 1546×423)
{
  const W = 2560, H = 1440
  const p = await pill(640, 160)
  await sharp(painting).resize(W, H, { fit: "cover", position: "centre" })
    .composite([{ input: shade(W, H) }, { input: p, left: Math.round((W - 640) / 2), top: 560 }, { input: line(W, H, "Temple poojas and Vedic homams, performed in your family's name", 800, 50) }, { input: line(W, H, "Homam films · mantras · festival guides", 862, 36) }])
    .jpeg({ quality: 86 }).toFile(path.join(OUT, "youtube-banner-2560x1440.jpg"))
}
for (const f of await fs.readdir(OUT)) console.log(f, Math.round((await fs.stat(path.join(OUT, f))).size / 1024), "KB")
