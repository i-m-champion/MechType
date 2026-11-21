/**
 * AudioContextManager
 * High-performance Web Audio API engine with zero-latency playback,
 * dynamics compression, spatial panning, and browser autoplay unlock.
 */

class AudioContextManager {
  private static instance: AudioContextManager;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private opponentPanner: StereoPannerNode | PannerNode | null = null;
  private opponentGain: GainNode | null = null;
  private isUnlocked: boolean = false;
  private volume: number = 0.8;

  private constructor() {
    // Setup lazy unlock on first user gesture
    if (typeof window !== 'undefined') {
      const unlockEvents = ['keydown', 'mousedown', 'touchstart', 'pointerdown'];
      const unlockHandler = () => {
        this.unlockContext();
        unlockEvents.forEach((ev) => window.removeEventListener(ev, unlockHandler));
      };
      unlockEvents.forEach((ev) => window.addEventListener(ev, unlockHandler, { passive: true }));
    }
  }

  public static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx({ latencyHint: 'interactive' });
      this.setupMasterChain();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private setupMasterChain(): void {
    if (!this.ctx) return;

    // Master Dynamics Compressor to prevent distortion at extreme typing bursts (120+ WPM)
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(20, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.002, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.12, this.ctx.currentTime);

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Setup 3D / Spatial Panner for Opponent Duel Clacks (Right ear bias: pan = +0.75)
    if (this.ctx.createStereoPanner) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(0.75, this.ctx.currentTime);
      this.opponentGain = this.ctx.createGain();
      this.opponentGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.opponentPanner = panner;
      this.opponentGain.connect(this.opponentPanner);
      this.opponentPanner.connect(this.compressor);
    } else {
      // Fallback standard gain
      this.opponentGain = this.ctx.createGain();
      this.opponentGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.opponentGain.connect(this.compressor);
    }
  }

  public unlockContext(): void {
    if (this.isUnlocked) return;
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        this.isUnlocked = true;
      }).catch(() => {});
    } else {
      this.isUnlocked = true;
    }
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.02);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getMasterInput(): AudioNode {
    this.getContext();
    return this.compressor!;
  }

  public getOpponentInput(): AudioNode {
    this.getContext();
    return this.opponentGain || this.compressor!;
  }

  public getCurrentTime(): number {
    return this.getContext().currentTime;
  }
}

export const audioContextManager = AudioContextManager.getInstance();
