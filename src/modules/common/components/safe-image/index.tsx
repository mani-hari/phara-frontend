import Image from "next/image"

// Product photo frame that never crops the subject. The frame is 3:2 (most product images are 3:2,
// so they fill it exactly). Any other shape is shown whole ("contain"), centred over a blurred,
// enlarged copy of itself, so the frame stays full without cutting off heads or showing bare bars.
export default function SafeImage({
  src,
  alt,
  ratio = "3 / 2",
  radius = 14,
  sizes = "(max-width: 1024px) 100vw, 760px",
  priority = false,
}: {
  src: string
  alt: string
  ratio?: string
  radius?: number
  sizes?: string
  priority?: boolean
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: ratio,
        borderRadius: radius,
        overflow: "hidden",
        background: "var(--paper-2)",
      }}
    >
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        sizes={sizes}
        className="object-cover"
        style={{ filter: "blur(22px) saturate(1.1)", transform: "scale(1.15)", opacity: 0.55 }}
      />
      <Image src={src} alt={alt} fill sizes={sizes} className="object-contain" priority={priority} />
    </div>
  )
}
