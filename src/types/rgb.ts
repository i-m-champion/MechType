export type RgbMode = 'rainbow' | 'neon' | 'matrix' | 'starlight' | 'off';

export interface RgbWave {
  id: number;
  originRow: number;
  originCol: number;
  originX: number; // percentage 0..100
  originY: number; // percentage 0..100
  startTime: number;
  duration: number; // ms
  color: string;
}
