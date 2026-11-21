import React, { useState } from 'react';
import { SOUND_PROFILES, SoundProfileId } from '../../types/audio';
import { soundEngine } from '../../audio/SoundEngine';
import { lofiRhythmEngine } from '../../audio/LofiRhythmEngine';
import { useTheme } from '../../context/ThemeContext';
import {
  Volume2,
  Music,
  Tv,
  Sliders,
  Activity,
  Search,
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
  const { themeConfig, toggleScanlines, scanlinesEnabled } = useTheme();
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
    <header className="w-full border-b border-[#232838] sticky top-0 z-40 transition-colors backdrop-blur-md bg-[#08090d]/90 text-white">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Left: ChainGPT Labs / Stols inspired Brand Monogram */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-1.5 px-2.5 rounded-lg border border-[#232838] bg-[#141824] shadow-sm">
            {/* Robot / Terminal Face Monogram */}
            <div className="w-5 h-5 rounded bg-[#ff5500] text-white flex items-center justify-center font-bold text-[10px]">
              ::
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold tracking-wider text-[11px] font-display-chamfer text-white">
                MECHTYPE
              </span>
              <span className="text-[8px] tracking-widest text-[#ff5500] font-bold uppercase">
                LABS // 2024
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-neutral-400 pl-2 border-l border-[#232838]">
            <span>←</span>
            <span className="hover:text-white cursor-pointer transition-colors">
              Sensory Lab
            </span>
          </div>
        </div>

        {/* Center: Mode Tabs inspired by [ Portfolio ] Blog :: Our Ecosystem */}
        <nav className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
          {modes.map((m) => {
            const isActive = activeMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMode(m.id)}
                className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'font-bold bg-[#1a202e] text-white border border-[#ff5500]/50 shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-[#141824]'
                }`}
              >
                {isActive && <span className="text-[#ff5500]">┌</span>}
                <span>{m.label}</span>
                {isActive && <span className="text-[#ff5500]">┘</span>}
              </button>
            );
          })}
        </nav>

        {/* Right: Technical Controls & Orange "Apply Now" style Action */}
        <div className="flex items-center gap-2">
          {/* Switch Selector Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#232838] bg-[#141824]">
            <KeyboardIcon className="w-3.5 h-3.5 text-[#ff5500]" />
            <select
              value={currentProfile}
              onChange={(e) => handleProfileChange(e.target.value as SoundProfileId)}
              className="bg-transparent text-[11px] font-mono font-bold text-white focus:outline-none cursor-pointer max-w-[130px] truncate"
            >
              <optgroup label="Mechanical Switches" className="bg-[#141824] text-white">
                {SOUND_PROFILES.filter((p) => p.category === 'mechanical').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Bonus Soundpacks" className="bg-[#141824] text-white">
                {SOUND_PROFILES.filter((p) => p.category === 'bonus').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Lo-Fi Rhythm Harmonizer Sync */}
          <button
            onClick={handleToggleLofi}
            className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 text-[11px] ${
              isLofiActive
                ? 'bg-[#ff5500]/20 border-[#ff5500] text-[#ff5500] font-bold shadow-md shadow-[#ff5500]/20 animate-pulse'
                : 'border-[#232838] bg-[#141824] text-neutral-400 hover:text-white'
            }`}
            title="Toggle Ambient Lo-Fi Melodic Harmonizer"
          >
            <Music className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Lo-Fi</span>
          </button>

          {/* 10-Finger Heatmap */}
          <button
            onClick={onOpenHeatmap}
            className="p-1.5 rounded border border-[#232838] bg-[#141824] hover:border-[#ff5500] text-neutral-300 hover:text-white transition-colors"
            title="10-Finger Ergonomic Heatmap"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>

          {/* Typo Autopsy */}
          <button
            onClick={onOpenAutopsy}
            className="p-1.5 rounded border border-[#232838] bg-[#141824] hover:border-[#ff5500] text-neutral-300 hover:text-white transition-colors"
            title="Slow-Mo Typo Autopsy"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* High-Impact Orange Pill Button (Inspired by APPLY NOW / APPLY FOR INCUBATION) */}
          <button
            onClick={onOpenSettings}
            className="btn-orange-pill px-3 py-1.5 rounded font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#ff5500]/25"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>CALIBRATE</span>
          </button>
        </div>
      </div>
    </header>
  );
};
