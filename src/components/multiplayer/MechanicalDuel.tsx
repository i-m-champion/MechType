import React, { useState, useEffect, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { soundEngine } from '../../audio/SoundEngine';
import { audioContextManager } from '../../audio/AudioContextManager';
import {
  Swords,
  Users,
  Copy,
  Check,
  Zap,
  Trophy,
  RotateCcw,
  Volume2,
  Radio,
  Bot,
} from 'lucide-react';

interface DuelKeystrokeMessage {
  type: 'keystroke';
  key: string;
  charIdx: number;
  wpm: number;
  progress: number;
  isComplete: boolean;
}

const DUEL_SAMPLE_WORDS = [
  'speed', 'switch', 'tactile', 'linear', 'sound', 'spring', 'smooth', 'rhythm',
  'engine', 'thock', 'clack', 'chassis', 'matrix', 'clicky', 'action', 'latency',
  'arcade', 'overdrive', 'combustion', 'lightning', 'spark', 'vibration', 'resonant',
  'frequency', 'actuation', 'bottom', 'travel', 'stabilizer', 'harmonic', 'melody'
];

function getRandomWords(count: number = 30): string[] {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * DUEL_SAMPLE_WORDS.length);
    words.push(DUEL_SAMPLE_WORDS[idx]);
  }
  return words;
}

