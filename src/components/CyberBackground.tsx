import React, { useEffect, useRef } from 'react';
import { useSettings } from '../utils/settingsContext';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
}

interface LightningBolt {
  segments: { x: number; y: number }[];
  alpha: number;
  maxAlpha: number;
  life: number;
  width: number;
}

export const CyberBackground: React.FC = () => {
  const { theme, bgEffect } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (bgEffect === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Parse hex to RGB for alpha control
    const hex = theme.hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 59;
    const g = parseInt(hex.substring(2, 4), 16) || 130;
    const b = parseInt(hex.substring(4, 6), 16) || 246;

    // Initialize floating glowing balls / orbs
    const numParticles = Math.min(Math.floor((width * height) / 25000), 45);
    const particles: Particle[] = [];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 4 + 2, // glowing balls size 2px - 6px
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        baseAlpha: Math.random() * 0.6 + 0.3,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Lightning bolts list
    const lightningBolts: LightningBolt[] = [];

    const createLightning = () => {
      const startX = Math.random() * width;
      const startY = Math.random() * (height * 0.3); // Starts top
      const endX = startX + (Math.random() - 0.5) * (width * 0.6);
      const endY = startY + Math.random() * (height * 0.7) + 150;

      const segments: { x: number; y: number }[] = [{ x: startX, y: startY }];
      const steps = Math.floor(Math.random() * 6 + 5);

      let currentX = startX;
      let currentY = startY;

      for (let i = 1; i <= steps; i++) {
        const progress = i / steps;
        const targetX = startX + (endX - startX) * progress;
        const targetY = startY + (endY - startY) * progress;

        const jitterX = (Math.random() - 0.5) * 60;
        const jitterY = (Math.random() - 0.5) * 30;

        currentX = targetX + jitterX;
        currentY = targetY + jitterY;

        segments.push({ x: currentX, y: currentY });
      }

      segments.push({ x: endX, y: endY });

      lightningBolts.push({
        segments,
        alpha: 1,
        maxAlpha: Math.random() * 0.5 + 0.5,
        life: 1,
        width: Math.random() * 2 + 1.5,
      });
    };

    let lastLightningTime = Date.now();
    let nextLightningInterval = Math.random() * 1500 + 800; // lightning every ~1-2.5 seconds

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const now = Date.now();

      // Spawn lightning bolts
      if ((bgEffect === 'hybrid' || bgEffect === 'lightning') && now - lastLightningTime > nextLightningInterval) {
        createLightning();
        lastLightningTime = now;
        nextLightningInterval = Math.random() * 2000 + 1000;
      }

      // Draw & update lightning bolts
      if (bgEffect === 'hybrid' || bgEffect === 'lightning') {
        for (let i = lightningBolts.length - 1; i >= 0; i--) {
          const bolt = lightningBolts[i];
          bolt.life -= 0.05;

          if (bolt.life <= 0) {
            lightningBolts.splice(i, 1);
            continue;
          }

          const currentAlpha = bolt.life * bolt.maxAlpha;

          // Draw Outer Glow
          ctx.beginPath();
          ctx.moveTo(bolt.segments[0].x, bolt.segments[0].y);
          for (let j = 1; j < bolt.segments.length; j++) {
            ctx.lineTo(bolt.segments[j].x, bolt.segments[j].y);
          }
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${currentAlpha * 0.4})`;
          ctx.lineWidth = bolt.width * 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.shadowColor = theme.hex;
          ctx.shadowBlur = 15;
          ctx.stroke();

          // Draw Core Beam
          ctx.beginPath();
          ctx.moveTo(bolt.segments[0].x, bolt.segments[0].y);
          for (let j = 1; j < bolt.segments.length; j++) {
            ctx.lineTo(bolt.segments[j].x, bolt.segments[j].y);
          }
          ctx.strokeStyle = `rgba(255, 255, 255, ${currentAlpha * 0.9})`;
          ctx.lineWidth = bolt.width;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // Draw & update floating glowing balls / orbs
      if (bgEffect === 'hybrid' || bgEffect === 'orbs' || bgEffect === 'matrix') {
        // Draw connection lines between nearby balls
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120) {
              const lineAlpha = (1 - dist / 120) * 0.2;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineAlpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }

        // Draw balls / orbs
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // Move
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          // Pulse
          p.pulsePhase += p.pulseSpeed;
          const currentAlpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.25;

          // Radial glow gradient for each ball
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.5);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${currentAlpha})`);
          gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${currentAlpha * 0.8})`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Bright center ball
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.9})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme.hex, bgEffect]);

  if (bgEffect === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
