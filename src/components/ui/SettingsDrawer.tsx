import React, { useState } from 'react';
import { X, Sliders, Volume2, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { soundEngine } from '../../audio/SoundEngine';
import { SOUND_PROFILES, SoundProfileId } from '../../types/audio';
import { THEME_CONFIGS, KeycapTheme } from '../../types/theme';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, volume, setVolume, themeConfig } = useTheme();
  const [jitter, setJitter] = useState(true);
  const [stabilizers, setStabilizers] = useState(true);
  const [dualAction, setDualAction] = useState(true);

  if (!isOpen) return null;

  const handleToggleJitter = () => {
    const next = !jitter;
    setJitter(next);
    soundEngine.setJitterEnabled(next);
  };

  const handleToggleStabilizers = () => {
    const next = !stabilizers;
    setStabilizers(next);
    soundEngine.setStabilizersEnabled(next);
  };

  const handleToggleDualAction = () => {
    const next = !dualAction;
    setDualAction(next);
    soundEngine.setDualActionEnabled(next);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h3 className="font-mono font-bold text-slate-100 tracking-wider">
                  ACOUSTIC CALIBRATION & THEMES
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Master Volume */}
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-cyan-400" /> Master Volume
                </span>
                <span className="text-cyan-400 font-bold">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Physical Acoustic Realism Toggles */}
            <div className="mt-8 flex flex-col gap-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Physical Acoustic Realism
              </span>

              {/* Pitch Jitter */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5">
                <div>
                  <div className="text-xs font-mono font-bold text-slate-200">Micro-Pitch Jitter (±3%)</div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Randomizes micro-detuning per keystroke for humanized organic sound.
                  </div>
                </div>
                <button
                  onClick={handleToggleJitter}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    jitter ? 'bg-cyan-500' : 'bg-slate-700'
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
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5">
                <div>
                  <div className="text-xs font-mono font-bold text-slate-200">Stabilizer Cavity & Wire Rattle</div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Deep resonance and subtle wire ticking on Spacebar, Enter, & Backspace.
                  </div>
                </div>
                <button
                  onClick={handleToggleStabilizers}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    stabilizers ? 'bg-cyan-500' : 'bg-slate-700'
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
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5">
                <div>
                  <div className="text-xs font-mono font-bold text-slate-200">Dual-Action Down/Up Audio</div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Independent micro-clicks for key bottom-out press and stem release return.
                  </div>
                </div>
                <button
                  onClick={handleToggleDualAction}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    dualAction ? 'bg-cyan-500' : 'bg-slate-700'
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
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
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
                          ? 'border-cyan-400 bg-cyan-950/30'
                          : 'border-white/5 bg-slate-950/50 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {t.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: t.bg }} />
                        <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: t.surface }} />
                        <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: t.accent }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 text-center text-[10px] font-mono text-slate-500">
            MechType ASMR Audio Synthesizer • 100% Client-Side Web Audio
          </div>
        </div>
      </div>
    </div>
  );
};
