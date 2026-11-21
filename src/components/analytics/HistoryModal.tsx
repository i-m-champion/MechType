import React, { useState } from 'react';
import { historyService } from '../../services/historyService';
import { X, Award, BarChart3, Download, Trash2, Calendar, Target, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HistoryModalProps {
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ onClose }) => {
  const { themeConfig } = useTheme();
  const [records, setRecords] = useState(() => historyService.getRecords());

  const bestWpm = historyService.getBestWpm();
  const avgWpm = historyService.getAvgWpm();
  const avgAcc = historyService.getAvgAccuracy();

  const handleClear = () => {
    if (confirm('Clear all your typing history logs?')) {
      historyService.clearHistory();
      setRecords([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-mono font-bold text-slate-100 tracking-wider">
              PERFORMANCE ANALYTICS & LOGS
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => historyService.exportJson()}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-cyan-400 text-xs font-mono flex items-center gap-1"
              title="Download JSON Export"
            >
              <Download className="w-3.5 h-3.5" /> EXPORT JSON
            </button>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Personal Best</span>
            <span className="text-2xl font-mono font-black text-cyan-400 flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-400" /> {bestWpm} WPM
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Average Speed</span>
            <span className="text-2xl font-mono font-black text-slate-200 flex items-center gap-1">
              <Zap className="w-4 h-4 text-cyan-400" /> {avgWpm} WPM
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Avg Accuracy</span>
            <span className="text-2xl font-mono font-black text-emerald-400 flex items-center gap-1">
              <Target className="w-4 h-4 text-emerald-400" /> {avgAcc}%
            </span>
          </div>
        </div>

        {/* History Table */}
        <div className="flex-1 overflow-y-auto border border-white/5 rounded-xl bg-slate-950/40">
          {records.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No test logs yet. Complete a Speed Sprint or Code Sprint to record your statistics!
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 sticky top-0 text-slate-400 border-b border-white/5">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Mode</th>
                  <th className="p-2.5">Net WPM</th>
                  <th className="p-2.5">Raw WPM</th>
                  <th className="p-2.5">Accuracy</th>
                  <th className="p-2.5">Switch Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-white/5 text-slate-300">
                    <td className="p-2.5 text-slate-400">
                      {new Date(r.timestamp).toLocaleDateString()} {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-2.5 font-bold text-cyan-400">{r.mode}</td>
                    <td className="p-2.5 font-black text-slate-100">{r.wpm}</td>
                    <td className="p-2.5 text-slate-400">{r.rawWpm}</td>
                    <td className="p-2.5 text-emerald-400">{r.accuracy}%</td>
                    <td className="p-2.5 text-slate-400 capitalize">{r.soundProfile.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {records.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleClear}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All Logs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
