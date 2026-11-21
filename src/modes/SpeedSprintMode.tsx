import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getRandomWords } from '../data/wordlists';
import { soundEngine } from '../audio/SoundEngine';
import { lofiRhythmEngine } from '../audio/LofiRhythmEngine';
import { getOverdriveTier, OverdriveTier } from '../types/overdrive';
import { useTheme } from '../context/ThemeContext';
import { RotateCcw, Clock, Award, Target, Zap, AlertCircle } from 'lucide-react';

interface SpeedSprintProps {
  onKeystrokeStats?: (char: string, code: string, isCorrect: boolean, latencyMs: number) => void;
  onTestComplete?: (result: {
    wpm: number;
    rawWpm: number;
    accuracy: number;
    duration: number;
    mode: string;
  }) => void;
  onParticleTrigger?: (pos: { x: number; y: number }, tier: OverdriveTier) => void;
  onWpmUpdate?: (wpm: number, kps: number) => void;
}

export const SpeedSprintMode: React.FC<SpeedSprintProps> = ({
  onKeystrokeStats,
  onTestComplete,
  onParticleTrigger,
  onWpmUpdate,
}) => {
  const { themeConfig } = useTheme();
  const [duration, setDuration] = useState<number>(30); // 15, 30, 60, 120
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [typedChars, setTypedChars] = useState<string>('');
  const [history, setHistory] = useState<{ word: string; typed: string; isCorrect: boolean }[]>([]);

  // State flags
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Live Metrics
  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);

  const startTimeRef = useRef<number | null>(null);
  const lastKeyTimeRef = useRef<number>(performance.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const activeCharSpanRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize test
  const resetTest = useCallback((newDuration = duration) => {
    const generated = getRandomWords(80);
    setWords(generated);
    setCurrentWordIdx(0);
    setTypedChars('');
    setHistory([]);
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(newDuration);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setCorrectChars(0);
    setIncorrectChars(0);
    startTimeRef.current = null;
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  }, [duration]);

  useEffect(() => {
    resetTest(duration);
  }, [duration, resetTest]);

  // Timer countdown and live WPM recalculation
  useEffect(() => {
    if (!isActive || isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishTest();
          return 0;
        }
        return prev - 1;
      });

      // Update Live WPM
      if (startTimeRef.current) {
        const elapsedSec = (performance.now() - startTimeRef.current) / 1000;
        if (elapsedSec > 0.5) {
          const totalWords = (correctChars + incorrectChars) / 5;
          const liveRawWpm = Math.round((totalWords / elapsedSec) * 60);
          const liveNetWpm = Math.max(0, Math.round(((correctChars / 5) / elapsedSec) * 60));
          const liveKps = parseFloat(((correctChars + incorrectChars) / elapsedSec).toFixed(1));

          setRawWpm(liveRawWpm);
          setWpm(liveNetWpm);

          if (onWpmUpdate) {
            onWpmUpdate(liveNetWpm, liveKps);
          }
        }
      }
    }, 200);

    return () => clearInterval(timer);
  }, [isActive, isFinished, correctChars, incorrectChars, onWpmUpdate]);

  const finishTest = useCallback(() => {
    setIsActive(false);
    setIsFinished(true);

    const elapsedSec = startTimeRef.current
      ? (performance.now() - startTimeRef.current) / 1000
      : duration;

    const totalChars = correctChars + incorrectChars;
    const finalRawWpm = Math.round(((totalChars / 5) / elapsedSec) * 60) || 0;
    const finalNetWpm = Math.max(0, Math.round(((correctChars / 5) / elapsedSec) * 60)) || 0;
    const finalAcc = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

    setRawWpm(finalRawWpm);
    setWpm(finalNetWpm);
    setAccuracy(finalAcc);

    if (onTestComplete) {
      onTestComplete({
        wpm: finalNetWpm,
        rawWpm: finalRawWpm,
        accuracy: finalAcc,
        duration,
        mode: 'Speed Sprint',
      });
    }
  }, [correctChars, incorrectChars, duration, onTestComplete]);

  // Handle typing input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished) {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        resetTest();
      }
      return;
    }

    if (!isActive && e.key.length === 1) {
      setIsActive(true);
      startTimeRef.current = performance.now();
    }

    const now = performance.now();
    const latency = now - lastKeyTimeRef.current;
    lastKeyTimeRef.current = now;

    // Trigger Key Audio
    const isSpace = e.key === ' ';
    const isEnter = e.key === 'Enter';
    const isBackspace = e.key === 'Backspace';

    soundEngine.triggerKeystroke({
      key: e.key,
      code: e.code,
      isKeyDown: true,
      isSpacebar: isSpace,
      isEnter: isEnter,
      isBackspace: isBackspace,
    });

    if (lofiRhythmEngine.isEnabled() && e.key.length === 1) {
      lofiRhythmEngine.triggerHarmonizedKeystroke(e.key);
    }

    // Trigger Particle Sparks / Combustion at Caret
    if (activeCharSpanRef.current && onParticleTrigger) {
      const rect = activeCharSpanRef.current.getBoundingClientRect();
      const currentTier = getOverdriveTier(wpm);
      onParticleTrigger({ x: rect.right, y: rect.top + 12 }, currentTier);
    }

    // Handle Spacebar (Word Submission)
    if (isSpace) {
      e.preventDefault();
      if (typedChars.length === 0) return;

      const targetWord = words[currentWordIdx];
      const isWordCorrect = typedChars === targetWord;

      // Count character accuracy
      let correctInWord = 0;
      for (let i = 0; i < typedChars.length; i++) {
        if (typedChars[i] === targetWord[i]) correctInWord++;
      }
      const incorrectInWord = Math.max(0, typedChars.length - correctInWord) + Math.max(0, targetWord.length - typedChars.length);

      setCorrectChars((prev) => prev + correctInWord + 1); // +1 for spacebar
      setIncorrectChars((prev) => prev + incorrectInWord);

      setHistory((prev) => [
        ...prev,
        { word: targetWord, typed: typedChars, isCorrect: isWordCorrect },
      ]);

      setTypedChars('');
      setCurrentWordIdx((prev) => prev + 1);

      // Replenish words when approaching end
      if (currentWordIdx > words.length - 15) {
        setWords((prev) => [...prev, ...getRandomWords(40)]);
      }

      if (onKeystrokeStats) {
        onKeystrokeStats(' ', 'Space', isWordCorrect, latency);
      }
      return;
    }

    // Handle Backspace
    if (isBackspace) {
      if (typedChars.length > 0) {
        setTypedChars((prev) => prev.slice(0, -1));
      }
      return;
    }

    // Handle normal printable characters
    if (e.key.length === 1) {
      const nextTyped = typedChars + e.key;
      setTypedChars(nextTyped);

      const targetWord = words[currentWordIdx] || '';
      const charIndex = typedChars.length;
      const isCharCorrect = e.key === targetWord[charIndex];

      if (onKeystrokeStats) {
        onKeystrokeStats(e.key, e.code, isCharCorrect, latency);
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

  const currentTier = getOverdriveTier(wpm);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Test Controls Bar */}
      <div className="flex items-center justify-between w-full mb-6 px-4 py-2 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
        {/* Time Selector */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-slate-400 uppercase">Duration:</span>
          {[15, 30, 60, 120].map((t) => (
            <button
              key={t}
              onClick={() => {
                setDuration(t);
                resetTest(t);
              }}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                duration === t
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}s
            </button>
          ))}
        </div>

        {/* Live Metrics Display */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Timer:</span>
            <span className="text-lg font-mono font-black text-cyan-400">
              {timeLeft}s
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase">WPM:</span>
            <span
              className={`text-lg font-mono font-black transition-colors ${
                currentTier === 'overdrive'
                  ? 'text-cyan-300 animate-pulse'
                  : currentTier === 'combustion'
                  ? 'text-orange-400'
                  : 'text-slate-100'
              }`}
            >
              {wpm}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Acc:</span>
            <span className="text-lg font-mono font-black text-emerald-400">
              {correctChars + incorrectChars > 0
                ? `${Math.round((correctChars / (correctChars + incorrectChars)) * 100)}%`
                : '100%'}
            </span>
          </div>

          <button
            onClick={() => resetTest()}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors"
            title="Restart Test (Tab + Enter)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Words Flow Container */}
      <div
        ref={containerRef}
        onClick={() => inputRef.current?.focus()}
        className="w-full min-h-[160px] p-6 rounded-2xl bg-slate-900/40 border border-white/5 relative cursor-text overflow-hidden select-none"
      >
        {/* Hidden Input for Touch & Focus */}
        <input
          ref={inputRef}
          type="text"
          value={typedChars}
          onChange={() => {}}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          autoFocus
          className="absolute opacity-0 pointer-events-none"
        />

        {/* Word Display Stream */}
        <div className="flex flex-wrap gap-x-2.5 gap-y-3 font-mono text-xl sm:text-2xl leading-relaxed tracking-wide">
          {words.slice(Math.max(0, currentWordIdx - 4), currentWordIdx + 25).map((word, relIdx) => {
            const actualIdx = Math.max(0, currentWordIdx - 4) + relIdx;
            const isCurrent = actualIdx === currentWordIdx;
            const isPast = actualIdx < currentWordIdx;
            const historyItem = history[actualIdx];

            if (isPast && historyItem) {
              return (
                <span
                  key={actualIdx}
                  className={`transition-colors ${
                    historyItem.isCorrect ? 'text-slate-500' : 'text-rose-500/80 underline decoration-rose-500'
                  }`}
                >
                  {historyItem.typed}
                </span>
              );
            }

            if (isCurrent) {
              return (
                <span
                  key={actualIdx}
                  className="relative inline-flex items-center"
                >
                  {word.split('').map((char, charIdx) => {
                    const typedChar = typedChars[charIdx];
                    let charColor = 'text-slate-400';
                    let isCaretHere = charIdx === typedChars.length;

                    if (typedChar !== undefined) {
                      charColor = typedChar === char ? 'text-cyan-300 font-bold' : 'text-rose-400 bg-rose-500/20 rounded';
                    }

                    return (
                      <span
                        key={charIdx}
                        ref={isCaretHere ? activeCharSpanRef : null}
                        className={`relative ${charColor}`}
                      >
                        {isCaretHere && (
                          <span
                            className="absolute -left-0.5 top-0 bottom-0 w-0.5 animate-pulse"
                            style={{ backgroundColor: themeConfig.accent }}
                          />
                        )}
                        {char}
                      </span>
                    );
                  })}

                  {/* Trailing extra typos typed beyond word length */}
                  {typedChars.length > word.length &&
                    typedChars.slice(word.length).split('').map((extraChar, extraIdx) => (
                      <span key={`extra-${extraIdx}`} className="text-rose-500 bg-rose-950/40 rounded">
                        {extraChar}
                      </span>
                    ))}

                  {/* Caret at end of word */}
                  {typedChars.length >= word.length && (
                    <span
                      ref={activeCharSpanRef}
                      className="w-0.5 h-6 animate-pulse inline-block align-middle ml-0.5"
                      style={{ backgroundColor: themeConfig.accent }}
                    />
                  )}
                </span>
              );
            }

            return (
              <span key={actualIdx} className="text-slate-600 transition-colors">
                {word}
              </span>
            );
          })}
        </div>

        {!isActive && !isFinished && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <span className="text-xs font-mono text-cyan-400/80 uppercase tracking-widest animate-pulse">
              Click or Press Any Key to Start
            </span>
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {isFinished && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl flex flex-col items-center">
            <Award className="w-12 h-12 text-cyan-400 mb-3 animate-bounce" />
            <h3 className="text-2xl font-mono font-black text-slate-100 tracking-wider">
              SPEED SPRINT COMPLETE
            </h3>
            <p className="text-xs font-mono text-cyan-400 mb-6">BENCHMARK CERTIFIED</p>

            <div className="grid grid-cols-2 gap-4 w-full mb-6">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-white/5 flex flex-col items-center">
                <span className="text-xs font-mono text-slate-400 uppercase">Net WPM</span>
                <span className="text-3xl font-mono font-black text-cyan-400">{wpm}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-white/5 flex flex-col items-center">
                <span className="text-xs font-mono text-slate-400 uppercase">Raw WPM</span>
                <span className="text-3xl font-mono font-black text-slate-200">{rawWpm}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-white/5 flex flex-col items-center">
                <span className="text-xs font-mono text-slate-400 uppercase">Accuracy</span>
                <span className="text-2xl font-mono font-bold text-emerald-400">{accuracy}%</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-white/5 flex flex-col items-center">
                <span className="text-xs font-mono text-slate-400 uppercase">Duration</span>
                <span className="text-2xl font-mono font-bold text-slate-200">{duration}s</span>
              </div>
            </div>

            <button
              onClick={() => resetTest()}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              REPEAT SPRINT (TAB + ENTER)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
