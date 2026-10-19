import sharp from "sharp"

// Product link previews: WhatsApp often won't show WebP preview images, and Medusa thumbnails are WebP.
// This serves them as a 1200×630 JPEG. Only images from our Medusa storage host, so it is not an open proxy.
const ALLOWED = /^https:\/\/s3\.us-east-1\.amazonaws\.com\/medusajs\.cloud-data-prod-use1-[a-z0-9-]+\//

export async function GET(req: Request) {
  const src = new URL(req.url).searchParams.get("src") || ""
  if (!ALLOWED.test(src)) return new Response("Not allowed", { status: 400 })
  const res = await fetch(src, { next: { revalidate: 86400 } })
  if (!res.ok) return new Response("Not found", { status: 404 })
  const input = Buffer.from(await res.arrayBuffer())
  // whole photo on a soft blurred copy of itself (never crop a deity or a jar)
  const bg = await sharp(input).resize(1200, 630, { fit: "cover" }).blur(30).modulate({ brightness: 0.85 }).toBuffer()
  const fg = await sharp(input).resize(1200, 630, { fit: "inside" }).toBuffer()
  const out = await sharp(bg).composite([{ input: fg, gravity: "centre" }]).jpeg({ quality: 82, mozjpeg: true }).toBuffer()
  return new Response(new Uint8Array(out), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" },
  })
}
