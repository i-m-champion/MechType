import React, { useRef, useEffect } from 'react';

interface LightningCanvasProps {
  active: boolean;
}

export const LightningCanvas: React.FC<LightningCanvasProps> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let nextLightningTime = performance.now() + Math.random() * 400;

    const createLightningArc = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      displace: number,
      iteration: number
    ) => {
      if (displace < 4 || iteration > 5) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = Math.random() > 0.3 ? '#00f0ff' : '#ffffff';
        ctx.lineWidth = Math.random() * 2 + 1;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.stroke();
        return;
      }

      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displace;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displace;

      createLightningArc(x1, y1, midX, midY, displace / 2, iteration + 1);
      createLightningArc(midX, midY, x2, y2, displace / 2, iteration + 1);
    };

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (time >= nextLightningTime) {
        // Spawn 1 to 2 lightning bolts jumping along screen
        const bolts = 1 + Math.floor(Math.random() * 2);
        for (let b = 0; b < bolts; b++) {
          const startX = Math.random() * canvas.width;
          const startY = Math.random() * (canvas.height * 0.4) + canvas.height * 0.1;
          const endX = startX + (Math.random() * 300 - 150);
          const endY = startY + (Math.random() * 200 - 100);

          createLightningArc(startX, startY, endX, endY, 60, 0);
        }
        nextLightningTime = time + 120 + Math.random() * 300;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20 mix-blend-screen"
    />
  );
};
