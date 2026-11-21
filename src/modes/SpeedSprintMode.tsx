import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundEngine } from '../audio/SoundEngine';
import { historyService } from '../services/historyService';
import { useTheme } from '../context/ThemeContext';
import {
  RotateCcw,
  Clock,
  Zap,
  Target,
  Award,
  Flame,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { OverdriveTier, getOverdriveTier } from '../types/overdrive';
import { GhostRacer } from '../components/multiplayer/GhostRacer';

interface SpeedSprintModeProps {
  onKeystrokeStats?: (
    key: string,
    code: string,
    isCorrect: boolean,
    latencyMs: number
  ) => void;
  onLiveWpmUpdate?: (wpm: number, streak: number) => void;
  onCaretPositionUpdate?: (rect: { x: number; y: number } | null) => void;
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

// Top standard benchmark wordlist (Monkeytype style)
const TOP_WORDS = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for',
  'they', 'I', 'with', 'as', 'not', 'on', 'she', 'at', 'by', 'this', 'we', 'you',
  'do', 'but', 'his', 'from', 'they', 'say', 'her', 'she', 'or', 'an', 'will',
  'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
  'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
  'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good',
  'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only',
  'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
  'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any',
  'these', 'give', 'day', 'most', 'us', 'sound', 'great', 'right', 'place', 'switch',
  'mechanical', 'click', 'tactile', 'linear', 'spring', 'smooth', 'speed', 'rhythm',
  'keyboard', 'engine', 'thock', 'clack', 'chassis', 'stabilizer', 'keycap', 'matrix'
];

function getRandomWords(count: number = 80): string[] {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    const randomIdx = Math.floor(Math.random() * TOP_WORDS.length);
    words.push(TOP_WORDS[randomIdx]);
  }
  return words;
}

