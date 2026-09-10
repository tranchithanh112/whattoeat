// Sound is synthesised, not sampled. The reference build shipped several MB
// of game audio; these few oscillators cost nothing to download, work
// offline, and carry no third-party rights.

const RARITY_CHORDS: number[][] = [
  [523.25, 659.25], // everyday     C5 E5
  [523.25, 659.25, 783.99], // familiar     C5 E5 G5
  [587.33, 739.99, 880.0], // worth a try  D5 F#5 A5
  [523.25, 659.25, 783.99, 1046.5], // fancy        C5 E5 G5 C6
  [523.25, 698.46, 880.0, 1174.66, 1396.91], // treat        C5 F5 A5 D6 F6
];

export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private muted = false;
  /** Ticks fire once per card crossing the marker; on a fast reel that is
   *  dozens per second, so they are rate-limited rather than queued. */
  private lastTick = 0;

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

  /** One click as a card passes the marker. `heat` (0..1) rises as the reel slows. */
  tick(heat = 0): void {
    const ctx = this.ready();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (now - this.lastTick < 0.022) return;
    this.lastTick = now;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1500 + heat * 900, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.03);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16 + heat * 0.1, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    osc.connect(gain).connect(this.master!);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  /** Filtered-noise whoosh as the reel launches. */
  open(): void {
    const ctx = this.ready();
    if (!ctx) return;
    const now = ctx.currentTime;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.1;
    filter.frequency.setValueAtTime(260, now);
    filter.frequency.exponentialRampToValueAtTime(2600, now + 0.42);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.09);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    src.connect(filter).connect(gain).connect(this.master!);
    src.start(now);
    src.stop(now + 0.6);

    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(150, now);
    thump.frequency.exponentialRampToValueAtTime(48, now + 0.24);
    thumpGain.gain.setValueAtTime(0.34, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    thump.connect(thumpGain).connect(this.master!);
    thump.start(now);
    thump.stop(now + 0.32);
  }

  /** Arpeggio on reveal; longer and brighter the rarer the dish. */
  reveal(rarity: number): void {
    const ctx = this.ready();
    if (!ctx) return;
    const now = ctx.currentTime;
    const chord = RARITY_CHORDS[Math.min(rarity, RARITY_CHORDS.length - 1)];

    chord.forEach((freq, i) => {
      const at = now + i * 0.075;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = rarity >= 3 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.22, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.75);
      osc.connect(gain).connect(this.master!);
      osc.start(at);
      osc.stop(at + 0.8);
    });

    if (rarity >= 3) {
      // A shimmer tail marks the rare drops without another sample.
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 5200;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      src.connect(filter).connect(gain).connect(this.master!);
      src.start(now);
      src.stop(now + 0.95);
    }
  }

  private ready(): AudioContext | null {
    if (!this.ctx || !this.master || this.muted || this.ctx.state !== 'running') return null;
    return this.ctx;
  }

  private noiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.noise) {
      const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.noise = buffer;
    }
    return this.noise;
  }
}
