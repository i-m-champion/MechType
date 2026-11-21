import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ANSI_KEYBOARD_LAYOUT } from '../../data/keyboardLayout';
import { KeyDefinition } from '../../types/keyboard';
import { useTheme } from '../../context/ThemeContext';
import { soundEngine } from '../../audio/SoundEngine';
import { lofiRhythmEngine } from '../../audio/LofiRhythmEngine';
import { RgbRippleOverlay } from './RgbRippleOverlay';
import { RgbMode, RgbWave } from '../../types/rgb';

interface KeyState {
  isPressed: boolean;
  plungeOffset: number; // in pixels (0 = unpressed, 6 = fully plunged)
  velocity: number;
  lastPressedTime: number;
  rippleIntensity: number;
}

interface IsometricKeyboardProps {
  onVirtualKeyPress?: (key: string, code: string) => void;
  weakKeys?: Set<string>; // Keys highlighted in glowing red/orange for weak fingers
  problemKeyStats?: Record<string, { latency: number; errorRate: number }>;
}

export const IsometricKeyboardVisualizer: React.FC<IsometricKeyboardProps> = ({
  onVirtualKeyPress,
  weakKeys = new Set(),
  problemKeyStats = {},
}) => {
  const { themeConfig, theme, setTheme } = useTheme();
  const [pressedCodes, setPressedCodes] = useState<Set<string>>(new Set());
  const [rgbMode, setRgbMode] = useState<RgbMode>('rainbow');
  const [waves, setWaves] = useState<RgbWave[]>([]);
  const waveIdRef = useRef(0);
  const keyStatesRef = useRef<Record<string, KeyState>>({});
  const [, setRenderTrigger] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const spawnRgbWave = useCallback((row: number, col: number, keyWidth: number) => {
    if (rgbMode === 'off') return;
    const waveId = ++waveIdRef.current;
    // Estimate coordinates based on row and col (normalized 0..100)
    const yPercent = (row / 5) * 100 + 10;
    const xPercent = Math.min(100, Math.max(0, (col / 14) * 100 + 4));

    const newWave: RgbWave = {
      id: waveId,
      originRow: row,
      originCol: col,
      originX: xPercent,
      originY: yPercent,
      startTime: performance.now(),
      duration: 650,
      color: themeConfig.accent,
    };

    setWaves((prev) => [...prev.slice(-12), newWave]);
  }, [rgbMode, themeConfig.accent]);

  const handleWaveComplete = useCallback((id: number) => {
    setWaves((prev) => prev.filter((w) => w.id !== id));
  }, []);

  // Initialize key states
  useEffect(() => {
    ANSI_KEYBOARD_LAYOUT.forEach((row) => {
      row.forEach((key) => {
        if (!keyStatesRef.current[key.code]) {
          keyStatesRef.current[key.code] = {
            isPressed: false,
            plungeOffset: 0,
            velocity: 0,
            lastPressedTime: 0,
            rippleIntensity: 0,
          };
        }
      });
    });
  }, []);

  // Spring physics animation loop
  useEffect(() => {
    let animId: number;
    const stiffness = 380;
    const damping = 26;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      let changed = false;
      const keys = keyStatesRef.current;

      for (const code in keys) {
        const state = keys[code];
        const target = state.isPressed ? 6.5 : 0;
        const force = -stiffness * (state.plungeOffset - target) - damping * state.velocity;
        state.velocity += force * dt;
        state.plungeOffset += state.velocity * dt;

        // Clamp & decay
        if (!state.isPressed && Math.abs(state.plungeOffset) < 0.1 && Math.abs(state.velocity) < 0.1) {
          state.plungeOffset = 0;
          state.velocity = 0;
        }

        // Decay ripple
        if (state.rippleIntensity > 0) {
          state.rippleIntensity = Math.max(0, state.rippleIntensity - dt * 2.5);
          changed = true;
        }

        if (state.plungeOffset > 0 || state.velocity !== 0) {
          changed = true;
        }
      }

      if (changed) {
        setRenderTrigger((prev) => (prev + 1) % 10000);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Listen to global key events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept modifier shortcuts like Cmd+R
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const code = e.code;
      const keyState = keyStatesRef.current[code];
      if (keyState && !keyState.isPressed) {
        keyState.isPressed = true;
        keyState.lastPressedTime = performance.now();
        keyState.rippleIntensity = 1.0;
        setPressedCodes((prev) => new Set(prev).add(code));

        // Find key row/col for RGB wave
        for (const r of ANSI_KEYBOARD_LAYOUT) {
          const found = r.find((k) => k.code === code);
          if (found) {
            spawnRgbWave(found.row, found.col, found.width);
            break;
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      const keyState = keyStatesRef.current[code];
      if (keyState) {
        keyState.isPressed = false;
        setPressedCodes((prev) => {
          const next = new Set(prev);
          next.delete(code);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handlePointerDownKey = useCallback((key: KeyDefinition) => {
    const keyState = keyStatesRef.current[key.code];
    if (keyState) {
      keyState.isPressed = true;
      keyState.lastPressedTime = performance.now();
      keyState.rippleIntensity = 1.0;
      setPressedCodes((prev) => new Set(prev).add(key.code));
      spawnRgbWave(key.row, key.col, key.width);
    }

    // Trigger audio
    soundEngine.triggerKeystroke({
      key: key.label,
      code: key.code,
      isKeyDown: true,
      isSpacebar: key.isSpacebar,
      isEnter: key.isEnter,
      isBackspace: key.isBackspace,
    });

    if (lofiRhythmEngine.isEnabled()) {
      lofiRhythmEngine.triggerHarmonizedKeystroke(key.label);
    }

    if (onVirtualKeyPress) {
      onVirtualKeyPress(key.label, key.code);
    }
  }, [onVirtualKeyPress]);

  const handlePointerUpKey = useCallback((key: KeyDefinition) => {
    const keyState = keyStatesRef.current[key.code];
    if (keyState) {
      keyState.isPressed = false;
      setPressedCodes((prev) => {
        const next = new Set(prev);
        next.delete(key.code);
        return next;
      });
    }

    soundEngine.triggerKeystroke({
      key: key.label,
      code: key.code,
      isKeyDown: false,
      isSpacebar: key.isSpacebar,
      isEnter: key.isEnter,
      isBackspace: key.isBackspace,
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-5xl mx-auto select-none p-3 rounded-2xl border transition-all duration-300 relative shadow-2xl"
      style={{
        backgroundColor: themeConfig.surface,
        borderColor: themeConfig.border,
        boxShadow: `0 20px 40px -15px ${themeConfig.glow}`,
      }}
    >
      {/* Visualizer Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-neutral-200 px-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: themeConfig.accent }} />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500">
            60% ISO-SPRING VISUALIZER
          </span>
        </div>

        {/* Controls: RGB Waves & Themes */}
        <div className="flex items-center gap-3">
          {/* RGB Mode Selector */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200">
            <span className="text-[10px] font-mono text-neutral-500 px-1 font-bold">RGB:</span>
            {(['rainbow', 'neon', 'matrix', 'starlight', 'off'] as RgbMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setRgbMode(mode)}
                className={`px-1.5 py-0.5 text-[10px] font-mono uppercase rounded transition-colors ${
                  rgbMode === mode
                    ? 'bg-[#ff5500] text-white font-bold shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Keycap Theme Switcher */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200">
            <span className="text-[10px] font-mono text-neutral-500 px-1 font-bold">Theme:</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="bg-transparent text-[11px] font-mono font-bold text-neutral-900 focus:outline-none cursor-pointer"
            >
              <option value="industrial" className="bg-white text-neutral-900">Pristine White Architectural</option>
              <option value="cyberpunk" className="bg-white text-neutral-900">Cyberpunk Neon</option>
              <option value="retro1984" className="bg-white text-neutral-900">Retro 1984 Beige</option>
              <option value="nordic" className="bg-white text-neutral-900">Nordic Minimal Slate</option>
              <option value="crt" className="bg-white text-neutral-900">CRT Phosphor Green</option>
            </select>
          </div>
        </div>
      </div>

      {/* Keyboard Bed */}
      <div
        className="p-3 rounded-xl flex flex-col gap-1.5 overflow-hidden relative"
        style={{
          backgroundColor: themeConfig.panel,
          perspective: '1000px',
        }}
      >
        {/* Dynamic RGB Reactive Ripple Layer */}
        <RgbRippleOverlay
          mode={rgbMode}
          waves={waves}
          onWaveComplete={handleWaveComplete}
        />
        {ANSI_KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1.5 justify-center w-full">
            {row.map((key) => {
              const state = keyStatesRef.current[key.code] || {
                isPressed: false,
                plungeOffset: 0,
                rippleIntensity: 0,
              };
              const isPressed = pressedCodes.has(key.code) || state.isPressed;
              const plunge = Math.min(Math.max(state.plungeOffset, 0), 8);
              const isWeak = weakKeys.has(key.code) || weakKeys.has(key.label.toLowerCase());

              // Colors based on theme
              const isModifier = key.isModifier;
              const baseBg = isModifier ? themeConfig.modKeyBase : themeConfig.keycapBase;
              const topBg = isModifier ? themeConfig.modKeyTop : themeConfig.keycapTop;

              const activeGlow = isWeak
                ? 'rgba(244, 63, 94, 0.9)'
                : isPressed
                ? themeConfig.accent
                : 'transparent';

              return (
                <div
                  key={key.code}
                  onPointerDown={() => handlePointerDownKey(key)}
                  onPointerUp={() => handlePointerUpKey(key)}
                  onPointerLeave={() => {
                    if (keyStatesRef.current[key.code]?.isPressed) {
                      handlePointerUpKey(key);
                    }
                  }}
                  className="relative group cursor-pointer transition-transform ease-out"
                  style={{
                    flexGrow: key.width,
                    flexBasis: `${key.width * 36}px`,
                    height: '46px',
                    transform: `translateY(${plunge}px)`,
                    touchAction: 'none',
                  }}
                  title={problemKeyStats[key.label.toLowerCase()] ? `Latency: ${problemKeyStats[key.label.toLowerCase()].latency}ms | Error: ${problemKeyStats[key.label.toLowerCase()].errorRate}%` : undefined}
                >
                  {/* Keycap Bottom Bevel / Stem Housing (Gives 3D physical depth) */}
                  <div
                    className="absolute inset-0 rounded-lg transition-colors"
                    style={{
                      backgroundColor: baseBg,
                      boxShadow: isPressed
                        ? `0 1px 0 rgba(0,0,0,0.4)`
                        : `0 4px 0 ${baseBg}, 0 6px 8px rgba(0,0,0,0.5)`,
                    }}
                  />

                  {/* Keycap Top Face */}
                  <div
                    className="absolute inset-0 rounded-lg flex flex-col items-center justify-center p-1 border transition-all duration-75 overflow-hidden"
                    style={{
                      backgroundColor: isPressed ? themeConfig.keycapActive : topBg,
                      color: isPressed
                        ? '#ffffff'
                        : isWeak
                        ? '#f43f5e'
                        : themeConfig.keycapText,
                      borderColor: isWeak
                        ? '#f43f5e'
                        : isPressed
                        ? themeConfig.accent
                        : '#2e3447',
                      boxShadow: isWeak
                        ? `0 0 12px rgba(244, 63, 94, 0.8)`
                        : isPressed
                        ? `0 0 16px ${themeConfig.accent}`
                        : 'inset 0 1px 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.4)',
                    }}
                  >
                    {/* Top sublabel if exists */}
                    {key.subLabel && (
                      <span className="text-[9px] font-mono opacity-60 leading-none">
                        {key.subLabel}
                      </span>
                    )}

                    {/* Main Label */}
                    <span
                      className={`font-mono font-bold leading-none tracking-tight ${
                        key.label.length > 2 ? 'text-[9px] font-medium' : 'text-xs'
                      }`}
                    >
                      {key.label}
                    </span>

                    {/* Problem key warning dot */}
                    {isWeak && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
