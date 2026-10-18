// Builds the shareable "blessing card" image (1080×1350, Instagram/WhatsApp portrait) from the deity art,
// in the browser with a canvas, so nothing is uploaded. Used by "Send a blessing".
import type { Deity } from "@lib/data/aarti"

export const OCCASIONS: { key: string; label: string; line: (to: string) => string }[] = [
  { key: "birthday", label: "Birthday", line: (to) => `Wishing you a blessed birthday, ${to}` },
  { key: "anniversary", label: "Anniversary", line: (to) => `Blessings on your anniversary, ${to}` },
  { key: "exam", label: "Exams & studies", line: (to) => `All the very best for your exams, ${to}` },
  { key: "new", label: "A new beginning", line: (to) => `Blessings for your new beginning, ${to}` },
  { key: "health", label: "Good health", line: (to) => `Praying for your health and strength, ${to}` },
  { key: "blessings", label: "Just blessings", line: (to) => `Sending you divine blessings, ${to}` },
]

export const occasionLine = (key: string, to: string) => (OCCASIONS.find((o) => o.key === key) || OCCASIONS[5]).line(to)

const loadImg = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })

export async function makeBlessingCard(opts: { deity: Deity; to: string; from: string; occasion: string; note?: string }) {
  const { deity, to, from, occasion, note } = opts
  const W = 1080
  const H = 1350
  const c = document.createElement("canvas")
  c.width = W
  c.height = H
  const ctx = c.getContext("2d")!
  const [bg, god] = await Promise.all([loadImg(`/aarti/${deity.slug}-bg.webp`), loadImg(`/aarti/${deity.slug}-deity.webp`)])

  // background, cover
  const s = Math.max(W / bg.width, H / bg.height)
  ctx.drawImage(bg, (W - bg.width * s) / 2, (H - bg.height * s) / 2, bg.width * s, bg.height * s)
  // halo
  const halo = ctx.createRadialGradient(W / 2, H * 0.42, 20, W / 2, H * 0.42, 520)
  halo.addColorStop(0, `rgba(${deity.theme.halo},0.55)`)
  halo.addColorStop(1, `rgba(${deity.theme.halo},0)`)
  ctx.fillStyle = halo
  ctx.fillRect(0, 0, W, H)
  // deity
  const gh = H * 0.62
  const gw = (god.width / god.height) * gh
  ctx.drawImage(god, (W - gw) / 2, H * 0.1, gw, gh)
  // soft ivory panel for the words
  const grad = ctx.createLinearGradient(0, H * 0.6, 0, H)
  grad.addColorStop(0, "rgba(252,246,234,0)")
  grad.addColorStop(0.28, "rgba(252,246,234,0.92)")
  grad.addColorStop(1, "rgba(252,246,234,0.98)")
  ctx.fillStyle = grad
  ctx.fillRect(0, H * 0.6, W, H * 0.4)

  ctx.textAlign = "center"
  // Measure the words first, then place the block so it always ends above the site name (no overlaps).
  const lines = (text: string, font: string, maxW: number) => {
    ctx.font = font
    const out: string[] = []
    let line = ""
    for (const w of text.split(/\s+/)) {
      const test = line ? `${line} ${w}` : w
      if (ctx.measureText(test).width > maxW && line) {
        out.push(line)
        line = w
      } else line = test
    }
    if (line) out.push(line)
    return out
  }
  const F_PRAYER = "600 30px Georgia, 'DM Serif Display', serif"
  const F_WISH = "56px Georgia, 'DM Serif Display', serif"
  const F_NOTE = "italic 34px Georgia, serif"
  const F_FROM = "32px Georgia, serif"
  const wish = lines(occasionLine(occasion, to), F_WISH, W - 160)
  const noteLines = note?.trim() ? lines(`“${note.trim()}”`, F_NOTE, W - 200) : []
  const blocks: { text: string; font: string; color: string; lh: number; gapBefore: number }[] = [
    { text: (deity.prayerLine || deity.name).toUpperCase(), font: F_PRAYER, color: "#9a6a28", lh: 40, gapBefore: 0 },
    ...wish.map((t, i) => ({ text: t, font: F_WISH, color: "#1a1410", lh: 66, gapBefore: i ? 0 : 34 })),
    ...noteLines.map((t, i) => ({ text: t, font: F_NOTE, color: "#4a3f36", lh: 46, gapBefore: i ? 0 : 22 })),
    { text: `With ${deity.name}'s blessings, from ${from}`, font: F_FROM, color: "#6b5d52", lh: 42, gapBefore: 26 },
  ]
  const total = blocks.reduce((a, b) => a + b.gapBefore + b.lh, 0)
  let y = Math.min(H * 0.74, H - 84 - total) + 30
  for (const b of blocks) {
    y += b.gapBefore
    ctx.font = b.font
    ctx.fillStyle = b.color
    ctx.fillText(b.text, W / 2, y)
    y += b.lh
  }
  ctx.fillStyle = "#b6442e"
  ctx.font = "600 24px Helvetica, Arial, sans-serif"
  ctx.fillText("pariharaonline.com", W / 2, H - 34)

  return await new Promise<Blob>((res) => c.toBlob((b) => res(b!), "image/jpeg", 0.9))
}
