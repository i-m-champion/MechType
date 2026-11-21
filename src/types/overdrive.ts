export type OverdriveTier = 'cruising' | 'sparking' | 'combustion' | 'overdrive';

export interface OverdriveState {
  wpm: number;
  tier: OverdriveTier;
  streak: number;
  multiplier: number;
  heat: number; // 0 to 100%
  isOverdrive: boolean;
}

export function getOverdriveTier(wpm: number): OverdriveTier {
  if (wpm >= 100) return 'overdrive';
  if (wpm >= 70) return 'combustion';
  if (wpm >= 40) return 'sparking';
  return 'cruising';
}

export function getComboMultiplier(streak: number): number {
  if (streak >= 100) return 5.0;
  if (streak >= 50) return 3.0;
  if (streak >= 25) return 2.0;
  if (streak >= 10) return 1.5;
  return 1.0;
}
