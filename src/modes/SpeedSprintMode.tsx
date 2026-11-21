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
  BarChart2,
  CheckCircle2,
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

interface CompletedWord {
  target: string;
  typed: string;
  isCorrect: boolean;
}

// Standard Top Benchmark Wordlist (Monkeytype Top 200 standard)
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
  'keyboard', 'engine', 'thock', 'clack', 'chassis', 'stabilizer', 'keycap', 'matrix',
  'world', 'school', 'still', 'last', 'ask', 'need', 'too', 'feel', 'three', 'state',
  'never', 'become', 'between', 'high', 'really', 'something', 'most', 'another', 'much',
  'family', 'own', 'out', 'leave', 'put', 'old', 'while', 'mean', 'keep', 'student'
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
  const [history, setHistory] = useState<CompletedWord[]>([]);

  // Monkeytype Standard Keystroke & Character Counters
  const [correctKeystrokes, setCorrectKeystrokes] = useState<number>(0);
  const [incorrectKeystrokes, setIncorrectKeystrokes] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // Live Metric Displays
  const [wpm, setWpm] = useState<number>(0);
  const [rawWpm, setRawWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [consistency, setConsistency] = useState<number>(100);
  const [netCorrectChars, setNetCorrectChars] = useState<number>(0);
  const [totalRawChars, setTotalRawChars] = useState<number>(0);

  // Timing refs
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);
  const lastKeyTimeRef = useRef<number>(Date.now());
  const rawWpmHistoryRef = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCharSpanRef = useRef<HTMLSpanElement>(null);

  // Ghost Racing
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const bestRun = historyService.getBestWpm() || 75;

  /**
   * Reset typing test to initial state
   */
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
      setCorrectKeystrokes(0);
      setIncorrectKeystrokes(0);
      setStreak(0);
      setWpm(0);
      setRawWpm(0);
      setAccuracy(100);
      setConsistency(100);
      setNetCorrectChars(0);
      setTotalRawChars(0);
      setElapsedMs(0);
      startTimeRef.current = null;
      lastKeyTimeRef.current = Date.now();
      rawWpmHistoryRef.current = [];

      if (onLiveWpmUpdate) onLiveWpmUpdate(0, 0);
      if (onCaretPositionUpdate) onCaretPositionUpdate(null);
      if (onWpmUpdate) onWpmUpdate(0, 0);

      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [duration, onLiveWpmUpdate, onCaretPositionUpdate, onWpmUpdate]
  );

  // Global key listener: Esc or Tab + Enter to reset
  useEffect(() => {
    let tabPressed = false;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetTest();
      }
      if (e.key === 'Tab') {
        tabPressed = true;
      }
      if (e.key === 'Enter' && tabPressed) {
        e.preventDefault();
        resetTest();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        tabPressed = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [resetTest]);

  /**
   * Monkeytype Standard Calculations:
   * 1 word = 5 characters.
   * Net WPM = (characters in correct words + correct spaces + active word correct letters) / 5 / (time_in_seconds / 60)
   * Raw WPM = (total characters typed including errors and spaces) / 5 / (time_in_seconds / 60)
   * Accuracy = (correct keystrokes / total keystrokes) * 100
   */
  const calculateMonkeytypeMetrics = useCallback(
    (
      completedWords: CompletedWord[],
      currTyped: string,
      currWord: string,
      elapsedSeconds: number,
      correctKeys: number,
      incorrectKeys: number
    ) => {
      // 1. Net Correct Characters (Standard 5-char rule)
      // Only words that were typed 100% correctly count towards Net WPM
      let correctCharsCount = 0;
      for (const item of completedWords) {
        if (item.isCorrect) {
          correctCharsCount += item.target.length + 1; // characters + following space
        }
      }

      // Active word partial credit (only if no error so far in the active word)
      let hasErrorInCurrent = false;
      let currentWordMatched = 0;
      for (let i = 0; i < currTyped.length; i++) {
        if (i < currWord.length && currTyped[i] === currWord[i]) {
          if (!hasErrorInCurrent) currentWordMatched++;
        } else {
          hasErrorInCurrent = true;
        }
      }
      if (!hasErrorInCurrent) {
        correctCharsCount += currentWordMatched;
      }

      // 2. Raw Characters (all typed characters including errors, extra chars, and spaces)
      let rawCharsCount = 0;
      for (const item of completedWords) {
        rawCharsCount += item.typed.length + 1;
      }
      rawCharsCount += currTyped.length;

      // 3. Time in minutes
      const timeMinutes = Math.max(0.2, elapsedSeconds) / 60;

      // 4. Words per minute (rounded integer, clamped >= 0)
      const liveWpm = Math.max(0, Math.round((correctCharsCount / 5) / timeMinutes));
      const liveRawWpm = Math.max(0, Math.round((rawCharsCount / 5) / timeMinutes));

      // 5. Accuracy (percentage of correct keystrokes)
      const totalKeys = correctKeys + incorrectKeys;
      const liveAcc = totalKeys > 0 ? Math.round((correctKeys / totalKeys) * 100) : 100;

      return {
        wpm: liveWpm,
        rawWpm: liveRawWpm,
        accuracy: liveAcc,
        netCorrectChars: correctCharsCount,
        totalRawChars: rawCharsCount,
      };
    },
    []
  );

  // Stable ref holding latest mutable typing state to avoid restarting timer interval on every keystroke
  const latestStateRef = useRef({
    duration,
    words,
    currentWordIdx,
    history,
    typedChars,
    correctKeystrokes,
    incorrectKeystrokes,
    streak,
  });

  // Always keep latestStateRef in sync with latest component state
  useEffect(() => {
    latestStateRef.current = {
      duration,
      words,
      currentWordIdx,
      history,
      typedChars,
      correctKeystrokes,
      incorrectKeystrokes,
      streak,
    };
  });

  /**
   * Final Benchmark Calculation when timer expires
   */
  const finishTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsActive(false);
    setIsFinished(true);
    setTimeLeft(0);

    const state = latestStateRef.current;
    const testMinutes = state.duration / 60;
    const currentWord = state.words[state.currentWordIdx] || '';

    // Final Monkeytype Net & Raw calculation
    let finalNetCorrectChars = 0;
    for (const item of state.history) {
      if (item.isCorrect) {
        finalNetCorrectChars += item.target.length + 1;
      }
    }

    // Active word credit at the buzzer if no typo was present
    let hasError = false;
    let activeCorrect = 0;
    for (let i = 0; i < state.typedChars.length; i++) {
      if (i < currentWord.length && state.typedChars[i] === currentWord[i]) {
        if (!hasError) activeCorrect++;
      } else {
        hasError = true;
      }
    }
    if (!hasError) {
      finalNetCorrectChars += activeCorrect;
    }

    let finalRawChars = 0;
    for (const item of state.history) {
      finalRawChars += item.typed.length + 1;
    }
    finalRawChars += state.typedChars.length;

    const finalWpm = Math.max(0, Math.round((finalNetCorrectChars / 5) / testMinutes));
    const finalRawWpm = Math.max(0, Math.round((finalRawChars / 5) / testMinutes));

    const totalKeys = state.correctKeystrokes + state.incorrectKeystrokes;
    const finalAcc = totalKeys > 0 ? Math.round((state.correctKeystrokes / totalKeys) * 100) : 100;

    // Monkeytype Consistency formula: 100 * (1 - (StandardDeviation / Mean))
    let finalConsistency = 100;
    const rawSamples = rawWpmHistoryRef.current;
    if (rawSamples.length > 1) {
      const mean = rawSamples.reduce((a, b) => a + b, 0) / rawSamples.length;
      if (mean > 0) {
        const variance =
          rawSamples.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / rawSamples.length;
        const sd = Math.sqrt(variance);
        finalConsistency = Math.max(0, Math.min(100, Math.round(100 * (1 - sd / mean))));
      }
    }

    setWpm(finalWpm);
    setRawWpm(finalRawWpm);
    setAccuracy(finalAcc);
    setConsistency(finalConsistency);
    setNetCorrectChars(finalNetCorrectChars);
    setTotalRawChars(finalRawChars);

    historyService.addRecord({
      mode: 'speed_sprint',
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAcc,
      duration: state.duration,
      soundProfile: soundEngine.getProfile(),
    });

    if (onTestComplete) {
      onTestComplete({
        wpm: finalWpm,
        rawWpm: finalRawWpm,
        accuracy: finalAcc,
        duration: state.duration,
        mode: `Speed Sprint (${state.duration}s)`,
      });
    }
  }, [onTestComplete]);

  // Main countdown timer & live telemetry tick (Independent of typing events)
  useEffect(() => {
    if (!isActive) return;

    const testDuration = duration;
    const startMs = startTimeRef.current || performance.now();
    if (!startTimeRef.current) {
      startTimeRef.current = startMs;
    }

    let lastSampleSec = -1;

    // Tick every 100ms for continuous, millisecond-accurate countdown with zero drift
    timerRef.current = setInterval(() => {
      const now = performance.now();
      const elapsedSec = (now - startMs) / 1000;
      const remainingSec = Math.max(0, testDuration - elapsedSec);

      setElapsedMs(Math.round(elapsedSec * 1000));
      setTimeLeft(Math.ceil(remainingSec));

      // Record second-by-second Raw WPM sample once every second
      const currentSecFloor = Math.floor(elapsedSec);
      if (currentSecFloor > lastSampleSec) {
        lastSampleSec = currentSecFloor;
        const state = latestStateRef.current;
        const currentWord = state.words[state.currentWordIdx] || '';
        const metrics = calculateMonkeytypeMetrics(
          state.history,
          state.typedChars,
          currentWord,
          elapsedSec,
          state.correctKeystrokes,
          state.incorrectKeystrokes
        );

        setWpm(metrics.wpm);
        setRawWpm(metrics.rawWpm);
        setAccuracy(metrics.accuracy);
        setNetCorrectChars(metrics.netCorrectChars);
        setTotalRawChars(metrics.totalRawChars);
        rawWpmHistoryRef.current.push(metrics.rawWpm);

        if (onLiveWpmUpdate) {
          onLiveWpmUpdate(metrics.wpm, state.streak);
        }
        if (onWpmUpdate) {
          const kps = Number((metrics.rawWpm / 12).toFixed(1));
          onWpmUpdate(metrics.wpm, kps);
        }
      }

      if (remainingSec <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        finishTest();
      }
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, duration, calculateMonkeytypeMetrics, finishTest, onLiveWpmUpdate, onWpmUpdate]);

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

  /**
   * Keystroke event handler
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished) return;

    // Start timer on first non-modifier keystroke
    if (!isActive) {
      if (e.key === 'Tab' || e.key === 'Escape' || e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }
      setIsActive(true);
      startTimeRef.current = performance.now();
      lastKeyTimeRef.current = Date.now();
    }

    const currentWord = words[currentWordIdx] || '';
    const now = Date.now();
    const latency = now - lastKeyTimeRef.current;
    lastKeyTimeRef.current = now;

    // Native audio synthesis trigger
    soundEngine.triggerKeystroke({
      key: e.key,
      code: e.code,
      isKeyDown: true,
      isSpacebar: e.key === ' ',
      isEnter: e.key === 'Enter',
      isBackspace: e.key === 'Backspace',
    });

    // Handle Backspace (Monkeytype word navigation)
    if (e.key === 'Backspace') {
      if (typedChars.length > 0) {
        const nextTyped = typedChars.slice(0, -1);
        setTypedChars(nextTyped);
        if (startTimeRef.current) {
          const elapsedSec = (performance.now() - startTimeRef.current) / 1000;
          const metrics = calculateMonkeytypeMetrics(
            history,
            nextTyped,
            currentWord,
            elapsedSec,
            correctKeystrokes,
            incorrectKeystrokes
          );
          setWpm(metrics.wpm);
          setRawWpm(metrics.rawWpm);
          setAccuracy(metrics.accuracy);
        }
      } else if (currentWordIdx > 0) {
        // Backspace to previous word if it had errors (Monkeytype feature)
        const prevWord = history[currentWordIdx - 1];
        if (prevWord && !prevWord.isCorrect) {
          setCurrentWordIdx((idx) => idx - 1);
          setTypedChars(prevWord.typed);
          const newHistory = history.slice(0, -1);
          setHistory(newHistory);

          if (startTimeRef.current) {
            const elapsedSec = (performance.now() - startTimeRef.current) / 1000;
            const metrics = calculateMonkeytypeMetrics(
              newHistory,
              prevWord.typed,
              prevWord.target,
              elapsedSec,
              correctKeystrokes,
              incorrectKeystrokes
            );
            setWpm(metrics.wpm);
            setRawWpm(metrics.rawWpm);
            setAccuracy(metrics.accuracy);
          }
        }
      }
      return;
    }

    // Handle Spacebar (Submit current word)
    if (e.key === ' ') {
      e.preventDefault();
      if (typedChars.length === 0) return; // Prevent space spamming

      const isWordCorrect = typedChars === currentWord;
      const newHistory: CompletedWord[] = [
        ...history,
        { target: currentWord, typed: typedChars, isCorrect: isWordCorrect },
      ];
      setHistory(newHistory);

      let nextCorrectKeys = correctKeystrokes;
      let nextIncorrectKeys = incorrectKeystrokes;

      if (isWordCorrect) {
        nextCorrectKeys += 1; // spacebar was correct
        setCorrectKeystrokes(nextCorrectKeys);
        setStreak((s) => s + 1);
      } else {
        nextIncorrectKeys += 1;
        setIncorrectKeystrokes(nextIncorrectKeys);
        setStreak(0);
      }

      setTypedChars('');
      const nextWordIdx = currentWordIdx + 1;
      setCurrentWordIdx(nextWordIdx);

      // Append additional words as user types deeper into the wordlist
      if (nextWordIdx >= words.length - 10) {
        setWords((w) => [...w, ...getRandomWords(50)]);
      }

      if (startTimeRef.current) {
        const elapsedSec = (performance.now() - startTimeRef.current) / 1000;
        const metrics = calculateMonkeytypeMetrics(
          newHistory,
          '',
          words[nextWordIdx] || '',
          elapsedSec,
          nextCorrectKeys,
          nextIncorrectKeys
        );
        setWpm(metrics.wpm);
        setRawWpm(metrics.rawWpm);
        setAccuracy(metrics.accuracy);
        setNetCorrectChars(metrics.netCorrectChars);
        setTotalRawChars(metrics.totalRawChars);

        if (onLiveWpmUpdate) onLiveWpmUpdate(metrics.wpm, streak);
        if (onWpmUpdate) {
          const kps = Number((metrics.rawWpm / 12).toFixed(1));
          onWpmUpdate(metrics.wpm, kps);
        }
      }
      return;
    }

    // Handle normal character keystrokes
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const nextTyped = typedChars + e.key;
      setTypedChars(nextTyped);

      const targetChar = currentWord[typedChars.length];
      const isCharCorrect = e.key === targetChar;

      let nextCorrectKeys = correctKeystrokes;
      let nextIncorrectKeys = incorrectKeystrokes;

      if (isCharCorrect) {
        nextCorrectKeys += 1;
        setCorrectKeystrokes(nextCorrectKeys);
        setStreak((s) => s + 1);
      } else {
        nextIncorrectKeys += 1;
        setIncorrectKeystrokes(nextIncorrectKeys);
        setStreak(0);
      }

      if (onKeystrokeStats) {
        onKeystrokeStats(e.key, e.code, isCharCorrect, latency);
      }

      if (startTimeRef.current) {
        const elapsedSec = (performance.now() - startTimeRef.current) / 1000;
        const metrics = calculateMonkeytypeMetrics(
          history,
          nextTyped,
          currentWord,
          elapsedSec,
          nextCorrectKeys,
          nextIncorrectKeys
        );
        setWpm(metrics.wpm);
        setRawWpm(metrics.rawWpm);
        setAccuracy(metrics.accuracy);
        setNetCorrectChars(metrics.netCorrectChars);
        setTotalRawChars(metrics.totalRawChars);

        if (onLiveWpmUpdate) onLiveWpmUpdate(metrics.wpm, streak);
        if (onWpmUpdate) {
          const kps = Number((metrics.rawWpm / 12).toFixed(1));
          onWpmUpdate(metrics.wpm, kps);
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

        {/* Live Metrics Display (Monkeytype Format) */}
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
            <span className="text-xs font-mono text-neutral-500 uppercase">Raw:</span>
            <span className="text-lg font-mono font-bold text-neutral-600">
              {rawWpm}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-500 uppercase">Acc:</span>
            <span className="text-lg font-mono font-black text-emerald-600">
              {accuracy}%
            </span>
          </div>

          <button
            onClick={() => resetTest()}
            className="p-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors shadow-xs"
            title="Restart Test (Esc / Tab + Enter)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ghost Pacer (Personal Best Racing) */}
      {isActive && (
        <div className="w-full mb-3">
          <GhostRacer
            enabled={isActive}
            targetWpm={bestRun}
            elapsedTimeMs={elapsedMs}
            totalChars={words.slice(0, 40).join(' ').length}
            activeCharIdx={totalRawChars}
          />
        </div>
      )}

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

        {/* Word Display Stream (Monkeytype Visual Layout) */}
        <div className="flex flex-wrap gap-x-3 gap-y-3.5 font-mono text-2xl sm:text-3xl leading-relaxed tracking-normal">
          {words.slice(Math.max(0, currentWordIdx - 4), currentWordIdx + 25).map((word, relIdx) => {
            const actualIdx = Math.max(0, currentWordIdx - 4) + relIdx;
            const isCurrent = actualIdx === currentWordIdx;
            const isPast = actualIdx < currentWordIdx;
            const historyItem = history[actualIdx];

            // 1. Completed Word
            if (isPast && historyItem) {
              return (
                <span
                  key={actualIdx}
                  className={`transition-colors ${
                    historyItem.isCorrect
                      ? 'text-neutral-400 font-normal'
                      : 'text-rose-500 underline decoration-rose-500/80 decoration-2 font-medium'
                  }`}
                >
                  {historyItem.typed}
                </span>
              );
            }

            // 2. Active Word Being Typed
            if (isCurrent) {
              return (
                <span
                  key={actualIdx}
                  className="relative inline-flex items-center"
                >
                  {word.split('').map((char, charIdx) => {
                    const typedChar = typedChars[charIdx];
                    const isCaretHere = charIdx === typedChars.length;
                    const isTyped = typedChar !== undefined;
                    const isCharCorrect = typedChar === char;

                    return (
                      <span
                        key={charIdx}
                        ref={isCaretHere ? activeCharSpanRef : null}
                        className={`relative transition-colors ${
                          !isTyped
                            ? 'text-neutral-800 font-medium'
                            : isCharCorrect
                            ? 'font-bold'
                            : 'text-rose-600 bg-rose-100 rounded font-bold'
                        }`}
                        style={isTyped && isCharCorrect ? { color: themeConfig.accent } : undefined}
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

                  {/* Extra characters typed beyond word length */}
                  {typedChars.length > word.length &&
                    typedChars.slice(word.length).split('').map((extraChar, extraIdx) => (
                      <span
                        key={`extra-${extraIdx}`}
                        className="text-rose-700 bg-rose-200 rounded font-bold px-0.5"
                      >
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

            // 3. Upcoming Words
            return (
              <span key={actualIdx} className="text-neutral-400 transition-colors">
                {word}
              </span>
            );
          })}
        </div>

        {/* Start Overlay */}
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

      {/* Monkeytype-Accurate Results Modal */}
      {isFinished && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200 shadow-2xl flex flex-col items-center text-neutral-900 animate-fadeIn">
            <Award className="w-12 h-12 mb-2 animate-bounce" style={{ color: themeConfig.accent }} />

            <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
              MONKEYTYPE BENCHMARK VERIFIED
            </div>
            <h3 className="text-2xl font-mono font-black text-neutral-900 tracking-wider mb-6">
              TEST COMPLETED
            </h3>

            {/* Primary Metrics: WPM and ACC */}
            <div className="grid grid-cols-2 gap-4 w-full mb-4">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col items-center">
                <span className="text-xs font-mono text-neutral-500 uppercase font-semibold">wpm</span>
                <span className="text-5xl font-mono font-black" style={{ color: themeConfig.accent }}>
                  {wpm}
                </span>
                <span className="text-[10px] font-mono text-neutral-400 mt-1">net words/min</span>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col items-center">
                <span className="text-xs font-mono text-neutral-500 uppercase font-semibold">acc</span>
                <span className="text-5xl font-mono font-black text-emerald-600">
                  {accuracy}%
                </span>
                <span className="text-[10px] font-mono text-neutral-400 mt-1">keystroke accuracy</span>
              </div>
            </div>

            {/* Secondary Monkeytype Telemetry Grid */}
            <div className="grid grid-cols-3 gap-3 w-full mb-6 text-center">
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">raw</span>
                <div className="text-xl font-mono font-bold text-neutral-800">{rawWpm}</div>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">characters</span>
                <div className="text-sm font-mono font-bold text-neutral-800">
                  <span className="text-emerald-600">{correctKeystrokes}</span> /{' '}
                  <span className="text-rose-600">{incorrectKeystrokes}</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">consistency</span>
                <div className="text-xl font-mono font-bold text-neutral-800">{consistency}%</div>
              </div>
            </div>

            {/* Test Config Info */}
            <div className="w-full pb-4 mb-4 border-b border-neutral-100 flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <span>test type: <strong className="text-neutral-800">time {duration}</strong></span>
              <span>switch: <strong className="text-neutral-800 capitalize">{soundEngine.getProfile().replace('_', ' ')}</strong></span>
            </div>

            <button
              onClick={() => resetTest()}
              className="btn-accent-pill w-full py-3.5 rounded-xl font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2 shadow-md text-white text-xs uppercase"
              style={{ backgroundColor: themeConfig.accent }}
            >
              <RotateCcw className="w-4 h-4" />
              REPEAT TEST (ESC / TAB + ENTER)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
