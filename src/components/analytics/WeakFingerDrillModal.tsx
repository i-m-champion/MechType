import React, { useState, useRef } from 'react';
import { TouchFinger } from '../../types/keyboard';
import { soundEngine } from '../../audio/SoundEngine';
import { lofiRhythmEngine } from '../../audio/LofiRhythmEngine';
import { X, Dumbbell, CheckCircle2, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const FINGER_DRILL_WORDS: Record<TouchFinger, string[]> = {
  left_pinky: ['quack', 'jazz', 'plaza', 'zone', 'queen', 'quartz', 'zero', 'quick', 'apex', 'zeal', 'equal', 'quiz'],
  left_ring: ['swift', 'sweet', 'wax', 'swim', 'sword', 'west', 'slow', 'wash', 'wise', 'sway', 'snow', 'waste'],
  left_middle: ['deck', 'dice', 'edge', 'code', 'echo', 'cell', 'acid', 'cedar', 'decay', 'cider', 'dance', 'deduce'],
  left_index: ['brave', 'frost', 'vivid', 'tramp', 'grape', 'burst', 'track', 'orbit', 'craft', 'tiger', 'favor', 'brand'],
  thumb: ['space', 'galaxy', 'lunar', 'cosmic', 'orbit', 'stellar', 'void', 'vacuum', 'nebula', 'pulsar'],
  right_index: ['honey', 'jump', 'night', 'month', 'young', 'human', 'union', 'magic', 'joint', 'heavy', 'haunt', 'humid'],
  right_middle: ['kite', 'kill', 'silk', 'skin', 'milk', 'icon', 'kick', 'link', 'bike', 'king', 'sink', 'pink'],
  right_ring: ['pool', 'loop', 'solo', 'look', 'moon', 'wool', 'poll', 'loom', 'door', 'poor', 'spoon', 'bloom'],
  right_pinky: ['pop', 'plot', 'post', 'path', 'page', 'pour', 'pulp', 'pine', 'pipe', 'pump', 'palm', 'prism'],
};

interface WeakFingerDrillModalProps {
  finger: TouchFinger;
  onClose: () => void;
}

export const WeakFingerDrillModal: React.FC<WeakFingerDrillModalProps> = ({ finger, onClose }) => {
  const { themeConfig } = useTheme();
  const drillWords = FINGER_DRILL_WORDS[finger] || FINGER_DRILL_WORDS.left_pinky;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [typedChars, setTypedChars] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentWord = drillWords[currentIdx] || '';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished) return;

    soundEngine.triggerKeystroke({
      key: e.key,
      code: e.code,
      isKeyDown: true,
      isSpacebar: e.key === ' ',
      isEnter: e.key === 'Enter',
      isBackspace: e.key === 'Backspace',
    });

    if (lofiRhythmEngine.isEnabled() && e.key.length === 1) {
      lofiRhythmEngine.triggerHarmonizedKeystroke(e.key);
    }

    if (e.key === 'Backspace') {
      if (typedChars.length > 0) setTypedChars((prev) => prev.slice(0, -1));
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      if (typedChars === currentWord) {
        const next = currentIdx + 1;
        setTypedChars('');
        setCurrentIdx(next);
        if (next >= drillWords.length) {
          setIsFinished(true);
        }
      }
      return;
    }

    if (e.key.length === 1) {
      setTypedChars((prev) => prev + e.key);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    soundEngine.triggerKeystroke({
      key: e.key,
      code: e.code,
      isKeyDown: false,
      isSpacebar: e.key === ' ',
      isEnter: e.key === 'Enter',
      isBackspace: e.key === 'Backspace',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl relative flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <Dumbbell className="w-10 h-10 text-cyan-400 mb-2" />
        <h3 className="text-xl font-mono font-black text-slate-100 tracking-wider">
          TARGETED WEAK-FINGER DRILL
        </h3>
        <p className="text-xs font-mono text-cyan-400 mb-6 uppercase">
          Conditioning: {finger.replace('_', ' ')}
        </p>

        {!isFinished ? (
          <div
            onClick={() => inputRef.current?.focus()}
            className="w-full p-8 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col items-center cursor-text relative mb-6"
          >
            <input
              ref={inputRef}
              type="text"
              value=""
              onChange={() => {}}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              autoFocus
              className="absolute opacity-0 pointer-events-none"
            />

            <div className="text-xs font-mono text-slate-400 mb-3">
              Word {currentIdx + 1} of {drillWords.length}
            </div>

            <div className="text-3xl font-mono font-bold tracking-widest text-cyan-300">
              {currentWord.split('').map((char, idx) => (
                <span
                  key={idx}
                  className={
                    typedChars[idx] === undefined
                      ? 'text-slate-500'
                      : typedChars[idx] === char
                      ? 'text-cyan-300'
                      : 'text-rose-500 bg-rose-950/40'
                  }
                >
                  {char}
                </span>
              ))}
            </div>

            <div className="text-xs font-mono text-slate-500 mt-4">
              Press [SPACE] when word matches
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 animate-fadeIn">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2" />
            <div className="text-lg font-mono font-bold text-slate-100">DRILL COMPLETED!</div>
            <p className="text-xs font-mono text-slate-400 mt-1 mb-6 text-center">
              Your {finger.replace('_', ' ')} muscle memory has been reinforced.
            </p>
            <button
              onClick={() => {
                setCurrentIdx(0);
                setTypedChars('');
                setIsFinished(false);
              }}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> REPEAT DRILL
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
