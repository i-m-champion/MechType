import React, { useRef, useEffect } from 'react';
import { RgbMode, RgbWave } from '../../types/rgb';

interface RgbRippleOverlayProps {
  mode: RgbMode;
  waves: RgbWave[];
  onWaveComplete: (id: number) => void;
}

export const RgbRippleOverlay: React.FC<RgbRippleOverlayProps> = ({
  mode,
  waves,
  onWaveComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (mode === 'off' || waves.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const now = performance.now();

      waves.forEach((wave) => {
        const elapsed = now - wave.startTime;
        const progress = Math.min(elapsed / wave.duration, 1.0);

        if (progress >= 1.0) {
          onWaveComplete(wave.id);
          return;
        }

        const cx = (wave.originX / 100) * width;
        const cy = (wave.originY / 100) * height;
        const maxRadius = Math.max(width, height) * 0.7;
        const currentRadius = progress * maxRadius;
        const alpha = Math.sin(progress * Math.PI) * 0.55;

        ctx.save();

        if (mode === 'rainbow') {
          const hue = (now * 0.2 + progress * 360) % 360;
          const grad = ctx.createRadialGradient(
            cx, cy, Math.max(0, currentRadius - 35),
            cx, cy, currentRadius + 35
          );
          grad.addColorStop(0, `hsla(${hue}, 100%, 65%, 0)`);
          grad.addColorStop(0.5, `hsla(${hue}, 100%, 65%, ${alpha})`);
          grad.addColorStop(1, `hsla(${(hue + 60) % 360}, 100%, 65%, 0)`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, currentRadius + 35, 0, Math.PI * 2);
          ctx.fill();
        } else if (mode === 'neon') {
          // Neon Cyan to Magenta dual wave
          const grad = ctx.createRadialGradient(
            cx, cy, Math.max(0, currentRadius - 25),
            cx, cy, currentRadius + 25
          );
          grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
          grad.addColorStop(0.5, `rgba(255, 0, 119, ${alpha})`);
          grad.addColorStop(0.8, `rgba(0, 240, 255, ${alpha * 0.8})`);
          grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, currentRadius + 25, 0, Math.PI * 2);
          ctx.fill();
        } else if (mode === 'matrix') {
          // Matrix column stream
          ctx.fillStyle = `rgba(57, 255, 20, ${alpha * 0.7})`;
          const colWidth = 24;
          const streamHeight = height * progress;
          ctx.fillRect(cx - colWidth / 2, 0, colWidth, streamHeight);
        } else if (mode === 'starlight') {
          // Starlight cosmic burst
          const grad = ctx.createRadialGradient(
            cx, cy, 0,
            cx, cy, currentRadius + 15
          );
          grad.addColorStop(0, `rgba(255, 235, 150, ${alpha * 0.9})`);
          grad.addColorStop(0.6, `rgba(168, 85, 247, ${alpha * 0.4})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, currentRadius + 15, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mode, waves, onWaveComplete]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    resize();

    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  if (mode === 'off') return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none rounded-xl z-10 mix-blend-screen"
    />
  );
};
