import React from 'react';
import { OverdriveTier, getComboMultiplier } from '../../types/overdrive';
import { LightningCanvas } from './LightningCanvas';
import { Flame, Zap, Sparkles } from 'lucide-react';

interface OverdriveHudProps {
  wpm: number;
  streak: number;
  tier: OverdriveTier;
  screenShake: boolean;
}

export const OverdriveHud: React.FC<OverdriveHudProps> = ({
  wpm,
  streak,
  tier,
  screenShake,
}) => {
  const multiplier = getComboMultiplier(streak);
  const isOverdrive = tier === 'overdrive';
  const isCombustion = tier === 'combustion';

  return (
    <>
      {/* Edge Chromatic Aberration Vignette for Overdrive (100+ WPM) */}
      {isOverdrive && (
        <div className="fixed inset-0 pointer-events-none z-40 chromatic-aberration" />
      )}

      {/* Screen edge fire glow for 70-100 WPM */}
      {isCombustion && (
        <div
          className="fixed inset-0 pointer-events-none z-30 transition-opacity duration-300"
          style={{
            boxShadow: 'inset 0 0 50px rgba(255, 69, 0, 0.35)',
          }}
        />
      )}

      {/* Lightning Arcs for Overdrive Mode */}
      <LightningCanvas active={isOverdrive} />

      {/* Combo Streak & Multiplier Banner */}
      {streak >= 10 && (
        <div className="fixed top-20 right-6 z-40 pointer-events-none animate-bounce">
          <div
            className={`px-4 py-2 rounded-xl backdrop-blur-md border shadow-2xl flex items-center gap-3 ${
              isOverdrive
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-cyan-500/50'
                : isCombustion
                ? 'bg-rose-950/80 border-orange-500 text-orange-200 shadow-orange-500/50'
                : 'bg-slate-900/80 border-amber-500/50 text-amber-200'
            }`}
          >
            {isOverdrive ? (
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            ) : isCombustion ? (
              <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-400" />
            )}

            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider opacity-80">
                {isOverdrive ? '⚡ OVERDRIVE ACTIVE' : isCombustion ? '🔥 COMBUSTION STREAK' : 'COMBO'}
              </div>
              <div className="text-sm font-mono font-black flex items-center gap-1.5">
                <span>{streak}x STREAK</span>
                <span className="text-xs px-1.5 py-0.2 rounded bg-white/10">
                  {multiplier}x
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
