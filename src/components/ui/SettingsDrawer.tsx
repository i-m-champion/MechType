import React, { useState } from 'react';
import { soundEngine } from '../../audio/SoundEngine';
import { useTheme } from '../../context/ThemeContext';
import { KeycapTheme, THEME_CONFIGS } from '../../types/theme';
import {
  X,
  Volume2,
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Palette,
  Check,
} from 'lucide-react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme, setTheme, themeConfig } = useTheme();

  // Audio settings local state synced to soundEngine
  const [volume, setVolumeState] = useState<number>(() => soundEngine.getMasterVolume());
  const [jitter, setJitter] = useState<boolean>(() => soundEngine.isPitchJitterEnabled());
  const [stabilizers, setStabilizers] = useState<boolean>(() => soundEngine.isStabilizerPhysicsEnabled());
  const [dualAction, setDualAction] = useState<boolean>(() => soundEngine.isDualActionEnabled());

  if (!isOpen) return null;

  const setVolume = (val: number) => {
    setVolumeState(val);
    soundEngine.setMasterVolume(val);
  };

  const handleToggleJitter = () => {
    const next = soundEngine.togglePitchJitter();
    setJitter(next);
  };

  const handleToggleStabilizers = () => {
    const next = soundEngine.toggleStabilizerPhysics();
    setStabilizers(next);
  };

  const handleToggleDualAction = () => {
    const next = soundEngine.toggleDualAction();
    setDualAction(next);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-neutral-200 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto text-neutral-900">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#ff5500]" />
                <h3 className="font-mono font-bold text-neutral-900 tracking-wider text-sm uppercase">
                  ACOUSTIC CALIBRATION & THEMES
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Master Volume */}
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-800 font-bold flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-[#ff5500]" /> Master Volume
                </span>
                <span className="text-[#ff5500] font-bold">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-[#ff5500] cursor-pointer"
              />
            </div>

            {/* Physical Acoustic Realism Toggles */}
            <div className="mt-8 flex flex-col gap-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
                Physical Acoustic Realism
              </span>

              {/* Pitch Jitter */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <div>
                  <div className="text-xs font-mono font-bold text-neutral-900">Micro-Pitch Jitter (±3%)</div>
                  <div className="text-[11px] font-mono text-neutral-500">
                    Randomizes micro-detuning per keystroke for humanized organic sound.
                  </div>
                </div>
                <button
                  onClick={handleToggleJitter}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    jitter ? 'bg-[#ff5500]' : 'bg-neutral-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      jitter ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Stabilizer Physics */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <div>
                  <div className="text-xs font-mono font-bold text-neutral-900">Stabilizer Cavity & Wire Rattle</div>
                  <div className="text-[11px] font-mono text-neutral-500">
                    Deep resonance and subtle wire ticking on Spacebar, Enter, & Backspace.
                  </div>
                </div>
                <button
                  onClick={handleToggleStabilizers}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    stabilizers ? 'bg-[#ff5500]' : 'bg-neutral-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      stabilizers ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Dual-Action Micro-clicks */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <div>
                  <div className="text-xs font-mono font-bold text-neutral-900">Dual-Action Down/Up Audio</div>
                  <div className="text-[11px] font-mono text-neutral-500">
                    Independent micro-clicks for key bottom-out press and stem release return.
                  </div>
                </div>
                <button
                  onClick={handleToggleDualAction}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    dualAction ? 'bg-[#ff5500]' : 'bg-neutral-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      dualAction ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Keycap Theme Switcher */}
            <div className="mt-8 flex flex-col gap-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
                Keycap Themes
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {(Object.keys(THEME_CONFIGS) as KeycapTheme[]).map((themeKey) => {
                  const t = THEME_CONFIGS[themeKey];
                  const isSelected = theme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      onClick={() => setTheme(themeKey)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'border-[#ff5500] bg-[#ff5500]/5 shadow-xs'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-bold text-neutral-900">
                          {t.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#ff5500]" />}
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        <span className="w-3 h-3 rounded-full border border-neutral-300" style={{ backgroundColor: t.bg }} />
                        <span className="w-3 h-3 rounded-full border border-neutral-300" style={{ backgroundColor: t.surface }} />
                        <span className="w-3 h-3 rounded-full border border-neutral-300" style={{ backgroundColor: t.accent }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-200 text-center text-[10px] font-mono text-neutral-400">
            MechType ASMR Audio Synthesizer • 100% Client-Side Web Audio
          </div>
        </div>
      </div>
    </div>
  );
};
