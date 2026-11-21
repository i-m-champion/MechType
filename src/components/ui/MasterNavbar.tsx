import React, { useState } from 'react';
import { SOUND_PROFILES, SoundProfileId } from '../../types/audio';
import { soundEngine } from '../../audio/SoundEngine';
import { lofiRhythmEngine } from '../../audio/LofiRhythmEngine';
import { useTheme } from '../../context/ThemeContext';
import { KeycapTheme } from '../../types/theme';
import {
  Volume2,
  Music,
  Tv,
  Sliders,
  Activity,
  Search,
  Keyboard as KeyboardIcon,
  Palette,
  Check,
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

const QUICK_COLORWAYS: { id: KeycapTheme; label: string; color: string }[] = [
  { id: 'architectural_orange', label: 'Orange', color: '#ff5500' },
  { id: 'architectural_green', label: 'Green', color: '#10b981' },
  { id: 'architectural_yellow', label: 'Yellow', color: '#f59e0b' },
  { id: 'architectural_blue', label: 'Blue', color: '#0284c7' },
];

export const MasterNavbar: React.FC<MasterNavbarProps> = ({
  activeMode,
  onSelectMode,
  onOpenSettings,
  onOpenHeatmap,
  onOpenAutopsy,
}) => {
  const { theme, setTheme, themeConfig } = useTheme();
  const [currentProfile, setCurrentProfile] = useState<SoundProfileId>(() => soundEngine.getProfile());
  const [isLofiActive, setIsLofiActive] = useState<boolean>(() => lofiRhythmEngine.isEnabled());

  const handleProfileChange = (id: SoundProfileId) => {
    setCurrentProfile(id);
    soundEngine.setProfile(id);
    soundEngine.triggerKeystroke({
      key: 'a',
      code: 'KeyA',
      isKeyDown: true,
    });
  };

  const handleToggleLofi = () => {
    const next = lofiRhythmEngine.toggle();
    setIsLofiActive(next);
  };

  const modes: { id: GameMode; label: string; tag: string }[] = [
    { id: 'speed_sprint', label: 'Speed Sprint', tag: '01' },
    { id: 'code_sprint', label: 'Code Sprint', tag: '02' },
    { id: 'boss_battle', label: 'Boss Battle', tag: '03' },
    { id: 'zen_typewriter', label: 'Zen ASMR', tag: '04' },
    { id: 'blindfold', label: 'Blindfold', tag: '05' },
    { id: 'sudden_death', label: 'Hardcore', tag: '06' },
    { id: 'mechanical_duel', label: '1v1 Duel', tag: '07' },
  ];

  return (
    <header className="w-full border-b border-neutral-200 sticky top-0 z-40 transition-colors backdrop-blur-md bg-white/95 text-neutral-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Left: Brand Monogram */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-1.5 px-2.5 rounded-lg border border-neutral-200 bg-white shadow-xs">
            {/* Monogram Box dynamically colored with active accent */}
            <div
              className="w-5 h-5 rounded text-white flex items-center justify-center font-bold text-[10px] shadow-xs transition-colors"
              style={{ backgroundColor: themeConfig.accent }}
            >
              ::
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold tracking-wider text-[11px] font-display-chamfer text-neutral-900">
                MECHTYPE
              </span>
              <span
                className="text-[8px] tracking-widest font-bold uppercase transition-colors"
                style={{ color: themeConfig.accent }}
              >
                LABS // 2024
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-neutral-500 pl-2 border-l border-neutral-200">
            <span>←</span>
            <span className="hover:text-neutral-900 cursor-pointer transition-colors font-medium">
              Sensory Lab
            </span>
          </div>
        </div>

        {/* Center: Mode Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full py-1">
          {modes.map((m) => {
            const isActive = activeMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMode(m.id)}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'font-bold bg-neutral-100 text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 border border-transparent'
                }`}
                style={
                  isActive
                    ? {
                        borderColor: `${themeConfig.accent}80`,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                      }
                    : undefined
                }
              >
                {isActive && (
                  <span className="font-bold transition-colors" style={{ color: themeConfig.accent }}>
                    ┌
                  </span>
                )}
                <span>{m.label}</span>
                {isActive && (
                  <span className="font-bold transition-colors" style={{ color: themeConfig.accent }}>
                    ┘
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Technical Controls, Colorway Quick Switcher & Action */}
        <div className="flex items-center gap-2">
          {/* =========================================================================
              QUICK UI COLORWAY PICKER PILL (Orange, Green, Yellow, Blue + Dropdown)
              ========================================================================= */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-200 bg-white shadow-xs">
            <Palette className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase hidden md:inline">
              UI:
            </span>
            <div className="flex items-center gap-1.5">
              {QUICK_COLORWAYS.map((preset) => {
                const isSelected =
                  theme === preset.id ||
                  (preset.id === 'architectural_orange' && theme === 'industrial');
                return (
                  <button
                    key={preset.id}
                    onClick={() => setTheme(preset.id)}
                    className={`w-4 h-4 rounded-full transition-all relative flex items-center justify-center ${
                      isSelected
                        ? 'scale-125 ring-2 ring-neutral-400 ring-offset-1'
                        : 'opacity-70 hover:opacity-100 hover:scale-110'
                    }`}
                    style={{ backgroundColor: preset.color }}
                    title={`Switch UI to Architectural ${preset.label}`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            {/* Quick All-Theme Dropdown */}
            <select
              value={theme === 'industrial' ? 'architectural_orange' : theme}
              onChange={(e) => setTheme(e.target.value as KeycapTheme)}
              className="bg-transparent text-[11px] font-mono font-bold text-neutral-800 focus:outline-none cursor-pointer ml-1 pl-1 border-l border-neutral-200 max-w-[90px] sm:max-w-[120px] truncate"
              title="Select Full Theme Preset"
            >
              <optgroup label="Architectural White Themes">
                <option value="architectural_orange">Orange</option>
                <option value="architectural_green">Green</option>
                <option value="architectural_yellow">Yellow</option>
                <option value="architectural_blue">Blue</option>
              </optgroup>
              <optgroup label="Arcade Nocturnal Themes">
                <option value="cyberpunk">Cyberpunk</option>
                <option value="retro1984">Retro 1984</option>
                <option value="nordic">Nordic Slate</option>
                <option value="crt">CRT Green</option>
              </optgroup>
            </select>
          </div>

          {/* Switch Selector Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-200 bg-white shadow-xs">
            <KeyboardIcon
              className="w-3.5 h-3.5 transition-colors"
              style={{ color: themeConfig.accent }}
            />
            <select
              value={currentProfile}
              onChange={(e) => handleProfileChange(e.target.value as SoundProfileId)}
              className="bg-transparent text-[11px] font-mono font-bold text-neutral-900 focus:outline-none cursor-pointer max-w-[120px] truncate"
            >
              <optgroup label="Mechanical Switches" className="bg-white text-neutral-900">
                {SOUND_PROFILES.filter((p) => p.category === 'mechanical').map((p) => (
                  <option key={p.id} value={p.id} className="bg-white text-neutral-900">
                    {p.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Bonus Soundpacks" className="bg-white text-neutral-900">
                {SOUND_PROFILES.filter((p) => p.category === 'bonus').map((p) => (
                  <option key={p.id} value={p.id} className="bg-white text-neutral-900">
                    {p.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Lo-Fi Rhythm Harmonizer Sync */}
          <button
            onClick={handleToggleLofi}
            className={`px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1.5 text-[11px] shadow-xs ${
              isLofiActive ? 'font-bold animate-pulse' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
            style={
              isLofiActive
                ? {
                    backgroundColor: `${themeConfig.accent}15`,
                    borderColor: themeConfig.accent,
                    color: themeConfig.accent,
                  }
                : {
                    borderColor: '#e5e7eb',
                    backgroundColor: '#ffffff',
                  }
            }
            title="Toggle Ambient Lo-Fi Melodic Harmonizer"
          >
            <Music className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-semibold">Lo-Fi</span>
          </button>

          {/* 10-Finger Heatmap */}
          <button
            onClick={onOpenHeatmap}
            className="p-1.5 rounded-md border border-neutral-200 bg-white hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 transition-colors shadow-xs"
            title="10-Finger Ergonomic Heatmap"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>

          {/* Typo Autopsy */}
          <button
            onClick={onOpenAutopsy}
            className="p-1.5 rounded-md border border-neutral-200 bg-white hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 transition-colors shadow-xs"
            title="Slow-Mo Typo Autopsy"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* High-Impact Action Pill Button */}
          <button
            onClick={onOpenSettings}
            className="btn-accent-pill px-3 py-1.5 rounded-md font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md"
            style={{ backgroundColor: themeConfig.accent }}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>CALIBRATE</span>
          </button>
        </div>
      </div>
    </header>
  );
};
