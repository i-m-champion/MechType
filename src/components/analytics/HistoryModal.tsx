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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xl relative flex flex-col max-h-[85vh] text-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#ff5500]" />
            <h3 className="text-base font-mono font-bold text-neutral-900 tracking-wider uppercase">
              PERFORMANCE ANALYTICS & LOGS
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => historyService.exportJson()}
              className="px-2.5 py-1 rounded-md border border-neutral-200 hover:bg-neutral-50 text-[#ff5500] text-xs font-mono font-bold flex items-center gap-1 shadow-xs"
              title="Download JSON Export"
            >
              <Download className="w-3.5 h-3.5" /> EXPORT JSON
            </button>
            <button onClick={onClose} className="p-1 rounded-md text-neutral-500 hover:text-neutral-900">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col items-center">
            <span className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">Personal Best</span>
            <span className="text-2xl font-mono font-black text-[#ff5500] flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-500" /> {bestWpm} WPM
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col items-center">
            <span className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">Average Speed</span>
            <span className="text-2xl font-mono font-black text-neutral-900 flex items-center gap-1">
              <Zap className="w-4 h-4 text-[#ff5500]" /> {avgWpm} WPM
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col items-center">
            <span className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">Avg Accuracy</span>
            <span className="text-2xl font-mono font-black text-emerald-600 flex items-center gap-1">
              <Target className="w-4 h-4 text-emerald-600" /> {avgAcc}%
            </span>
          </div>
        </div>

        {/* History Table */}
        <div className="flex-1 overflow-y-auto border border-neutral-200 rounded-xl bg-white shadow-inner">
          {records.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-neutral-400">
              No test logs yet. Complete a Speed Sprint or Code Sprint to record your statistics!
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-50 sticky top-0 text-neutral-600 border-b border-neutral-200 font-bold">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Mode</th>
                  <th className="p-2.5">Net WPM</th>
                  <th className="p-2.5">Raw WPM</th>
                  <th className="p-2.5">Accuracy</th>
                  <th className="p-2.5">Switch Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50 text-neutral-800 transition-colors">
                    <td className="p-2.5 text-neutral-500">
                      {new Date(r.timestamp).toLocaleDateString()} {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-2.5 font-bold text-[#ff5500] uppercase">{r.mode.replace('_', ' ')}</td>
                    <td className="p-2.5 font-black text-neutral-900">{r.wpm}</td>
                    <td className="p-2.5 text-neutral-500">{r.rawWpm}</td>
                    <td className="p-2.5 text-emerald-600 font-bold">{r.accuracy}%</td>
                    <td className="p-2.5 text-neutral-600 capitalize">{r.soundProfile.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-3 border-t border-neutral-200 text-xs font-mono">
          <span className="text-neutral-500">
            Total Logged Tests: <strong className="text-neutral-900">{records.length}</strong>
          </span>
          {records.length > 0 && (
            <button
              onClick={handleClear}
              className="px-2 py-1 rounded text-rose-600 hover:bg-rose-50 flex items-center gap-1 transition-colors font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear History
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
