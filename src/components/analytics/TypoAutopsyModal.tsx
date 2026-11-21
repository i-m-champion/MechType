import React, { useState } from 'react';
import { X, Search, Clock, Play, Pause, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface StumbleEvent {
  id: number;
  expected: string;
  typed: string;
  latencyMs: number;
  finger: string;
  context: string;
}

const SAMPLE_STUMBLES: StumbleEvent[] = [
  { id: 1, expected: 'q', typed: 'w', latencyMs: 295, finger: 'Left Pinky', context: 'e-q-u-a-l' },
  { id: 2, expected: 'p', typed: 'o', latencyMs: 310, finger: 'Right Pinky', context: 'p-e-o-p-l-e' },
  { id: 3, expected: 'b', typed: 'v', latencyMs: 260, finger: 'Left Index', context: 'b-e-c-a-u-s-e' },
  { id: 4, expected: ';', typed: 'l', latencyMs: 340, finger: 'Right Pinky', context: 'c-o-n-s-t-;' },
];

interface TypoAutopsyModalProps {
  onClose: () => void;
}

export const TypoAutopsyModal: React.FC<TypoAutopsyModalProps> = ({ onClose }) => {
  const { themeConfig } = useTheme();
  const [selectedStumble, setSelectedStumble] = useState<StumbleEvent>(SAMPLE_STUMBLES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrubberPos, setScrubberPos] = useState(50); // 0 to 100%

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-xl p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-mono font-bold text-slate-100 tracking-wider">
              SLOW-MO TYPO AUTOPSY // FINGER HESITATION
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stumble Selector Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {SAMPLE_STUMBLES.map((stumble) => (
            <button
              key={stumble.id}
              onClick={() => {
                setSelectedStumble(stumble);
                setScrubberPos(50);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border whitespace-nowrap transition-colors ${
                selectedStumble.id === stumble.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                  : 'bg-slate-800/40 text-slate-400 border-white/5 hover:text-slate-200'
              }`}
            >
              Miskey: '{stumble.typed}' instead of '{stumble.expected}'
            </button>
          ))}
        </div>

        {/* Diagnostic Breakdown Card */}
        <div className="p-5 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-mono font-black text-rose-500 line-through">
                {selectedStumble.typed}
              </div>
              <span className="text-slate-500 font-mono text-sm">→</span>
              <div className="text-3xl font-mono font-black text-emerald-400">
                {selectedStumble.expected}
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-mono">
              <Clock className="w-3.5 h-3.5" />
              Hesitation: {selectedStumble.latencyMs}ms
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 flex flex-col gap-1">
            <div>
              Responsible Finger: <span className="text-slate-200 font-bold">{selectedStumble.finger}</span>
            </div>
            <div>
              Word Context: <span className="text-cyan-400 font-mono">{selectedStumble.context}</span>
            </div>
          </div>

          {/* Slow-mo Scrubber Timeline */}
          <div className="flex flex-col gap-1.5 mt-2 pt-3 border-t border-white/5">
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>-1.5s (Pre-strike)</span>
              <span className="text-rose-400 font-bold">STUMBLE POINT ({selectedStumble.latencyMs}ms delay)</span>
              <span>+1.5s (Recovery)</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={scrubberPos}
              onChange={(e) => setScrubberPos(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Coaching Recommendation */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-white/5 flex items-start gap-2.5 text-xs font-mono text-slate-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Coaching Insight:</strong> Micro-hesitation of {selectedStumble.latencyMs}ms on {selectedStumble.finger} indicates muscle memory uncertainty when reaching for '{selectedStumble.expected}'. Practice the pinky extension drill to eliminate finger drag.
          </span>
        </div>
      </div>
    </div>
  );
};
