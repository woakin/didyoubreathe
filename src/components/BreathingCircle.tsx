import { useMemo } from 'react';
import { BreathPhase } from '@/types/breathing';
import { cn } from '@/lib/utils';

interface BreathingCircleProps {
  phase: BreathPhase;
  phaseTimeRemaining: number;
  phaseDuration: number;
  totalTimeRemaining: number;
  totalDuration: number;
  isActive: boolean;
}

const phaseLabels: Record<BreathPhase, string> = {
  inhale: 'Inhala',
  holdIn: 'Mantén',
  exhale: 'Exhala',
  holdOut: 'Pausa',
  complete: '¡Completado!',
};

const phaseColors: Record<BreathPhase, string> = {
  inhale: 'from-breath-inhale/40 to-breath-inhale/60',
  holdIn: 'from-breath-hold/40 to-breath-hold/60',
  exhale: 'from-breath-exhale/40 to-breath-exhale/60',
  holdOut: 'from-muted/40 to-muted/60',
  complete: 'from-breath-glow/40 to-breath-glow/60',
};

export function BreathingCircle({
  phase,
  phaseTimeRemaining,
  phaseDuration,
  totalTimeRemaining,
  totalDuration,
  isActive,
}: BreathingCircleProps) {
  const progress = useMemo(() => {
    if (!isActive || phase === 'complete') return 1;
    return 1 - phaseTimeRemaining / phaseDuration;
  }, [phaseTimeRemaining, phaseDuration, isActive, phase]);

  const totalProgress = useMemo(() => {
    return 1 - totalTimeRemaining / totalDuration;
  }, [totalTimeRemaining, totalDuration]);

  // SVG circle properties for progress ring
  const size = 280;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - totalProgress);

  // Animation scale based on phase
  const scale = useMemo(() => {
    if (!isActive) return 1;
    if (phase === 'complete') return 1;
    
    const phaseProgress = 1 - phaseTimeRemaining / phaseDuration;
    
    switch (phase) {
      case 'inhale':
        return 1 + 0.15 * phaseProgress;
      case 'holdIn':
        return 1.15;
      case 'exhale':
        return 1.15 - 0.15 * phaseProgress;
      case 'holdOut':
        return 1;
      default:
        return 1;
    }
  }, [phase, phaseTimeRemaining, phaseDuration, isActive]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Progress ring */}
      <svg
        width={size}
        height={size}
        className="absolute -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          className="opacity-30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>

      {/* Inner breathing circle */}
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-full',
          'bg-gradient-to-br shadow-xl',
          'w-56 h-56',
          'transition-all duration-1000 ease-in-out',
          phaseColors[phase]
        )}
        style={{ transform: `scale(${scale})` }}
      >
        <span className="text-3xl font-semibold text-foreground mb-2">
          {phaseLabels[phase]}
        </span>
        
        {isActive && phase !== 'complete' && (
          <span className="text-5xl font-light text-foreground/90">
            {phaseTimeRemaining}
          </span>
        )}
        
        {phase === 'complete' && (
          <span className="text-lg text-foreground/80">
            Bien hecho 🌿
          </span>
        )}
      </div>
    </div>
  );
}
