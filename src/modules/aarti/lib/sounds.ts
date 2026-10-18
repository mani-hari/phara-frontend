// Temple sounds made in code with Web Audio: no recordings, so no copyright or download weight.
// Created only after a tap (browsers require a user gesture to start audio).
export class TempleAudio {
  ctx: AudioContext
  master: GainNode
  droneGain: GainNode | null = null

  constructor() {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    this.ctx = new AC()
    this.master = this.ctx.createGain()
    this.master.gain.value = 0.9
    this.master.connect(this.ctx.destination)
  }

  /** Brass temple bell: inharmonic partials with long decays. */
  bell(base = 830) {
    const t = this.ctx.currentTime
    ;[1, 2.76, 5.4, 8.93, 13.34].forEach((ratio, i) => {
      const o = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      o.type = "sine"
      o.frequency.value = base * ratio
      const peak = 0.28 / (i + 1)
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(peak, t + 0.005)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8 / (1 + i * 0.6))
      o.connect(g).connect(this.master)
      o.start(t)
      o.stop(t + 3)
    })
  }

  /** Conch (shankh): breathy swell around 230 Hz. */
  conch() {
    const t = this.ctx.currentTime
    const o = this.ctx.createOscillator()
    const o2 = this.ctx.createOscillator()
    const f = this.ctx.createBiquadFilter()
    const g = this.ctx.createGain()
    const lfo = this.ctx.createOscillator()
    const lfoGain = this.ctx.createGain()
    o.type = "sawtooth"
    o2.type = "triangle"
    o.frequency.value = 233
    o2.frequency.value = 466
    lfo.frequency.value = 5
    lfoGain.gain.value = 3
    lfo.connect(lfoGain).connect(o.frequency)
    f.type = "lowpass"
    f.frequency.value = 900
    f.Q.value = 6
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.22, t + 0.6)
    g.gain.setValueAtTime(0.22, t + 2.0)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2)
    o.connect(f)
    o2.connect(f)
    f.connect(g).connect(this.master)
    ;[o, o2, lfo].forEach((n) => {
      n.start(t)
      n.stop(t + 3.3)
    })
  }

  /** Soft tanpura-like drone (Sa + Pa) under the experience. */
  startDrone() {
    if (this.droneGain) return
    const t = this.ctx.currentTime
    this.droneGain = this.ctx.createGain()
    this.droneGain.gain.setValueAtTime(0, t)
    this.droneGain.gain.linearRampToValueAtTime(0.06, t + 3)
    this.droneGain.connect(this.master)
    ;[130.81, 196.0, 261.63].forEach((freq, i) => {
      const o = this.ctx.createOscillator()
      o.type = i === 2 ? "sine" : "triangle"
      o.frequency.value = freq
      const g = this.ctx.createGain()
      g.gain.value = i === 2 ? 0.4 : 0.7
      o.connect(g).connect(this.droneGain!)
      o.start()
    })
  }

  /** Coconut breaking: a sharp crack plus a low thud. */
  coconut() {
    const t = this.ctx.currentTime
    const len = Math.floor(this.ctx.sampleRate * 0.25)
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    const bp = this.ctx.createBiquadFilter()
    bp.type = "bandpass"
    bp.frequency.value = 1800
    const g = this.ctx.createGain()
    g.gain.value = 0.9
    src.connect(bp).connect(g).connect(this.master)
    src.start(t)
    const o = this.ctx.createOscillator()
    const og = this.ctx.createGain()
    o.frequency.setValueAtTime(140, t)
    o.frequency.exponentialRampToValueAtTime(50, t + 0.25)
    og.gain.setValueAtTime(0.5, t)
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
    o.connect(og).connect(this.master)
    o.start(t)
    o.stop(t + 0.35)
  }

  setMuted(m: boolean) {
    this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.05)
  }

  close() {
    this.ctx.close().catch(() => {})
  }
}
