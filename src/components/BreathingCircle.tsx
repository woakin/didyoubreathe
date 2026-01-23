import { useMemo } from 'react';
import { BreathPhase } from '@/types/breathing';
import { cn } from '@/lib/utils';

interface BreathingCircleProps {
  phase: BreathPhase;
  phaseProgress?: number; // 0-1 progress within current phase (audio-driven mode)
  phaseTimeRemaining?: number; // Timer-driven mode
  phaseDuration?: number; // Timer-driven mode
  totalProgress?: number; // 0-1 overall progress (audio-driven mode)
  totalTimeRemaining?: number; // Timer-driven mode
  totalDuration?: number; // Timer-driven mode
  isActive: boolean;
  currentCount?: number; // Current number being spoken (audio-driven)
}

const phaseLabels: Record<BreathPhase, string> = {
  idle: 'Prepárate',
  prepare: 'Prepárate',
  inhale: 'Inhala',
  holdIn: 'Mantén',
  exhale: 'Exhala',
  holdOut: 'Pausa',
  complete: '¡Completado!',
};

const phaseColors: Record<BreathPhase, string> = {
  idle: 'from-muted/30 to-muted/50',
  prepare: 'from-primary/20 to-primary/40',
  inhale: 'from-breath-inhale/40 to-breath-inhale/60',
  holdIn: 'from-breath-hold/40 to-breath-hold/60',
  exhale: 'from-breath-exhale/40 to-breath-exhale/60',
  holdOut: 'from-muted/40 to-muted/60',
  complete: 'from-breath-glow/40 to-breath-glow/60',
};

export function BreathingCircle({
  phase,
  phaseProgress,
  phaseTimeRemaining,
  phaseDuration,
  totalProgress,
  totalTimeRemaining,
  totalDuration,
  isActive,
  currentCount,
}: BreathingCircleProps) {
  // Determine if we're in audio-driven or timer-driven mode
  const isAudioDriven = phaseProgress !== undefined && totalProgress !== undefined;

  // Calculate progress for timer-driven mode
  const timerProgress = useMemo(() => {
    if (!isActive || phase === 'complete') return 1;
    if (phaseTimeRemaining === undefined || phaseDuration === undefined) return 0;
    return 1 - phaseTimeRemaining / phaseDuration;
  }, [phaseTimeRemaining, phaseDuration, isActive, phase]);

  // Calculate total progress for timer-driven mode
  const timerTotalProgress = useMemo(() => {
    if (totalTimeRemaining === undefined || totalDuration === undefined) return 0;
    return 1 - totalTimeRemaining / totalDuration;
  }, [totalTimeRemaining, totalDuration]);

  // Use audio-driven or timer-driven progress
  const effectiveProgress = isAudioDriven ? phaseProgress : timerProgress;
  const effectiveTotalProgress = isAudioDriven ? totalProgress : timerTotalProgress;

  // SVG circle properties for progress ring
  const size = 280;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - effectiveTotalProgress);

  // Animation scale based on phase
  const scale = useMemo(() => {
    if (!isActive) return 1;
    if (phase === 'complete') return 1;
    
    const progress = effectiveProgress || 0;
    
    switch (phase) {
      case 'prepare':
        // Gentle pulse during preparation
        return 1 + 0.03 * Math.sin(progress * Math.PI * 2);
      case 'inhale':
        return 1 + 0.15 * progress;
      case 'holdIn':
        return 1.15;
      case 'exhale':
        return 1.15 - 0.15 * progress;
      case 'holdOut':
        return 1;
      default:
        return 1;
    }
  }, [phase, effectiveProgress, isActive]);

  // Display count - use currentCount for audio-driven, or calculate for timer mode
  const displayCount = useMemo(() => {
    if (isAudioDriven && currentCount) {
      return currentCount;
    }
    if (!isAudioDriven && phaseDuration !== undefined && phaseTimeRemaining !== undefined) {
      return phaseDuration - phaseTimeRemaining + 1;
    }
    return null;
  }, [isAudioDriven, currentCount, phaseDuration, phaseTimeRemaining]);

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
          className="transition-all duration-100 ease-linear"
        />
      </svg>

      {/* Inner breathing circle */}
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-full',
          'bg-gradient-to-br shadow-xl',
          'w-56 h-56',
          'transition-transform duration-100 ease-out',
          phaseColors[phase]
        )}
        style={{ transform: `scale(${scale})` }}
      >
        <span className="text-3xl font-semibold text-foreground mb-2">
          {phaseLabels[phase]}
        </span>
        
        {isActive && phase === 'prepare' && (
          <span className="text-base text-foreground/70 text-center px-4 animate-pulse">
            Encuentra una posición cómoda
          </span>
        )}
        
        {isActive && phase !== 'complete' && phase !== 'prepare' && displayCount !== null && (
          <span className="text-5xl font-light text-foreground/90">
            {displayCount}
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
