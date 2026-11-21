import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getRandomWords } from '../data/wordlists';
import { soundEngine } from '../audio/SoundEngine';
import { lofiRhythmEngine } from '../audio/LofiRhythmEngine';
import { Shield, Heart, Zap, Clock, Skull, Trophy, Swords, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Boss {
  name: string;
  title: string;
  maxHp: number;
  color: string;
  accent: string;
  icon: string;
  enrageWpm: number;
}

const BOSSES: Boss[] = [
  {
    name: 'Null Pointer Dragon',
    title: 'Byte-Devourer of Segment 0x0000',
    maxHp: 800,
    color: '#00f0ff',
    accent: '#ff0077',
    icon: '🐉',
    enrageWpm: 45,
  },
  {
    name: 'The Memory Leak',
    title: 'Oozing Radioactive Heap Consumer',
    maxHp: 1000,
    color: '#39ff14',
    accent: '#ffaa00',
    icon: '🦠',
    enrageWpm: 50,
  },
  {
    name: 'The Merge Conflict Hydra',
    title: 'Ancient Multi-Headed Git Abomination',
    maxHp: 1200,
    color: '#ff0055',
    accent: '#00f0ff',
    icon: '🐙',
    enrageWpm: 55,
  },
];

interface DamageNumber {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

export const BossBattleMode: React.FC = () => {
  const { themeConfig } = useTheme();
  const [bossIndex, setBossIndex] = useState(0);
  const currentBoss = BOSSES[bossIndex];

  // Battle State
  const [bossHp, setBossHp] = useState(currentBoss.maxHp);
  const [playerHp, setPlayerHp] = useState(100);
  const [playerShield, setPlayerShield] = useState(50);
  const [gameState, setGameState] = useState<'ready' | 'fighting' | 'victory' | 'defeat'>('ready');

  // Active Words & Typing
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [typedChars, setTypedChars] = useState('');

  // Power-ups
  const [doubleDamageActive, setDoubleDamageActive] = useState(false);
  const [bulletTimeActive, setBulletTimeActive] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [bossHitAnim, setBossHitAnim] = useState(false);

  // Live WPM
  const [wpm, setWpm] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const typedCountRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dmgIdRef = useRef(0);

  const initBattle = useCallback((idx = bossIndex) => {
    const b = BOSSES[idx];
    setBossHp(b.maxHp);
    setPlayerHp(100);
    setPlayerShield(50);
    setGameState('ready');
    setWords(getRandomWords(50));
    setCurrentWordIdx(0);
    setTypedChars('');
    setDoubleDamageActive(false);
    setBulletTimeActive(false);
    setDamageNumbers([]);
    setWpm(0);
    startTimeRef.current = null;
    typedCountRef.current = 0;
    if (inputRef.current) inputRef.current.focus();
  }, [bossIndex]);

  useEffect(() => {
    initBattle(bossIndex);
  }, [bossIndex, initBattle]);

  // Boss Attack Timer (Attacks if player is inactive or slow)
  useEffect(() => {
    if (gameState !== 'fighting') return;

    const intervalTime = bulletTimeActive ? 5000 : 2500;
    const interval = setInterval(() => {
      // If WPM is below enrage or typing is paused, boss strikes!
      if (wpm < currentBoss.enrageWpm) {
        takePlayerDamage(12, 'Slow WPM Counter-Attack!');
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [gameState, wpm, currentBoss.enrageWpm, bulletTimeActive]);

  const triggerDamageNumber = (text: string, color: string) => {
    const id = ++dmgIdRef.current;
    setDamageNumbers((prev) => [
      ...prev.slice(-8),
      { id, text, x: 50 + (Math.random() * 20 - 10), y: 35 + (Math.random() * 10 - 5), color },
    ]);
    setTimeout(() => {
      setDamageNumbers((prev) => prev.filter((d) => d.id !== id));
    }, 900);
  };

  const takePlayerDamage = (amount: number, reason: string) => {
    setPlayerShield((prevShield) => {
      if (prevShield > 0) {
        const remainingShield = Math.max(0, prevShield - amount);
        triggerDamageNumber(`-${amount} SHIELD!`, '#38bdf8');
        return remainingShield;
      } else {
        setPlayerHp((prevHp) => {
          const next = Math.max(0, prevHp - amount);
          triggerDamageNumber(`-${amount} HP!`, '#ff0055');
          if (next <= 0) {
            setGameState('defeat');
          }
          return next;
        });
        return 0;
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (gameState === 'victory' || gameState === 'defeat') return;

    if (gameState === 'ready' && e.key.length === 1) {
      setGameState('fighting');
      startTimeRef.current = performance.now();
    }

    // Audio
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

    // Check spacebar (Attack Launch)
    if (e.key === ' ') {
      e.preventDefault();
      const target = words[currentWordIdx];

      if (typedChars === target) {
        // Successful attack!
        typedCountRef.current += target.length + 1;
        const multiplier = doubleDamageActive ? 2.0 : 1.0;
        const isCrit = Math.random() > 0.75;
        const baseDmg = target.length * 15;
        const dmg = Math.round(baseDmg * (isCrit ? 1.75 : 1.0) * multiplier);

        // Flash boss hit
        setBossHitAnim(true);
        setTimeout(() => setBossHitAnim(false), 150);

        triggerDamageNumber(
          isCrit ? `CRIT! -${dmg}` : `-${dmg}`,
          isCrit ? '#ffaa00' : '#00f0ff'
        );

        setBossHp((prev) => {
          const next = Math.max(0, prev - dmg);
          if (next <= 0) {
            setGameState('victory');
          }
          return next;
        });

        // Chance of Power-up drop!
        if (Math.random() > 0.82) {
          const powerType = Math.random();
          if (powerType < 0.35) {
            // Health Potion
            setPlayerHp((prev) => Math.min(100, prev + 25));
            triggerDamageNumber('+25 HP RESTORED!', '#39ff14');
          } else if (powerType < 0.7) {
            // Double Damage
            setDoubleDamageActive(true);
            triggerDamageNumber('⚡ 2X DOUBLE DAMAGE ACTIVE!', '#facc15');
            setTimeout(() => setDoubleDamageActive(false), 10000);
          } else {
            // Bullet time
            setBulletTimeActive(true);
            triggerDamageNumber('⏳ BULLET TIME SLOW-MO!', '#a855f7');
            setTimeout(() => setBulletTimeActive(false), 8000);
          }
        }
      } else {
        // Typo! Boss counter attacks
        takePlayerDamage(15, 'Misspell Counter-Attack!');
      }

      setTypedChars('');
      setCurrentWordIdx((prev) => prev + 1);
      if (currentWordIdx > words.length - 10) {
        setWords((prev) => [...prev, ...getRandomWords(30)]);
      }

      // Update WPM
      if (startTimeRef.current) {
        const elapsed = (performance.now() - startTimeRef.current) / 60000;
        setWpm(Math.round(typedCountRef.current / 5 / Math.max(0.01, elapsed)));
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
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Boss Selection & Mode Header */}
      <div className="flex flex-wrap items-center justify-between w-full mb-4 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md gap-3">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-rose-500" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            BOSS BATTLE RPG //
          </span>
          {BOSSES.map((b, idx) => (
            <button
              key={b.name}
              onClick={() => {
                setBossIndex(idx);
                initBattle(idx);
              }}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                bossIndex === idx
                  ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>

        {/* Powerups Indicators */}
        <div className="flex items-center gap-3">
          {doubleDamageActive && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold flex items-center gap-1 animate-pulse">
              <Zap className="w-3.5 h-3.5" /> 2X DMG
            </span>
          )}
          {bulletTimeActive && (
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-mono font-bold flex items-center gap-1 animate-pulse">
              <Clock className="w-3.5 h-3.5" /> BULLET TIME
            </span>
          )}
        </div>
      </div>

      {/* Boss Arena Stage */}
      <div className="w-full p-6 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-rose-500/30 relative overflow-hidden shadow-2xl flex flex-col items-center min-h-[360px]">
        {/* Floating Damage Numbers */}
        {damageNumbers.map((dmg) => (
          <div
            key={dmg.id}
            className="absolute font-mono font-black text-lg pointer-events-none animate-bounce z-40"
            style={{
              left: `${dmg.x}%`,
              top: `${dmg.y}%`,
              color: dmg.color,
              textShadow: `0 0 10px ${dmg.color}`,
            }}
          >
            {dmg.text}
          </div>
        ))}

        {/* Boss HP Gauge */}
        <div className="w-full max-w-lg mb-4">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Skull className="w-4 h-4" /> {currentBoss.name}
            </span>
            <span className="text-slate-400">
              {bossHp} / {currentBoss.maxHp} HP
            </span>
          </div>
          <div className="w-full h-4 bg-slate-950 rounded-full border border-white/10 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${(bossHp / currentBoss.maxHp) * 100}%`,
                background: 'linear-gradient(90deg, #ff0055, #ff5500)',
                boxShadow: '0 0 12px rgba(255, 0, 85, 0.7)',
              }}
            />
          </div>
        </div>

        {/* Pixel Boss Monster Avatar */}
        <div
          className={`text-7xl my-3 select-none transition-transform duration-100 ${
            bossHitAnim ? 'scale-125 filter drop-shadow(0 0 25px #ff0055)' : 'animate-pulse'
          }`}
        >
          {currentBoss.icon}
        </div>
        <div className="text-xs font-mono text-slate-400 mb-6 italic">
          {currentBoss.title}
        </div>

        {/* Player Shield & Health HUD */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono text-slate-400">Shield:</span>
            <span className="text-sm font-mono font-bold text-cyan-300">{playerShield}/50</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-mono text-slate-400">HP:</span>
            <span className="text-sm font-mono font-bold text-rose-400">{playerHp}/100</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono text-slate-400">Speed:</span>
            <span className="text-sm font-mono font-bold text-amber-300">{wpm} WPM</span>
          </div>
        </div>

        {/* Typing Word Bar */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="w-full max-w-xl p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-center cursor-text relative"
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

          <div className="flex items-center gap-4 text-2xl font-mono tracking-wider">
            {words.slice(currentWordIdx, currentWordIdx + 3).map((w, idx) => {
              if (idx === 0) {
                return (
                  <span key={idx} className="font-bold text-cyan-300 border-b-2 border-cyan-400 pb-0.5">
                    {w.split('').map((char, cIdx) => (
                      <span
                        key={cIdx}
                        className={
                          typedChars[cIdx] === undefined
                            ? 'text-cyan-400'
                            : typedChars[cIdx] === char
                            ? 'text-white'
                            : 'text-rose-500 bg-rose-950/60'
                        }
                      >
                        {char}
                      </span>
                    ))}
                  </span>
                );
              }
              return (
                <span key={idx} className="text-slate-600">
                  {w}
                </span>
              );
            })}
          </div>
        </div>

        {/* Victory Screen */}
        {gameState === 'victory' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 animate-fadeIn">
            <Trophy className="w-16 h-16 text-amber-400 mb-3 animate-bounce" />
            <h3 className="text-3xl font-mono font-black text-amber-300 tracking-wider">
              VICTORY! BOSS VANQUISHED
            </h3>
            <p className="text-xs font-mono text-cyan-300 mt-1 mb-6">
              You conquered {currentBoss.name}!
            </p>
            <button
              onClick={() => {
                const nextBoss = (bossIndex + 1) % BOSSES.length;
                setBossIndex(nextBoss);
                initBattle(nextBoss);
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-mono font-bold tracking-wider hover:opacity-90"
            >
              NEXT BOSS BATTLE
            </button>
          </div>
        )}

        {/* Defeat Screen */}
        {gameState === 'defeat' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 animate-fadeIn">
            <Skull className="w-16 h-16 text-rose-500 mb-3 animate-pulse" />
            <h3 className="text-3xl font-mono font-black text-rose-400 tracking-wider">
              SHIELD CORRUPTED // DEFEAT
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-1 mb-6">
              The boss overwhelmed your defense. Train your muscle memory and strike again!
            </p>
            <button
              onClick={() => initBattle(bossIndex)}
              className="px-6 py-3 rounded-xl bg-rose-500 text-white font-mono font-bold tracking-wider hover:bg-rose-400"
            >
              RETRY BATTLE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
