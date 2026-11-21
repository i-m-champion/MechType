import React, { useState } from 'react';
import { X, Search, Clock, AlertTriangle, ArrowRight, Play, RotateCcw } from 'lucide-react';

interface TypoAutopsyModalProps {
  onClose: () => void;
}

interface StumbleEvent {
  id: string;
  expected: string;
  typed: string;
  latencyMs: number;
  finger: string;
  context: string;
  advice: string;
}

const SAMPLE_STUMBLES: StumbleEvent[] = [
  {
    id: 's1',
    expected: 'a',
    typed: 'q',
    latencyMs: 340,
    finger: 'Left Pinky',
    context: 'mechanical',
    advice: 'Left pinky drifted upward to the Q-row due to palm collapse. Keep wrist elevated.',
  },
  {
    id: 's2',
    expected: 'p',
    typed: 'o',
    latencyMs: 290,
    finger: 'Right Pinky',
    context: 'spring',
    advice: 'Right pinky clipped the neighbor key. Ensure index finger remains anchored on J.',
  },
  {
    id: 's3',
    expected: 'c',
    typed: 'x',
    latencyMs: 410,
    finger: 'Left Middle',
    context: 'chassis',
    advice: 'High hesitation reaching down to C. Practice left hand diagonal curling drills.',
  },
];

export const TypoAutopsyModal: React.FC<TypoAutopsyModalProps> = ({ onClose }) => {
  const [selectedStumble, setSelectedStumble] = useState<StumbleEvent>(SAMPLE_STUMBLES[0]);
  const [scrubberPos, setScrubberPos] = useState<number>(50); // 0 to 100%

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-xl p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xl relative flex flex-col text-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-[#ff5500]" />
            <h3 className="text-base font-mono font-bold text-neutral-900 tracking-wider uppercase">
              SLOW-MO TYPO AUTOPSY // FINGER HESITATION
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-neutral-500 hover:text-neutral-900">
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
                  ? 'bg-neutral-100 text-[#ff5500] border-[#ff5500] font-bold shadow-xs'
                  : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:text-neutral-900'
              }`}
            >
              Miskey: '{stumble.typed}' instead of '{stumble.expected}'
            </button>
          ))}
        </div>

        {/* Diagnostic Breakdown Card */}
        <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-mono font-black text-rose-600 line-through">
                {selectedStumble.typed}
              </div>
              <span className="text-neutral-400 font-mono text-sm">→</span>
              <div className="text-3xl font-mono font-black text-emerald-600">
                {selectedStumble.expected}
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-mono font-semibold">
              <Clock className="w-3.5 h-3.5" />
              Hesitation: {selectedStumble.latencyMs}ms
            </div>
          </div>

          <div className="text-xs font-mono text-neutral-600 flex flex-col gap-1">
            <div>
              Responsible Finger: <span className="text-neutral-900 font-bold">{selectedStumble.finger}</span>
            </div>
            <div>
              Word Context: <span className="text-[#ff5500] font-bold font-mono">{selectedStumble.context}</span>
            </div>
          </div>

          {/* Slow-mo Scrubber Timeline */}
          <div className="flex flex-col gap-1.5 mt-2 pt-3 border-t border-neutral-200">
            <div className="flex justify-between text-[11px] font-mono text-neutral-500">
              <span>-1.5s (Pre-strike)</span>
              <span className="text-rose-600 font-bold">STUMBLE POINT ({selectedStumble.latencyMs}ms delay)</span>
              <span>+1.5s (Recovery)</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={scrubberPos}
              onChange={(e) => setScrubberPos(parseInt(e.target.value))}
              className="w-full accent-[#ff5500] cursor-pointer"
            />
          </div>
        </div>

        {/* Coach Advice */}
        <div className="p-4 rounded-xl bg-white border border-neutral-200 flex items-start gap-3 mb-6 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs font-mono">
            <div className="font-bold text-neutral-900 mb-1">COACH RECOMMENDATION</div>
            <div className="text-neutral-600">{selectedStumble.advice}</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn-orange-pill w-full py-2.5 rounded-xl font-mono text-xs font-bold"
        >
          CLOSE AUTOPSY
        </button>
      </div>
    </div>
  );
};