export const MechanicalDuel: React.FC = () => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [conn, setConn] = useState<DataConnection | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Bot Rival Fallback
  const [botMode, setBotMode] = useState<boolean>(false);
  const [botDifficulty, setBotDifficulty] = useState<'novice' | 'pro' | 'master'>('pro');

  // Race Progress
  const [words, setWords] = useState<string[]>(() => getRandomWords(30));
  const [currentWordIdx, setCurrentWordIdx] = useState<number>(0);
  const [typedChars, setTypedChars] = useState<string>('');
  const [myProgress, setMyProgress] = useState<number>(0);
  const [myWpm, setMyWpm] = useState<number>(0);
  const [opponentProgress, setOpponentProgress] = useState<number>(0);
  const [opponentWpm, setOpponentWpm] = useState<number>(0);
  const [winner, setWinner] = useState<'me' | 'opponent' | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const totalCharsRef = useRef<number>(100);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    totalCharsRef.current = words.join(' ').length;
  }, [words]);

  // Clean up PeerJS on unmount
  useEffect(() => {
    return () => {
      conn?.close();
      peer?.destroy();
    };
  }, [conn, peer]);

  // Initialize Host
  const initHost = () => {
    const code = 'MECH-' + Math.floor(1000 + Math.random() * 9000);
    const newPeer = new Peer(code);

    newPeer.on('open', (id) => {
      setRoomId(id);
      setIsHost(true);
    });

    newPeer.on('connection', (connection) => {
      setConn(connection);
      setupConnection(connection);
      // Host transmits the shared words to guest
      connection.on('open', () => {
        connection.send({ type: 'sync_words', words });
      });
    });

    setPeer(newPeer);
  };

  // Join Room
  const joinMatch = () => {
    if (!joinCode) return;
    const newPeer = new Peer();
    newPeer.on('open', () => {
      const connection = newPeer.connect(joinCode);
      setConn(connection);
      setupConnection(connection);
      setRoomId(joinCode);
      setIsHost(false);
    });
    setPeer(newPeer);
  };

  // Sparring Bot Simulation
  const startBotSparring = () => {
    setBotMode(true);
    setIsConnected(true);
    resetRace();
  };

  // Bot typing tick
  useEffect(() => {
    if (!botMode || !isConnected || winner) return;

    // Bot speed based on difficulty: novice 45 WPM, pro 85 WPM, master 125 WPM
    const targetWpm = botDifficulty === 'novice' ? 45 : botDifficulty === 'pro' ? 85 : 125;
    const charsPerSec = (targetWpm * 5) / 60;
    const intervalMs = 1000 / charsPerSec;

    const botInterval = setInterval(() => {
      setOpponentProgress((prev) => {
        const next = prev + (100 / totalCharsRef.current);
        // Play opponent mechanical click in right ear (panned +0.8)
        audioContextManager.playSpatialOpponentClick();

        if (next >= 100) {
          clearInterval(botInterval);
          setWinner((curr) => curr || 'opponent');
          return 100;
        }
        return next;
      });
      setOpponentWpm(targetWpm + Math.floor(Math.sin(Date.now() / 1000) * 5));
    }, intervalMs);

    return () => clearInterval(botInterval);
  }, [botMode, isConnected, winner, botDifficulty]);

  const setupConnection = (connection: DataConnection) => {
    connection.on('open', () => {
      setIsConnected(true);
      resetRace();
    });

    connection.on('data', (data: any) => {
      if (data.type === 'sync_words') {
        setWords(data.words);
      } else if (data.type === 'keystroke') {
        setOpponentProgress(data.progress);
        setOpponentWpm(data.wpm);

        // SPATIAL AUDIO: Opponent mechanical switches clacking in right ear!
        audioContextManager.playSpatialOpponentClick();

        if (data.isComplete) {
          setWinner((prev) => prev || 'opponent');
        }
      }
    });

    connection.on('close', () => {
      setIsConnected(false);
      alert('Opponent disconnected from duel.');
    });
  };

  const resetRace = () => {
    setCurrentWordIdx(0);
    setTypedChars('');
    setMyProgress(0);
    setMyWpm(0);
    setOpponentProgress(0);
    setOpponentWpm(0);
    setWinner(null);
    startTimeRef.current = null;
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (winner) return;

    if (!startTimeRef.current) {
      startTimeRef.current = performance.now();
    }

    // Local user keystroke audio
    soundEngine.triggerKeystroke({
      key: e.key,
      code: e.code,
      isKeyDown: true,
      isSpacebar: e.key === ' ',
      isEnter: e.key === 'Enter',
      isBackspace: e.key === 'Backspace',
    });

    if (e.key === 'Backspace') {
      if (typedChars.length > 0) setTypedChars((p) => p.slice(0, -1));
      return;
    }

    const currentWord = words[currentWordIdx];

    if (e.key === ' ') {
      e.preventDefault();
      if (typedChars === currentWord) {
        const nextIdx = currentWordIdx + 1;
        setCurrentWordIdx(nextIdx);
        setTypedChars('');

        // Compute progress & send to opponent
        const charsDone = words.slice(0, nextIdx).join(' ').length + 1;
        const progress = Math.min(100, Math.round((charsDone / totalCharsRef.current) * 100));
        const elapsedMin = (performance.now() - (startTimeRef.current || performance.now())) / 60000;
        const currentWpm = Math.round((charsDone / 5) / Math.max(0.01, elapsedMin));

        setMyProgress(progress);
        setMyWpm(currentWpm);

        const isFinished = nextIdx >= words.length;
        if (isFinished) {
          setWinner('me');
        }

        if (conn && conn.open) {
          const msg: DuelKeystrokeMessage = {
            type: 'keystroke',
            key: e.key,
            charIdx: charsDone,
            wpm: currentWpm,
            progress,
            isComplete: isFinished,
          };
          conn.send(msg);
        }
      }
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const nextTyped = typedChars + e.key;
      setTypedChars(nextTyped);

      // Transmit single keystroke for right-ear audio replication
      if (conn && conn.open) {
        conn.send({
          type: 'keystroke',
          key: e.key,
          progress: myProgress,
          wpm: myWpm,
          isComplete: false,
        });
      }
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
        <div className="w-full p-8 rounded-2xl bg-white border border-neutral-200/90 flex flex-col items-center text-center shadow-sm text-neutral-900">
          <Swords className="w-12 h-12 text-[#ff5500] mb-3" />
          <h3 className="text-2xl font-mono font-black text-neutral-900 tracking-wider">
            1v1 MECHANICAL DUEL
          </h3>
          <p className="text-xs font-mono text-neutral-500 mt-1 mb-8 max-w-md">
            Peer-to-peer real-time typing race with 3D spatial opponent clacks in your right ear!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
            {/* Host Button */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col items-center gap-3">
              <span className="text-xs font-mono text-neutral-800 font-bold uppercase">Create Match</span>
              <button
                onClick={initHost}
                className="btn-orange-pill w-full py-2.5 rounded-lg font-mono font-bold text-xs shadow-md"
              >
                HOST ROOM
              </button>
            </div>

            {/* Join Form */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col items-center gap-3">
              <span className="text-xs font-mono text-neutral-800 font-bold uppercase">Join Room</span>
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  placeholder="MECH-4821"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-2 py-1.5 rounded bg-white border border-neutral-300 text-xs font-mono text-neutral-900 font-bold uppercase focus:outline-none"
                />
                <button
                  onClick={joinMatch}
                  className="px-3 py-1.5 rounded bg-neutral-900 hover:bg-black text-white font-mono font-bold text-xs"
                >
                  JOIN
                </button>
              </div>
            </div>
          </div>

          {/* AI Bot Rival Fallback */}
          <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-col items-center gap-2">
            <span className="text-xs font-mono text-neutral-600 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-amber-500" /> Or practice solo against an AI Sparring Bot:
            </span>
            <div className="flex gap-2 mt-1">
              {(['novice', 'pro', 'master'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    setBotDifficulty(diff);
                    startBotSparring();
                  }}
                  className="px-3 py-1 rounded bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-200 text-xs font-mono uppercase font-semibold"
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
          <div className="flex flex-wrap items-center justify-between px-4 py-2.5 rounded-xl bg-white border border-neutral-200/90 text-xs font-mono shadow-xs text-neutral-900">
            <div className="flex items-center gap-3">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="text-neutral-900 font-bold">
                {botMode ? `SPARRING BOT (${botDifficulty.toUpperCase()})` : `ROOM: ${roomId}`}
              </span>
              {!botMode && roomId && (
                <button
                  onClick={copyRoomCode}
                  className="flex items-center gap-1 text-[11px] text-[#ff5500] hover:underline font-bold"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-neutral-500">
              <Volume2 className="w-4 h-4 text-[#ff5500]" />
              <span>Spatial 3D Audio Active (Opponent in Right Ear)</span>
            </div>
          </div>

          {/* Dual Racing Progress Tracks */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-sm flex flex-col gap-5 text-neutral-900">
            {/* Player Track */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-[#ff5500] font-bold">YOU (PLAYER 1)</span>
                <span className="text-neutral-900 font-bold">{myWpm} WPM • {myProgress}%</span>
              </div>
              <div className="w-full h-3 bg-neutral-100 rounded-full border border-neutral-200 p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-150 bg-gradient-to-r from-orange-500 to-[#ff5500]"
                  style={{ width: `${myProgress}%` }}
                />
              </div>
            </div>

            {/* Opponent Track */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-neutral-600 font-bold">
                  {botMode ? `CYBER BOT (${botDifficulty.toUpperCase()})` : 'OPPONENT (PLAYER 2)'}
                </span>
                <span className="text-neutral-700 font-bold">{opponentWpm} WPM • {Math.round(opponentProgress)}%</span>
              </div>
              <div className="w-full h-3 bg-neutral-100 rounded-full border border-neutral-200 p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-150 bg-neutral-400"
                  style={{ width: `${opponentProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Typing Word Area */}
          <div
            onClick={() => inputRef.current?.focus()}
            className="w-full min-h-[160px] p-6 rounded-2xl bg-white border border-neutral-200/90 relative cursor-text select-none shadow-sm text-neutral-900"
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
                  return <span key={idx} className="text-neutral-400 line-through">{word}</span>;
                }

                if (isCurrent) {
                  return (
                    <span key={idx} className="text-[#ff5500] font-bold border-b-2 border-[#ff5500] pb-0.5">
                      {word.split('').map((char, cIdx) => (
                        <span
                          key={cIdx}
                          className={
                            typedChars[cIdx] === undefined
                              ? 'text-neutral-700'
                              : typedChars[cIdx] === char
                              ? 'text-[#ff5500] font-black'
                              : 'text-rose-600 bg-rose-100 rounded'
                          }
                        >
                          {char}
                        </span>
                      ))}
                    </span>
                  );
                }

                return <span key={idx} className="text-neutral-400">{word}</span>;
              })}
            </div>

            {/* Duel Result Modal */}
            {winner && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 rounded-2xl z-50 animate-fadeIn">
                <Trophy className={`w-14 h-14 mb-2 animate-bounce ${winner === 'me' ? 'text-amber-500' : 'text-neutral-400'}`} />
                <h3 className="text-2xl font-mono font-black text-neutral-900 tracking-wider">
                  {winner === 'me' ? 'VICTORY! YOU WON THE DUEL' : 'DEFEAT! OPPONENT FINISHED FIRST'}
                </h3>
                <p className="text-xs font-mono text-[#ff5500] font-bold mt-1 mb-6">
                  Final Speed: {myWpm} WPM vs Opponent {opponentWpm} WPM
                </p>
                <button
                  onClick={() => {
                    const newWords = getRandomWords(35);
                    setWords(newWords);
                    resetRace();
                  }}
                  className="btn-orange-pill px-6 py-2.5 rounded-xl font-mono font-bold text-xs shadow-md"
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