export const SpeedSprintMode: React.FC<SpeedSprintModeProps> = ({
  onKeystrokeStats,
  onLiveWpmUpdate,
  onCaretPositionUpdate,
  onTestComplete,
  onParticleTrigger,
  onWpmUpdate,
}) => {
  const { themeConfig } = useTheme();
  const [duration, setDuration] = useState<number>(30); // 15, 30, 60, 120
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const [words, setWords] = useState<string[]>(() => getRandomWords(100));
  const [currentWordIdx, setCurrentWordIdx] = useState<number>(0);
  const [typedChars, setTypedChars] = useState<string>('');
  const [history, setHistory] = useState<{ typed: string; isCorrect: boolean }[]>([]);

  // Analytics
  const [correctChars, setCorrectChars] = useState<number>(0);
  const [incorrectChars, setIncorrectChars] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [wpm, setWpm] = useState<number>(0);
  const [rawWpm, setRawWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);

  // Timing
  const timerRef = useRef<any>(null);
  const lastKeyTimeRef = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCharSpanRef = useRef<HTMLSpanElement>(null);

  // Ghost Racing
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const bestRun = historyService.getBestWpm() || 75;

  const resetTest = useCallback(
    (newDuration: number = duration) => {
      clearInterval(timerRef.current);
      setDuration(newDuration);
      setTimeLeft(newDuration);
      setIsActive(false);
      setIsFinished(false);
      setWords(getRandomWords(100));
      setCurrentWordIdx(0);
      setTypedChars('');
      setHistory([]);
      setCorrectChars(0);
      setIncorrectChars(0);
      setStreak(0);
      setWpm(0);
      setRawWpm(0);
      setAccuracy(100);
      setElapsedMs(0);
      lastKeyTimeRef.current = Date.now();

      if (onLiveWpmUpdate) onLiveWpmUpdate(0, 0);
      if (onCaretPositionUpdate) onCaretPositionUpdate(null);

      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [duration, onLiveWpmUpdate, onCaretPositionUpdate]
  );

  // Keyboard shortcut listener: Tab + Enter or Esc to reset
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetTest();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [resetTest]);

  // Main countdown timer
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishTest();
            return 0;
          }
          return prev - 1;
        });
        setElapsedMs((prev) => prev + 1000);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  // Caret coordinate reporting for particle bursts
  useEffect(() => {
    if (activeCharSpanRef.current && onCaretPositionUpdate) {
      const rect = activeCharSpanRef.current.getBoundingClientRect();
      onCaretPositionUpdate({
        x: rect.right,
        y: rect.top + rect.height / 2,
      });
    }
  }, [typedChars, currentWordIdx, onCaretPositionUpdate]);

  // Live WPM calculation
  useEffect(() => {
    const elapsedSeconds = duration - timeLeft;
    if (elapsedSeconds > 0) {
      // Standard WPM = (correctChars / 5) / (elapsedSeconds / 60)
      const calculatedWpm = Math.round((correctChars / 5) / (elapsedSeconds / 60));
      const calculatedRawWpm = Math.round(((correctChars + incorrectChars) / 5) / (elapsedSeconds / 60));
      const total = correctChars + incorrectChars;
      const calculatedAcc = total > 0 ? Math.round((correctChars / total) * 100) : 100;

      setWpm(calculatedWpm);
      setRawWpm(calculatedRawWpm);
      setAccuracy(calculatedAcc);

      if (onLiveWpmUpdate) {
        onLiveWpmUpdate(calculatedWpm, streak);
      }
    }
  }, [correctChars, incorrectChars, timeLeft, duration, streak, onLiveWpmUpdate]);

  const finishTest = () => {
    setIsActive(false);
    setIsFinished(true);

    const elapsedSeconds = duration;
    const finalWpm = Math.round((correctChars / 5) / (elapsedSeconds / 60));
    const finalRaw = Math.round(((correctChars + incorrectChars) / 5) / (elapsedSeconds / 60));
    const finalAcc = correctChars + incorrectChars > 0
      ? Math.round((correctChars / (correctChars + incorrectChars)) * 100)
      : 100;

    historyService.addRecord({
      mode: 'speed_sprint',
      wpm: finalWpm,
      rawWpm: finalRaw,
      accuracy: finalAcc,
      duration,
      soundProfile: soundEngine.getProfile(),
    });

    if (onTestComplete) {
      onTestComplete({
        wpm: finalWpm,
        rawWpm: finalRaw,
        accuracy: finalAcc,
        duration,
        mode: 'speed_sprint',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished) return;

    // Start timer on first keystroke
    if (!isActive) {
      setIsActive(true);
      lastKeyTimeRef.current = Date.now();
    }

    const currentWord = words[currentWordIdx];
    const now = Date.now();
    const latency = now - lastKeyTimeRef.current;
    lastKeyTimeRef.current = now;

    // Audio synthesis trigger
    soundEngine.triggerKeystroke({
      key: e.key,
      code: e.code,
      isKeyDown: true,
      isSpacebar: e.key === ' ',
      isEnter: e.key === 'Enter',
      isBackspace: e.key === 'Backspace',
    });

    if (e.key === 'Backspace') {
      if (typedChars.length > 0) {
        setTypedChars((prev) => prev.slice(0, -1));
      }
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      if (typedChars.length === 0) return;

      const isWordCorrect = typedChars === currentWord;
      setHistory((prev) => [...prev, { typed: typedChars, isCorrect: isWordCorrect }]);

      if (isWordCorrect) {
        setCorrectChars((prev) => prev + currentWord.length + 1); // +1 for space
        setStreak((prev) => prev + 1);
      } else {
        setIncorrectChars((prev) => prev + 1);
        setStreak(0);
      }

      setTypedChars('');
      setCurrentWordIdx((prev) => {
        const next = prev + 1;
        // Expand wordlist if nearing end
        if (next >= words.length - 10) {
          setWords((w) => [...w, ...getRandomWords(50)]);
        }
        return next;
      });
      return;
    }

    // Normal Character input
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const nextTyped = typedChars + e.key;
      setTypedChars(nextTyped);

      const targetChar = currentWord[typedChars.length];
      const isCharCorrect = e.key === targetChar;

      if (isCharCorrect) {
        setCorrectChars((prev) => prev + 1);
        setStreak((prev) => prev + 1);
      } else {
        setIncorrectChars((prev) => prev + 1);
        setStreak(0);
      }

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
      <div className="flex flex-wrap items-center justify-between w-full mb-6 px-4 py-2.5 rounded-xl bg-white border border-neutral-200/90 shadow-xs gap-3">
        {/* Time Selector */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 transition-colors" style={{ color: themeConfig.accent }} />
          <span className="text-xs font-mono text-neutral-500 uppercase">Duration:</span>
          {[15, 30, 60, 120].map((t) => (
            <button
              key={t}
              onClick={() => {
                setDuration(t);
                resetTest(t);
              }}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                duration === t
                  ? 'bg-neutral-100 text-neutral-900 font-bold border shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              style={duration === t ? { borderColor: themeConfig.accent } : undefined}
            >
              {t}s
            </button>
          ))}
        </div>

        {/* Live Metrics Display */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-500 uppercase">Timer:</span>
            <span className="text-lg font-mono font-black text-neutral-900">
              {timeLeft}s
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-500 uppercase">WPM:</span>
            <span
              className={`text-lg font-mono font-black transition-colors ${
                currentTier === 'overdrive'
                  ? 'animate-pulse'
                  : currentTier === 'combustion'
                  ? 'text-orange-600'
                  : 'text-neutral-900'
              }`}
              style={currentTier === 'overdrive' ? { color: themeConfig.accent } : undefined}
            >
              {wpm}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-500 uppercase">Acc:</span>
            <span className="text-lg font-mono font-black text-emerald-600">
              {correctChars + incorrectChars > 0
                ? `${Math.round((correctChars / (correctChars + incorrectChars)) * 100)}%`
                : '100%'}
            </span>
          </div>

          <button
            onClick={() => resetTest()}
            className="p-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors shadow-xs"
            title="Restart Test (Esc)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Words Flow Container */}
      <div
        ref={containerRef}
        onClick={() => inputRef.current?.focus()}
        className="w-full min-h-[170px] p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 relative cursor-text overflow-hidden select-none shadow-sm"
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
        <div className="flex flex-wrap gap-x-3 gap-y-3.5 font-mono text-2xl sm:text-3xl leading-relaxed tracking-normal">
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
                    historyItem.isCorrect ? 'text-neutral-400' : 'text-rose-600 underline decoration-rose-500'
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
                    let charColor = 'text-neutral-800 font-medium';
                    let isCaretHere = charIdx === typedChars.length;

                    if (typedChar !== undefined) {
                      charColor = typedChar === char ? 'font-bold' : 'text-rose-600 bg-rose-50 font-bold rounded';
                    }

                    return (
                      <span
                        key={charIdx}
                        ref={isCaretHere ? activeCharSpanRef : null}
                        className={`relative ${charColor}`}
                        style={typedChar === char ? { color: themeConfig.accent } : undefined}
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
                      <span key={`extra-${extraIdx}`} className="text-rose-600 bg-rose-50 font-bold rounded">
                        {extraChar}
                      </span>
                    ))}

                  {/* Caret at end of word */}
                  {typedChars.length >= word.length && (
                    <span
                      ref={activeCharSpanRef}
                      className="w-0.5 h-7 animate-pulse inline-block align-middle ml-0.5"
                      style={{ backgroundColor: themeConfig.accent }}
                    />
                  )}
                </span>
              );
            }

            return (
              <span key={actualIdx} className="text-neutral-400 transition-colors">
                {word}
              </span>
            );
          })}
        </div>

        {!isActive && !isFinished && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <span
              className="text-xs font-mono font-bold uppercase tracking-widest animate-pulse px-3.5 py-1.5 rounded-lg bg-white border shadow-sm"
              style={{ borderColor: themeConfig.accent, color: themeConfig.accent }}
            >
              CLICK OR PRESS ANY KEY TO INITIALIZE SPRINT
            </span>
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {isFinished && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xl flex flex-col items-center">
            <Award className="w-12 h-12 mb-3 animate-bounce" style={{ color: themeConfig.accent }} />
            <h3 className="text-2xl font-mono font-black text-neutral-900 tracking-wider">
              SPEED SPRINT COMPLETE
            </h3>
            <p className="text-xs font-mono mb-6 font-bold uppercase" style={{ color: themeConfig.accent }}>BENCHMARK CERTIFIED</p>

            <div className="grid grid-cols-2 gap-4 w-full mb-6">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col items-center">
                <span className="text-xs font-mono text-neutral-500 uppercase">Net WPM</span>
                <span className="text-3xl font-mono font-black" style={{ color: themeConfig.accent }}>{wpm}</span>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col items-center">
                <span className="text-xs font-mono text-neutral-500 uppercase">Raw WPM</span>
                <span className="text-3xl font-mono font-black text-neutral-900">{rawWpm}</span>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col items-center">
                <span className="text-xs font-mono text-neutral-500 uppercase">Accuracy</span>
                <span className="text-2xl font-mono font-bold text-emerald-600">{accuracy}%</span>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col items-center">
                <span className="text-xs font-mono text-neutral-500 uppercase">Duration</span>
                <span className="text-2xl font-mono font-bold text-neutral-900">{duration}s</span>
              </div>
            </div>

            <button
              onClick={() => resetTest()}
              className="btn-accent-pill w-full py-3 rounded-xl font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2 shadow-md text-white"
              style={{ backgroundColor: themeConfig.accent }}
            >
              <RotateCcw className="w-4 h-4" />
              REPEAT SPRINT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
