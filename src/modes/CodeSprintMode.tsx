import React, { useState, useEffect, useRef } from 'react';
import { CODE_SNIPPETS } from '../data/wordlists';
import { soundEngine } from '../audio/SoundEngine';
import { lofiRhythmEngine } from '../audio/LofiRhythmEngine';
import { Code2, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CodeSprintProps {
  onKeystrokeStats?: (char: string, code: string, isCorrect: boolean, latencyMs: number) => void;
  onTestComplete?: (result: {
    wpm: number;
    rawWpm: number;
    accuracy: number;
    duration: number;
    mode: string;
  }) => void;
  onWpmUpdate?: (wpm: number, kps: number) => void;
}

export const CodeSprintMode: React.FC<CodeSprintProps> = ({
  onKeystrokeStats,
  onTestComplete,
  onWpmUpdate,
}) => {
  const { themeConfig } = useTheme();
  const [language, setLanguage] = useState<'javascript' | 'python' | 'rust' | 'cpp'>('javascript');
  const [snippetIdx, setSnippetIdx] = useState(0);
  const [targetCode, setTargetCode] = useState('');
  const [typedIndex, setTypedIndex] = useState(0);
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [errors, setErrors] = useState<Set<number>>(new Set());

  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const lastKeyTimeRef = useRef<number>(performance.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const loadSnippet = (lang = language, idx = 0) => {
    const list = CODE_SNIPPETS[lang] || CODE_SNIPPETS.javascript;
    const code = list[idx % list.length];
    setTargetCode(code);
    setTypedIndex(0);
    setTypedChars([]);
    setErrors(new Set());
    setIsActive(false);
    setIsFinished(false);
    startTimeRef.current = null;
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    loadSnippet(language, snippetIdx);
  }, [language, snippetIdx]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished) return;

    if (!isActive && e.key.length === 1) {
      setIsActive(true);
      startTimeRef.current = performance.now();
    }

    const now = performance.now();
    const latency = now - lastKeyTimeRef.current;
    lastKeyTimeRef.current = now;

    // Handle audio
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

    if (isBackspace) {
      if (typedIndex > 0) {
        setTypedIndex((prev) => prev - 1);
        setTypedChars((prev) => prev.slice(0, -1));
      }
      return;
    }

    // Single character input or Enter
    const inputChar = isEnter ? '\n' : e.key.length === 1 ? e.key : null;
    if (!inputChar) return;

    const expectedChar = targetCode[typedIndex];
    const isCorrect = inputChar === expectedChar;

    if (!isCorrect) {
      setErrors((prev) => new Set(prev).add(typedIndex));
    }

    const nextChars = [...typedChars, inputChar];
    const nextIdx = typedIndex + 1;

    setTypedChars(nextChars);
    setTypedIndex(nextIdx);

    if (onKeystrokeStats) {
      onKeystrokeStats(inputChar, e.code, isCorrect, latency);
    }

    // Check completion
    if (nextIdx >= targetCode.length) {
      setIsFinished(true);
      setIsActive(false);

      const elapsedSec = startTimeRef.current
        ? (performance.now() - startTimeRef.current) / 1000
        : 1;

      const totalTyped = nextChars.length;
      const totalErrors = errors.size + (isCorrect ? 0 : 1);
      const correctCount = Math.max(0, totalTyped - totalErrors);
      const calculatedWpm = Math.round(((correctCount / 5) / elapsedSec) * 60) || 0;
      const calculatedAcc = Math.round((correctCount / totalTyped) * 100) || 100;

      if (onTestComplete) {
        onTestComplete({
          wpm: calculatedWpm,
          rawWpm: Math.round(((totalTyped / 5) / elapsedSec) * 60),
          accuracy: calculatedAcc,
          duration: Math.round(elapsedSec),
          mode: `Code Sprint (${language.toUpperCase()})`,
        });
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

  // Heavy punctuation detector
  const isPunctuation = (ch: string) => /[{}[\]();:<>=&|!+\-*/%]/.test(ch);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Language Header Bar */}
      <div className="flex flex-wrap items-center justify-between w-full mb-6 px-4 py-2.5 rounded-xl bg-white border border-neutral-200/90 shadow-xs gap-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-[#ff5500]" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800">
            CODE SPRINT //
          </span>
          {(['javascript', 'python', 'rust', 'cpp'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                setSnippetIdx(0);
              }}
              className={`px-2.5 py-1 text-xs font-mono uppercase rounded transition-colors ${
                language === lang
                  ? 'bg-neutral-100 text-[#ff5500] font-bold border border-[#ff5500] shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSnippetIdx((prev) => prev + 1)}
            className="px-2.5 py-1 text-xs font-mono rounded bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700"
          >
            Next Snippet
          </button>
          <button
            onClick={() => loadSnippet(language, snippetIdx)}
            className="p-1.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-neutral-900"
            title="Reset Snippet"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Editor Frame */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="w-full p-6 rounded-2xl bg-white border border-neutral-200/90 relative cursor-text overflow-hidden shadow-sm font-mono text-base leading-relaxed text-neutral-900"
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

        {/* Editor Tab Bar */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            <span className="ml-2 font-mono text-neutral-700 font-semibold">
              snippet_{snippetIdx + 1}.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'rust' ? 'rs' : 'cpp'}
            </span>
          </div>
          <span className="text-[11px] text-[#ff5500] font-bold">
            {typedIndex} / {targetCode.length} chars ({Math.round((typedIndex / Math.max(1, targetCode.length)) * 100)}%)
          </span>
        </div>

        {/* Code Content */}
        <pre className="whitespace-pre-wrap break-all select-none">
          {targetCode.split('').map((char, idx) => {
            const isTyped = idx < typedIndex;
            const isCurrent = idx === typedIndex;
            const hadError = errors.has(idx);
            const isPunct = isPunctuation(char);

            let styleClass = 'text-neutral-400';
            if (isTyped) {
              styleClass = hadError
                ? 'text-rose-600 bg-rose-100 rounded font-bold'
                : isPunct
                ? 'text-amber-600 font-bold'
                : 'text-[#ff5500] font-bold';
            } else if (isPunct) {
              styleClass = 'text-neutral-700 font-semibold';
            }

            return (
              <span key={idx} className={`relative ${styleClass}`}>
                {isCurrent && (
                  <span
                    className="absolute -left-0.5 top-0 bottom-0 w-0.5 animate-pulse bg-[#ff5500]"
                  />
                )}
                {char === '\n' ? '↵\n' : char}
              </span>
            );
          })}
        </pre>

        {isFinished && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <div className="text-sm font-mono font-bold text-emerald-950">SNIPPET COMPILED</div>
                <div className="text-xs font-mono text-emerald-700">Punctuation muscle memory locked in!</div>
              </div>
            </div>
            <button
              onClick={() => setSnippetIdx((prev) => prev + 1)}
              className="btn-orange-pill px-4 py-2 rounded-lg font-mono font-bold text-xs"
            >
              NEXT CHALLENGE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
