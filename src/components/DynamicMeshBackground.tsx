import { useMemo, useEffect, useRef } from 'react';
import { BreathPhase } from '@/types/breathing';

interface DynamicMeshBackgroundProps {
  phase: BreathPhase;
  isActive: boolean;
}

// Phase-specific color configurations (HSL values)
const phaseColors = {
  idle: {
    primary: { h: 45, s: 33, l: 97 },      // Warm background
    secondary: { h: 40, s: 35, l: 88 },    // Sand
    accent: { h: 75, s: 25, l: 35 },       // Olive
  },
  prepare: {
    primary: { h: 75, s: 30, l: 90 },      // Soft olive tint
    secondary: { h: 45, s: 40, l: 95 },    // Cream
    accent: { h: 75, s: 25, l: 45 },       // Deeper olive
  },
  inhale: {
    primary: { h: 180, s: 35, l: 85 },     // Soft teal
    secondary: { h: 180, s: 40, l: 75 },   // Deeper teal
    accent: { h: 160, s: 30, l: 70 },      // Seafoam
  },
  holdIn: {
    primary: { h: 40, s: 45, l: 80 },      // Warm amber
    secondary: { h: 35, s: 50, l: 70 },    // Golden
    accent: { h: 45, s: 40, l: 75 },       // Honey
  },
  exhale: {
    primary: { h: 40, s: 35, l: 88 },      // Soft sand
    secondary: { h: 30, s: 30, l: 85 },    // Warm beige
    accent: { h: 25, s: 40, l: 75 },       // Terracotta hint
  },
  holdOut: {
    primary: { h: 40, s: 20, l: 90 },      // Neutral warm
    secondary: { h: 45, s: 25, l: 88 },    // Pale cream
    accent: { h: 30, s: 15, l: 80 },       // Muted
  },
  complete: {
    primary: { h: 75, s: 35, l: 85 },      // Celebration green
    secondary: { h: 80, s: 40, l: 80 },    // Fresh
    accent: { h: 70, s: 45, l: 70 },       // Vibrant olive
  },
};

// Dark mode variants
const phaseColorsDark = {
  idle: {
    primary: { h: 30, s: 15, l: 12 },
    secondary: { h: 30, s: 20, l: 15 },
    accent: { h: 75, s: 30, l: 25 },
  },
  prepare: {
    primary: { h: 30, s: 18, l: 14 },
    secondary: { h: 75, s: 20, l: 18 },
    accent: { h: 75, s: 30, l: 30 },
  },
  inhale: {
    primary: { h: 180, s: 25, l: 18 },
    secondary: { h: 180, s: 30, l: 22 },
    accent: { h: 160, s: 25, l: 25 },
  },
  holdIn: {
    primary: { h: 40, s: 30, l: 18 },
    secondary: { h: 35, s: 35, l: 22 },
    accent: { h: 45, s: 30, l: 25 },
  },
  exhale: {
    primary: { h: 30, s: 20, l: 14 },
    secondary: { h: 25, s: 25, l: 18 },
    accent: { h: 25, s: 30, l: 22 },
  },
  holdOut: {
    primary: { h: 30, s: 15, l: 12 },
    secondary: { h: 30, s: 18, l: 15 },
    accent: { h: 30, s: 20, l: 18 },
  },
  complete: {
    primary: { h: 75, s: 25, l: 18 },
    secondary: { h: 80, s: 30, l: 22 },
    accent: { h: 70, s: 35, l: 28 },
  },
};

function hslToString(color: { h: number; s: number; l: number }, alpha = 1) {
  return `hsla(${color.h}, ${color.s}%, ${color.l}%, ${alpha})`;
}

export function DynamicMeshBackground({ phase, isActive }: DynamicMeshBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const currentColorsRef = useRef(phaseColors.idle);
  const targetColorsRef = useRef(phaseColors.idle);

  // Detect dark mode
  const isDarkMode = typeof window !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  // Update target colors when phase changes
  useEffect(() => {
    const colorSet = isDarkMode ? phaseColorsDark : phaseColors;
    targetColorsRef.current = colorSet[phase] || colorSet.idle;
  }, [phase, isDarkMode]);

  // Lerp function for smooth color transitions
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  const lerpColor = (
    current: { h: number; s: number; l: number },
    target: { h: number; s: number; l: number },
    factor: number
  ) => ({
    h: lerp(current.h, target.h, factor),
    s: lerp(current.s, target.s, factor),
    l: lerp(current.l, target.l, factor),
  });

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    const lerpSpeed = 0.02; // Smooth color transition speed

    const draw = () => {
      time += 0.005;

      // Smoothly interpolate colors
      currentColorsRef.current = {
        primary: lerpColor(currentColorsRef.current.primary, targetColorsRef.current.primary, lerpSpeed),
        secondary: lerpColor(currentColorsRef.current.secondary, targetColorsRef.current.secondary, lerpSpeed),
        accent: lerpColor(currentColorsRef.current.accent, targetColorsRef.current.accent, lerpSpeed),
      };

      const { primary, secondary, accent } = currentColorsRef.current;
      const { width, height } = canvas;

      // Clear with base color
      ctx.fillStyle = hslToString(primary);
      ctx.fillRect(0, 0, width, height);

      // Create mesh gradient effect with multiple overlapping circles
      const circles = [
        { x: width * 0.2, y: height * 0.3, radius: width * 0.6, color: secondary, alpha: 0.5 },
        { x: width * 0.8, y: height * 0.7, radius: width * 0.5, color: accent, alpha: 0.4 },
        { x: width * 0.5, y: height * 0.5, radius: width * 0.4, color: primary, alpha: 0.3 },
      ];

      circles.forEach((circle, i) => {
        // Animate position subtly
        const offsetX = Math.sin(time + i * 2) * 30;
        const offsetY = Math.cos(time + i * 1.5) * 20;
        
        // Breathing-synchronized pulse when active
        const breathPulse = isActive ? Math.sin(time * 2) * 20 : 0;

        const gradient = ctx.createRadialGradient(
          circle.x + offsetX,
          circle.y + offsetY,
          0,
          circle.x + offsetX,
          circle.y + offsetY,
          circle.radius + breathPulse
        );

        gradient.addColorStop(0, hslToString(circle.color, circle.alpha));
        gradient.addColorStop(0.5, hslToString(circle.color, circle.alpha * 0.5));
        gradient.addColorStop(1, hslToString(circle.color, 0));

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });

      // Add subtle noise texture
      if (isActive) {
        ctx.globalAlpha = 0.02;
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const size = Math.random() * 2;
          ctx.fillStyle = isDarkMode ? 'white' : 'black';
          ctx.fillRect(x, y, size, size);
        }
        ctx.globalAlpha = 1;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 transition-opacity duration-1000"
      style={{ opacity: isActive ? 1 : 0.7 }}
    />
  );
}
