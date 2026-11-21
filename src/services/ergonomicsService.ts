import { TouchFinger, FINGER_DEFINITIONS } from '../types/keyboard';
import { getFingerForKey } from '../data/keyboardLayout';

export interface KeystrokeLog {
  char: string;
  code: string;
  finger: TouchFinger;
  latencyMs: number;
  isCorrect: boolean;
  timestamp: number;
}

export interface FingerAnalytics {
  finger: TouchFinger;
  name: string;
  totalKeystrokes: number;
  errorCount: number;
  errorRate: number; // percentage
  avgLatencyMs: number;
  color: string;
}

export class ErgonomicsService {
  private static instance: ErgonomicsService;
  private logs: KeystrokeLog[] = [];

  private constructor() {
    const saved = localStorage.getItem('mechtype_keystroke_logs');
    if (saved) {
      try {
        this.logs = JSON.parse(saved).slice(-500); // keep last 500 strokes
      } catch {
        this.logs = [];
      }
    }
  }

  public static getInstance(): ErgonomicsService {
    if (!ErgonomicsService.instance) {
      ErgonomicsService.instance = new ErgonomicsService();
    }
    return ErgonomicsService.instance;
  }

  public logKeystroke(char: string, code: string, isCorrect: boolean, latencyMs: number): void {
    const finger = getFingerForKey(char, code);
    const log: KeystrokeLog = {
      char,
      code,
      finger,
      latencyMs: Math.min(1200, Math.max(30, latencyMs)), // clamp outliers
      isCorrect,
      timestamp: Date.now(),
    };

    this.logs.push(log);
    if (this.logs.length > 800) {
      this.logs = this.logs.slice(-800);
    }

    // Debounced save
    if (Math.random() > 0.85) {
      localStorage.setItem('mechtype_keystroke_logs', JSON.stringify(this.logs));
    }
  }

  public getFingerStats(): Record<TouchFinger, FingerAnalytics> {
    const result: Record<TouchFinger, FingerAnalytics> = {
      left_pinky: { finger: 'left_pinky', name: 'Left Pinky', totalKeystrokes: 0, errorCount: 0, errorRate: 0, avgLatencyMs: 0, color: FINGER_DEFINITIONS.left_pinky.color },
      left_ring: { finger: 'left_ring', name: 'Left Ring', totalKeystrokes: 0, errorCount: 0, errorRate: 0, avgLatencyMs: 0, color: FINGER_DEFINITIONS.left_ring.color },
      left_middle: { finger: 'left_middle', name: 'Left Middle', totalKeystrokes: 0, errorCount: 0, errorRate: 0, avgLatencyMs: 0, color: FINGER_DEFINITIONS.left_middle.color },
      left_index: { finger: 'left_index', name: 'Left Index', totalKeystrokes: 0, errorCount: 0, errorRate: 0, avgLatencyMs: 0, color: FINGER_DEFINITIONS.left_index.color },
      thumb: { finger: 'thumb', name: 'Thumbs', totalKeystrokes: 0, errorCount: 0, errorRate: 0, avgLatencyMs: 0, color: FINGER_DEFINITIONS.thumb.color },
      right_index: { finger: 'right_index', name: 'Right Index', totalKeystrokes: 0, errorCount: 0, errorRate: 0, avgLatencyMs: 0, color: FINGER_DEFINITIONS.right_index.color },
      right_middle: { finger: 'right_middle', name: 'Right Middle', totalKeystrokes: 0, errorCount: 0, errorRate: 0, avgLatencyMs: 0, color: FINGER_DEFINITIONS.right_middle.color },
      right_ring: { finger: 'right_ring', name: 'Right Ring', totalKeystrokes: 0, errorCount: 0, errorRate: 0, avgLatencyMs: 0, color: FINGER_DEFINITIONS.right_ring.color },
      right_pinky: { finger: 'right_pinky', name: 'Right Pinky', totalKeystrokes: 0, errorCount: 0, errorRate: 0, avgLatencyMs: 0, color: FINGER_DEFINITIONS.right_pinky.color },
    };

    const latencySums: Record<TouchFinger, number> = {
      left_pinky: 0, left_ring: 0, left_middle: 0, left_index: 0, thumb: 0,
      right_index: 0, right_middle: 0, right_ring: 0, right_pinky: 0,
    };

    this.logs.forEach((log) => {
      const stat = result[log.finger];
      if (stat) {
        stat.totalKeystrokes++;
        if (!log.isCorrect) stat.errorCount++;
        latencySums[log.finger] += log.latencyMs;
      }
    });

    for (const f in result) {
      const fingerKey = f as TouchFinger;
      const stat = result[fingerKey];
      if (stat.totalKeystrokes > 0) {
        stat.errorRate = Math.round((stat.errorCount / stat.totalKeystrokes) * 100);
        stat.avgLatencyMs = Math.round(latencySums[fingerKey] / stat.totalKeystrokes);
      }
    }

    return result;
  }

  public getWeakestFinger(): FingerAnalytics | null {
    const stats = this.getFingerStats();
    let worst: FingerAnalytics | null = null;
    let worstScore = -1;

    for (const f in stats) {
      const stat = stats[f as TouchFinger];
      if (stat.totalKeystrokes >= 3) {
        // Combined weakness score: errorRate * 2 + latencyMs / 10
        const score = stat.errorRate * 2 + stat.avgLatencyMs / 10;
        if (score > worstScore) {
          worstScore = score;
          worst = stat;
        }
      }
    }

    return worst;
  }

  public getWeakKeys(): Set<string> {
    const weakKeys = new Set<string>();
    const weakFinger = this.getWeakestFinger();
    if (weakFinger && FINGER_DEFINITIONS[weakFinger.finger]) {
      FINGER_DEFINITIONS[weakFinger.finger].keys.forEach((k) => weakKeys.add(k.toLowerCase()));
    }
    return weakKeys;
  }
}

export const ergonomicsService = ErgonomicsService.getInstance();
