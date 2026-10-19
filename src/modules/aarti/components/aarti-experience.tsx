"use client"

// Digital Aarti — an immersive darshan for one deity.
//
// Design intent (owner, 19 Oct 2026): graceful and divine, never tacky. The aarti PLAYS by itself (the
// recording + an aarti flame circling the deity) and the devotee joins in on top of it:
//   · ring the bell · offer flowers · light a diya (Durga) · take the aarti plate · break a coconut
//   · all controls live together in the dock (owner: discoverability), incl. blessing and sound
//   · offer a prayer: written on a paper chit that is placed at the deity's feet and stays there
//   · send a blessing: a birthday/anniversary/exam/health wish as a card shared on WhatsApp; the link opens
//     this darshan greeting the recipient by name (the viral loop)
// The paintings are kept as the owner approved them (warm, painterly), with nothing painted over them: the owner wants the paintings exactly as on the /aarti cover (no halo, rays or
// golden wash; tried and rejected 19 Oct). Only the aarti flame's own light. Slow motion; nothing bounces.
//
// Layers, back → front: sanctum (gentle tilt) · deity (tilt) · canvas (flame,
// trail, glow, motes, petals, sparks, ripples, coconut) · prayer chits · veil and UI.
// Prayers stay on the device (localStorage); nothing is sent to a server.

import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { Deity } from "@lib/data/aarti"
import { nextAarti } from "@lib/data/aarti"
import { track, withShareUtm } from "@lib/analytics"
import { TempleAudio } from "../lib/sounds"
import { OCCASIONS, makeBlessingCard, occasionLine } from "../lib/blessing-card"

type Petal = { x: number; y: number; vy: number; sway: number; phase: number; spin: number; rot: number; size: number; color: string; life: number; landed: boolean }
type Spark = { x: number; y: number; vx: number; vy: number; life: number; size: number }
type Mote = { x: number; y: number; vy: number; drift: number; size: number; tw: number }
type Ripple = { r: number; life: number }
type Lamp = { x: number; y: number; t: number; scale: number; seed: number }
type Chit = { id: number; text: string; placed: boolean }
type Sheet = null | "prayer" | "blessing"

const TAU = Math.PI * 2

