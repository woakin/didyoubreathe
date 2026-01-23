import { useMemo } from 'react';
import { BreathPhase } from '@/types/breathing';
import { cn } from '@/lib/utils';

interface BreathingBlobProps {
  phase: BreathPhase;
  phaseProgress?: number;
  totalProgress?: number;
  isActive: boolean;
  currentCount?: number;
  phaseTimeRemaining?: number;
  phaseDuration?: number;
}

const phaseLabels: Record<BreathPhase, { en: string; es: string }> = {
  idle: { en: 'Get Ready', es: 'Prepárate' },
  prepare: { en: 'Get Ready', es: 'Prepárate' },
  inhale: { en: 'Breathe In', es: 'Inhala' },
  holdIn: { en: 'Hold', es: 'Mantén' },
  exhale: { en: 'Breathe Out', es: 'Exhala' },
  holdOut: { en: 'Pause', es: 'Pausa' },
  complete: { en: 'Complete!', es: '¡Completado!' },
};

export function BreathingBlob({
  phase,
  phaseProgress = 0,
  totalProgress = 0,
  isActive,
  currentCount,
  phaseTimeRemaining,
  phaseDuration,
}: BreathingBlobProps) {
  // Determine if audio-driven or timer-driven
  const isAudioDriven = currentCount !== undefined;
  
  // Calculate timer progress for non-audio mode
  const timerProgress = useMemo(() => {
    if (phaseTimeRemaining === undefined || phaseDuration === undefined) return 0;
    return 1 - phaseTimeRemaining / phaseDuration;
  }, [phaseTimeRemaining, phaseDuration]);

  const effectiveProgress = isAudioDriven ? phaseProgress : timerProgress;

  // Calculate display count
  const displayCount = useMemo(() => {
    if (isAudioDriven && currentCount) return currentCount;
    if (!isAudioDriven && phaseDuration !== undefined && phaseTimeRemaining !== undefined) {
      return phaseDuration - phaseTimeRemaining + 1;
    }
    return null;
  }, [isAudioDriven, currentCount, phaseDuration, phaseTimeRemaining]);

  // Organic blob scale based on phase
  const blobScale = useMemo(() => {
    if (!isActive) return 1;
    if (phase === 'complete') return 1;
    
    const progress = effectiveProgress || 0;
    
    switch (phase) {
      case 'prepare':
        return 1 + 0.02 * Math.sin(progress * Math.PI * 2);
      case 'inhale':
        // Smooth expansion using easeOutQuad
        const inhaleEase = 1 - Math.pow(1 - progress, 2);
        return 1 + 0.25 * inhaleEase;
      case 'holdIn':
        // Gentle pulse at peak
        return 1.25 + 0.02 * Math.sin(progress * Math.PI * 4);
      case 'exhale':
        // Smooth contraction using easeInQuad
        const exhaleEase = 1 - Math.pow(progress, 2);
        return 1 + 0.25 * exhaleEase;
      case 'holdOut':
        // Subtle rest pulse
        return 1 + 0.01 * Math.sin(progress * Math.PI * 2);
      default:
        return 1;
    }
  }, [phase, effectiveProgress, isActive]);

  // Blob morphing - different shapes for different phases
  const blobPath = useMemo(() => {
    const progress = effectiveProgress || 0;
    
    // Base blob shape vertices (8 points for organic feel)
    const baseRadii = [1, 0.95, 1.02, 0.97, 1.01, 0.96, 0.99, 0.98];
    
    // Phase-based morphing
    let morphAmount = 0;
    switch (phase) {
      case 'inhale':
        morphAmount = 0.08 * Math.sin(progress * Math.PI);
        break;
      case 'exhale':
        morphAmount = 0.06 * Math.sin(progress * Math.PI);
        break;
      case 'holdIn':
      case 'holdOut':
        morphAmount = 0.03 * Math.sin(progress * Math.PI * 2);
        break;
      default:
        morphAmount = 0.02 * Math.sin(Date.now() / 2000);
    }

    // Generate blob path
    const points: string[] = [];
    const centerX = 140;
    const centerY = 140;
    const baseRadius = 120;
    
    for (let i = 0; i <= 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radiusVariation = baseRadii[i % 8] + morphAmount * Math.sin(angle * 3 + progress * Math.PI);
      const radius = baseRadius * radiusVariation * blobScale;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        points.push(`M ${x} ${y}`);
      } else {
        // Use quadratic curves for smoothness
        const prevAngle = ((i - 1) / 8) * Math.PI * 2;
        const prevRadiusVar = baseRadii[(i - 1) % 8] + morphAmount * Math.sin(prevAngle * 3 + progress * Math.PI);
        const prevRadius = baseRadius * prevRadiusVar * blobScale;
        
        const cpAngle = (prevAngle + angle) / 2;
        const cpRadius = (prevRadius + radius) / 2 * 1.05;
        const cpX = centerX + Math.cos(cpAngle) * cpRadius;
        const cpY = centerY + Math.sin(cpAngle) * cpRadius;
        
        points.push(`Q ${cpX} ${cpY} ${x} ${y}`);
      }
    }
    points.push('Z');
    
    return points.join(' ');
  }, [phase, effectiveProgress, blobScale]);

  // Progress ring properties
  const ringRadius = 130;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - totalProgress);

  // Get label based on stored language preference
  const lang = localStorage.getItem('breathe-language') || 'es';
  const label = phaseLabels[phase][lang === 'en' ? 'en' : 'es'];

  return (
    <div className="relative flex items-center justify-center w-[280px] h-[280px]">
      {/* Progress ring */}
      <svg
        width={280}
        height={280}
        className="absolute -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={140}
          cy={140}
          r={ringRadius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={6}
          className="opacity-20"
        />
        {/* Progress circle */}
        <circle
          cx={140}
          cy={140}
          r={ringRadius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={ringCircumference}
          strokeDashoffset={ringOffset}
          className="transition-all duration-150 ease-linear"
        />
      </svg>

      {/* Organic blob */}
      <svg
        width={280}
        height={280}
        className="absolute"
        style={{ filter: 'url(#blob-blur)' }}
      >
        <defs>
          {/* Blur filter for soft edges */}
          <filter id="blob-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
          
          {/* Gradient for blob fill - changes with phase */}
          <radialGradient id="blob-gradient" cx="30%" cy="30%" r="70%">
            <stop 
              offset="0%" 
              className={cn(
                'transition-all duration-1000',
                phase === 'inhale' && 'stop-color-breath-inhale',
                phase === 'holdIn' && 'stop-color-breath-hold',
                phase === 'exhale' && 'stop-color-breath-exhale',
                phase === 'holdOut' && 'stop-color-muted',
                (phase === 'prepare' || phase === 'idle') && 'stop-color-primary',
                phase === 'complete' && 'stop-color-breath-glow'
              )}
              style={{
                stopColor: phase === 'inhale' ? 'hsl(var(--breath-inhale))' :
                           phase === 'holdIn' ? 'hsl(var(--breath-hold))' :
                           phase === 'exhale' ? 'hsl(var(--breath-exhale))' :
                           phase === 'holdOut' ? 'hsl(var(--muted))' :
                           phase === 'complete' ? 'hsl(var(--breath-glow))' :
                           'hsl(var(--primary))',
                stopOpacity: 0.7
              }}
            />
            <stop 
              offset="100%" 
              style={{
                stopColor: phase === 'inhale' ? 'hsl(var(--breath-inhale))' :
                           phase === 'holdIn' ? 'hsl(var(--breath-hold))' :
                           phase === 'exhale' ? 'hsl(var(--breath-exhale))' :
                           phase === 'holdOut' ? 'hsl(var(--muted))' :
                           phase === 'complete' ? 'hsl(var(--breath-glow))' :
                           'hsl(var(--primary))',
                stopOpacity: 0.3
              }}
            />
          </radialGradient>
        </defs>
        
        <path
          d={blobPath}
          fill="url(#blob-gradient)"
          className="transition-all duration-100 ease-out"
        />
      </svg>

      {/* Inner glow layer */}
      <div 
        className={cn(
          'absolute rounded-full transition-all duration-500',
          'bg-gradient-to-br from-white/20 to-transparent'
        )}
        style={{
          width: 180 * blobScale,
          height: 180 * blobScale,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-semibold text-foreground mb-1">
          {label}
        </span>
        
        {isActive && phase === 'prepare' && (
          <span className="text-sm text-foreground/70 animate-pulse">
            {lang === 'en' ? 'Find a comfortable position' : 'Encuentra una posición cómoda'}
          </span>
        )}
        
        {isActive && phase !== 'complete' && phase !== 'prepare' && displayCount !== null && (
          <span className="text-5xl font-light text-foreground/90 tabular-nums">
            {displayCount}
          </span>
        )}
        
        {phase === 'complete' && (
          <span className="text-lg text-foreground/80">
            {lang === 'en' ? 'Well done 🌿' : 'Bien hecho 🌿'}
          </span>
        )}
      </div>
    </div>
  );
}
