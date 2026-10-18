// Email hero for the Digital Aarti announcement: Maa Durga in her sanctum with the aarti flame circling,
// composed like the site's wide-screen aarti (painting centred, its edges reflected either side).
// Frames with sharp, GIF with ffmpeg (palette). Output: public/email/digital-aarti-durga.gif
import sharp from "sharp"
import { execFileSync } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const TMP = process.argv[2] || path.join(ROOT, ".scratch-aarti", "gif")
const OUT = path.join(ROOT, "public", "email", "digital-aarti-durga.gif")
const W = 1200, H = 900, N = 40 // 40 frames at 12 fps ≈ one slow circle of the aarti
await fs.mkdir(TMP, { recursive: true })

const bgSrc = path.join(ROOT, "public/aarti/durga-bg.webp")
const godSrc = path.join(ROOT, "public/aarti/durga-deity.webp")
const SH = Math.round(H * 1.12), SW = Math.round((SH * 2) / 3) // scene slightly taller than the frame: trims the top drape
const sceneTop = -Math.round(H * 0.04)
const sx = Math.round((W - SW) / 2)

// base: blurred warm fill + reflected edges + the painting + the deity (as on the site)
const scene = await sharp(bgSrc).resize(SW, SH).toBuffer()
const mirror = await sharp(scene).flop().modulate({ brightness: 0.62 }).toBuffer()
const fade = (dir) => Buffer.from(`<svg width="${SW}" height="${SH}"><defs><linearGradient id="g" x1="${dir < 0 ? 1 : 0}" x2="${dir < 0 ? 0 : 1}" y1="0" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="0.22" stop-color="#fff"/><stop offset="0.6" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`)
const side = async (dir) => sharp(mirror).composite([{ input: fade(dir), blend: "dest-in" }]).png().toBuffer()
const edgeMask = Buffer.from(`<svg width="${SW}" height="${SH}"><defs><linearGradient id="e"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.07" stop-color="#fff"/><stop offset="0.93" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#e)"/></svg>`)
const sceneMasked = await sharp(scene).composite([{ input: edgeMask, blend: "dest-in" }]).png().toBuffer()
// deity box inside the scene: left/right 8%, top 18%, bottom 10% (same as the page), contained at the bottom
const bw = Math.round(SW * 0.84), bh = Math.round(SH * 0.72)
const god = await sharp(godSrc).resize(bw, bh, { fit: "contain", position: "bottom", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer()
// compose on a canvas wide enough for the reflections, then cut the W×H window
const CW = SW * 3, CH = SH
const wideFill = await sharp(bgSrc).resize(CW, CH, { fit: "cover" }).blur(28).modulate({ brightness: 0.5, saturation: 0.85 }).toBuffer()
const wide = await sharp(wideFill)
  .composite([
    { input: await side(-1), left: 0, top: 0 },
    { input: await side(1), left: SW * 2, top: 0 },
    { input: sceneMasked, left: SW, top: 0 },
    { input: god, left: SW + Math.round(SW * 0.08), top: Math.round(SH * 0.18) },
  ])
  .png()
  .toBuffer()
const base = await sharp(wide).extract({ left: Math.round(SW * 1.5 - W / 2), top: -sceneTop, width: W, height: H }).png().toBuffer()
// soft vignette + bottom shade so the diya flames read
const vignette = Buffer.from(`<svg width="${W}" height="${H}"><defs><radialGradient id="v" cx="50%" cy="48%" r="70%"><stop offset="0.55" stop-color="#140a04" stop-opacity="0"/><stop offset="1" stop-color="#140a04" stop-opacity="0.6"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#v)"/></svg>`)

const cx = W / 2, cy = sceneTop + SH * 0.47, rx = 230, ry = 150
const pos = (a) => [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry + Math.sin(a * 2) * 8]
for (let i = 0; i < N; i++) {
  const a = -Math.PI / 2 + (i / N) * Math.PI * 2
  const [x, y] = pos(a)
  const flick = 1 + 0.08 * Math.sin(i * 1.7) + 0.05 * Math.sin(i * 3.1)
  let trail = ""
  for (let k = 1; k <= 10; k++) {
    const [tx, ty] = pos(a - k * 0.06)
    trail += `<circle cx="${tx}" cy="${ty - 22}" r="${9 - k * 0.7}" fill="#ffc878" opacity="${0.22 - k * 0.02}"/>`
  }
  const fh = 46 * flick
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs>
    <radialGradient id="glow"><stop offset="0" stop-color="#ffd68c" stop-opacity="0.55"/><stop offset="0.35" stop-color="#ffaa50" stop-opacity="0.18"/><stop offset="1" stop-color="#ffaa50" stop-opacity="0"/></radialGradient>
    <radialGradient id="fl" cx="50%" cy="65%" r="60%"><stop offset="0" stop-color="#fffbe6"/><stop offset="0.45" stop-color="#ffc45a"/><stop offset="1" stop-color="#f07828" stop-opacity="0"/></radialGradient>
    <linearGradient id="plate" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f3d38a"/><stop offset="1" stop-color="#8a5a1e"/></linearGradient>
  </defs>
  ${trail}
  <circle cx="${x}" cy="${y - 20}" r="${170 * flick}" fill="url(#glow)"/>
  <ellipse cx="${x}" cy="${y + 4}" rx="34" ry="8" fill="url(#plate)"/>
  <path d="M ${x} ${y - fh} Q ${x + 13} ${y - fh * 0.35} ${x} ${y} Q ${x - 13} ${y - fh * 0.35} ${x} ${y - fh} Z" fill="url(#fl)"/>
  </svg>`
  const frame = await sharp(base).composite([{ input: Buffer.from(svg), blend: "screen" }, { input: vignette }]).png().toBuffer()
  await sharp(frame).resize(600, 450).png().toFile(path.join(TMP, `f${String(i).padStart(3, "0")}.png`))
}
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-framerate", "12", "-i", path.join(TMP, "f%03d.png"),
  "-vf", "split[a][b];[a]palettegen=max_colors=128:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a", "-loop", "0", OUT])
const st = await fs.stat(OUT)
console.log(OUT, Math.round(st.size / 1024), "KB")
