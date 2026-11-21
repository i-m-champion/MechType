import React from 'react';
import { ergonomicsService, FingerAnalytics } from '../../services/ergonomicsService';
import { Activity, AlertCircle, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface WeakFingerHeatmapProps {
  onStartDrill?: (finger: string) => void;
}

export const WeakFingerHeatmap: React.FC<WeakFingerHeatmapProps> = ({ onStartDrill }) => {
  const { themeConfig } = useTheme();
  const stats = ergonomicsService.getFingerStats();
  const weakest = ergonomicsService.getWeakestFinger();

  const fingerList = Object.values(stats);

  return (
    <div className="p-6 rounded-2xl border border-neutral-200 bg-white flex flex-col gap-6 shadow-2xl transition-all duration-300 w-full max-w-4xl mx-auto text-neutral-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#ff5500]" />
          <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-900">
            10-FINGER ERGONOMIC LATENCY & WEAKNESS HEATMAP
          </h4>
        </div>

        {weakest && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>
              Diagnostic: <strong className="font-bold">{weakest.name}</strong> has{' '}
              {weakest.avgLatencyMs}ms latency & {weakest.errorRate}% error rate
            </span>
          </div>
        )}
      </div>

      {/* 10 Fingers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {fingerList.map((f) => {
          const isProblem = weakest?.finger === f.finger && f.totalKeystrokes >= 3;

          return (
            <div
              key={f.finger}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                isProblem
                  ? 'bg-rose-50 border-rose-300 shadow-sm'
                  : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-neutral-800">
                  {f.name}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: f.color }}
                />
              </div>

              <div className="flex flex-col gap-1 text-xs font-mono">
                <div className="flex justify-between text-neutral-500">
                  <span>Latency:</span>
                  <span className="text-neutral-900 font-bold">{f.avgLatencyMs}ms</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Error Rate:</span>
                  <span
                    className={`font-bold ${
                      f.errorRate > 10 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {f.errorRate}%
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400 text-[10px]">
                  <span>Strokes:</span>
                  <span>{f.totalKeystrokes}</span>
                </div>
              </div>

              {onStartDrill && (
                <button
                  onClick={() => onStartDrill(f.finger)}
                  className="mt-3 w-full py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 text-[10px] font-mono font-bold text-neutral-700 hover:text-black transition-colors"
                >
                  Drill Finger
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Touch Typing Visual Guide */}
      <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#ff5500]" />
          <span className="text-neutral-600">
            Real-time latency analytics measure finger fatigue and key travel delay. Keys with high stumbles glow red on the 3D ISO visualizer.
          </span>
        </div>
      </div>
    </div>
  );
};
