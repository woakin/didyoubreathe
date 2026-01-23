import { BreathingPattern } from '@/types/breathing';
import { cn } from '@/lib/utils';

interface BreathRhythmVisualProps {
  techniqueId: string;
  pattern: BreathingPattern;
  className?: string;
}

export function BreathRhythmVisual({ techniqueId, pattern, className }: BreathRhythmVisualProps) {
  const cycleDuration = pattern.inhale + pattern.holdIn + pattern.exhale + pattern.holdOut;

  switch (techniqueId) {
    case 'box-breathing':
      return <BoxBreathingShape duration={cycleDuration} className={className} />;
    case '4-7-8':
      return <WaveBreathingShape pattern={pattern} className={className} />;
    case 'diaphragmatic':
      return <CircleBreathingShape pattern={pattern} className={className} />;
    case 'nadi-shodhana':
      return <InfinityBreathingShape duration={cycleDuration} className={className} />;
    default:
      return <CircleBreathingShape pattern={pattern} className={className} />;
  }
}

// Box Breathing - Pulsating square that draws itself
function BoxBreathingShape({ duration, className }: { duration: number; className?: string }) {
  return (
    <div className={cn("relative w-20 h-20", className)}>
      <div
        className="absolute inset-0 rounded-sm border-2 border-primary/40 animate-box-pulse"
        style={{ animationDuration: `${duration}s` }}
      />
      <div
        className="absolute inset-2 rounded-sm border border-primary/20 animate-box-pulse"
        style={{ animationDuration: `${duration}s`, animationDelay: '0.5s' }}
      />
    </div>
  );
}

// 4-7-8 - Wave pattern representing the long exhale
function WaveBreathingShape({ pattern, className }: { pattern: BreathingPattern; className?: string }) {
  const cycleDuration = pattern.inhale + pattern.holdIn + pattern.exhale + pattern.holdOut;
  
  return (
    <div className={cn("relative w-24 h-16", className)}>
      <svg
        viewBox="0 0 100 50"
        className="w-full h-full"
        style={{ animationDuration: `${cycleDuration}s` }}
      >
        <path
          d="M0,25 Q15,25 25,15 T50,25 T75,35 T100,25"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeOpacity="0.4"
          className="animate-wave-flow"
          style={{ animationDuration: `${cycleDuration}s` }}
        />
        <path
          d="M0,25 Q15,25 25,20 T50,25 T75,30 T100,25"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          strokeOpacity="0.2"
          className="animate-wave-flow"
          style={{ animationDuration: `${cycleDuration}s`, animationDelay: '0.3s' }}
        />
      </svg>
    </div>
  );
}

// Diaphragmatic - Organic expanding/contracting circle
function CircleBreathingShape({ pattern, className }: { pattern: BreathingPattern; className?: string }) {
  const cycleDuration = pattern.inhale + pattern.holdIn + pattern.exhale + pattern.holdOut;
  
  return (
    <div className={cn("relative w-20 h-20 flex items-center justify-center", className)}>
      <div
        className="absolute w-16 h-16 rounded-full bg-primary/10 animate-circle-breathe"
        style={{ animationDuration: `${cycleDuration}s` }}
      />
      <div
        className="absolute w-12 h-12 rounded-full bg-primary/15 animate-circle-breathe"
        style={{ animationDuration: `${cycleDuration}s`, animationDelay: '0.2s' }}
      />
      <div
        className="absolute w-8 h-8 rounded-full bg-primary/20 animate-circle-breathe"
        style={{ animationDuration: `${cycleDuration}s`, animationDelay: '0.4s' }}
      />
    </div>
  );
}

// Nadi Shodhana - Infinity symbol representing alternating breath
function InfinityBreathingShape({ duration, className }: { duration: number; className?: string }) {
  return (
    <div className={cn("relative w-24 h-16", className)}>
      <svg viewBox="0 0 100 50" className="w-full h-full">
        {/* Infinity path */}
        <path
          d="M50,25 C50,10 30,10 20,25 C10,40 30,40 50,25 C70,10 90,10 80,25 C70,40 90,40 50,25"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeOpacity="0.3"
          className="animate-infinity-trace"
          style={{ 
            animationDuration: `${duration}s`,
            strokeDasharray: '200',
            strokeDashoffset: '200'
          }}
        />
        {/* Glow effect */}
        <circle
          r="3"
          fill="hsl(var(--primary))"
          fillOpacity="0.6"
          className="animate-infinity-dot"
          style={{ animationDuration: `${duration}s` }}
        >
          <animateMotion
            dur={`${duration}s`}
            repeatCount="indefinite"
            path="M50,25 C50,10 30,10 20,25 C10,40 30,40 50,25 C70,10 90,10 80,25 C70,40 90,40 50,25"
          />
        </circle>
      </svg>
    </div>
  );
}
