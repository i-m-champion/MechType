import React, { useState, useEffect, useRef, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { getRandomWords } from '../../data/wordlists';
import { soundEngine } from '../../audio/SoundEngine';
import { lofiRhythmEngine } from '../../audio/LofiRhythmEngine';
import { Swords, Users, Bot, Volume2, Trophy, Copy, Check, Radio } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface DuelMessage {
  type: 'SYNC' | 'PROGRESS' | 'CLACK' | 'FINISH';
  words?: string[];
  progress?: number;
  wpm?: number;
  key?: string;
  code?: string;
  isSpacebar?: boolean;
}

export const MechanicalDuel: React.FC = () => {
  const { themeConfig } = useTheme();
  const [roomId, setRoomId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);

  // Bot Rival Mode (Instant Play when testing solo)
  const [botMode, setBotMode] = useState(false);
  const [botDifficulty, setBotDifficulty] = useState<'novice' | 'pro' | 'master'>('pro');

  // Race State
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [typedChars, setTypedChars] = useState('');
  const [myProgress, setMyProgress] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [myWpm, setMyWpm] = useState(0);
  const [opponentWpm, setOpponentWpm] = useState(0);
  const [winner, setWinner] = useState<'me' | 'opponent' | null>(null);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize PeerJS host
  const initHost = () => {
    // Generate clean 4-character code e.g. "CLCK-88"
    const randomCode = Math.floor(10 + Math.random() * 90);
    const code = `CLACK-${randomCode}`;
    setRoomId(code);
    setIsHost(true);
    setBotMode(false);

    try {
      const peer = new Peer(code);
      peerRef.current = peer;

      peer.on('open', (id) => {
        setRoomId(id);
      });

      peer.on('connection', (conn) => {
        connRef.current = conn;
        setIsConnected(true);

        conn.on('open', () => {
          // Send initial synchronized wordlist
          const sharedWords = getRandomWords(40);
          setWords(sharedWords);
          conn.send({ type: 'SYNC', words: sharedWords });
        });

        conn.on('data', (data: any) => {
          handleIncomingMessage(data);
        });
      });

      peer.on('error', (err) => {
        console.warn('PeerJS fallback to bot sparring:', err);
      });
    } catch {
      setBotMode(true);
    }
  };

  // Join match
  const joinMatch = () => {
    if (!joinCode) return;
    setIsHost(false);
    setBotMode(false);

    try {
      const peer = new Peer();
      peerRef.current = peer;

      peer.on('open', () => {
        const conn = peer.connect(joinCode);
        connRef.current = conn;

        conn.on('open', () => {
          setIsConnected(true);
          setRoomId(joinCode);
        });

        conn.on('data', (data: any) => {
          handleIncomingMessage(data);
        });
      });
    } catch {
      setBotMode(true);
    }
  };

  // Handle incoming P2P opponent events
  const handleIncomingMessage = (data: DuelMessage) => {
    if (data.type === 'SYNC' && data.words) {
      setWords(data.words);
      resetRace();
    } else if (data.type === 'PROGRESS') {
      if (data.progress !== undefined) setOpponentProgress(data.progress);
      if (data.wpm !== undefined) setOpponentWpm(data.wpm);
    } else if (data.type === 'CLACK') {
      // SPATIAL AUDIO: Play opponent's clack in right ear!
      soundEngine.triggerKeystroke({
        key: data.key || 'a',
        code: data.code || 'KeyA',
        isKeyDown: true,
        isSpacebar: data.isSpacebar,
        isOpponent: true, // Routes to 3D spatial panner in right ear!
      });
    } else if (data.type === 'FINISH') {
      if (!winner) setWinner('opponent');
    }
  };

  const resetRace = () => {
    setCurrentWordIdx(0);
    setTypedChars('');
    setMyProgress(0);
    setOpponentProgress(0);
    setMyWpm(0);
    setOpponentWpm(0);
    setWinner(null);
    startTimeRef.current = null;
    if (inputRef.current) inputRef.current.focus();
  };

  // Bot Rival Logic
  useEffect(() => {
    if (!botMode || words.length === 0 || winner) return;

    const targetWpm = botDifficulty === 'novice' ? 45 : botDifficulty === 'pro' ? 85 : 125;
    const intervalMs = Math.round(60000 / (targetWpm * 5)); // ms per character

    const botInterval = setInterval(() => {
      setOpponentProgress((prev) => {
        const next = Math.min(100, prev + 0.6);
        setOpponentWpm(targetWpm + Math.floor(Math.random() * 6 - 3));

        // Spatial Audio: Opponent Bot Clacks in Right Ear!
        soundEngine.triggerKeystroke({
          key: 'a',
          code: 'KeyA',
          isKeyDown: true,
          isOpponent: true,
        });

        if (next >= 100 && !winner) {
          setWinner('opponent');
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(botInterval);
  }, [botMode, words, botDifficulty, winner]);

  // Start Bot Sparring Match
  const startBotSparring = () => {
    setBotMode(true);
    setIsConnected(true);
    const sharedWords = getRandomWords(35);
    setWords(sharedWords);
    resetRace();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (winner) return;

    if (!startTimeRef.current && e.key.length === 1) {
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

    // Send spatial clack packet to opponent over WebRTC
    if (connRef.current && isConnected) {
      connRef.current.send({
        type: 'CLACK',
        key: e.key,
        code: e.code,
        isSpacebar: e.key === ' ',
      });
    }

    if (e.key === 'Backspace') {
      if (typedChars.length > 0) setTypedChars((prev) => prev.slice(0, -1));
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      const currentTarget = words[currentWordIdx];

      if (typedChars === currentTarget) {
        const nextWordIdx = currentWordIdx + 1;
        setCurrentWordIdx(nextWordIdx);
        setTypedChars('');

        const progress = Math.min(100, Math.round((nextWordIdx / words.length) * 100));
        setMyProgress(progress);

        // Update WPM
        if (startTimeRef.current) {
          const elapsed = (performance.now() - startTimeRef.current) / 60000;
          const liveWpm = Math.round((nextWordIdx * 5) / Math.max(0.01, elapsed));
          setMyWpm(liveWpm);

          if (connRef.current && isConnected) {
            connRef.current.send({
              type: 'PROGRESS',
              progress,
              wpm: liveWpm,
            });
          }
        }

        // Win condition
        if (nextWordIdx >= words.length) {
          setWinner('me');
          if (connRef.current && isConnected) {
            connRef.current.send({ type: 'FINISH' });
          }
        }
      }
      return;
    }

    if (e.key.length === 1) {
      setTypedChars((prev) => prev + e.key);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Lobby / Connection HUD */}
      {!isConnected ? (
        <div className="w-full p-8 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex flex-col items-center text-center shadow-2xl">
          <Swords className="w-12 h-12 text-cyan-400 mb-3" />
          <h3 className="text-2xl font-mono font-black text-slate-100 tracking-wider">
            1v1 MECHANICAL DUEL
          </h3>
          <p className="text-xs font-mono text-cyan-400/80 mt-1 mb-8 max-w-md">
            Peer-to-peer real-time typing race with 3D spatial opponent clacks in your right ear!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
            {/* Host Button */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-white/5 flex flex-col items-center gap-3">
              <span className="text-xs font-mono text-slate-300 font-bold uppercase">Create Match</span>
              <button
                onClick={initHost}
                className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs"
              >
                HOST ROOM
              </button>
            </div>

            {/* Join Form */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-white/5 flex flex-col items-center gap-3">
              <span className="text-xs font-mono text-slate-300 font-bold uppercase">Join Room</span>
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  placeholder="CLACK-88"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-2 py-1.5 rounded bg-slate-900 border border-white/10 text-xs font-mono text-cyan-300 uppercase"
                />
                <button
                  onClick={joinMatch}
                  className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-100 font-mono font-bold text-xs"
                >
                  JOIN
                </button>
              </div>
            </div>
          </div>

          {/* AI Bot Rival Fallback */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-amber-400" /> Or practice solo against an AI Sparring Bot:
            </span>
            <div className="flex gap-2 mt-1">
              {(['novice', 'pro', 'master'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    setBotDifficulty(diff);
                    startBotSparring();
                  }}
                  className="px-3 py-1 rounded bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-white/5 text-xs font-mono uppercase"
                >
                  {diff} ({diff === 'novice' ? '45' : diff === 'pro' ? '85' : '125'} WPM)
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Live Duel Arena */
        <div className="w-full flex flex-col gap-6">
          {/* Duel Top Status Bar */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs font-mono">
            <div className="flex items-center gap-3">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-bold">
                {botMode ? `SPARRING BOT (${botDifficulty.toUpperCase()})` : `ROOM: ${roomId}`}
              </span>
              {!botMode && roomId && (
                <button
                  onClick={copyRoomCode}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Spatial 3D Audio Active (Opponent in Right Ear)</span>
            </div>
          </div>

          {/* Dual Racing Progress Tracks */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/20 flex flex-col gap-5">
            {/* Player Track */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-cyan-400 font-bold">YOU (PLAYER 1)</span>
                <span className="text-slate-300 font-bold">{myWpm} WPM • {myProgress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full border border-white/10 p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-150 bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ width: `${myProgress}%` }}
                />
              </div>
            </div>

            {/* Opponent Track */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-rose-400 font-bold">
                  {botMode ? `CYBER BOT (${botDifficulty.toUpperCase()})` : 'OPPONENT (PLAYER 2)'}
                </span>
                <span className="text-slate-300 font-bold">{opponentWpm} WPM • {Math.round(opponentProgress)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full border border-white/10 p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-150 bg-gradient-to-r from-rose-500 to-orange-500"
                  style={{ width: `${opponentProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Typing Word Area */}
          <div
            onClick={() => inputRef.current?.focus()}
            className="w-full min-h-[160px] p-6 rounded-2xl bg-slate-950/70 border border-white/10 relative cursor-text select-none shadow-2xl"
          >
            <input
              ref={inputRef}
              type="text"
              value=""
              onChange={() => {}}
              onKeyDown={handleKeyDown}
              autoFocus
              className="absolute opacity-0 pointer-events-none"
            />

            <div className="flex flex-wrap gap-2.5 font-mono text-xl">
              {words.map((word, idx) => {
                const isCurrent = idx === currentWordIdx;
                const isDone = idx < currentWordIdx;

                if (isDone) {
                  return <span key={idx} className="text-slate-600 line-through">{word}</span>;
                }

                if (isCurrent) {
                  return (
                    <span key={idx} className="text-cyan-300 font-bold border-b-2 border-cyan-400 pb-0.5">
                      {word.split('').map((char, cIdx) => (
                        <span
                          key={cIdx}
                          className={
                            typedChars[cIdx] === undefined
                              ? 'text-cyan-400'
                              : typedChars[cIdx] === char
                              ? 'text-white'
                              : 'text-rose-500 bg-rose-950/50'
                          }
                        >
                          {char}
                        </span>
                      ))}
                    </span>
                  );
                }

                return <span key={idx} className="text-slate-400">{word}</span>;
              })}
            </div>

            {/* Duel Result Modal */}
            {winner && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 rounded-2xl z-50 animate-fadeIn">
                <Trophy className={`w-14 h-14 mb-2 animate-bounce ${winner === 'me' ? 'text-amber-400' : 'text-slate-500'}`} />
                <h3 className="text-2xl font-mono font-black text-slate-100 tracking-wider">
                  {winner === 'me' ? 'VICTORY! YOU WON THE DUEL' : 'DEFEAT! OPPONENT FINISHED FIRST'}
                </h3>
                <p className="text-xs font-mono text-cyan-400 mt-1 mb-6">
                  Final Speed: {myWpm} WPM vs Opponent {opponentWpm} WPM
                </p>
                <button
                  onClick={() => {
                    const newWords = getRandomWords(35);
                    setWords(newWords);
                    resetRace();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs"
                >
                  RE-MATCH RACE
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
