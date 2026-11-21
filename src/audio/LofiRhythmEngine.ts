import { audioContextManager } from './AudioContextManager';

/**
 * Lo-Fi Rhythm Sync Engine
 * Generates an ambient chill lo-fi beat (vinyl crackle, warm chords, mellow rhythm)
 * and melodically harmonizes each keystroke to the active chord progression!
 */

// Chord progression: Pentatonic / 7th scale notes (frequencies in Hz)
const CHORD_PROGRESSIONS = [
  // Dm9: D F A C E
  { root: 146.83, name: 'Dm9', notes: [293.66, 349.23, 440.0, 523.25, 659.25, 783.99, 880.0] },
  // G13: G B D F A E
  { root: 196.0, name: 'G13', notes: [392.0, 493.88, 587.33, 698.46, 880.0, 987.77, 1174.66] },
  // Cmaj9: C E G B D
  { root: 130.81, name: 'Cmaj9', notes: [261.63, 329.63, 392.0, 493.88, 587.33, 659.25, 783.99] },
  // Am7: A C E G B
  { root: 110.0, name: 'Am7', notes: [220.0, 261.63, 329.63, 392.0, 493.88, 587.33, 659.25] },
];

export class LofiRhythmEngine {
  private static instance: LofiRhythmEngine;
  private isPlaying: boolean = false;
  private currentChordIndex: number = 0;
  private chordTimer: number | null = null;
  private beatTimer: number | null = null;
  private step: number = 0;
  private lofiGain: GainNode | null = null;
  private vinylNode: AudioNode | null = null;

  private constructor() {}

  public static getInstance(): LofiRhythmEngine {
    if (!LofiRhythmEngine.instance) {
      LofiRhythmEngine.instance = new LofiRhythmEngine();
    }
    return LofiRhythmEngine.instance;
  }

  public isEnabled(): boolean {
    return this.isPlaying;
  }

