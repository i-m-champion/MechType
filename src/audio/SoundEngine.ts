import { audioContextManager } from './AudioContextManager';
import { SwitchSynthesizer } from './SwitchSynthesizer';
import { BonusSynthesizer } from './BonusSynthesizer';
import { KeystrokeAudioEvent, SoundProfileId } from '../types/audio';

/**
 * SoundEngine
 * Coordinates all switch profiles, bonus soundpacks, physical acoustic realism:
 * - Micro pitch jitter (+/- 3%)
 * - Stabilizer wire rattle and deep cavity resonance on Space/Enter/Backspace
 * - Dual-action press/release triggers
 * - Column-based binaural stereo field placement
 */

export class SoundEngine {
  private static instance: SoundEngine;
  private currentProfile: SoundProfileId = 'cherry_blue';
  private jitterEnabled: boolean = true;
  private stabilizersEnabled: boolean = true;
  private dualActionEnabled: boolean = true;

  private constructor() {
    const savedProfile = localStorage.getItem('mechtype_sound_profile');
    if (savedProfile) {
      this.currentProfile = savedProfile as SoundProfileId;
    }
  }

  public static getInstance(): SoundEngine {
    if (!SoundEngine.instance) {
      SoundEngine.instance = new SoundEngine();
    }
    return SoundEngine.instance;
  }

  public setProfile(profile: SoundProfileId): void {
    this.currentProfile = profile;
    localStorage.setItem('mechtype_sound_profile', profile);
  }

  public getProfile(): SoundProfileId {
    return this.currentProfile;
  }

  public setJitterEnabled(enabled: boolean): void {
    this.jitterEnabled = enabled;
  }

  public setStabilizersEnabled(enabled: boolean): void {
    this.stabilizersEnabled = enabled;
  }

  public setDualActionEnabled(enabled: boolean): void {
    this.dualActionEnabled = enabled;
  }

  /**
   * Primary Keystroke Trigger
   */
  public triggerKeystroke(event: KeystrokeAudioEvent): void {
    if (!this.dualActionEnabled && !event.isKeyDown) {
      return;
    }

    const ctx = audioContextManager.getContext();

    // Destination: Master compressor or Opponent 3D spatial panner
    let destination: AudioNode = event.isOpponent
      ? audioContextManager.getOpponentInput()
      : audioContextManager.getMasterInput();

    // 1. Column-based Stereo Panning (Creates wide tactile acoustic stage)
    if (!event.isOpponent && ctx.createStereoPanner && event.columnNormalized !== undefined) {
      const panner = ctx.createStereoPanner();
      // subtle pan -0.45 to +0.45 for a natural seated keyboard acoustic field
      panner.pan.setValueAtTime(event.columnNormalized * 0.45, ctx.currentTime);
      panner.connect(destination);
      destination = panner;
    }

    // 2. Randomized Pitch Jitter (+/- 3%)
    let pitchMod = 1.0;
    if (this.jitterEnabled) {
      const jitterRange = 0.03; // +/- 3%
      pitchMod = 1.0 + (Math.random() * 2 - 1) * jitterRange;
    }

    // 3. Stabilizer Wire Rattle & Deep Resonance for Large Modifier Keys
    if (this.stabilizersEnabled && event.isKeyDown && (event.isSpacebar || event.isEnter || event.isBackspace)) {
      this.playStabilizerAcoustics(event, destination, pitchMod);
    }

    // 4. Dispatch to Switch / Soundpack Synthesizer
    switch (this.currentProfile) {
      case 'cherry_blue':
        SwitchSynthesizer.playCherryBlue(event, destination, pitchMod);
        break;
      case 'gateron_black':
        SwitchSynthesizer.playGateronBlack(event, destination, pitchMod);
        break;
      case 'ibm_model_m':
        SwitchSynthesizer.playIbmModelM(event, destination, pitchMod);
        break;
      case 'cherry_red':
        SwitchSynthesizer.playCherryRed(event, destination, pitchMod);
        break;
      case 'typewriter_1920':
        SwitchSynthesizer.playTypewriter(event, destination, pitchMod);
        break;
      case 'minecraft':
        BonusSynthesizer.playMinecraft(event, destination, pitchMod);
        break;
      case 'rubber_duck':
        BonusSynthesizer.playRubberDuck(event, destination, pitchMod);
        break;
      case 'bubble_wrap':
        BonusSynthesizer.playBubbleWrap(event, destination, pitchMod);
        break;
      default:
        SwitchSynthesizer.playCherryBlue(event, destination, pitchMod);
    }
  }

  /**
   * Stabilizer Physics:
   * Adds mechanical wire-tick and large hollow keycap acoustic body resonance.
   */
  private playStabilizerAcoustics(event: KeystrokeAudioEvent, destination: AudioNode, pitchMod: number): void {
    const ctx = audioContextManager.getContext();
    const now = ctx.currentTime;

    // A. Hollow Deep Keycap Body Cavity Resonance (95Hz-130Hz)
    const cavityFreq = event.isSpacebar ? 95 * pitchMod : 125 * pitchMod;
    const cavityOsc = ctx.createOscillator();
    cavityOsc.type = 'sine';
    cavityOsc.frequency.setValueAtTime(cavityFreq, now);

    const cavityGain = ctx.createGain();
    cavityGain.gain.setValueAtTime(0.35, now);
    cavityGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    cavityOsc.connect(cavityGain);
    cavityGain.connect(destination);
    cavityOsc.start(now);
    cavityOsc.stop(now + 0.055);

    // B. Stabilizer Wire Ticking Rattle (subtle metal wire clink ~4200Hz)
    const wireOsc = ctx.createOscillator();
    wireOsc.type = 'triangle';
    wireOsc.frequency.setValueAtTime(4200 * pitchMod, now);

    const wireGain = ctx.createGain();
    wireGain.gain.setValueAtTime(0.12, now + 0.004);
    wireGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.016);

    wireOsc.connect(wireGain);
    wireGain.connect(destination);
    wireOsc.start(now + 0.004);
    wireOsc.stop(now + 0.02);
  }
}

export const soundEngine = SoundEngine.getInstance();
