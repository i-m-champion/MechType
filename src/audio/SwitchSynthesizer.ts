import { audioContextManager } from './AudioContextManager';
import { KeystrokeAudioEvent, SwitchProfile } from '../types/audio';

/**
 * Procedural Mechanical Switch Synthesizer
 * Synthesizes 5 authentic switch profiles directly via Web Audio API.
 * High performance, zero latency, no external mp3 downloads required.
 */

// Cached procedural noise buffers
let whiteNoiseBuffer: AudioBuffer | null = null;
let pinkNoiseBuffer: AudioBuffer | null = null;

function getNoiseBuffers(ctx: AudioContext) {
  if (whiteNoiseBuffer && pinkNoiseBuffer) {
    return { white: whiteNoiseBuffer, pink: pinkNoiseBuffer };
  }

  const length = ctx.sampleRate * 1.0; // 1 second buffer
  const white = ctx.createBuffer(1, length, ctx.sampleRate);
  const pink = ctx.createBuffer(1, length, ctx.sampleRate);
  const wData = white.getChannelData(0);
  const pData = pink.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

  for (let i = 0; i < length; i++) {
    const whiteVal = Math.random() * 2 - 1;
    wData[i] = whiteVal;

    // Paul Kellet's filter method for pink noise
    b0 = 0.99886 * b0 + whiteVal * 0.0555179;
    b1 = 0.99332 * b1 + whiteVal * 0.0750759;
    b2 = 0.96900 * b2 + whiteVal * 0.1538520;
    b3 = 0.86650 * b3 + whiteVal * 0.3104856;
    b4 = 0.55000 * b4 + whiteVal * 0.5329522;
    b5 = -0.7616 * b5 - whiteVal * 0.0168980;
    pData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + whiteVal * 0.5362) * 0.11;
    b6 = whiteVal * 0.115926;
  }

  whiteNoiseBuffer = white;
  pinkNoiseBuffer = pink;
  return { white, pink };
}

