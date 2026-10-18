"use client"

// Digital Aarti experience (one deity). HTML5 layers + one <canvas> for light and particles + Web Audio.
// Layers (back → front): sanctum background, deity murti, canvas (flame glow, petals, embers), vignette,
// UI (top bar, offering dock, completion card). Depth comes from moving the layers by different amounts
// with phone tilt (DeviceOrientation) or the mouse. No 3D engine, no recordings, ~1 MB of art per deity.

import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { Deity } from "@lib/data/aarti"
import { nextAarti } from "@lib/data/aarti"
import { TempleAudio } from "../lib/sounds"

type Step = "bell" | "flowers" | "aarti" | "coconut"
type Petal = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; life: number; hue: number; size: number }
type Ember = { x: number; y: number; vy: number; life: number }

const AARTI_ROUNDS = 3 // full circles around the deity to complete the aarti

export default function AartiExperience({ deity }: { deity: Deity }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const deityRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<TempleAudio | null>(null)

  const [started, setStarted] = useState(false)
  const [muted, setMuted] = useState(false)
  const [done, setDone] = useState<Record<Step, boolean>>({ bell: false, flowers: false, aarti: false, coconut: false })
  const [aartiOn, setAartiOn] = useState(false)
  const [rounds, setRounds] = useState(0)
  const [coconutPhase, setCoconutPhase] = useState<"idle" | "whole" | "broken">("idle")
  const [showCard, setShowCard] = useState(false)
  const [nextLabel, setNextLabel] = useState("")

  // Mutable animation state (kept out of React to avoid re-rendering every frame)
  const anim = useRef({
    tiltX: 0, tiltY: 0, targetX: 0, targetY: 0,
    plate: { x: 0, y: 0, active: false }, angleSum: 0, lastAngle: null as number | null,
    petals: [] as Petal[], embers: [] as Ember[], glow: 0, glowTarget: 0, w: 0, h: 0,
  })

  // ── Next aarti countdown (client only, avoids server/client time mismatch) ──
  useEffect(() => {
    const tick = () => {
      const n = nextAarti(deity)
      if (!n) return setNextLabel("")
      const mins = Math.round((n.at.getTime() - Date.now()) / 60000)
      if (mins <= 0) setNextLabel(`${n.slot.name} is happening now`)
      else {
        const h = Math.floor(mins / 60)
        const m = mins % 60
        const days = Math.floor(h / 24)
        const local = n.at.toLocaleString([], days ? { weekday: "long", hour: "numeric", minute: "2-digit" } : { hour: "numeric", minute: "2-digit" })
        const when = days ? `in ${days} day${days > 1 ? "s" : ""}` : `in ${h ? `${h}h ` : ""}${m}m`
        setNextLabel(`${n.slot.name} ${when} · ${local} your time`)
      }
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [deity])

  // ── Canvas loop: tilt smoothing, flame glow, petals, embers ──
  useEffect(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (!canvas || !stage) return
    const ctx = canvas.getContext("2d")!
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let raf = 0

    const resize = () => {
      const r = stage.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = r.width * dpr
      canvas.height = r.height * dpr
      canvas.style.width = `${r.width}px`
      canvas.style.height = `${r.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      anim.current.w = r.width
      anim.current.h = r.height
      if (!anim.current.plate.active) {
        anim.current.plate.x = r.width / 2
        anim.current.plate.y = r.height * 0.78
      }
    }
    resize()
    window.addEventListener("resize", resize)

    const frame = (t: number) => {
      const a = anim.current
      const { w, h } = a
      // depth: smooth the tilt and move the layers by different amounts
      if (!reduced) {
        a.tiltX += (a.targetX - a.tiltX) * 0.08
        a.tiltY += (a.targetY - a.tiltY) * 0.08
        if (bgRef.current) bgRef.current.style.transform = `translate3d(${a.tiltX * -8}px, ${a.tiltY * -6}px, 0) scale(1.08)`
        if (deityRef.current) deityRef.current.style.transform = `translate3d(calc(-50% + ${a.tiltX * 10}px), ${a.tiltY * 6}px, 0)`
      }
      ctx.clearRect(0, 0, w, h)

      // ambient lamp breathing + aarti glow on the deity
      a.glow += (a.glowTarget - a.glow) * 0.05
      const breathe = 0.5 + 0.5 * Math.sin(t / 1400)
      const g = ctx.createRadialGradient(w / 2, h * 0.5, 10, w / 2, h * 0.5, Math.max(w, h) * 0.55)
      g.addColorStop(0, `rgba(255,190,90,${0.08 + 0.05 * breathe + a.glow * 0.22})`)
      g.addColorStop(1, "rgba(255,190,90,0)")
      ctx.globalCompositeOperation = "lighter"
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      // aarti plate + flame
      if (aartiOnRef.current) {
        const { x, y } = a.plate
        const flick = 1 + 0.12 * Math.sin(t / 60) + 0.06 * Math.sin(t / 23)
        const halo = ctx.createRadialGradient(x, y - 18, 2, x, y - 18, 120 * flick)
        halo.addColorStop(0, "rgba(255,200,110,0.55)")
        halo.addColorStop(0.4, "rgba(255,150,60,0.18)")
        halo.addColorStop(1, "rgba(255,150,60,0)")
        ctx.fillStyle = halo
        ctx.beginPath()
        ctx.arc(x, y - 18, 130 * flick, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalCompositeOperation = "source-over"
        // brass plate
        const plate = ctx.createLinearGradient(x - 34, y, x + 34, y)
        plate.addColorStop(0, "#8a5a1c")
        plate.addColorStop(0.5, "#e7bf63")
        plate.addColorStop(1, "#8a5a1c")
        ctx.fillStyle = plate
        ctx.beginPath()
        ctx.ellipse(x, y, 36, 11, 0, 0, Math.PI * 2)
        ctx.fill()
        // flame
        ctx.globalCompositeOperation = "lighter"
        const fh = 26 * flick
        const flame = ctx.createRadialGradient(x, y - fh * 0.6, 1, x, y - fh * 0.6, fh)
        flame.addColorStop(0, "rgba(255,255,220,0.95)")
        flame.addColorStop(0.35, "rgba(255,190,80,0.85)")
        flame.addColorStop(1, "rgba(255,90,20,0)")
        ctx.fillStyle = flame
        ctx.beginPath()
        ctx.ellipse(x, y - fh * 0.55, fh * 0.42, fh, 0, 0, Math.PI * 2)
        ctx.fill()
        if (Math.random() < 0.35) a.embers.push({ x: x + (Math.random() - 0.5) * 10, y: y - fh, vy: -0.6 - Math.random(), life: 1 })
      }

      // embers
      ctx.globalCompositeOperation = "lighter"
      a.embers = a.embers.filter((e) => e.life > 0)
      for (const e of a.embers) {
        e.y += e.vy
        e.x += Math.sin((e.y + t / 10) / 20) * 0.3
        e.life -= 0.015
        ctx.fillStyle = `rgba(255,180,90,${e.life * 0.8})`
        ctx.beginPath()
        ctx.arc(e.x, e.y, 1.6, 0, Math.PI * 2)
        ctx.fill()
      }

      // petals
      ctx.globalCompositeOperation = "source-over"
      a.petals = a.petals.filter((p) => p.life > 0)
      for (const p of a.petals) {
        p.vy = Math.min(p.vy + 0.02, 1.6)
        p.x += p.vx + Math.sin((p.y + p.size * 40) / 30) * 0.6
        p.y += p.vy
        p.rot += p.vr
        if (p.y > h * 0.86) {
          p.vy = 0
          p.vx = 0
          p.vr = 0
          p.life -= 0.006
        }
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.min(1, p.life)
        ctx.fillStyle = `hsl(${p.hue}, 85%, 55%)`
        ctx.beginPath()
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [])

  const aartiOnRef = useRef(false)
  useEffect(() => {
    aartiOnRef.current = aartiOn
  }, [aartiOn])

  // ── Tilt (phones) / mouse (desktop) for depth ──
  useEffect(() => {
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      anim.current.targetX = Math.max(-1, Math.min(1, e.gamma / 25))
      anim.current.targetY = Math.max(-1, Math.min(1, (e.beta - 45) / 25))
    }
    const onMouse = (e: MouseEvent) => {
      anim.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2
      anim.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener("deviceorientation", onOrient)
    window.addEventListener("mousemove", onMouse)
    return () => {
      window.removeEventListener("deviceorientation", onOrient)
      window.removeEventListener("mousemove", onMouse)
    }
  }, [])

  useEffect(() => () => audioRef.current?.close(), [])

  const begin = async () => {
    // iOS needs explicit permission for motion; ignore if denied (mouse/no-depth fallback)
    try {
      const DOE = (window as any).DeviceOrientationEvent
      if (DOE && typeof DOE.requestPermission === "function") await DOE.requestPermission()
    } catch {}
    try {
      audioRef.current = new TempleAudio()
      audioRef.current.startDrone()
      audioRef.current.conch()
    } catch {}
    setStarted(true)
  }

  const mark = useCallback((s: Step) => setDone((d) => ({ ...d, [s]: true })), [])

  const ringBell = () => {
    audioRef.current?.bell(830 + Math.random() * 40)
    if ("vibrate" in navigator) navigator.vibrate?.(30)
    anim.current.glowTarget = Math.min(1, anim.current.glowTarget + 0.15)
    setTimeout(() => (anim.current.glowTarget = Math.max(0, anim.current.glowTarget - 0.15)), 900)
    mark("bell")
  }

  const offerFlowers = () => {
    const { w } = anim.current
    for (let i = 0; i < 46; i++) {
      anim.current.petals.push({
        x: w * 0.2 + Math.random() * w * 0.6, y: -20 - Math.random() * 200, vx: (Math.random() - 0.5) * 0.6, vy: 0.4 + Math.random(),
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.08, life: 3, hue: Math.random() < 0.6 ? 32 + Math.random() * 14 : 350 + Math.random() * 10, size: 4 + Math.random() * 4,
      })
    }
    audioRef.current?.bell(1100)
    mark("flowers")
  }

  const startAarti = () => {
    setAartiOn(true)
    setRounds(0)
    anim.current.angleSum = 0
    anim.current.lastAngle = null
  }

  const breakCoconut = () => {
    setCoconutPhase("whole")
    setTimeout(() => {
      audioRef.current?.coconut()
      if ("vibrate" in navigator) navigator.vibrate?.([20, 40, 60])
      setCoconutPhase("broken")
      mark("coconut")
    }, 650)
    setTimeout(() => setCoconutPhase("idle"), 2600)
  }

  // Wave the plate in circles around the deity (finger or mouse drag on the stage).
  const onPointer = (e: React.PointerEvent) => {
    if (!aartiOn) return
    const r = stageRef.current!.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const a = anim.current
    a.plate = { x, y, active: true }
    const cx = r.width / 2
    const cy = r.height * 0.52
    const ang = Math.atan2(y - cy, x - cx)
    if (a.lastAngle != null) {
      let d = ang - a.lastAngle
      if (d > Math.PI) d -= Math.PI * 2
      if (d < -Math.PI) d += Math.PI * 2
      a.angleSum += Math.abs(d)
      const r2 = Math.floor(a.angleSum / (Math.PI * 2))
      if (r2 !== rounds) {
        setRounds(r2)
        if (r2 > 0) audioRef.current?.bell(830)
        a.glowTarget = Math.min(1, r2 / AARTI_ROUNDS)
        if (r2 >= AARTI_ROUNDS) finishAarti()
      }
    }
    a.lastAngle = ang
  }

  const finishAarti = () => {
    setAartiOn(false)
    anim.current.plate.active = false
    anim.current.glowTarget = 0.6
    audioRef.current?.conch()
    mark("aarti")
    setTimeout(() => setShowCard(true), 1400)
  }

  const toggleMute = () => {
    const m = !muted
    setMuted(m)
    audioRef.current?.setMuted(m)
  }

  const nextStep: Step | null = !done.bell ? "bell" : !done.flowers ? "flowers" : !done.aarti ? "aarti" : !done.coconut ? "coconut" : null
  const shareText = `🙏 I joined the ${deity.title} today on PariharaOnline. ${deity.prayerLine ?? ""}\n${typeof window !== "undefined" ? window.location.href.split("?")[0] : ""}`

  return (
    <div
      ref={stageRef}
      className="aarti-stage"
      onPointerMove={onPointer}
      onPointerDown={onPointer}
      style={{ touchAction: aartiOn ? "none" : "auto" }} // stop the page scrolling while waving the aarti
    >
      <div ref={bgRef} className="aarti-layer aarti-bg">
        <Image src={`/aarti/${deity.slug}-bg.webp`} alt="" fill priority sizes="100vw" className="object-cover" />
      </div>
      <div ref={deityRef} className="aarti-deity">
        <Image src={`/aarti/${deity.slug}-deity.webp`} alt={deity.name} fill priority sizes="(max-width: 768px) 90vw, 520px" className="object-contain object-bottom" />
      </div>
      <canvas ref={canvasRef} className="aarti-canvas" aria-hidden />
      <div className="aarti-vignette" aria-hidden />

      {/* Coconut */}
      {coconutPhase !== "idle" && (
        <div className={`aarti-coconut ${coconutPhase}`} aria-hidden>
          <span className="half left" />
          <span className="half right" />
        </div>
      )}

      {/* Top bar */}
      <div className="aarti-top">
        <div>
          <p className="aarti-eyebrow">{deity.place}</p>
          <h1 className="aarti-title">{deity.title}</h1>
          {nextLabel && <p className="aarti-next">🪔 {nextLabel}</p>}
        </div>
        {started && (
          <button type="button" className="aarti-icon-btn" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
            {muted ? "🔇" : "🔊"}
          </button>
        )}
      </div>

      {/* Aarti guidance */}
      {aartiOn && (
        <div className="aarti-hint">
          Move your finger in circles around {deity.name} to wave the aarti · {Math.min(rounds, AARTI_ROUNDS)}/{AARTI_ROUNDS}
        </div>
      )}

      {/* Intro */}
      {!started && (
        <div className="aarti-intro">
          <p className="aarti-intro-line">{deity.tagline}</p>
          <button type="button" className="aarti-begin" onClick={begin}>
            Begin darshan
          </button>
          <p className="aarti-intro-small">Sound on for the bell and conch</p>
        </div>
      )}

      {/* Offering dock */}
      {started && !showCard && (
        <div className="aarti-dock">
          {([
            ["bell", "🔔", "Ring bell", ringBell],
            ["flowers", "🌸", "Offer flowers", offerFlowers],
            ["aarti", "🪔", aartiOn ? "Waving…" : "Aarti", startAarti],
            ["coconut", "🥥", "Coconut", breakCoconut],
          ] as [Step, string, string, () => void][]).map(([k, icon, label, fn]) => (
            <button
              key={k}
              type="button"
              onClick={fn}
              className={`aarti-dock-btn${nextStep === k ? " next" : ""}${done[k] ? " done" : ""}`}
            >
              <span className="aarti-dock-icon">{icon}</span>
              <span className="aarti-dock-label">{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Completion */}
      {showCard && (
        <div className="aarti-card" role="dialog" aria-label="Aarti complete">
          <p className="aarti-card-om">🙏</p>
          <h2 className="aarti-card-title">Your aarti is complete</h2>
          {deity.prayerLine && <p className="aarti-card-prayer">{deity.prayerLine}</p>}
          <p className="aarti-card-text">{deity.blessing}</p>
          <a
            className="aarti-card-share"
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
          >
            Share with family on WhatsApp
          </a>
          <div className="aarti-card-links">
            {deity.offerings.map((o) => (
              <LocalizedClientLink key={o.handle} href={`/products/${o.handle}`} className="aarti-card-link">
                {o.label} →
              </LocalizedClientLink>
            ))}
          </div>
          <button type="button" className="aarti-card-stay" onClick={() => setShowCard(false)}>
            Stay for darshan
          </button>
        </div>
      )}
    </div>
  )
}
