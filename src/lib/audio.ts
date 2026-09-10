// Sound is synthesised, not sampled. The reference build shipped several MB
// of game audio; these oscillators cost nothing to download, work offline,
// and carry no third-party rights.
//
// The palette is a canteen rather than a slot machine: struck ceramic for
// every event. A bowl rings with inharmonic partials — unlike a chord, the
// overtones are not whole-number multiples — so a plain sine reads as a beep
// while these ratios read as crockery. Each strike also gets a few
// milliseconds of filtered noise, which is the sound of the two surfaces
// actually meeting; without it the ring sounds synthetic.

const BOWL = [1, 2.31, 4.28, 6.61];

/** Bowl sizes the reel cycles through, so a fast reel clatters instead of
 *  ticking like a metronome. */
const BOWL_SIZES = [1180, 1560, 2040, 1360, 1820];

export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private muted = false;
  /** Ticks fire once per card crossing the marker; on a fast reel that is
   *  dozens per second, so they are rate-limited rather than queued. */
  private lastTick = 0;
  private bowlIndex = 0;

  /** Must run inside a user gesture — browsers refuse to start audio otherwise. */
  unlock(): void {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.5, this.ctx.currentTime, 0.02);
    }
  }

  suspend(): void {
    if (this.ctx?.state === 'running') void this.ctx.suspend();
  }

  resume(): void {
    if (this.ctx?.state === 'suspended' && !this.muted) void this.ctx.resume();
  }

  dispose(): void {
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.noise = null;
  }

  /** One bowl knocking against the next as a card passes the marker.
   *  `heat` (0..1) rises as the reel slows: strikes get heavier and duller,
   *  like a stack settling. */
  tick(heat = 0): void {
    const ctx = this.ready();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (now - this.lastTick < 0.022) return;
    this.lastTick = now;

    // Walk the bowl sizes with a random skip so the pattern never locks into
    // an audible loop, and detune each strike a little.
    this.bowlIndex = (this.bowlIndex + 1 + Math.floor(Math.random() * 2)) % BOWL_SIZES.length;
    const size = BOWL_SIZES[this.bowlIndex] * (0.92 + Math.random() * 0.16);

    this.strike(ctx, now, size * (1 - heat * 0.18), 0.13 + heat * 0.07, 0.1 + heat * 0.06, 3);
  }

  /** A stack of bowls being shuffled on a steel table as the reel launches. */
  open(): void {
    const ctx = this.ready();
    if (!ctx) return;
    const now = ctx.currentTime;

    for (let i = 0; i < 7; i++) {
      const at = now + i * 0.045 + Math.random() * 0.02;
      const size = BOWL_SIZES[i % BOWL_SIZES.length] * (0.85 + Math.random() * 0.3);
      this.strike(ctx, at, size, 0.11, 0.13, 3);
    }

    // The table underneath: a short low thud so the clatter has a body.
    const thud = ctx.createOscillator();
    const gain = ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(190, now);
    thud.frequency.exponentialRampToValueAtTime(62, now + 0.22);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    thud.connect(gain).connect(this.master!);
    thud.start(now);
    thud.stop(now + 0.32);
  }

  /**
   * Chopsticks running up the rims of bowls, longer the rarer the dish.
   * The top tier gets a bright two-note flourish on the end — the joke being
   * that an expensive dish sounds like a till.
   */
  reveal(rarity: number): void {
    const ctx = this.ready();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = 2 + Math.min(rarity, 3);
    for (let i = 0; i < notes; i++) {
      // Rising, because a run that climbs reads as a reward in any culture.
      const freq = 900 * Math.pow(1.26, i);
      this.strike(ctx, now + i * 0.085, freq, 0.21, 0.42, 4);
    }

    if (rarity >= 4) {
      const at = now + notes * 0.085 + 0.05;
      this.strike(ctx, at, 2640, 0.24, 0.5, 4);
      this.strike(ctx, at + 0.07, 3520, 0.21, 0.7, 4);
    }
  }

  /**
   * One struck-ceramic hit: inharmonic partials over a noise contact
   * transient. `partials` trades realism for node count — the reel fires
   * these dozens of times a second, the reveal only a handful.
   */
  private strike(
    ctx: AudioContext,
    at: number,
    freq: number,
    level: number,
    decay: number,
    partials: number,
  ): void {
    for (let i = 0; i < partials; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * BOWL[i], at);
      // Higher partials are quieter and die first, which is what makes a
      // strike sound struck rather than simply switched on.
      const amp = level / (i + 1.6);
      const life = decay / (1 + i * 0.55);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(amp, at + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + life);
      osc.connect(gain).connect(this.master!);
      osc.start(at);
      osc.stop(at + life + 0.02);
    }

    const contact = ctx.createBufferSource();
    contact.buffer = this.noiseBuffer(ctx);
    contact.playbackRate.value = 1 + Math.random() * 0.4;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = Math.min(freq * 1.7, 7000);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level * 0.55, at);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.02);
    contact.connect(filter).connect(gain).connect(this.master!);
    contact.start(at);
    contact.stop(at + 0.03);
  }

  private ready(): AudioContext | null {
    if (!this.ctx || !this.master || this.muted || this.ctx.state !== 'running') return null;
    return this.ctx;
  }

  private noiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.noise) {
      // A quarter second is plenty: contact transients are ~20 ms and the
      // playback rate is jittered, so no repeat is audible.
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.noise = buffer;
    }
    return this.noise;
  }
}
