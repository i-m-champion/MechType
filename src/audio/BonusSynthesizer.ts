import { audioContextManager } from './AudioContextManager';
import { KeystrokeAudioEvent } from '../types/audio';

/**
 * Bonus Soundpack Synthesizer
 * Procedurally generates:
 * 1. Minecraft Mode (stone crumble, wood chops, voxel impacts)
 * 2. Rubber Duck (squeak chirps + loud Spacebar honk)
 * 3. Bubble Wrap (crisp air bubble snaps)
 */

export class BonusSynthesizer {
  /**
   * Minecraft Mode:
   * Stone, wood, and dirt block breaking sound effects.
   */
  public static playMinecraft(event: KeystrokeAudioEvent, destination: AudioNode, pitchMod: number = 1.0): void {
    if (!event.isKeyDown) return;
    const ctx = audioContextManager.getContext();
    const now = ctx.currentTime;

    // Wood chop vs stone crumble based on keycode
    const isStone = event.code.charCodeAt(0) % 2 === 0;

    if (isStone) {
      // Crunchy stone breaking impact
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140 * pitchMod, now);
      osc.frequency.exponentialRampToValueAtTime(40 * pitchMod, now + 0.04);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800 * pitchMod, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } else {
      // Wood chop / block pop
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 * pitchMod, now);
      osc.frequency.exponentialRampToValueAtTime(90 * pitchMod, now + 0.035);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(now);
      osc.stop(now + 0.045);
    }
  }

  /**
   * Rubber Duck:
   * Squeaks per key with loud comical honk on Spacebar!
   */
  public static playRubberDuck(event: KeystrokeAudioEvent, destination: AudioNode, pitchMod: number = 1.0): void {
    const ctx = audioContextManager.getContext();
    const now = ctx.currentTime;

    if (event.isSpacebar || event.code === 'Space') {
      // Loud Dual-Tone Brassy Duck Honk with vibrato!
      if (!event.isKeyDown) return;

      const baseFreq = 340 * pitchMod;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc2.frequency.setValueAtTime(baseFreq * 2.05, now);

      // Vibrato
      lfo.frequency.setValueAtTime(14, now);
      lfoGain.gain.setValueAtTime(25, now);
      lfo.connect(osc1.frequency);
      lfo.connect(osc2.frequency);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100 * pitchMod, now);
      filter.Q.setValueAtTime(3.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      lfo.start(now);
      osc1.start(now);
      osc2.start(now);
      lfo.stop(now + 0.25);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);
    } else {
      // Cheerful high-pitch squeak chirp
      if (event.isKeyDown) {
        // Press squeak: upward pitch bend
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(850 * pitchMod, now);
        osc.frequency.exponentialRampToValueAtTime(1750 * pitchMod, now + 0.035);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(destination);
        osc.start(now);
        osc.stop(now + 0.045);
      } else {
        // Release squeak: short downward puff
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500 * pitchMod, now);
        osc.frequency.exponentialRampToValueAtTime(950 * pitchMod, now + 0.025);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(destination);
        osc.start(now);
        osc.stop(now + 0.035);
      }
    }
  }

  /**
   * Bubble Wrap:
   * Addictive popping bubble sounds with high-elasticity air snaps.
   */
  public static playBubbleWrap(event: KeystrokeAudioEvent, destination: AudioNode, pitchMod: number = 1.0): void {
    if (!event.isKeyDown) return;
    const ctx = audioContextManager.getContext();
    const now = ctx.currentTime;

    // Pop bubble frequency snap
    const baseFreq = (450 + Math.random() * 200) * pitchMod;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.25, now + 0.022);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.026);

    // Subtle click transient for polymer rupture
    const clickOsc = ctx.createOscillator();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1200 * pitchMod, now);
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.4, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

    osc.connect(gain);
    clickOsc.connect(clickGain);
    gain.connect(destination);
    clickGain.connect(destination);

    osc.start(now);
    clickOsc.start(now);
    osc.stop(now + 0.03);
    clickOsc.stop(now + 0.015);
  }
}
