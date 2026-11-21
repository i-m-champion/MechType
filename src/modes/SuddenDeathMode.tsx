import React, { useState, useEffect, useRef } from 'react';
import { getRandomWords } from '../data/wordlists';
import { soundEngine } from '../audio/SoundEngine';
import { lofiRhythmEngine } from '../audio/LofiRhythmEngine';
import { audioContextManager } from '../audio/AudioContextManager';
import { Skull, AlertTriangle, RotateCcw, Flame } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const SuddenDeathMode: React.FC = () => {
  const { themeConfig } = useTheme();
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('mechtype_best_hardcore') || '0', 10);
  });
  const [isJammed, setIsJammed] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const initGame = () => {
    setWords(getRandomWords(100));
    setCurrentWordIdx(0);
    setCharIdx(0);
    setStreak(0);
    setIsJammed(false);
    setScreenFlash(false);
    if (inputRef.current) inputRef.current.focus();
  };

  useEffect(() => {
    initGame();
  }, []);

  const triggerKeyboardJam = () => {
    setIsJammed(true);
    setScreenFlash(true);
    setTimeout(() => setScreenFlash(false), 400);

    // Mechanical Jam audio sound: harsh dissonant crunch
    const ctx = audioContextManager.getContext();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(80, now);
    osc2.frequency.setValueAtTime(115, now); // dissonance

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioContextManager.getMasterInput());

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);

    // Update best streak
    if (streak > bestStreak) {
      setBestStreak(streak);
      localStorage.setItem('mechtype_best_hardcore', String(streak));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isJammed) return;

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
      // In sudden death, even backspace or typos immediately jam!
      return;
    }

    const currentWord = words[currentWordIdx];
    if (!currentWord) return;

    // Check spacebar at end of word
    if (e.key === ' ') {
      e.preventDefault();
      if (charIdx === currentWord.length) {
        // Correct space! Move to next word
        setCurrentWordIdx((prev) => prev + 1);
        setCharIdx(0);
        setStreak((prev) => prev + 1);

        if (currentWordIdx > words.length - 10) {
          setWords((prev) => [...prev, ...getRandomWords(50)]);
        }
      } else {
        // Pressed space too early! JAM!
        triggerKeyboardJam();
      }
      return;
    }

    // Normal character check
    if (e.key.length === 1) {
      const expectedChar = currentWord[charIdx];
      if (e.key === expectedChar) {
        setCharIdx((prev) => prev + 1);
        setStreak((prev) => prev + 1);
      } else {
        // ONE TYPO = IMMEDIATE JAM & TERMINATION!
        triggerKeyboardJam();
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

  const currentWord = words[currentWordIdx] || '';

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Screen flash on jam */}
      {screenFlash && (
        <div className="fixed inset-0 bg-rose-600/40 pointer-events-none z-50 animate-ping" />
      )}

      {/* Mode Header */}
      <div className="flex items-center justify-between w-full mb-6 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Skull className="w-5 h-5 text-rose-500" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
            SUDDEN DEATH // 1-TYPO KEYBOARD JAM
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-amber-400">
            <Flame className="w-4 h-4" /> Streak: {streak} chars
          </span>
          <span className="text-slate-400">
            Record: {bestStreak} chars
          </span>
          <button
            onClick={initGame}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hardcore Typing Chamber */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`w-full min-h-[220px] p-8 rounded-2xl border transition-all duration-300 relative cursor-text flex flex-col items-center justify-center select-none shadow-2xl ${
          isJammed
            ? 'bg-rose-950/40 border-rose-500 shadow-rose-900/50'
            : 'bg-slate-950/70 border-white/10'
        }`}
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

        {!isJammed ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-rose-400/80 text-xs font-mono uppercase tracking-widest animate-pulse">
              <AlertTriangle className="w-4 h-4" /> Zero Tolerance for Errors
            </div>

            <div className="text-3xl sm:text-4xl font-mono tracking-widest">
              {currentWord.split('').map((char, idx) => {
                const isTyped = idx < charIdx;
                const isCurrent = idx === charIdx;

                return (
                  <span
                    key={idx}
                    className={`relative ${
                      isTyped
                        ? 'text-emerald-400 font-bold'
                        : isCurrent
                        ? 'text-cyan-300 font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    {isCurrent && (
                      <span
                        className="absolute -left-1 top-0 bottom-0 w-1 animate-pulse"
                        style={{ backgroundColor: themeConfig.accent }}
                      />
                    )}
                    {char}
                  </span>
                );
              })}
              {charIdx === currentWord.length && (
                <span className="text-xs font-mono ml-2 px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 animate-pulse">
                  [SPACE]
                </span>
              )}
            </div>

            <div className="text-xs font-mono text-slate-500 mt-2">
              Next: {words.slice(currentWordIdx + 1, currentWordIdx + 4).join(' ')}
            </div>
          </div>
        ) : (
          /* Jammed Screen */
          <div className="flex flex-col items-center gap-3 text-center animate-bounce">
            <AlertTriangle className="w-12 h-12 text-rose-500" />
            <h3 className="text-2xl font-mono font-black text-rose-400 tracking-wider">
              KEYBOARD JAMMED! RUN TERMINATED
            </h3>
            <p className="text-xs font-mono text-slate-400">
              A single stumble stopped your streak at <span className="text-amber-400 font-bold">{streak} characters</span>.
            </p>
            <button
              onClick={initGame}
              className="mt-4 px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-mono font-bold text-xs"
            >
              UNJAM & RE-ATTEMPT HARDCORE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
