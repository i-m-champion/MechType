import React, { useEffect, useState } from 'react';
import { Gauge, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface RadialSpeedometerProps {
  wpm: number;
  kps: number;
}

export const RadialSpeedometer: React.FC<RadialSpeedometerProps> = ({ wpm, kps }) => {
  const { themeConfig } = useTheme();
  const [smoothWpm, setSmoothWpm] = useState(0);

  // Smooth needle lag interpolation
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setSmoothWpm((prev) => {
        const diff = wpm - prev;
        if (Math.abs(diff) < 0.2) return wpm;
        return prev + diff * 0.15;
      });
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [wpm]);

  // Max scale 180 WPM
  // Angle: -120 deg (0 WPM) to +120 deg (180 WPM) -> 240 deg range
  const clampedWpm = Math.min(180, Math.max(0, smoothWpm));
  const angle = -120 + (clampedWpm / 180) * 240;

  const isRedline = smoothWpm >= 100;

  return (
    <div
      className="p-4 rounded-2xl border backdrop-blur-md flex flex-col items-center justify-center relative shadow-xl transition-all duration-300"
      style={{
        backgroundColor: `${themeConfig.surface}dd`,
        borderColor: isRedline ? '#ff0077' : themeConfig.border,
        boxShadow: isRedline ? '0 0 25px rgba(255, 0, 119, 0.4)' : undefined,
      }}
    >
      <div className="flex items-center justify-between w-full mb-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 px-1">
        <span className="flex items-center gap-1">
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          SPEEDOMETER
        </span>
        <span className={`font-bold ${isRedline ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
          {isRedline ? '⚡ REDLINE' : 'STANDARD'}
        </span>
      </div>

      {/* Radial Dial SVG */}
      <div className="relative w-44 h-28 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          {/* Background Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={themeConfig.isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Cruising Zone (0 to 40) */}
          <path
            d="M 20 100 A 80 80 0 0 1 45 45"
            fill="none"
            stroke={themeConfig.isLight ? '#0ea5e9' : '#00f0ff'}
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Amber Combustion Zone (40 to 100) */}
          <path
            d="M 45 45 A 80 80 0 0 1 125 25"
            fill="none"
            stroke={themeConfig.isLight ? '#f59e0b' : '#ffaa00'}
            strokeWidth="8"
            opacity="0.8"
          />

          {/* Redline Overdrive Zone (100 to 180) */}
          <path
            d="M 125 25 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#ff5500"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Tick marks */}
          {[0, 30, 60, 90, 120, 150, 180].map((val) => {
            const tickAngle = (-120 + (val / 180) * 240) * (Math.PI / 180);
            const x1 = 100 + 72 * Math.cos(tickAngle);
            const y1 = 100 + 72 * Math.sin(tickAngle);
            const x2 = 100 + 82 * Math.cos(tickAngle);
            const y2 = 100 + 82 * Math.sin(tickAngle);
            return (
              <line
                key={val}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={themeConfig.isLight ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.4)'}
                strokeWidth="2"
              />
            );
          })}

          {/* Needle with Rotational Spring Pivot */}
          <g transform={`rotate(${angle}, 100, 100)`}>
            <polygon
              points="97,100 100,22 103,100"
              fill={isRedline ? '#ff5500' : themeConfig.accent}
              filter={themeConfig.isLight ? undefined : 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.8))'}
            />
            <circle cx="100" cy="100" r="7" fill={themeConfig.isLight ? '#090a0d' : '#ffffff'} />
            <circle cx="100" cy="100" r="4" fill={themeConfig.isLight ? '#ffffff' : '#0a0d14'} />
          </g>
        </svg>

        {/* Digital Readout */}
        <div className="absolute bottom-0 flex flex-col items-center">
          <div className="text-2xl font-mono font-black tracking-tight" style={{ color: isRedline ? '#ff5500' : themeConfig.accent }}>
            {Math.round(smoothWpm)}
          </div>
          <div className="text-[10px] font-mono text-neutral-400 uppercase -mt-1 font-bold">
            WPM LIVE
          </div>
        </div>
      </div>

      {/* Keystrokes Per Second Sub-gauge */}
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5 w-full justify-center text-xs font-mono">
        <span className="text-slate-400">KPS Cadence:</span>
        <span className="text-emerald-400 font-bold">{kps} keys/sec</span>
      </div>
    </div>
  );
};