export default function AartiExperience({ deity }: { deity: Deity }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const deityRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<TempleAudio | null>(null)

  const [entered, setEntered] = useState(false)
  const [veilGone, setVeilGone] = useState(false)
  const [muted, setMuted] = useState(false)
  const [holding, setHolding] = useState(false)
  const [closing, setClosing] = useState(false)
  const [nextLabel, setNextLabel] = useState("")
  const [hint, setHint] = useState("")
  const [sheet, setSheet] = useState<Sheet>(null)
  const [chits, setChits] = useState<Chit[]>([])
  const [prayerText, setPrayerText] = useState("")
  const [gift, setGift] = useState<{ for: string; from: string; o: string } | null>(null)
  const [bl, setBl] = useState({ to: "", from: "", occasion: "birthday", note: "" })
  const [blBusy, setBlBusy] = useState(false)

  const sim = useRef({
    w: 0, h: 0, t0: 0,
    tiltX: 0, tiltY: 0, targetX: 0, targetY: 0,
    angle: -Math.PI / 2, flame: { x: 0, y: 0 }, held: null as { x: number; y: number } | null, trail: [] as { x: number; y: number }[],
    performing: false, intensity: 0,
    petals: [] as Petal[], sparks: [] as Spark[], motes: [] as Mote[], ripples: [] as Ripple[],
    coconut: null as null | { t: number },
    lamps: [] as Lamp[], nextShower: 0,
  })

  // ── A blessing link opens the darshan greeting the recipient (…?for=Asha&from=Ravi&o=birthday) ──
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const f = q.get("for")
    if (f) setGift({ for: f.slice(0, 40), from: (q.get("from") || "").slice(0, 40), o: q.get("o") || "blessings" })
  }, [])

  // ── Next aarti time in the visitor's own time zone ──
  useEffect(() => {
    const tick = () => {
      const n = nextAarti(deity)
      if (!n) return setNextLabel("")
      const mins = Math.round((n.at.getTime() - Date.now()) / 60000)
      if (mins <= 0) return setNextLabel(`${n.slot.name} is being performed now`)
      const days = Math.floor(mins / 1440)
      const local = n.at.toLocaleString([], days ? { weekday: "long", hour: "numeric", minute: "2-digit" } : { hour: "numeric", minute: "2-digit" })
      setNextLabel(`Next: ${n.slot.name}, ${local} your time`)
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [deity])

  // ── Render loop ──
  useEffect(() => {
    const canvas = canvasRef.current!
    const stage = stageRef.current!
    const ctx = canvas.getContext("2d")!
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const s = sim.current
    const halo = deity.theme.halo
    let raf = 0

    const resize = () => {
      const r = stage.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = r.width * dpr
      canvas.height = r.height * dpr
      canvas.style.width = `${r.width}px`
      canvas.style.height = `${r.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      s.w = r.width
      s.h = r.height
      if (!s.motes.length)
        for (let i = 0; i < 18; i++)
          s.motes.push({ x: Math.random() * r.width, y: Math.random() * r.height, vy: 0.08 + Math.random() * 0.22, drift: Math.random() * TAU, size: 0.6 + Math.random() * 1.6, tw: Math.random() * TAU })
    }
    resize()
    window.addEventListener("resize", resize)
    s.t0 = performance.now()

    const drawPetal = (p: Petal) => {
      const flip = Math.cos(p.phase) // 3D tumble: turns edge-on and back
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.scale(Math.max(0.15, Math.abs(flip)), 1)
      ctx.globalAlpha = Math.min(1, p.life) * 0.95
      const g = ctx.createLinearGradient(0, -p.size, 0, p.size)
      g.addColorStop(0, p.color)
      g.addColorStop(1, shade(p.color, flip > 0 ? -0.18 : -0.32))
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(0, -p.size)
      ctx.bezierCurveTo(p.size * 0.85, -p.size * 0.5, p.size * 0.7, p.size * 0.7, 0, p.size)
      ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.7, -p.size * 0.85, -p.size * 0.5, 0, -p.size)
      ctx.fill()
      ctx.restore()
    }
    const star = (x: number, y: number, r: number, a: number) => {
      ctx.globalAlpha = a
      ctx.beginPath()
      ctx.moveTo(x, y - r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.quadraticCurveTo(x, y, x, y + r)
      ctx.quadraticCurveTo(x, y, x - r, y)
      ctx.quadraticCurveTo(x, y, x, y - r)
      ctx.fill()
    }

    const frame = (now: number) => {
      const t = now - s.t0
      const { w, h } = s
      const cx = w / 2
      const cy = h * 0.5

      if (!reduced) {
        s.tiltX += (s.targetX - s.tiltX) * 0.05
        s.tiltY += (s.targetY - s.tiltY) * 0.05
        const drift = Math.sin(t / 9000) * 0.5
        if (bgRef.current) bgRef.current.style.transform = `translate3d(${s.tiltX * -8 + drift * 4}px, ${s.tiltY * -5}px, 0) scale(1.04)`
        if (deityRef.current) deityRef.current.style.transform = `translate3d(${s.tiltX * 10}px, ${s.tiltY * 5}px, 0) scale(${1 + Math.sin(t / 4200) * 0.004})`
      }
      ctx.clearRect(0, 0, w, h)

      // the aarti: performs on its own (~10 s a circle); follows the devotee's finger while held
      if (s.performing) {
        const rx = Math.min(w * 0.3, 190)
        const ry = Math.min(h * 0.17, 150)
        let fx: number, fy: number
        if (s.held) {
          fx = s.held.x
          fy = s.held.y
        } else {
          s.angle += reduced ? 0.006 : 0.0105
          fx = cx + Math.cos(s.angle) * rx
          fy = cy + Math.sin(s.angle) * ry + Math.sin(s.angle * 2) * 8
        }
        const k = s.held ? 0.35 : 1
        s.flame.x += (fx - s.flame.x) * k
        s.flame.y += (fy - s.flame.y) * k
        s.intensity += (1 - s.intensity) * 0.01
        s.trail.push({ x: s.flame.x, y: s.flame.y })
        if (s.trail.length > 46) s.trail.shift()
      } else s.intensity *= 0.99

      // the passing flame warms the murti a little; nothing else glows (owner: the painting as it is)
      const near = s.performing ? 1 - Math.min(1, Math.hypot(s.flame.x - cx, s.flame.y - (cy - h * 0.12)) / (w * 0.45)) : 0
      ctx.globalCompositeOperation = "lighter"
      if (near > 0.01) {
        const g = ctx.createRadialGradient(cx, cy - h * 0.1, 10, cx, cy - h * 0.1, Math.max(w, h) * 0.4)
        g.addColorStop(0, `rgba(${halo},${s.intensity * near * 0.07})`)
        g.addColorStop(1, `rgba(${halo},0)`)
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      }

      // gold motes drifting upward
      ctx.fillStyle = "rgba(255,226,160,1)"
      for (const m of s.motes) {
        m.y -= m.vy
        m.x += Math.sin(t / 3000 + m.drift) * 0.15
        m.tw += 0.02
        if (m.y < -4) {
          m.y = h + 4
          m.x = Math.random() * w
        }
        ctx.globalAlpha = 0.12 + 0.18 * (0.5 + 0.5 * Math.sin(m.tw))
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.size, 0, TAU)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // aarti trail, flame and plate
      if (s.performing || s.intensity > 0.05) {
        for (let i = 1; i < s.trail.length; i++) {
          ctx.strokeStyle = `rgba(255,200,120,${(i / s.trail.length) * 0.22 * s.intensity})`
          ctx.lineWidth = 10 * (i / s.trail.length)
          ctx.lineCap = "round"
          ctx.beginPath()
          ctx.moveTo(s.trail[i - 1].x, s.trail[i - 1].y)
          ctx.lineTo(s.trail[i].x, s.trail[i].y)
          ctx.stroke()
        }
        const { x, y } = s.flame
        const flick = 1 + 0.1 * Math.sin(t / 70) + 0.05 * Math.sin(t / 27)
        const glow = ctx.createRadialGradient(x, y - 16, 2, x, y - 16, 150 * flick)
        glow.addColorStop(0, `rgba(255,214,140,${0.5 * s.intensity})`)
        glow.addColorStop(0.35, `rgba(255,170,80,${0.16 * s.intensity})`)
        glow.addColorStop(1, "rgba(255,170,80,0)")
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, y - 16, 150 * flick, 0, TAU)
        ctx.fill()
        ctx.globalCompositeOperation = "source-over"
        ctx.globalAlpha = Math.min(1, s.intensity * 1.4)
        const plate = ctx.createLinearGradient(x - 30, y, x + 30, y)
        plate.addColorStop(0, "#9a6a28")
        plate.addColorStop(0.5, "#f1d27a")
        plate.addColorStop(1, "#9a6a28")
        ctx.fillStyle = plate
        ctx.beginPath()
        ctx.ellipse(x, y + 4, 30, 8, 0, 0, TAU)
        ctx.fill()
        ctx.fillStyle = "#c79a45"
        ctx.beginPath()
        ctx.ellipse(x, y, 9, 4, 0, 0, TAU)
        ctx.fill()
        ctx.globalCompositeOperation = "lighter"
        const fh = 24 * flick
        const flame = ctx.createRadialGradient(x, y - fh * 0.55, 1, x, y - fh * 0.55, fh)
        flame.addColorStop(0, "rgba(255,255,235,0.95)")
        flame.addColorStop(0.3, "rgba(255,206,110,0.9)")
        flame.addColorStop(1, "rgba(255,110,30,0)")
        ctx.fillStyle = flame
        ctx.beginPath()
        ctx.ellipse(x, y - fh * 0.5, fh * 0.36, fh, Math.sin(t / 300) * 0.06, 0, TAU)
        ctx.fill()
        ctx.globalAlpha = 1
        if (Math.random() < 0.25 * s.intensity) s.sparks.push({ x: x + (Math.random() - 0.5) * 8, y: y - fh, vx: (Math.random() - 0.5) * 0.3, vy: -0.4 - Math.random() * 0.6, life: 1, size: 1.2 })
      }

      // bell ripples
      ctx.globalCompositeOperation = "lighter"
      s.ripples = s.ripples.filter((r) => r.life > 0)
      for (const r of s.ripples) {
        r.r += 2.2
        r.life -= 0.012
        ctx.strokeStyle = `rgba(255,220,150,${r.life * 0.35})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(cx, cy - h * 0.12, r.r, 0, TAU)
        ctx.stroke()
      }

      // glints
      ctx.fillStyle = "rgba(255,232,170,1)"
      s.sparks = s.sparks.filter((p) => p.life > 0)
      for (const p of s.sparks) {
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.012
        star(p.x, p.y, p.size * 2.2, Math.min(1, p.life) * 0.9)
      }
      ctx.globalAlpha = 1

      // petals
      ctx.globalCompositeOperation = "source-over"
      s.petals = s.petals.filter((p) => p.life > 0)
      for (const p of s.petals) {
        if (!p.landed) {
          p.y += p.vy
          p.x += Math.sin(p.phase * 0.5 + p.sway) * 0.55
          p.phase += p.spin
          p.rot += p.spin * 0.25
          if (p.y > h * 0.8) p.landed = true
        } else p.life -= 0.004
        drawPetal(p)
      }
      ctx.globalAlpha = 1

      // while the aarti is performed, a few flowers fall now and then (owner: "flowers falling from time to time")
      if (s.performing && !reduced) {
        if (!s.nextShower) s.nextShower = now + 9000
        else if (now > s.nextShower) {
          s.nextShower = now + 22000 + Math.random() * 16000
          const colors = deity.theme.petals
          for (let i = 0; i < 12; i++)
            s.petals.push({
              x: w * (0.22 + Math.random() * 0.56), y: -20 - Math.random() * h * 0.5, vy: 0.4 + Math.random() * 0.35,
              sway: Math.random() * TAU, phase: Math.random() * TAU, spin: 0.015 + Math.random() * 0.025, rot: Math.random() * TAU,
              size: 4.5 + Math.random() * 4, color: colors[Math.floor(Math.random() * colors.length)], life: 2, landed: false,
            })
          for (let i = 0; i < 6; i++) s.sparks.push({ x: w * (0.3 + Math.random() * 0.4), y: -10 - Math.random() * h * 0.3, vx: (Math.random() - 0.5) * 0.2, vy: 0.5 + Math.random() * 0.4, life: 1.6, size: 1.3 })
        }
      }

      // earthen diyas the devotee has lit at the deity's feet
      for (const l of s.lamps) {
        const k = (now - l.t) / 1000
        const appear = Math.min(1, k / 0.7)
        const lit = Math.min(1, Math.max(0, (k - 0.5) / 0.6))
        const S = l.scale
        ctx.globalCompositeOperation = "source-over"
        ctx.globalAlpha = appear
        const bowl = ctx.createLinearGradient(l.x, l.y - 6 * S, l.x, l.y + 9 * S)
        bowl.addColorStop(0, "#9a5228")
        bowl.addColorStop(1, "#3e1d0c")
        ctx.fillStyle = bowl
        ctx.beginPath()
        ctx.moveTo(l.x - 15 * S, l.y - 3 * S)
        ctx.quadraticCurveTo(l.x, l.y - 7 * S, l.x + 15 * S, l.y - 3 * S)
        ctx.quadraticCurveTo(l.x + 18 * S, l.y - 2 * S, l.x + 21 * S, l.y - 6 * S) // spout
        ctx.quadraticCurveTo(l.x + 16 * S, l.y + 9 * S, l.x, l.y + 9 * S)
        ctx.quadraticCurveTo(l.x - 14 * S, l.y + 9 * S, l.x - 15 * S, l.y - 3 * S)
        ctx.fill()
        ctx.fillStyle = "rgba(255,190,110,0.35)"
        ctx.beginPath()
        ctx.ellipse(l.x, l.y - 3.5 * S, 12 * S, 2.4 * S, 0, 0, TAU)
        ctx.fill()
        if (lit > 0) {
          const fx = l.x + 17 * S
          const fy = l.y - 7 * S
          const fl = (1 + 0.12 * Math.sin(t / 90 + l.seed) + 0.06 * Math.sin(t / 37 + l.seed * 2)) * lit
          ctx.globalCompositeOperation = "lighter"
          ctx.globalAlpha = 1
          const halo = ctx.createRadialGradient(fx, fy - 9 * S, 1, fx, fy - 9 * S, 30 * S * fl)
          halo.addColorStop(0, "rgba(255,190,110,0.3)")
          halo.addColorStop(1, "rgba(255,150,60,0)")
          ctx.fillStyle = halo
          ctx.beginPath()
          ctx.arc(fx, fy - 9 * S, 30 * S * fl, 0, TAU)
          ctx.fill()
          const fh = 15 * S * fl
          const g2 = ctx.createRadialGradient(fx, fy - fh * 0.35, 0.5, fx, fy - fh * 0.35, fh * 0.7)
          g2.addColorStop(0, "rgba(255,250,225,1)")
          g2.addColorStop(0.5, "rgba(255,196,90,0.95)")
          g2.addColorStop(1, "rgba(240,120,40,0)")
          ctx.fillStyle = g2
          ctx.beginPath()
          ctx.moveTo(fx, fy - fh)
          ctx.quadraticCurveTo(fx + 4.5 * S, fy - fh * 0.3, fx, fy)
          ctx.quadraticCurveTo(fx - 4.5 * S, fy - fh * 0.3, fx, fy - fh)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = "source-over"

      // coconut: a quiet split
      if (s.coconut) {
        const k = (now - s.coconut.t) / 1000
        const x = cx
        const y = h * 0.74
        const open = Math.min(1, Math.max(0, (k - 0.35) / 0.5))
        ctx.globalAlpha = k < 2.2 ? 1 : Math.max(0, 1 - (k - 2.2) / 0.8)
        for (const side of [-1, 1]) {
          ctx.save()
          ctx.translate(x + side * open * 18, y + open * 4)
          ctx.rotate(side * open * 0.5)
          const cg = ctx.createRadialGradient(side * -6, -8, 2, 0, 0, 30)
          cg.addColorStop(0, "#8a5a2b")
          cg.addColorStop(1, "#4a2c14")
          ctx.fillStyle = cg
          ctx.beginPath()
          ctx.ellipse(0, 0, 26, 30, 0, side < 0 ? Math.PI / 2 : -Math.PI / 2, side < 0 ? (3 * Math.PI) / 2 : Math.PI / 2)
          ctx.fill()
          if (open > 0.05) {
            ctx.fillStyle = "#f8f3e6"
            ctx.beginPath()
            ctx.ellipse(0, 0, 4 * open, 26, 0, 0, TAU)
            ctx.fill()
          }
          ctx.restore()
        }
        ctx.globalAlpha = 1
        if (k > 3) s.coconut = null
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [deity])

  // ── Depth from tilt (phones) and pointer (desktop) ──
  useEffect(() => {
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      sim.current.targetX = Math.max(-1, Math.min(1, e.gamma / 25))
      sim.current.targetY = Math.max(-1, Math.min(1, (e.beta - 45) / 25))
    }
    const onMouse = (e: MouseEvent) => {
      sim.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2
      sim.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener("deviceorientation", onOrient)
    window.addEventListener("mousemove", onMouse)
    return () => {
      window.removeEventListener("deviceorientation", onOrient)
      window.removeEventListener("mousemove", onMouse)
    }
  }, [])

  useEffect(() => () => audioRef.current?.close(), [])

  // GA: one event per thing a devotee does, so we can see what people actually use (aarti_action.action)
  const act = (action: string, extra: Record<string, unknown> = {}) => track("aarti_action", { action, deity: deity.slug, ...extra })

  const flash = (msg: string, ms = 3600) => {
    setHint(msg)
    window.setTimeout(() => setHint((m) => (m === msg ? "" : m)), ms)
  }

  const enter = async () => {
    try {
      const DOE = (window as any).DeviceOrientationEvent
      if (DOE && typeof DOE.requestPermission === "function") await DOE.requestPermission()
    } catch {}
    try {
      const a = new TempleAudio()
      audioRef.current = a
      a.bell(800)
      if (deity.chantSrc)
        a.playTrack(deity.chantSrc, () => {
          setClosing(true)
          track("aarti_complete", { deity: deity.slug })
        })
      else {
        a.startDrone()
        a.startRhythm()
      }
    } catch {}
    setEntered(true)
    track("aarti_enter", { deity: deity.slug, from_blessing: gift ? 1 : 0 })
    const s = sim.current
    s.flame = { x: s.w / 2, y: s.h * 0.5 - Math.min(s.h * 0.17, 150) }
    window.setTimeout(() => (sim.current.performing = true), 900)
    window.setTimeout(() => setVeilGone(true), 1700)
    window.setTimeout(
      () => flash(gift ? `A blessing for ${gift.for}: ${occasionLine(gift.o, gift.for)}` : "The aarti has begun. Join in whenever you wish.", 5200),
      2400
    )
  }

  const ringBell = useCallback(() => {
    act("bell")
    audioRef.current?.bell(790 + Math.random() * 60)
    if ("vibrate" in navigator) navigator.vibrate?.(18)
    sim.current.ripples.push({ r: 30, life: 1 }, { r: 10, life: 0.8 })
  }, [])

  const offerFlowers = useCallback(() => {
    act("flowers")
    const s = sim.current
    const colors = deity.theme.petals
    for (let i = 0; i < 34; i++)
      s.petals.push({
        x: s.w * (0.18 + Math.random() * 0.64), y: -20 - Math.random() * s.h * 0.45, vy: 0.55 + Math.random() * 0.55,
        sway: Math.random() * TAU, phase: Math.random() * TAU, spin: 0.02 + Math.random() * 0.035, rot: Math.random() * TAU,
        size: 5 + Math.random() * 4.5, color: colors[Math.floor(Math.random() * colors.length)], life: 2.4, landed: false,
      })
    const glints = deity.theme.coins ? 26 : 16
    for (let i = 0; i < glints; i++)
      s.sparks.push({ x: s.w * (0.25 + Math.random() * 0.5), y: -10 - Math.random() * s.h * 0.3, vx: (Math.random() - 0.5) * 0.2, vy: 0.6 + Math.random() * 0.6, life: 1.6, size: deity.theme.coins ? 2 : 1.4 })
    audioRef.current?.bell(1180)
  }, [deity])

  const breakCoconut = useCallback(() => {
    act("coconut")
    sim.current.coconut = { t: performance.now() }
    window.setTimeout(() => {
      audioRef.current?.coconut()
      if ("vibrate" in navigator) navigator.vibrate?.([14, 30, 40])
      const s = sim.current
      for (let i = 0; i < 18; i++) s.sparks.push({ x: s.w / 2, y: s.h * 0.74, vx: (Math.random() - 0.5) * 2.2, vy: -Math.random() * 2, life: 1, size: 1.3 })
    }, 360)
  }, [])

  // ── Light an earthen diya at the deity's feet (Durga). Fills a soft arc, front row first. ──
  const lightDiya = useCallback(() => {
    const s = sim.current
    const n = s.lamps.length
    if (n >= 13) {
      flash(`${n} diyas glow at ${deity.name}'s feet.`)
      return
    }
    const row = n < 7 ? 0 : 1
    const i = row ? n - 7 : n
    const off = i === 0 ? 0 : Math.ceil(i / 2) * (i % 2 ? -1 : 1)
    const S = Math.min(1.5, Math.max(1, s.w / 420)) * (row ? 0.82 : 1)
    const gap = (row ? 40 : 48) * S
    const x = s.w / 2 + (row ? gap / 2 : 0) + off * gap
    const y = s.h * (row ? 0.79 : 0.83) + Math.abs(off) * -2
    s.lamps.push({ x, y, t: performance.now(), scale: S, seed: Math.random() * 100 })
    window.setTimeout(() => {
      audioRef.current?.bell(1320)
      for (let k = 0; k < 8; k++) s.sparks.push({ x: x + 17 * S, y: y - 12 * S, vx: (Math.random() - 0.5) * 0.6, vy: -0.4 - Math.random() * 0.7, life: 1, size: 1.1 })
    }, 550)
    act("diya", { count: n + 1 })
    if (n === 0) flash(`Your diya is lit at ${deity.name}'s feet.`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deity])

  const takeAarti = () => {
    if (!holding) act("take_aarti")
    if (!holding) flash("Move your finger in slow circles before the deity.")
    else sim.current.held = null
    setHolding((v) => !v)
  }

  // ── Prayer chit: written, folded, placed at the deity's feet (kept on this device only) ──
  const placePrayer = () => {
    const text = prayerText.trim()
    if (!text) return
    act("prayer")
    const id = Date.now()
    setChits((c) => [...c.slice(-2), { id, text, placed: false }])
    setPrayerText("")
    setSheet(null)
    try {
      const key = `aarti-prayers-${deity.slug}`
      const prev = JSON.parse(localStorage.getItem(key) || "[]")
      localStorage.setItem(key, JSON.stringify([...prev, { text, at: new Date().toISOString() }].slice(-20)))
    } catch {}
    window.setTimeout(() => setChits((c) => c.map((x) => (x.id === id ? { ...x, placed: true } : x))), 60)
    window.setTimeout(() => {
      audioRef.current?.bell(700)
      sim.current.ripples.push({ r: 20, life: 0.9 })
      flash(`Your prayer rests at ${deity.name}'s feet.`)
    }, 2300)
  }

  // ── Send a blessing: a card image + a link that greets the recipient ──
  const sendBlessing = async () => {
    if (!bl.to.trim() || !bl.from.trim()) return
    setBlBusy(true)
    const base = window.location.href.split("?")[0]
    const link = withShareUtm(`${base}?for=${encodeURIComponent(bl.to.trim())}&from=${encodeURIComponent(bl.from.trim())}&o=${bl.occasion}`, "aarti-blessing")
    const text = `🙏 ${occasionLine(bl.occasion, bl.to.trim())}. ${bl.from.trim()} has offered ${deity.name}'s blessings for you.${bl.note.trim() ? `\n“${bl.note.trim()}”` : ""}\nReceive your darshan: ${link}`
    try {
      const blob = await makeBlessingCard({ deity, to: bl.to.trim(), from: bl.from.trim(), occasion: bl.occasion, note: bl.note })
      const file = new File([blob], `blessing-${deity.slug}.jpg`, { type: "image/jpeg" })
      const nav = navigator as Navigator & { canShare?: (d: any) => boolean }
      if (nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], text })
        act("blessing_sent", { occasion: bl.occasion, method: "share_sheet" })
      } else {
        // Desktop / no file sharing: save the card, then open WhatsApp with the message and link.
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = file.name
        a.click()
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener")
        act("blessing_sent", { occasion: bl.occasion, method: "whatsapp_web" })
      }
      setSheet(null)
      flash(`Blessings on their way to ${bl.to.trim()}.`)
      sim.current.ripples.push({ r: 20, life: 1 })
    } catch {
      // share sheet dismissed: keep the form open
    } finally {
      setBlBusy(false)
    }
  }

  const onPointer = (e: React.PointerEvent) => {
    if (!holding || closing || sheet) return
    const r = stageRef.current!.getBoundingClientRect()
    if (e.clientY - r.top > r.height - 110) return
    sim.current.held = { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const onPointerUp = () => {
    if (holding) sim.current.held = null
  }

  const toggleMute = () => {
    const m = !muted
    act(m ? "mute" : "unmute")
    setMuted(m)
    audioRef.current?.setMuted(m)
  }

  const shareDarshan = () => {
    const url = withShareUtm(window.location.href.split("?")[0], "aarti-darshan-share")
    act("share_darshan")
    window.open(`https://wa.me/?text=${encodeURIComponent(`🙏 I joined the ${deity.title} today. ${deity.prayerLine ?? ""}\n${url}`)}`, "_blank", "noopener")
  }

  const prayerPlaced = chits.some((c) => c.placed)

  return (
    <div
      ref={stageRef}
      className={`aarti-stage${entered ? " entered" : ""}`}
      onPointerDown={onPointer}
      onPointerMove={onPointer}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ touchAction: holding ? "none" : "auto" }}
    >
      {/* The painting keeps its own composition at every screen size (owner, 18 Oct): a portrait scene of the
          height of the stage, centred. On wide screens the sides are filled by a soft, dim extension of the
          same sanctum, never by zooming the painting. */}
      <div className="aarti-layer aarti-fill" aria-hidden>
        <div className="aarti-fill-blur">
          <Image src={`/aarti/${deity.slug}-bg.webp`} alt="" fill sizes="60vw" className="object-cover" />
        </div>
        {[-1, 1].map((k) => (
          <div key={k} className={`aarti-fill-tile ${k < 0 ? "left" : "right"}`}>
            <div className="aarti-fill-mirror">
              <Image src={`/aarti/${deity.slug}-bg.webp`} alt="" fill sizes="40vw" className="object-cover" />
            </div>
          </div>
        ))}
      </div>
      <div className="aarti-scene">
        <div ref={bgRef} className="aarti-scene-bg">
          <Image src={`/aarti/${deity.slug}-bg.webp`} alt="" fill priority sizes="(max-width: 768px) 130vw, 720px" className="object-cover" />
        </div>
        <div ref={deityRef} className="aarti-deity">
          <Image src={`/aarti/${deity.slug}-deity.webp`} alt={deity.name} fill priority sizes="(max-width: 768px) 110vw, 600px" className="object-contain object-bottom" />
        </div>
      </div>
      <canvas ref={canvasRef} className="aarti-canvas" aria-hidden />

      {/* Prayer chits at the deity's feet */}
      <div className="aarti-chits" aria-hidden>
        {chits.map((c, i) => (
          <div key={c.id} className={`aarti-chit${c.placed ? " placed" : ""}`} style={{ ["--i" as any]: i }}>
            <span className="aarti-chit-text">{c.text}</span>
          </div>
        ))}
      </div>
      <div className="aarti-vignette" aria-hidden />

      <header className="aarti-top">
        <div className="aarti-top-text">
          <LocalizedClientLink href="/aarti" className="aarti-back">
            ← All aartis
          </LocalizedClientLink>
          <p className="aarti-eyebrow">{deity.place}</p>
          <h1 className="aarti-title">{deity.title}</h1>
          {nextLabel && <p className="aarti-next">{nextLabel}</p>}
        </div>
      </header>

      {hint && (
        <div className="aarti-hint" role="status" key={hint}>
          {hint}
        </div>
      )}

      {/* Opening veil */}
      {!veilGone && (
        <div className={`aarti-veil${entered ? " lifting" : ""}`}>
          <div className="aarti-veil-inner">
            <div className="aarti-diya" aria-hidden>
              <span className="aarti-diya-flame" />
              <span className="aarti-diya-base" />
            </div>
            {gift ? (
              <>
                <p className="aarti-veil-eyebrow">A blessing for {gift.for}</p>
                <h2 className="aarti-veil-title">{occasionLine(gift.o, gift.for)}</h2>
                <p className="aarti-veil-line">
                  {gift.from ? `${gift.from} has offered ${deity.name}'s blessings for you.` : `${deity.name}'s blessings are with you.`}
                </p>
              </>
            ) : (
              <>
                <p className="aarti-veil-eyebrow">{deity.place}</p>
                <h2 className="aarti-veil-title">{deity.title}</h2>
                <p className="aarti-veil-line">{deity.tagline}</p>
              </>
            )}
            <button type="button" className="aarti-enter" onClick={enter} disabled={entered}>
              {gift ? "Receive your darshan" : "Enter darshan"}
            </button>
            <p className="aarti-veil-small">Sound on · the aarti plays as you pray</p>
          </div>
        </div>
      )}

      {/* Offerings */}
      {entered && !closing && !sheet && (
        <nav className="aarti-dock" aria-label="Offerings">
          <DockButton icon="bell" label="Bell" onClick={ringBell} />
          <DockButton icon="flower" label="Flowers" onClick={offerFlowers} />
          {deity.diyas ? <DockButton icon="lamp" label="Diya" onClick={lightDiya} /> : null}
          <DockButton icon="prayer" label="Prayer" onClick={() => { act("prayer_open"); setSheet("prayer") }} />
          <DockButton icon="diya" label={holding ? "Release" : "Aarti"} active={holding} onClick={takeAarti} />
          {deity.diyas ? null : <DockButton icon="coconut" label="Coconut" onClick={breakCoconut} />}
          <DockButton icon="gift" label="Bless" onClick={() => { act("blessing_open"); setSheet("blessing") }} />
          <DockButton icon={muted ? "mute" : "sound"} label={muted ? "Muted" : "Sound"} onClick={toggleMute} />
        </nav>
      )}

      {/* Prayer sheet */}
      {sheet === "prayer" && (
        <div className="aarti-sheet-root" role="dialog" aria-label="Offer your prayer">
          <button type="button" className="aarti-sheet-backdrop" aria-label="Close" onClick={() => setSheet(null)} />
          <div className="aarti-sheet">
            <div className="aarti-sheet-grip" aria-hidden />
            <h2 className="aarti-sheet-title">Offer your prayer</h2>
            <p className="aarti-sheet-sub">Write what is in your heart. It will be placed at {deity.name}&apos;s feet. It stays private, on this phone.</p>
            <textarea
              className="aarti-paper"
              value={prayerText}
              onChange={(e) => setPrayerText(e.target.value.slice(0, 240))}
              placeholder={`${deity.name}, please bless…`}
              rows={4}
              autoFocus
            />
            <button type="button" className="aarti-primary" onClick={placePrayer} disabled={!prayerText.trim()}>
              Place at {deity.name}&apos;s feet
            </button>
          </div>
        </div>
      )}

      {/* Blessing sheet */}
      {sheet === "blessing" && (
        <div className="aarti-sheet-root" role="dialog" aria-label="Send a blessing">
          <button type="button" className="aarti-sheet-backdrop" aria-label="Close" onClick={() => setSheet(null)} />
          <div className="aarti-sheet">
            <div className="aarti-sheet-grip" aria-hidden />
            <h2 className="aarti-sheet-title">Send {deity.name}&apos;s blessings</h2>
            <p className="aarti-sheet-sub">For a birthday, an anniversary, exams or someone who needs strength. They receive a blessing card and their own darshan.</p>
            <div className="aarti-occasions">
              {OCCASIONS.map((o) => (
                <button key={o.key} type="button" className={`aarti-occasion${bl.occasion === o.key ? " on" : ""}`} onClick={() => setBl({ ...bl, occasion: o.key })}>
                  {o.label}
                </button>
              ))}
            </div>
            <input className="aarti-field" placeholder="Their name" value={bl.to} onChange={(e) => setBl({ ...bl, to: e.target.value.slice(0, 40) })} />
            <input className="aarti-field" placeholder="Your name" value={bl.from} onChange={(e) => setBl({ ...bl, from: e.target.value.slice(0, 40) })} />
            <input className="aarti-field" placeholder="A few words (optional)" value={bl.note} onChange={(e) => setBl({ ...bl, note: e.target.value.slice(0, 90) })} />
            <button type="button" className="aarti-primary" onClick={sendBlessing} disabled={blBusy || !bl.to.trim() || !bl.from.trim()}>
              {blBusy ? "Preparing the card…" : "Send the blessing"}
            </button>
          </div>
        </div>
      )}

      {/* Closing blessing: when the aarti ends */}
      {closing && (
        <div className="aarti-close" role="dialog" aria-label="Blessing">
          <div className="aarti-close-card">
            <p className="aarti-close-om">ॐ</p>
            {deity.prayerLine && <p className="aarti-close-prayer">{deity.prayerLine}</p>}
            <p className="aarti-close-text">
              {prayerPlaced ? `Your prayer rests at ${deity.name}'s feet. ` : ""}
              {deity.blessing}
            </p>
            <div className="aarti-close-row">
              <button type="button" className="aarti-close-share" onClick={shareDarshan}>
                Share this darshan
              </button>
              <button type="button" className="aarti-close-gift" onClick={() => { setClosing(false); setSheet("blessing") }}>
                Send a blessing
              </button>
            </div>
            <div className="aarti-close-links">
              {deity.offerings.map((o) => (
                <LocalizedClientLink key={o.handle} href={`/products/${o.handle}`} className="aarti-close-link">
                  {o.label}
                </LocalizedClientLink>
              ))}
            </div>
            <button type="button" className="aarti-close-stay" onClick={() => setClosing(false)}>
              Stay in darshan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DockButton({ icon, label, onClick, active }: { icon: IconName; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button type="button" className={`aarti-dock-btn${active ? " active" : ""}`} onClick={onClick}>
      <span className="aarti-dock-icon">
        <Icon name={icon} />
      </span>
      <span className="aarti-dock-label">{label}</span>
    </button>
  )
}

type IconName = "bell" | "flower" | "diya" | "lamp" | "coconut" | "prayer" | "gift" | "sound" | "mute"

/** Thin gold-line icons, drawn for the dock (no emoji). */
function Icon({ name }: { name: IconName }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
      {name === "bell" && (
        <g {...p}>
          <path d="M12 3v1.5" />
          <path d="M6.5 16.5c0-6 1.5-10 5.5-10s5.5 4 5.5 10" />
          <path d="M4.5 16.5h15" />
          <path d="M10.5 19.5a1.5 1.5 0 0 0 3 0" />
        </g>
      )}
      {name === "flower" && (
        <g {...p}>
          <circle cx="12" cy="11" r="2" />
          <path d="M12 9c-1.6-3.2.2-5.5 0-6 1.8 1.5 1.6 3.6 0 6Z" />
          <path d="M14 11c3.2-1.6 5.5.2 6 0-1.5 1.8-3.6 1.6-6 0Z" />
          <path d="M12 13c1.6 3.2-.2 5.5 0 6-1.8-1.5-1.6-3.6 0-6Z" />
          <path d="M10 11c-3.2 1.6-5.5-.2-6 0 1.5-1.8 3.6-1.6 6 0Z" />
        </g>
      )}
      {name === "diya" && (
        <g {...p}>
          <path d="M12 4.5c1.6 1.8 1.6 3.6 0 5-1.6-1.4-1.6-3.2 0-5Z" />
          <path d="M3.5 13h17c-1 3.5-4.5 5.5-8.5 5.5S4.5 16.5 3.5 13Z" />
          <path d="M9 20.5h6" />
        </g>
      )}
      {name === "lamp" && (
        <g {...p}>
          <path d="M16.5 6.5c1.3 1.4 1.3 2.9 0 4-1.3-1.1-1.3-2.6 0-4Z" />
          <path d="M3.5 13.5c2.5-1.2 6.5-1.5 10-.8l3-1.2c-.5 4.5-4 7-8 7-3 0-5-2-5-5Z" />
        </g>
      )}
      {name === "coconut" && (
        <g {...p}>
          <ellipse cx="12" cy="13" rx="7" ry="7.5" />
          <circle cx="10" cy="9.5" r=".6" />
          <circle cx="12" cy="8.8" r=".6" />
          <circle cx="14" cy="9.5" r=".6" />
        </g>
      )}
      {name === "prayer" && (
        <g {...p}>
          <path d="M6 4.5h9l3 3V19.5H6z" />
          <path d="M15 4.5v3h3" />
          <path d="M8.5 11h7M8.5 14h7M8.5 17h4" />
        </g>
      )}
      {name === "gift" && (
        <g {...p}>
          <rect x="4" y="9" width="16" height="11" rx="1.5" />
          <path d="M4 13h16M12 9v11" />
          <path d="M12 9c-1.5-3-5-3.5-5-1.5S10 9 12 9Zm0 0c1.5-3 5-3.5 5-1.5S14 9 12 9Z" />
        </g>
      )}
      {(name === "sound" || name === "mute") && (
        <g {...p}>
          <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" />
          {name === "sound" ? <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M17.8 7.2a7 7 0 0 1 0 9.6" /> : <path d="m16 10 4 4m0-4-4 4" />}
        </g>
      )}
    </svg>
  )
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16)
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + (amt < 0 ? c * amt : (255 - c) * amt))))
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`
}