export class SwitchSynthesizer {
  /**
   * Synthesize Cherry MX Blue:
   * High-pitched tactile click and snap + bottom-out plastic clack.
   */
  public static playCherryBlue(event: KeystrokeAudioEvent, destination: AudioNode, pitchMod: number = 1.0): void {
    const ctx = audioContextManager.getContext();
    const now = ctx.currentTime;
    const { white, pink } = getNoiseBuffers(ctx);

    if (event.isKeyDown) {
      // 1. Sharp tactile click jacket snap (high frequency burst)
      const clickSrc = ctx.createBufferSource();
      clickSrc.buffer = white;
      clickSrc.playbackRate.setValueAtTime(pitchMod * 1.1, now);

      const clickFilter = ctx.createBiquadFilter();
      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime(3400 * pitchMod, now);
      clickFilter.Q.setValueAtTime(4.5, now);

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.7, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);

      clickSrc.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(destination);

      clickSrc.start(now);
      clickSrc.stop(now + 0.02);

      // 2. Plastic housing bottom-out clack
      const clackOsc = ctx.createOscillator();
      clackOsc.type = 'triangle';
      clackOsc.frequency.setValueAtTime(480 * pitchMod, now);
      clackOsc.frequency.exponentialRampToValueAtTime(140 * pitchMod, now + 0.035);

      const clackGain = ctx.createGain();
      clackGain.gain.setValueAtTime(0.5, now);
      clackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      clackOsc.connect(clackGain);
      clackGain.connect(destination);

      clackOsc.start(now);
      clackOsc.stop(now + 0.045);
    } else {
      // Release clack (tactile reset click)
      const relSrc = ctx.createBufferSource();
      relSrc.buffer = pink;
      relSrc.playbackRate.setValueAtTime(pitchMod, now);

      const relFilter = ctx.createBiquadFilter();
      relFilter.type = 'highpass';
      relFilter.frequency.setValueAtTime(2600 * pitchMod, now);

      const relGain = ctx.createGain();
      relGain.gain.setValueAtTime(0.25, now);
      relGain.gain.exponentialRampToValueAtTime(0.001, now + 0.016);

      relSrc.connect(relFilter);
      relFilter.connect(relGain);
      relGain.connect(destination);

      relSrc.start(now);
      relSrc.stop(now + 0.02);
    }
  }

  /**
   * Synthesize Gateron Ink Black:
   * Deep, lubricated, buttery "thock" sound with cushioned bottom-out.
   */
  public static playGateronBlack(event: KeystrokeAudioEvent, destination: AudioNode, pitchMod: number = 1.0): void {
    const ctx = audioContextManager.getContext();
    const now = ctx.currentTime;
    const { pink } = getNoiseBuffers(ctx);

    if (event.isKeyDown) {
      // Deep low-frequency resonant thud
      const thockOsc = ctx.createOscillator();
      thockOsc.type = 'sine';
      thockOsc.frequency.setValueAtTime(220 * pitchMod, now);
      thockOsc.frequency.exponentialRampToValueAtTime(65 * pitchMod, now + 0.045);

      const thockGain = ctx.createGain();
      thockGain.gain.setValueAtTime(0.85, now);
      thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      // Lowpass filtered noise for lubricated stem impact
      const lubeSrc = ctx.createBufferSource();
      lubeSrc.buffer = pink;
      const lubeFilter = ctx.createBiquadFilter();
      lubeFilter.type = 'lowpass';
      lubeFilter.frequency.setValueAtTime(580 * pitchMod, now);
      lubeFilter.Q.setValueAtTime(2.0, now);

      const lubeGain = ctx.createGain();
      lubeGain.gain.setValueAtTime(0.45, now);
      lubeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      thockOsc.connect(thockGain);
      thockGain.connect(destination);

      lubeSrc.connect(lubeFilter);
      lubeFilter.connect(lubeGain);
      lubeGain.connect(destination);

      thockOsc.start(now);
      thockOsc.stop(now + 0.055);
      lubeSrc.start(now);
      lubeSrc.stop(now + 0.04);
    } else {
      // Soft buttery stem return
      const retOsc = ctx.createOscillator();
      retOsc.type = 'sine';
      retOsc.frequency.setValueAtTime(160 * pitchMod, now);
      retOsc.frequency.exponentialRampToValueAtTime(90 * pitchMod, now + 0.025);

      const retGain = ctx.createGain();
      retGain.gain.setValueAtTime(0.2, now);
      retGain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

      retOsc.connect(retGain);
      retGain.connect(destination);
      retOsc.start(now);
      retOsc.stop(now + 0.03);
    }
  }

  /**
   * Synthesize IBM Model M 1985:
   * Heavy buckling spring metallic clank and steel acoustic ring.
   */
  public static playIbmModelM(event: KeystrokeAudioEvent, destination: AudioNode, pitchMod: number = 1.0): void {
    const ctx = audioContextManager.getContext();
    const now = ctx.currentTime;
    const { white } = getNoiseBuffers(ctx);

    if (event.isKeyDown) {
      // 1. Heavy mechanical steel impact
      const impactOsc = ctx.createOscillator();
      impactOsc.type = 'triangle';
      impactOsc.frequency.setValueAtTime(320 * pitchMod, now);
      impactOsc.frequency.exponentialRampToValueAtTime(110 * pitchMod, now + 0.06);

      const impactGain = ctx.createGain();
      impactGain.gain.setValueAtTime(0.7, now);
      impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      impactOsc.connect(impactGain);
      impactGain.connect(destination);
      impactOsc.start(now);
      impactOsc.stop(now + 0.07);

      // 2. Buckling Spring Metallic Twang & Ring (3 resonant frequencies)
      const freqs = [1420 * pitchMod, 2260 * pitchMod, 3180 * pitchMod];
      freqs.forEach((freq, idx) => {
        const springOsc = ctx.createOscillator();
        springOsc.type = 'sine';
        springOsc.frequency.setValueAtTime(freq, now);

        const springGain = ctx.createGain();
        const initialVol = (0.28 / (idx + 1));
        springGain.gain.setValueAtTime(initialVol, now);
        springGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.09 + idx * 0.03);

        springOsc.connect(springGain);
        springGain.connect(destination);
        springOsc.start(now);
        springOsc.stop(now + 0.13);
      });

      // 3. Steel clatter transient
      const clatterSrc = ctx.createBufferSource();
      clatterSrc.buffer = white;
      const clatterFilter = ctx.createBiquadFilter();
      clatterFilter.type = 'bandpass';
      clatterFilter.frequency.setValueAtTime(2400 * pitchMod, now);
      clatterFilter.Q.setValueAtTime(3.0, now);

      const clatterGain = ctx.createGain();
      clatterGain.gain.setValueAtTime(0.35, now);
      clatterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      clatterSrc.connect(clatterFilter);
      clatterFilter.connect(clatterGain);
      clatterGain.connect(destination);
      clatterSrc.start(now);
      clatterSrc.stop(now + 0.03);
    } else {
      // Spring reset ping
      const resetOsc = ctx.createOscillator();
      resetOsc.type = 'sine';
      resetOsc.frequency.setValueAtTime(1800 * pitchMod, now);
      const resetGain = ctx.createGain();
      resetGain.gain.setValueAtTime(0.18, now);
      resetGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      resetOsc.connect(resetGain);
      resetGain.connect(destination);
      resetOsc.start(now);
      resetOsc.stop(now + 0.04);
    }
  }

  /**
   * Synthesize Cherry MX Red:
   * Silent, buttery smooth linear glide. Soft cushioned clack.
   */
  public static playCherryRed(event: KeystrokeAudioEvent, destination: AudioNode, pitchMod: number = 1.0): void {
    const ctx = audioContextManager.getContext();
    const now = ctx.currentTime;
    const { pink } = getNoiseBuffers(ctx);

    if (event.isKeyDown) {
      // Soft cushioned lowpass clack
      const redOsc = ctx.createOscillator();
      redOsc.type = 'sine';
      redOsc.frequency.setValueAtTime(190 * pitchMod, now);
      redOsc.frequency.exponentialRampToValueAtTime(90 * pitchMod, now + 0.03);

      const redGain = ctx.createGain();
      redGain.gain.setValueAtTime(0.4, now);
      redGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      // Gentle linear stem friction
      const fricSrc = ctx.createBufferSource();
      fricSrc.buffer = pink;
      const fricFilter = ctx.createBiquadFilter();
      fricFilter.type = 'lowpass';
      fricFilter.frequency.setValueAtTime(420 * pitchMod, now);

      const fricGain = ctx.createGain();
      fricGain.gain.setValueAtTime(0.2, now);
      fricGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      redOsc.connect(redGain);
      redGain.connect(destination);
      fricSrc.connect(fricFilter);
      fricFilter.connect(fricGain);
      fricGain.connect(destination);

      redOsc.start(now);
      redOsc.stop(now + 0.04);
      fricSrc.start(now);
      fricSrc.stop(now + 0.03);
    } else {
      // Very gentle stem return
      const retOsc = ctx.createOscillator();
      retOsc.type = 'sine';
      retOsc.frequency.setValueAtTime(140 * pitchMod, now);
      const retGain = ctx.createGain();
      retGain.gain.setValueAtTime(0.12, now);
      retGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      retOsc.connect(retGain);
      retGain.connect(destination);
      retOsc.start(now);
      retOsc.stop(now + 0.025);
    }
  }

  /**
   * Synthesize 1920s Underwood Typewriter:
   * Heavy steel hammer strike + carriage return bell *DING!* on Enter.
   */
  public static playTypewriter(event: KeystrokeAudioEvent, destination: AudioNode, pitchMod: number = 1.0): void {
    const ctx = audioContextManager.getContext();
    const now = ctx.currentTime;
    const { white, pink } = getNoiseBuffers(ctx);

    if (event.isKeyDown) {
      // 1. Steel hammer strike onto platen
      const strikeSrc = ctx.createBufferSource();
      strikeSrc.buffer = white;
      const strikeFilter = ctx.createBiquadFilter();
      strikeFilter.type = 'bandpass';
      strikeFilter.frequency.setValueAtTime(1600 * pitchMod, now);
      strikeFilter.Q.setValueAtTime(2.5, now);

      const strikeGain = ctx.createGain();
      strikeGain.gain.setValueAtTime(0.75, now);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      strikeSrc.connect(strikeFilter);
      strikeFilter.connect(strikeGain);
      strikeGain.connect(destination);
      strikeSrc.start(now);
      strikeSrc.stop(now + 0.035);

      // 2. Heavy platen body thud
      const thudOsc = ctx.createOscillator();
      thudOsc.type = 'triangle';
      thudOsc.frequency.setValueAtTime(260 * pitchMod, now);
      thudOsc.frequency.exponentialRampToValueAtTime(80 * pitchMod, now + 0.05);

      const thudGain = ctx.createGain();
      thudGain.gain.setValueAtTime(0.65, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      thudOsc.connect(thudGain);
      thudGain.connect(destination);
      thudOsc.start(now);
      thudOsc.stop(now + 0.06);

      // 3. Authentic Carriage Return Bell DING! on Enter!
      if (event.isEnter || event.key === 'Enter') {
        const bellFreq = 2093; // C7 crystalline metal bell
        const bellOsc = ctx.createOscillator();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(bellFreq, now);

        const bellHarmonic = ctx.createOscillator();
        bellHarmonic.type = 'sine';
        bellHarmonic.frequency.setValueAtTime(bellFreq * 2.76, now); // Metallic chime ratio

        const bellGain = ctx.createGain();
        bellGain.gain.setValueAtTime(0.8, now);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2); // Long resonant chime ring

        const harmonicGain = ctx.createGain();
        harmonicGain.gain.setValueAtTime(0.3, now);
        harmonicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

        bellOsc.connect(bellGain);
        bellHarmonic.connect(harmonicGain);
        bellGain.connect(destination);
        harmonicGain.connect(destination);

        bellOsc.start(now);
        bellOsc.stop(now + 1.25);
        bellHarmonic.start(now);
        bellHarmonic.stop(now + 0.85);
      }
    } else {
      // Paper platen release spring click
      const relSrc = ctx.createBufferSource();
      relSrc.buffer = pink;
      const relFilter = ctx.createBiquadFilter();
      relFilter.type = 'highpass';
      relFilter.frequency.setValueAtTime(1400 * pitchMod, now);

      const relGain = ctx.createGain();
      relGain.gain.setValueAtTime(0.2, now);
      relGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      relSrc.connect(relFilter);
      relFilter.connect(relGain);
      relGain.connect(destination);
      relSrc.start(now);
      relSrc.stop(now + 0.025);
    }
  }
}
