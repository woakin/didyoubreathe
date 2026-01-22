import { cn } from '@/lib/utils';

interface BreathingOrbProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

export function BreathingOrb({ size = 'md', className, animated = true }: BreathingOrbProps) {
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-32 w-32',
    lg: 'h-48 w-48',
  };

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-primary/40 via-breath-glow/30 to-accent/40',
        'shadow-lg',
        sizeClasses[size],
        animated && 'animate-breathe-pulse',
        className
      )}
    >
      <div className="h-full w-full rounded-full bg-gradient-to-tl from-transparent via-white/10 to-white/20" />
    </div>
  );
}
