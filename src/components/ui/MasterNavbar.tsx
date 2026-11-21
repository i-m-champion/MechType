import React, { useState } from 'react';
import { SOUND_PROFILES, SoundProfileId } from '../../types/audio';
import { soundEngine } from '../../audio/SoundEngine';
import { lofiRhythmEngine } from '../../audio/LofiRhythmEngine';
import { useTheme } from '../../context/ThemeContext';
import {
  Volume2,
  VolumeX,
  Music,
  Tv,
  Settings,
  Activity,
  Search,
  Sparkles,
  Keyboard as KeyboardIcon,
} from 'lucide-react';

export type GameMode =
  | 'speed_sprint'
  | 'code_sprint'
  | 'boss_battle'
  | 'zen_typewriter'
  | 'blindfold'
  | 'sudden_death'
  | 'mechanical_duel';

interface MasterNavbarProps {
  activeMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onOpenSettings: () => void;
  onOpenHeatmap: () => void;
  onOpenAutopsy: () => void;
}

export const MasterNavbar: React.FC<MasterNavbarProps> = ({
  activeMode,
  onSelectMode,
  onOpenSettings,
  onOpenHeatmap,
  onOpenAutopsy,
}) => {
  const { themeConfig, theme, setTheme, scanlinesEnabled, toggleScanlines, volume, setVolume } = useTheme();
  const [currentProfile, setCurrentProfile] = useState<SoundProfileId>(() => soundEngine.getProfile());
  const [isLofiActive, setIsLofiActive] = useState<boolean>(() => lofiRhythmEngine.isEnabled());

  const handleProfileChange = (id: SoundProfileId) => {
    setCurrentProfile(id);
    soundEngine.setProfile(id);
    // Preview sound
    soundEngine.triggerKeystroke({
      key: 'a',
      code: 'KeyA',
      isKeyDown: true,
    });
  };

  const handleToggleLofi = () => {
    const nextState = lofiRhythmEngine.toggle();
    setIsLofiActive(nextState);
  };

  const modes: { id: GameMode; label: string; icon: string }[] = [
    { id: 'speed_sprint', label: 'Speed Sprint', icon: '⚡' },
    { id: 'code_sprint', label: 'Code Sprint', icon: '💻' },
    { id: 'boss_battle', label: 'Boss Battle', icon: '🐉' },
    { id: 'zen_typewriter', label: 'Zen ASMR', icon: '📜' },
    { id: 'blindfold', label: 'Blindfold', icon: '🙈' },
    { id: 'sudden_death', label: 'Hardcore', icon: '💀' },
    { id: 'mechanical_duel', label: '1v1 Duel', icon: '⚔️' },
  ];

  return (
    <header className="w-full border-b border-white/5 backdrop-blur-md sticky top-0 z-40 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-lg border shadow-lg"
            style={{
              backgroundColor: themeConfig.surface,
              borderColor: themeConfig.accent,
              color: themeConfig.accent,
              boxShadow: `0 0 15px ${themeConfig.glow}`,
            }}
          >
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-base tracking-wider text-slate-100">
                MECHTYPE
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                v2.0 KINETIC
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              ASMR Mechanical Keyboard & Rhythm Engine
            </div>
          </div>
        </div>

        {/* Game Mode Tabs */}
        <nav className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto max-w-full">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeMode === m.id
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </nav>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2.5">
          {/* Soundpack Selector */}
          <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
            <KeyboardIcon className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={currentProfile}
              onChange={(e) => handleProfileChange(e.target.value as SoundProfileId)}
              className="bg-transparent text-xs font-mono text-cyan-300 focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              <optgroup label="Mechanical Switches" className="bg-slate-900 text-slate-200">
                {SOUND_PROFILES.filter((p) => p.category === 'mechanical').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Bonus Soundpacks" className="bg-slate-900 text-slate-200">
                {SOUND_PROFILES.filter((p) => p.category === 'bonus').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Lo-Fi Rhythm Sync Toggle */}
          <button
            onClick={handleToggleLofi}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all ${
              isLofiActive
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-md shadow-purple-950/40 animate-pulse'
                : 'bg-black/30 text-slate-400 border-white/5 hover:text-slate-200'
            }`}
            title="Toggle Lo-Fi Ambient Harmonizer Beat"
          >
            <Music className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lo-Fi Beat</span>
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={toggleScanlines}
            className={`p-1.5 rounded-lg border transition-colors ${
              scanlinesEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-black/30 text-slate-400 border-white/5 hover:text-slate-200'
            }`}
            title="Toggle CRT Retro Scanline Overlay"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Ergonomic Heatmap Button */}
          <button
            onClick={onOpenHeatmap}
            className="p-1.5 rounded-lg bg-black/30 text-slate-400 border border-white/5 hover:text-cyan-300 transition-colors"
            title="10-Finger Heatmap & Ergonomics"
          >
            <Activity className="w-4 h-4" />
          </button>

          {/* Typo Autopsy Button */}
          <button
            onClick={onOpenAutopsy}
            className="p-1.5 rounded-lg bg-black/30 text-slate-400 border border-white/5 hover:text-rose-300 transition-colors"
            title="Slow-Mo Typo Autopsy"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Settings Drawer Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-black/30 text-slate-400 border border-white/5 hover:text-cyan-300 transition-colors"
            title="Acoustic Settings & Calibration"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
