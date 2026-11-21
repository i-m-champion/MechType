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
  Zap,
  Flame,
  ShieldCheck,
  Disc,
  Palette,
  Check,
} from 'lucide-react';
import { KeycapTheme } from './types/theme';

function MechTypeApp() {
  const { theme, setTheme, themeConfig } = useTheme();
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
    <div className="min-h-screen flex flex-col justify-between relative architectural-grid selection:bg-[#ff5500]/20 selection:text-[#ff5500] font-sans bg-white text-neutral-900">
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

      {/* Main Architectural Blueprint Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-6 relative z-10">
        {/* =========================================================================
            HERO MASTHEAD: SEGMENTED BRUTALIST DISPLAY (Pure White Canvas)
            ========================================================================= */}
        <section className="border border-neutral-200/90 bg-white rounded-2xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Top Registration Bar */}
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-6 text-[11px] font-mono text-neutral-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="font-bold" style={{ color: themeConfig.accent }}>✳</span>
              <span className="text-neutral-900 font-bold">SYNTHETIC + ACOUSTIC</span>
              <span className="text-neutral-400">/</span>
              <span>EXPERIMENTAL SENSORY ENGINE</span>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-neutral-500">DESIGN 2024</span>
              <span className="text-neutral-300">//</span>
              <span className="font-bold" style={{ color: themeConfig.accent }}>2001 A SPACE ODYSSEY</span>
              <span style={{ color: themeConfig.accent }}>◎</span>
            </div>
          </div>

          {/* Huge Segmented Display Title: MECH_TYPE */}
          <div className="relative py-2 flex flex-col items-center sm:items-start">
            <h1 className="font-display-chamfer text-6xl sm:text-8xl md:text-9xl font-black text-neutral-900 tracking-tighter leading-none select-none">
              MECH_TYPE
            </h1>

            <div className="flex flex-wrap items-center justify-between w-full mt-4 gap-4 text-xs font-mono text-neutral-600">
              <p className="max-w-xl text-sm leading-relaxed text-neutral-600">
                The reinvention of human cognition & muscle memory through tactile mechanical acoustic feedback.
                <span className="font-bold ml-1.5" style={{ color: themeConfig.accent }}>/a sensory experiment/</span>
              </p>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeConfig.accent }} />
                <span className="text-neutral-800">HUMAN / EXPRESSION / INTEGRATION</span>
              </div>
            </div>

            {/* Quick Interactive UI Colorway Bar (Orange, Green, Yellow, Blue) */}
            <div className="flex flex-wrap items-center justify-between w-full mt-6 pt-4 border-t border-neutral-100 gap-3 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-neutral-500 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" style={{ color: themeConfig.accent }} /> SELECT UI COLORWAY:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'architectural_orange', label: 'Orange', color: '#ff5500' },
                    { id: 'architectural_green', label: 'Cyber Green', color: '#10b981' },
                    { id: 'architectural_yellow', label: 'Industrial Yellow', color: '#f59e0b' },
                    { id: 'architectural_blue', label: 'Electric Blue', color: '#0284c7' },
                  ].map((p) => {
                    const isSelected =
                      theme === p.id || (p.id === 'architectural_orange' && theme === 'industrial');
                    return (
                      <button
                        key={p.id}
                        onClick={() => setTheme(p.id as KeycapTheme)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-xs ${
                          isSelected
                            ? 'bg-neutral-100 text-neutral-900 border'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 border border-neutral-200'
                        }`}
                        style={isSelected ? { borderColor: p.color } : undefined}
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span>{p.label}</span>
                        {isSelected && <Check className="w-3 h-3 ml-0.5" style={{ color: p.color }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-neutral-500">
                <span>Active Accent:</span>
                <span className="font-bold uppercase" style={{ color: themeConfig.accent }}>
                  {themeConfig.name}
                </span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              MODULAR 3-COLUMN HERO GRID (Pristine White Architectural)
              ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border border-neutral-200 rounded-xl mt-8 overflow-hidden bg-neutral-50">
            {/* Col 1: Meet Our Sensory Engine & Mode Count */}
            <div className="md:col-span-3 p-5 border-b md:border-b-0 md:border-r border-neutral-200 flex flex-col justify-between bg-white">
              <div>
                <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5" style={{ backgroundColor: themeConfig.accent }} />
                  <span className="text-neutral-900 font-bold">Meet our sensory engine</span>
                </div>
              </div>
              <div className="mt-6">
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">
                  Game Modes Active
                </div>
                <div className="text-5xl font-display-chamfer font-black text-neutral-900 tracking-tight">
                  07
                </div>
              </div>
            </div>

            {/* Col 2: Isometric Wireframe Graphic & Bracket */}
            <div className="md:col-span-2 p-5 border-b md:border-b-0 md:border-r border-neutral-200 flex flex-col items-center justify-center relative bg-neutral-50/60">
              <span className="absolute top-2 left-2 text-[10px] font-mono" style={{ color: themeConfig.accent }}>┌</span>
              <span className="absolute bottom-2 right-2 text-[10px] font-mono" style={{ color: themeConfig.accent }}>┘</span>
              <div className="w-16 h-16 rounded-xl border border-neutral-200 bg-white flex items-center justify-center shadow-sm">
                <Disc className="w-8 h-8 animate-spin" style={{ color: themeConfig.accent, animationDuration: '8s' }} />
              </div>
              <span className="text-[9px] font-mono text-neutral-500 mt-2 uppercase tracking-widest font-bold">
                ZERO MP3 LATENCY
              </span>
            </div>

            {/* Col 3: Featured Active Switch Card */}
            <div className="md:col-span-7 p-5 bg-white flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-white text-[9px] font-mono font-bold uppercase shadow-xs" style={{ backgroundColor: themeConfig.accent }}>
                    ACTIVE PROFILE
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">
                    {currentSoundMeta.category}
                  </span>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-[11px] font-mono font-bold hover:underline flex items-center gap-1"
                  style={{ color: themeConfig.accent }}
                >
                  Configure Audio <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="my-3">
                <div className="text-xl font-display-chamfer font-black text-neutral-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentSoundMeta.accentColor }} />
                  {currentSoundMeta.name}
                </div>
                <p className="text-xs font-mono text-neutral-600 mt-1">
                  {currentSoundMeta.description}
                </p>
              </div>

              {/* Metric bar */}
              <div className="grid grid-cols-4 border-t border-neutral-100 pt-3 text-[11px] font-mono">
                <div>
                  <div className="text-neutral-400 text-[10px]">Tactile Feel</div>
                  <div className="font-bold text-neutral-900 truncate">{currentSoundMeta.tactileFeel}</div>
                </div>
                <div>
                  <div className="text-neutral-400 text-[10px]">Pitch Jitter</div>
                  <div className="font-bold text-emerald-600">±3% Detuned</div>
                </div>
                <div>
                  <div className="text-neutral-400 text-[10px]">Stabilizers</div>
                  <div className="font-bold text-neutral-900">Resonant Wire</div>
                </div>
                <div>
                  <div className="text-neutral-400 text-[10px]">Dual-Action</div>
                  <div className="font-bold" style={{ color: themeConfig.accent }}>Down + Up</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            DATA TELEMETRY GRID CARDS (Pristine White Cards)
            ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Speedometer */}
          <div className="border border-neutral-200 bg-white rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 uppercase pb-2 border-b border-neutral-100">
              <span className="text-neutral-900 font-bold">Speedometer</span>
              <span>LIVE CADENCE</span>
            </div>
            <div className="py-2 flex justify-center">
              <RadialSpeedometer wpm={liveWpm} kps={liveKps} />
            </div>
            <div className="grid grid-cols-2 pt-2 border-t border-neutral-100 text-[11px] font-mono">
              <div>
                <span className="text-neutral-400 text-[10px]">Peak Record</span>
                <div className="font-bold text-neutral-900">{historyService.getBestWpm()} WPM</div>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px]">Avg Speed</span>
                <div className="font-bold text-neutral-900">{historyService.getAvgWpm()} WPM</div>
              </div>
            </div>
          </div>

          {/* Card 2: Overdrive Matrix */}
          <div className="border border-neutral-200 bg-white rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 uppercase pb-2 border-b border-neutral-100">
              <span className="text-neutral-900 font-bold">Overdrive State</span>
              <span className="font-bold" style={{ color: themeConfig.accent }}>TIER // 04</span>
            </div>
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="text-3xl font-display-chamfer font-black text-neutral-900 uppercase tracking-tight flex items-center gap-2">
                {currentTier === 'overdrive' ? <Zap className="w-6 h-6" style={{ color: themeConfig.accent }} /> : <Flame className="w-6 h-6 text-orange-500" />}
                {currentTier}
              </div>
              <div className="text-xs font-mono text-neutral-500 mt-1">
                Streak: <strong className="font-bold" style={{ color: themeConfig.accent }}>{streak}x</strong> (Multiplier: {comboMultiplier}x)
              </div>
            </div>
            <div className="grid grid-cols-2 pt-2 border-t border-neutral-100 text-[11px] font-mono">
              <div>
                <span className="text-neutral-400 text-[10px]">Sparks Trigger</span>
                <div className="font-bold text-neutral-900">&gt; 40 WPM</div>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px]">Combustion</span>
                <div className="font-bold text-neutral-900">&gt; 70 WPM</div>
              </div>
            </div>
          </div>

          {/* Card 3: Ergonomic Coaching */}
          <div className="border border-neutral-200 bg-white rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 uppercase pb-2 border-b border-neutral-100">
              <span className="text-neutral-900 font-bold">Finger Latency</span>
              <span className="text-emerald-600 font-bold">10-FINGER</span>
            </div>
            <div className="py-4">
              <div className="text-xs font-mono text-neutral-700">
                {weakestFinger ? (
                  <>
                    Diagnostic: <span className="font-bold" style={{ color: themeConfig.accent }}>{weakestFinger.name}</span> has{' '}
                    <strong className="text-neutral-900">{weakestFinger.avgLatencyMs}ms</strong> delay & {weakestFinger.errorRate}% error rate.
                  </>
                ) : (
                  'Touch typing balance is optimal across all fingers.'
                )}
              </div>
              {weakestFinger && (
                <button
                  onClick={() => setActiveDrillFinger(weakestFinger.finger as TouchFinger)}
                  className="mt-3 px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-[11px] font-mono font-bold transition-colors"
                  style={{ color: themeConfig.accent }}
                >
                  Start Weak-Finger Drill →
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 pt-2 border-t border-neutral-100 text-[11px] font-mono">
              <div>
                <span className="text-neutral-400 text-[10px]">Avg Accuracy</span>
                <div className="font-bold text-emerald-600">{historyService.getAvgAccuracy()}%</div>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px]">Autopsy Logs</span>
                <div className="font-bold text-neutral-900 cursor-pointer hover:underline" onClick={() => setIsAutopsyOpen(true)}>
                  Inspect 3s Slow-Mo
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Historical Records & Export */}
          <div className="border border-neutral-200 bg-white rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 uppercase pb-2 border-b border-neutral-100">
              <span className="text-neutral-900 font-bold">Analytics Vault</span>
              <span>LOCALSTORAGE</span>
            </div>
            <div className="py-4 flex flex-col gap-2">
              <div className="text-xs font-mono text-neutral-600">
                All benchmark speeds, keystroke timestamps, and switch profiles are saved permanently in browser storage.
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="px-2.5 py-1 rounded bg-neutral-100 border border-neutral-300 text-neutral-900 text-[11px] font-mono font-bold hover:bg-neutral-200 transition-colors"
                >
                  View Logbook
                </button>
                <button
                  onClick={() => historyService.exportJson()}
                  className="px-2.5 py-1 rounded border border-neutral-300 text-[11px] font-mono text-neutral-700 hover:text-black"
                >
                  Export JSON
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 pt-2 border-t border-neutral-100 text-[11px] font-mono">
              <div>
                <span className="text-neutral-400 text-[10px]">Sessions Logged</span>
                <div className="font-bold text-neutral-900">{historyService.getRecords().length} Tests</div>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px]">Security</span>
                <div className="font-bold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Offline
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MAIN INTERACTIVE GAME MODE VIEWPORT (Pristine White Testing Bay)
            ========================================================================= */}
        <section className="border border-neutral-200/90 bg-white rounded-2xl p-6 sm:p-8 shadow-sm relative corner-crosshair">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-6 text-xs font-mono text-neutral-500 uppercase">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff5500]" />
              <span className="font-bold text-neutral-900">
                ACTIVE LAB PROTOCOL: {activeMode.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-neutral-500">TARGET: 100% MUSCLE MEMORY</span>
              <span className="text-neutral-300">//</span>
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
        <section className="border border-neutral-200/90 bg-white rounded-2xl p-6 shadow-sm relative corner-crosshair">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4 text-xs font-mono text-neutral-500 uppercase">
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-900">
                ISO-SPRING PHYSICAL KEYBOARD VISUALIZER
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-[#ff5500] font-bold">
                SPRING PHYSICS ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 font-mono">
              [ R01_TOP • R02_QWE • R03_HOM • R04_BOT • R05_SPC ]
            </div>
          </div>

          <IsometricKeyboardVisualizer weakKeys={weakKeys} />
        </section>

        {/* =========================================================================
            BOTTOM CALL-TO-ACTION BAR
            ========================================================================= */}
        <section className="border border-neutral-200 bg-white rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono shadow-sm">
          <div className="flex items-center gap-3">
            <span className="font-bold text-neutral-900">
              ▶ READY TO TEST YOUR REFLEXES?
            </span>
            <span className="px-2 py-1 rounded bg-neutral-100 text-neutral-700 font-bold uppercase">
              {activeMode.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveMode('mechanical_duel')}
              className="btn-accent-pill px-4 py-2.5 rounded font-mono font-bold text-xs uppercase tracking-wider shadow-sm text-white"
              style={{ backgroundColor: themeConfig.accent }}
            >
              START 1v1 DUEL
            </button>
            <button
              onClick={() => setIsHeatmapOpen(true)}
              className="px-4 py-2.5 rounded border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-mono font-bold text-xs uppercase transition-colors"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl relative">
            <button
              onClick={() => setIsHeatmapOpen(false)}
              className="absolute top-4 right-4 z-10 px-3 py-1 rounded-lg bg-white border border-neutral-200 text-xs font-mono text-neutral-700 hover:text-black shadow-xs font-bold"
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
