import React, { useState, useCallback, useRef } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { MasterNavbar, GameMode } from './components/ui/MasterNavbar';
import { IsometricKeyboardVisualizer } from './components/keyboard/IsometricKeyboardVisualizer';
import { RadialSpeedometer } from './components/analytics/RadialSpeedometer';
import { ParticleCanvas } from './components/effects/ParticleCanvas';
import { OverdriveHud } from './components/effects/OverdriveHud';
import { SpeedSprintMode } from './modes/SpeedSprintMode';
import { CodeSprintMode } from './modes/CodeSprintMode';
import { BossBattleMode } from './modes/BossBattleMode';
import { ZenTypewriterMode } from './modes/ZenTypewriterMode';
import { BlindfoldMode } from './modes/BlindfoldMode';
import { SuddenDeathMode } from './modes/SuddenDeathMode';
import { MechanicalDuel } from './components/multiplayer/MechanicalDuel';
import { SettingsDrawer } from './components/ui/SettingsDrawer';
import { WeakFingerHeatmap } from './components/analytics/WeakFingerHeatmap';
import { TypoAutopsyModal } from './components/analytics/TypoAutopsyModal';
import { WeakFingerDrillModal } from './components/analytics/WeakFingerDrillModal';
import { HistoryModal } from './components/analytics/HistoryModal';
import { ergonomicsService } from './services/ergonomicsService';
import { historyService } from './services/historyService';
import { soundEngine } from './audio/SoundEngine';
import { OverdriveTier, getOverdriveTier } from './types/overdrive';
import { TouchFinger } from './types/keyboard';
import { BarChart3, Activity } from 'lucide-react';

function MechTypeApp() {
  const { themeConfig } = useTheme();
  const [activeMode, setActiveMode] = useState<GameMode>('speed_sprint');

  // Overdrive & Live telemetry
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveKps, setLiveKps] = useState(0);
  const [streak, setStreak] = useState(0);
  const [caretPos, setCaretPos] = useState<{ x: number; y: number } | null>(null);
  const [particleTrigger, setParticleTrigger] = useState(0);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);
  const [isAutopsyOpen, setIsAutopsyOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeDrillFinger, setActiveDrillFinger] = useState<TouchFinger | null>(null);

  // Weak keys for visualizer
  const [weakKeys, setWeakKeys] = useState<Set<string>>(() => ergonomicsService.getWeakKeys());

  const handleWpmUpdate = useCallback((wpm: number, kps: number) => {
    setLiveWpm(wpm);
    setLiveKps(kps);
  }, []);

  const handleParticleTrigger = useCallback((pos: { x: number; y: number }, tier: OverdriveTier) => {
    setCaretPos(pos);
    setParticleTrigger(Date.now());
  }, []);

  const handleKeystrokeStats = useCallback((char: string, code: string, isCorrect: boolean, latencyMs: number) => {
    ergonomicsService.logKeystroke(char, code, isCorrect, latencyMs);

    if (isCorrect) {
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    // Refresh weak keys
    if (Math.random() > 0.8) {
      setWeakKeys(ergonomicsService.getWeakKeys());
    }
  }, []);

  const handleTestComplete = useCallback((result: {
    wpm: number;
    rawWpm: number;
    accuracy: number;
    duration: number;
    mode: string;
  }) => {
    historyService.addRecord({
      mode: result.mode,
      wpm: result.wpm,
      rawWpm: result.rawWpm,
      accuracy: result.accuracy,
      duration: result.duration,
      soundProfile: soundEngine.getProfile(),
    });
    setWeakKeys(ergonomicsService.getWeakKeys());
  }, []);

  const currentTier = getOverdriveTier(liveWpm);

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Dynamic Overdrive HUD & Particle Layer */}
      <ParticleCanvas tier={currentTier} caretPos={caretPos} triggerKey={particleTrigger} />
      <OverdriveHud wpm={liveWpm} streak={streak} tier={currentTier} screenShake={liveWpm >= 40} />

      {/* Master Top Navbar */}
      <MasterNavbar
        activeMode={activeMode}
        onSelectMode={(mode) => setActiveMode(mode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHeatmap={() => setIsHeatmapOpen(true)}
        onOpenAutopsy={() => setIsAutopsyOpen(true)}
      />

      {/* Main Interactive Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center justify-between gap-6 relative z-10">
        {/* Speedometer & Quick Telemetry Header */}
        <div className="w-full flex items-center justify-between gap-4 max-w-4xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 backdrop-blur-md shadow-sm transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Personal Best: {historyService.getBestWpm()} WPM</span>
            </button>
            <button
              onClick={() => setIsHeatmapOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 backdrop-blur-md shadow-sm transition-colors"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>10-Finger Heatmap</span>
            </button>
          </div>

          <RadialSpeedometer wpm={liveWpm} kps={liveKps} />
        </div>

        {/* Selected Game Mode Viewport */}
        <div className="w-full flex-1 flex flex-col items-center justify-center my-2">
          {activeMode === 'speed_sprint' && (
            <SpeedSprintMode
              onKeystrokeStats={handleKeystrokeStats}
              onTestComplete={handleTestComplete}
              onParticleTrigger={handleParticleTrigger}
              onWpmUpdate={handleWpmUpdate}
            />
          )}

          {activeMode === 'code_sprint' && (
            <CodeSprintMode
              onKeystrokeStats={handleKeystrokeStats}
              onTestComplete={handleTestComplete}
              onWpmUpdate={handleWpmUpdate}
            />
          )}

          {activeMode === 'boss_battle' && <BossBattleMode />}

          {activeMode === 'zen_typewriter' && <ZenTypewriterMode />}

          {activeMode === 'blindfold' && <BlindfoldMode />}

          {activeMode === 'sudden_death' && <SuddenDeathMode />}

          {activeMode === 'mechanical_duel' && <MechanicalDuel />}
        </div>

        {/* Interactive 3D / Isometric Keycap Visualizer */}
        <div className="w-full mt-4">
          <IsometricKeyboardVisualizer weakKeys={weakKeys} />
        </div>
      </main>

      {/* Modals & Drawers */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {isHeatmapOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl relative">
            <button
              onClick={() => setIsHeatmapOpen(false)}
              className="absolute top-4 right-4 z-10 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-300"
            >
              CLOSE
            </button>
            <WeakFingerHeatmap
              onStartDrill={(finger) => {
                setIsHeatmapOpen(false);
                setActiveDrillFinger(finger as TouchFinger);
              }}
            />
          </div>
        </div>
      )}

      {isAutopsyOpen && (
        <TypoAutopsyModal onClose={() => setIsAutopsyOpen(false)} />
      )}

      {activeDrillFinger && (
        <WeakFingerDrillModal
          finger={activeDrillFinger}
          onClose={() => setActiveDrillFinger(null)}
        />
      )}

      {isHistoryOpen && (
        <HistoryModal onClose={() => setIsHistoryOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MechTypeApp />
    </ThemeProvider>
  );
}