  public start(): void {
    if (this.isPlaying) return;
    const ctx = audioContextManager.getContext();
    this.isPlaying = true;

    // Create Lo-Fi Submix Gain
    this.lofiGain = ctx.createGain();
    this.lofiGain.gain.setValueAtTime(0.35, ctx.currentTime);
    this.lofiGain.connect(audioContextManager.getMasterInput());

    // Start Vinyl Dust Hiss
    this.startVinylCrackle(ctx, this.lofiGain);

    // Chord progression cycle (every 4 seconds switch chord)
    this.currentChordIndex = 0;
    this.playPadChord();
    this.chordTimer = window.setInterval(() => {
      this.currentChordIndex = (this.currentChordIndex + 1) % CHORD_PROGRESSIONS.length;
      this.playPadChord();
    }, 4000);

    // Mellow lo-fi drum pattern (75 BPM = 200ms per 16th step)
    this.step = 0;
    this.beatTimer = window.setInterval(() => {
      this.triggerDrumStep();
      this.step = (this.step + 1) % 16;
    }, 200);
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.chordTimer) {
      clearInterval(this.chordTimer);
      this.chordTimer = null;
    }
    if (this.beatTimer) {
      clearInterval(this.beatTimer);
      this.beatTimer = null;
    }
    if (this.vinylNode) {
      try {
        (this.vinylNode as AudioBufferSourceNode).stop();
      } catch {
        // ignore
      }
      this.vinylNode = null;
    }
    if (this.lofiGain) {
      try {
        this.lofiGain.disconnect();
      } catch {
        // ignore
      }
      this.lofiGain = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  /**
   * Generates warm ambient vinyl dust crackle
   */
  private startVinylCrackle(ctx: AudioContext, destination: AudioNode): void {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Periodic tiny crackle clicks + warm low hiss
      const hiss = (Math.random() * 2 - 1) * 0.015;
      const crackle = Math.random() > 0.998 ? (Math.random() * 2 - 1) * 0.08 : 0;
      data[i] = hiss + crackle;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    source.start();
    this.vinylNode = source;
  }

  /**
   * Lush electric piano / tape pad background chord
   */
  private playPadChord(): void {
    if (!this.isPlaying || !this.lofiGain) return;
    const ctx = audioContextManager.getContext();
    const now = ctx.currentTime;
    const chord = CHORD_PROGRESSIONS[this.currentChordIndex];

    // Play 3 notes of the chord with slow tape wow/flutter
    const notesToPlay = chord.notes.slice(0, 3);
    notesToPlay.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.5, now); // Warm lower octave

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.9);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.lofiGain!);

      osc.start(now);
      osc.stop(now + 4.0);
    });
  }

  /**
   * Mellow chill drum groove:
   * Step 0: Kick
   * Step 4: Snare/Rim
   * Step 8: Kick
   * Step 12: Snare/Rim
   * Even steps: Hi-hat
   */
  private triggerDrumStep(): void {
    if (!this.isPlaying || !this.lofiGain) return;
    const ctx = audioContextManager.getContext();
    const now = ctx.currentTime;

    // Kick on 0, 6, 10
    if (this.step === 0 || this.step === 6 || this.step === 10) {
      const kickOsc = ctx.createOscillator();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(110, now);
      kickOsc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

      const kickGain = ctx.createGain();
      kickGain.gain.setValueAtTime(0.35, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      kickOsc.connect(kickGain);
      kickGain.connect(this.lofiGain);
      kickOsc.start(now);
      kickOsc.stop(now + 0.16);
    }

    // Warm rimshot/snare on 4, 12
    if (this.step === 4 || this.step === 12) {
      const snareOsc = ctx.createOscillator();
      snareOsc.type = 'triangle';
      snareOsc.frequency.setValueAtTime(210, now);
      snareOsc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      const snareGain = ctx.createGain();
      snareGain.gain.setValueAtTime(0.25, now);
      snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      snareOsc.connect(snareGain);
      snareGain.connect(this.lofiGain);
      snareOsc.start(now);
      snareOsc.stop(now + 0.1);
    }

    // Soft hi-hat on even steps
    if (this.step % 2 === 0) {
      const hatOsc = ctx.createOscillator();
      hatOsc.type = 'square';
      hatOsc.frequency.setValueAtTime(8500, now);

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7000, now);

      const hatGain = ctx.createGain();
      hatGain.gain.setValueAtTime(0.05, now);
      hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      hatOsc.connect(filter);
      filter.connect(hatGain);
      hatGain.connect(this.lofiGain);
      hatOsc.start(now);
      hatOsc.stop(now + 0.04);
    }
  }

  /**
   * Harmonized Keystroke Note Trigger!
   * Called on each key press when Lo-Fi mode is active.
   * Plays a gorgeous Rhodes chime note aligned to the current chord.
   */
  public triggerHarmonizedKeystroke(keyChar: string): void {
    if (!this.isPlaying) return;
    const ctx = audioContextManager.getContext();
    const now = ctx.currentTime;
    const chord = CHORD_PROGRESSIONS[this.currentChordIndex];

    // Map character code to scale degree
    const charCode = keyChar.charCodeAt(0) || 65;
    const noteIndex = charCode % chord.notes.length;
    const noteFreq = chord.notes[noteIndex];

    // Rhodes / Electric Piano Chime synthesis
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(noteFreq, now);

    // Warm overtone
    const overtone = ctx.createOscillator();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(noteFreq * 2.0, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    const overGain = ctx.createGain();
    overGain.gain.setValueAtTime(0.08, now);
    overGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);

    osc.connect(filter);
    overtone.connect(overGain);
    overGain.connect(filter);
    filter.connect(gain);
    gain.connect(audioContextManager.getMasterInput());

    osc.start(now);
    overtone.start(now);
    osc.stop(now + 0.5);
    overtone.stop(now + 0.3);
  }
}

export const lofiRhythmEngine = LofiRhythmEngine.getInstance();
