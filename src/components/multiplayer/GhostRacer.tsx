import React, { useState, useEffect } from 'react';
import { Ghost, Sparkles } from 'lucide-react';

interface GhostRacerProps {
  enabled: boolean;
  targetWpm?: number; // Target ghost WPM or 0 for Personal Best
  elapsedTimeMs: number;
  totalChars: number;
  activeCharIdx: number;
}

export const GhostRacer: React.FC<GhostRacerProps> = ({
  enabled,
  targetWpm = 80,
  elapsedTimeMs,
  totalChars,
  activeCharIdx,
}) => {
  if (!enabled || elapsedTimeMs <= 0) return null;

  // Calculate characters ghost should have typed by this timestamp
  // characters per second = (targetWpm * 5) / 60
  const ghostCharsTyped = Math.floor((elapsedTimeMs / 1000) * ((targetWpm * 5) / 60));
  const ghostProgress = Math.min(100, Math.round((ghostCharsTyped / Math.max(1, totalChars)) * 100));
  const playerProgress = Math.min(100, Math.round((activeCharIdx / Math.max(1, totalChars)) * 100));
  const diffChars = activeCharIdx - ghostCharsTyped;

  return (
    <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs font-mono my-2 shadow-xs text-neutral-800">
      <div className="flex items-center gap-2">
        <Ghost className="w-4 h-4 text-[#ff5500] animate-pulse" />
        <span className="text-neutral-900 font-bold">
          GHOST PACER ({targetWpm} WPM)
        </span>
      </div>

      <div className="flex items-center gap-4 text-[11px]">
        <span className="text-neutral-500">
          Ghost: {ghostProgress}%
        </span>
        <span
          className={`font-bold ${
            diffChars >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {diffChars >= 0 ? `+${diffChars} ahead` : `${diffChars} behind`}
        </span>
      </div>
    </div>
  );
};
