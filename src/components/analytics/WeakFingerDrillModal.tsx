import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../../audio/SoundEngine';
import { ergonomicsService } from '../../services/ergonomicsService';
import { X, Dumbbell, CheckCircle2, RotateCcw } from 'lucide-react';

interface WeakFingerDrillModalProps {
  finger: string;
  onClose: () => void;
}

export const WeakFingerDrillModal: React.FC<WeakFingerDrillModalProps> = ({
  finger,
  onClose,
}) => {
  const [drillWords, setDrillWords] = useState<string[]>(() =>
    ergonomicsService.generateDrillWords(finger, 10)
  );
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [typedChars, setTypedChars] = useState<string>('');
  const [isFinished, setIsFinished] = useState<boolean>(false);
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

    if (e.key === 'Backspace') {
      setTypedChars((prev) => prev.slice(0, -1));
      return;
    }

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (typedChars === currentWord) {
        if (currentIdx + 1 >= drillWords.length) {
          setIsFinished(true);
        } else {
          setCurrentIdx((prev) => prev + 1);
          setTypedChars('');
        }
      }
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const nextTyped = typedChars + e.key;
      setTypedChars(nextTyped);

      // Auto-advance if fully matches
      if (nextTyped === currentWord) {
        if (currentIdx + 1 >= drillWords.length) {
          setIsFinished(true);
        } else {
          setTimeout(() => {
            setCurrentIdx((prev) => prev + 1);
            setTypedChars('');
          }, 80);
        }
      }
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xl relative flex flex-col items-center text-neutral-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-neutral-400 hover:text-neutral-900"
        >
          <X className="w-5 h-5" />
        </button>

        <Dumbbell className="w-10 h-10 text-[#ff5500] mb-2" />
        <h3 className="text-xl font-mono font-black text-neutral-900 tracking-wider">
          TARGETED WEAK-FINGER DRILL
        </h3>
        <p className="text-xs font-mono text-[#ff5500] mb-6 uppercase font-bold">
          Conditioning: {finger.replace('_', ' ')}
        </p>

        {!isFinished ? (
          <div
            onClick={() => inputRef.current?.focus()}
            className="w-full p-8 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col items-center cursor-text relative mb-6"
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

            <div className="text-xs font-mono text-neutral-500 mb-3">
              Word {currentIdx + 1} of {drillWords.length}
            </div>

            <div className="text-3xl font-mono font-bold tracking-widest text-[#ff5500]">
              {currentWord.split('').map((char, idx) => (
                <span
                  key={idx}
                  className={
                    typedChars[idx] === undefined
                      ? 'text-neutral-400'
                      : typedChars[idx] === char
                      ? 'text-[#ff5500] font-black'
                      : 'text-rose-600 bg-rose-100 rounded'
                  }
                >
                  {char}
                </span>
              ))}
            </div>

            <div className="mt-4 text-[11px] font-mono text-neutral-400">
              Type word accurately to advance
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center mb-6 w-full">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
            <h4 className="text-lg font-mono font-bold text-emerald-900">DRILL SESSION COMPLETED</h4>
            <p className="text-xs font-mono text-emerald-700">
              Muscle conditioning complete for {finger.replace('_', ' ')}.
            </p>
          </div>
        )}

        <div className="flex gap-3 w-full">
          <button
            onClick={() => {
              setDrillWords(ergonomicsService.generateDrillWords(finger, 10));
              setCurrentIdx(0);
              setTypedChars('');
              setIsFinished(false);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="flex-1 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-mono text-xs font-bold flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> RESTART DRILL
          </button>
          <button
            onClick={onClose}
            className="btn-orange-pill flex-1 py-2.5 rounded-xl font-mono text-xs font-bold"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
