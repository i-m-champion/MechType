import React, { useState, useEffect, useRef } from 'react';
import { getRandomWords } from '../data/wordlists';
import { soundEngine } from '../audio/SoundEngine';
import { lofiRhythmEngine } from '../audio/LofiRhythmEngine';
import { EyeOff, Eye, RotateCcw, Award } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const BlindfoldMode: React.FC = () => {
  const { themeConfig } = useTheme();
  const [words, setWords] = useState<string[]>([]);
  const [typedWords, setTypedWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initTest = () => {
    setWords(getRandomWords(25));
    setTypedWords([]);
    setCurrentInput('');
    setIsFinished(false);
    setStartTime(null);
    if (inputRef.current) inputRef.current.focus();
  };

  useEffect(() => {
    initTest();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished) return;

    if (!startTime && e.key.length === 1) {
      setStartTime(performance.now());
    }

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
      if (currentInput.length > 0) setCurrentInput((prev) => prev.slice(0, -1));
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      if (!currentInput.trim()) return;

      const nextTyped = [...typedWords, currentInput];
      setTypedWords(nextTyped);
      setCurrentInput('');

      if (nextTyped.length >= words.length) {
        setIsFinished(true);
      }
      return;
    }

    if (e.key.length === 1) {
      setCurrentInput((prev) => prev + e.key);
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

  // Score calculation
  let correctWords = 0;
  let totalChars = 0;
  let correctChars = 0;

  if (isFinished) {
    typedWords.forEach((typed, idx) => {
      const target = words[idx] || '';
      if (typed === target) correctWords++;
      for (let c = 0; c < target.length; c++) {
        totalChars++;
        if (typed[c] === target[c]) correctChars++;
      }
    });
  }

  const elapsedSec = startTime ? (performance.now() - startTime) / 1000 : 30;
  const blindWpm = Math.round(((correctChars / 5) / elapsedSec) * 60) || 0;
  const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Mode Header */}
      <div className="flex items-center justify-between w-full mb-6 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <EyeOff className="w-5 h-5 text-purple-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            BLINDFOLD MODE // 100% INVISIBLE INK
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span>Words: {typedWords.length} / {words.length}</span>
          <button
            onClick={initTest}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Typing Surface */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="w-full min-h-[220px] p-8 rounded-2xl bg-slate-950/70 border border-purple-500/30 relative cursor-text flex flex-col items-center justify-center select-none shadow-2xl"
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

        {!isFinished ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <EyeOff className="w-12 h-12 text-purple-400/50 animate-pulse" />
            <h4 className="text-xl font-mono text-slate-300 font-bold">
              THE INK IS INVISIBLE
            </h4>
            <p className="text-xs font-mono text-slate-500 max-w-md">
              Target word {typedWords.length + 1} of {words.length}: [ <span className="text-cyan-400 font-bold">{words[typedWords.length]}</span> ]
            </p>
            <div className="flex gap-1.5 mt-2">
              {currentInput.split('').map((_, idx) => (
                <span key={idx} className="w-3 h-3 rounded-full bg-purple-500/80 animate-ping inline-block" />
              ))}
              <span className="w-2 h-5 bg-cyan-400 animate-pulse inline-block" />
            </div>
          </div>
        ) : (
          /* Dramatic Reveal */
          <div className="w-full flex flex-col items-center animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Eye className="w-6 h-6" />
              <span className="font-mono font-bold text-lg">INK REVEALED!</span>
            </div>
            <div className="flex gap-6 my-4 font-mono">
              <div className="text-center">
                <div className="text-xs text-slate-400">Blind WPM</div>
                <div className="text-2xl font-bold text-cyan-400">{blindWpm}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400">Accuracy</div>
                <div className="text-2xl font-bold text-emerald-400">{accuracy}%</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400">Correct Words</div>
                <div className="text-2xl font-bold text-slate-200">{correctWords}/{words.length}</div>
              </div>
            </div>

            {/* Comparison Stream */}
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl font-mono text-sm mt-3 p-4 rounded-xl bg-slate-900/60 border border-white/5">
              {words.map((target, idx) => {
                const typed = typedWords[idx] || '';
                const isMatch = typed === target;
                return (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded text-xs ${
                      isMatch
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 line-through'
                    }`}
                    title={`Target: ${target} | You typed: ${typed}`}
                  >
                    {typed || 'MISSING'}
                  </span>
                );
              })}
            </div>

            <button
              onClick={initTest}
              className="mt-6 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs"
            >
              TRY BLINDFOLD AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
