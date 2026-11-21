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
    <div
      className="p-6 rounded-2xl border backdrop-blur-md flex flex-col gap-6 shadow-2xl transition-all duration-300 w-full max-w-4xl mx-auto"
      style={{
        backgroundColor: `${themeConfig.surface}f0`,
        borderColor: themeConfig.border,
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
            10-FINGER ERGONOMIC LATENCY & WEAKNESS HEATMAP
          </h4>
        </div>

        {weakest && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
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
                  ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/50'
                  : 'bg-slate-900/40 border-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-slate-300">
                  {f.name}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: f.color }}
                />
              </div>

              <div className="flex flex-col gap-1 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Latency:</span>
                  <span className="text-slate-200 font-bold">{f.avgLatencyMs}ms</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Error Rate:</span>
                  <span
                    className={`font-bold ${
                      f.errorRate > 10 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {f.errorRate}%
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>Strokes:</span>
                  <span>{f.totalKeystrokes}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Targeted Drill Action CTA */}
      {weakest && onStartDrill && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <div className="text-xs font-mono text-slate-300">
              Personalized Ergonomic Drill Ready for: <span className="text-cyan-300 font-bold">{weakest.name}</span>
            </div>
          </div>
          <button
            onClick={() => onStartDrill(weakest.finger)}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs transition-colors"
          >
            START WEAK-FINGER DRILL
          </button>
        </div>
      )}
    </div>
  );
};
