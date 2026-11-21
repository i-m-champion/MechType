import React, { useState, useCallback } from 'react';
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
import { SOUND_PROFILES } from './types/audio';
import { OverdriveTier, getOverdriveTier, getComboMultiplier } from './types/overdrive';
import { TouchFinger } from './types/keyboard';
import {
  ArrowRight,
  Sliders,
  Activity,
  Flame,
  Zap,
  ShieldCheck,
  Disc,
} from 'lucide-react';

function MechTypeApp() {
  const { themeConfig, theme } = useTheme();
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
  const comboMultiplier = getComboMultiplier(streak);
  const currentSoundMeta = SOUND_PROFILES.find((p) => p.id === soundEngine.getProfile()) || SOUND_PROFILES[0];
  const weakestFinger = ergonomicsService.getWeakestFinger();

  return (
    <div
      className="min-h-screen flex flex-col justify-between relative architectural-grid selection:bg-[#ff5500]/20 selection:text-[#ff5500] font-sans"
      style={{
        backgroundColor: themeConfig.bg,
        color: themeConfig.text,
      }}
    >
      {/* Dynamic Overdrive HUD & Particle Layer */}
      <ParticleCanvas tier={currentTier} caretPos={caretPos} triggerKey={particleTrigger} />
      <OverdriveHud wpm={liveWpm} streak={streak} tier={currentTier} screenShake={liveWpm >= 40} />

      {/* Master Top Navbar (ChainGPT Labs inspired) */}
      <MasterNavbar
        activeMode={activeMode}
        onSelectMode={(mode) => setActiveMode(mode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHeatmap={() => setIsHeatmapOpen(true)}
        onOpenAutopsy={() => setIsAutopsyOpen(true)}
      />

      {/* Main Architectural Blueprint Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-6 relative z-10">
        {/* =========================================================================
            HERO MASTHEAD: SEGMENTED BRUTALIST DISPLAY (ChainGPT Labs / Synthopsis Style)
            ========================================================================= */}
        <section className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Top Registration Bar */}
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-6 text-[11px] font-mono text-neutral-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="text-[#ff5500] font-bold">✳</span>
              <span>SYNTHETIC + ACOUSTIC</span>
              <span>/</span>
              <span>EXPERIMENTAL ENGINE</span>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <span>DESIGN 2024</span>
              <span>//</span>
              <span className="text-[#ff5500] font-bold">2001 A SPACE ODYSSEY</span>
              <span>◎</span>
            </div>
          </div>

          {/* Huge Segmented Display Title: MECH_TYPE */}
          <div className="relative py-2 flex flex-col items-center sm:items-start">
            <h1 className="font-display-chamfer text-6xl sm:text-8xl md:text-9xl font-black text-black dark:text-white tracking-tighter leading-none select-none">
              MECH_TYPE
            </h1>

            <div className="flex flex-wrap items-center justify-between w-full mt-4 gap-4 text-xs font-mono text-neutral-600 dark:text-neutral-400">
              <p className="max-w-xl text-sm leading-relaxed">
                The reinvention of human cognition & muscle memory through tactile mechanical acoustic feedback.
                <span className="text-[#ff5500] font-bold ml-1">/a sensory experiment/</span>
              </p>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold">
                <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-pulse" />
                <span>HUMAN / EXPRESSION / INTEGRATION</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              MODULAR 3-COLUMN HERO GRID (Directly from Image 1)
              ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border border-neutral-200 dark:border-neutral-800 rounded-xl mt-8 overflow-hidden bg-neutral-50 dark:bg-neutral-950">
            {/* Col 1: Meet Our Sensory Engine & Mode Count */}
            <div className="md:col-span-3 p-5 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-neutral-800 dark:bg-neutral-200" />
                  <span>Meet our sensory engine</span>
                </div>
              </div>
              <div className="mt-6">
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                  Game Modes
                </div>
                <div className="text-4xl font-display-chamfer font-black text-neutral-900 dark:text-neutral-100">
                  07
                </div>
              </div>
            </div>

            {/* Col 2: Isometric Wireframe Graphic & Bracket */}
            <div className="md:col-span-2 p-5 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center relative">
              <span className="absolute top-2 left-2 text-[10px] font-mono text-neutral-400">┌</span>
              <span className="absolute bottom-2 right-2 text-[10px] font-mono text-neutral-400">┘</span>
              <div className="w-16 h-16 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex items-center justify-center shadow-inner">
                <Disc className="w-8 h-8 text-[#ff5500] animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <span className="text-[9px] font-mono text-neutral-400 mt-2 uppercase tracking-widest">
                ZERO MP3 LATENCY
              </span>
            </div>

            {/* Col 3: Featured Active Switch Card (GT Protocol style in Image 1) */}
            <div className="md:col-span-7 p-5 bg-white dark:bg-neutral-900 flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-[#ff5500] text-white text-[9px] font-mono font-bold uppercase">
                    ACTIVE
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">
                    {currentSoundMeta.category}
                  </span>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-[11px] font-mono text-[#ff5500] font-bold hover:underline flex items-center gap-1"
                >
                  Configure Audio <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="my-3">
                <div className="text-lg font-display-chamfer font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentSoundMeta.accentColor }} />
                  {currentSoundMeta.name}
                </div>
                <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-1">
                  {currentSoundMeta.description}
                </p>
              </div>

              {/* Metric bar */}
              <div className="grid grid-cols-4 border-t border-neutral-100 dark:border-neutral-800 pt-3 text-[11px] font-mono">
                <div>
                  <div className="text-neutral-400 text-[10px]">Feel</div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100 truncate">{currentSoundMeta.tactileFeel}</div>
                </div>
                <div>
                  <div className="text-neutral-400 text-[10px]">Jitter</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">±3% Detuned</div>
                </div>
                <div>
                  <div className="text-neutral-400 text-[10px]">Stabs</div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100">Resonant Wire</div>
                </div>
                <div>
                  <div className="text-neutral-400 text-[10px]">Dual-Action</div>
                  <div className="font-bold text-[#ff5500]">Down + Up</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            DATA TELEMETRY GRID CARDS (Directly styled like the 6 cards in Image 1)
            ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Speedometer */}
          <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-900 dark:text-neutral-100 font-bold">Speedometer</span>
              <span>LIVE CADENCE</span>
            </div>
            <div className="py-2 flex justify-center">
              <RadialSpeedometer wpm={liveWpm} kps={liveKps} />
            </div>
            <div className="grid grid-cols-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-mono">
              <div>
                <span className="text-neutral-400 text-[10px]">Peak Record</span>
                <div className="font-bold text-neutral-900 dark:text-neutral-100">{historyService.getBestWpm()} WPM</div>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px]">Avg Speed</span>
                <div className="font-bold text-neutral-900 dark:text-neutral-100">{historyService.getAvgWpm()} WPM</div>
              </div>
            </div>
          </div>

          {/* Card 2: Overdrive Matrix */}
          <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-900 dark:text-neutral-100 font-bold">Overdrive State</span>
              <span className="text-[#ff5500] font-bold">TIER // 04</span>
            </div>
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="text-3xl font-display-chamfer font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-tight flex items-center gap-2">
                {currentTier === 'overdrive' ? <Zap className="w-6 h-6 text-[#ff5500]" /> : <Flame className="w-6 h-6 text-orange-500" />}
                {currentTier}
              </div>
              <div className="text-xs font-mono text-neutral-500 mt-1">
                Streak: <strong className="text-[#ff5500] font-bold">{streak}x</strong> (Multiplier: {comboMultiplier}x)
              </div>
            </div>
            <div className="grid grid-cols-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-mono">
              <div>
                <span className="text-neutral-400 text-[10px]">Sparks Trigger</span>
                <div className="font-bold text-neutral-900 dark:text-neutral-100">&gt; 40 WPM</div>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px]">Combustion</span>
                <div className="font-bold text-neutral-900 dark:text-neutral-100">&gt; 70 WPM</div>
              </div>
            </div>
          </div>

          {/* Card 3: Ergonomic Coaching */}
          <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-900 dark:text-neutral-100 font-bold">Finger Latency</span>
              <span className="text-emerald-600 dark:text-emerald-400">10-FINGER</span>
            </div>
            <div className="py-4">
              <div className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
                {weakestFinger ? (
                  <>
                    Diagnostic: <span className="text-[#ff5500] font-bold">{weakestFinger.name}</span> has{' '}
                    <strong>{weakestFinger.avgLatencyMs}ms</strong> delay & {weakestFinger.errorRate}% error rate.
                  </>
                ) : (
                  'Touch typing balance is optimal across all fingers.'
                )}
              </div>
              {weakestFinger && (
                <button
                  onClick={() => setActiveDrillFinger(weakestFinger.finger as TouchFinger)}
                  className="mt-3 px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[11px] font-mono font-bold text-[#ff5500] transition-colors"
                >
                  Start Weak-Finger Drill →
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-mono">
              <div>
                <span className="text-neutral-400 text-[10px]">Avg Accuracy</span>
                <div className="font-bold text-emerald-600 dark:text-emerald-400">{historyService.getAvgAccuracy()}%</div>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px]">Autopsy Logs</span>
                <div className="font-bold text-neutral-900 dark:text-neutral-100 cursor-pointer hover:underline" onClick={() => setIsAutopsyOpen(true)}>
                  Inspect 3s Slow-Mo
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Historical Records & Export */}
          <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-900 dark:text-neutral-100 font-bold">Analytics Vault</span>
              <span>LOCALSTORAGE</span>
            </div>
            <div className="py-4 flex flex-col gap-2">
              <div className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
                All benchmark speeds, keystroke timestamps, and switch profiles are saved locally.
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="px-2.5 py-1 rounded bg-neutral-900 text-white dark:bg-white dark:text-black text-[11px] font-mono font-bold"
                >
                  View Logbook
                </button>
                <button
                  onClick={() => historyService.exportJson()}
                  className="px-2.5 py-1 rounded border border-neutral-300 dark:border-neutral-700 text-[11px] font-mono text-neutral-600 dark:text-neutral-300"
                >
                  Export JSON
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-mono">
              <div>
                <span className="text-neutral-400 text-[10px]">Sessions Logged</span>
                <div className="font-bold text-neutral-900 dark:text-neutral-100">{historyService.getRecords().length} Tests</div>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px]">Security</span>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Offline
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MAIN INTERACTIVE GAME MODE VIEWPORT (Speed Sprint, Code Sprint, Boss, etc.)
            ========================================================================= */}
        <section className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 shadow-sm relative corner-crosshair">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-6 text-xs font-mono text-neutral-500 uppercase">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff5500]" />
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                ACTIVE LAB PROTOCOL: {activeMode.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span>TARGET: 100% MUSCLE MEMORY</span>
              <span>//</span>
              <span className="text-[#ff5500] font-bold">BENCHMARK CERTIFIED</span>
            </div>
          </div>

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
        </section>

        {/* =========================================================================
            3D ISOMETRIC KEYBOARD VISUALIZER
            ========================================================================= */}
        <section className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm relative corner-crosshair">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4 text-xs font-mono text-neutral-500 uppercase">
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                ISO-SPRING PHYSICAL KEYBOARD VISUALIZER
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold">
                SPRING PHYSICS ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">
              [ R01_TOP • R02_QWE • R03_HOM • R04_BOT • R05_SPC ]
            </div>
          </div>

          <IsometricKeyboardVisualizer weakKeys={weakKeys} />
        </section>

        {/* =========================================================================
            BOTTOM CALL-TO-ACTION BAR (ChainGPT Labs inspired bottom bar)
            ========================================================================= */}
        <section className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono shadow-sm">
          <div className="flex items-center gap-3">
            <span className="font-bold text-neutral-900 dark:text-neutral-100">
              ▶ READY TO TEST YOUR REFLEXES?
            </span>
            <span className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold uppercase">
              {activeMode.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveMode('mechanical_duel')}
              className="btn-orange-pill px-4 py-2.5 rounded font-mono font-bold text-xs uppercase tracking-wider"
            >
              START 1v1 DUEL
            </button>
            <button
              onClick={() => setIsHeatmapOpen(true)}
              className="px-4 py-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 font-mono font-bold text-xs uppercase"
            >
              ANALYZE WEAK FINGERS
            </button>
          </div>
        </section>
      </main>

      {/* Modals & Drawers */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {isHeatmapOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl relative">
            <button
              onClick={() => setIsHeatmapOpen(false)}
              className="absolute top-4 right-4 z-10 px-3 py-1 rounded-lg bg-neutral-800 text-xs font-mono text-white"
            >
              CLOSE [X]
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
