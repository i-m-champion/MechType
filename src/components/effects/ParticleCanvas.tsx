import React, { useRef, useEffect } from 'react';
import { OverdriveTier } from '../../types/overdrive';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'fire' | 'lightning';
}

interface ParticleCanvasProps {
  tier: OverdriveTier;
  caretPos?: { x: number; y: number } | null;
  triggerKey?: number; // timestamp or counter to emit particles
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  tier,
  caretPos,
  triggerKey,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastTriggerRef = useRef(0);

  // Emit particles when typing occurs in tier >= sparking
  useEffect(() => {
    if (!caretPos || !triggerKey || triggerKey === lastTriggerRef.current) return;
    lastTriggerRef.current = triggerKey;

    if (tier === 'cruising') return;

    const count = tier === 'overdrive' ? 12 : tier === 'combustion' ? 7 : 3;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = tier === 'overdrive' ? 3 + Math.random() * 6 : 1.5 + Math.random() * 3.5;

      let color = '#00f0ff';
      let type: Particle['type'] = 'spark';

      if (tier === 'sparking') {
        color = Math.random() > 0.4 ? '#facc15' : '#00f0ff';
        type = 'spark';
      } else if (tier === 'combustion') {
        color = Math.random() > 0.5 ? '#ff4500' : Math.random() > 0.5 ? '#ff0055' : '#ffa500';
        type = 'fire';
      } else if (tier === 'overdrive') {
        color = Math.random() > 0.4 ? '#00f0ff' : Math.random() > 0.5 ? '#ff0077' : '#ffffff';
        type = Math.random() > 0.6 ? 'lightning' : 'spark';
      }

      particlesRef.current.push({
        x: caretPos.x + (Math.random() * 6 - 3),
        y: caretPos.y + (Math.random() * 6 - 3),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'fire' ? 1.5 : 0), // fire rises
        life: 1.0,
        maxLife: 0.35 + Math.random() * 0.4,
        size: tier === 'overdrive' ? 2.5 + Math.random() * 3 : 1.5 + Math.random() * 2,
        color,
        type,
      });
    }

    // Limit active particles to prevent performance degradation
    if (particlesRef.current.length > 120) {
      particlesRef.current = particlesRef.current.slice(-120);
    }
  }, [triggerKey, caretPos, tier]);

  // Main Particle Render & Update Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.033);
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const active: Particle[] = [];
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life -= dt / p.maxLife;

        if (p.life > 0) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.type === 'fire') {
            p.vy -= 0.08; // upward buoyancy
            p.size *= 0.98;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;

          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          active.push(p);
        }
      }

      particlesRef.current = active;
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Window resize sync
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

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30 mix-blend-screen"
    />
  );
};
