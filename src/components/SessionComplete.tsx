import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n';
import { CheckCircle, Clock, Calendar, Flame, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionCompleteProps {
  sessionDuration: number; // seconds
  todayTotalMinutes: number;
  currentStreak: number;
  onRepeat: () => void;
  onContinue: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(24)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "absolute rounded-full animate-float-particle",
            i % 3 === 0 ? "w-2 h-2 bg-primary/40" : 
            i % 3 === 1 ? "w-1.5 h-1.5 bg-accent/50" : 
            "w-1 h-1 bg-breath-glow/30"
          )}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

function StatItem({ 
  icon, 
  value, 
  label 
}: { 
  icon: React.ReactNode; 
  value: string; 
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-primary/70">{icon}</div>
      <span className="text-xl font-semibold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function SessionComplete({
  sessionDuration,
  todayTotalMinutes,
  currentStreak,
  onRepeat,
  onContinue,
}: SessionCompleteProps) {
  const { t } = useLanguage();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Stagger the content reveal
    const timer = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl animate-fade-in">
      {/* Floating particles celebration */}
      <FloatingParticles />
      
      <div 
        className={cn(
          "relative z-10 text-center space-y-8 px-8 py-10 rounded-3xl bg-card/60 backdrop-blur-sm border border-border/50 shadow-2xl max-w-sm mx-4 transition-all duration-700",
          showContent 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 translate-y-8 scale-95"
        )}
      >
        {/* Animated checkmark */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-scale-in">
            <CheckCircle className="h-14 w-14 text-primary" />
          </div>
          {/* Glow ring */}
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-primary/10 animate-ping-slow" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            {t.sessionComplete?.title || 'Session Complete'}
          </h2>
          <p className="text-muted-foreground">
            {t.sessionComplete?.wellDone || 'Well done!'}
          </p>
        </div>
        
        {/* Stats summary */}
        <div className="flex justify-center gap-10 pt-2">
          <StatItem 
            icon={<Clock className="h-5 w-5" />} 
            value={formatDuration(sessionDuration)} 
            label={t.sessionComplete?.thisSession || 'This session'} 
          />
          <StatItem 
            icon={<Calendar className="h-5 w-5" />} 
            value={`${todayTotalMinutes}m`} 
            label={t.sessionComplete?.today || 'Today'} 
          />
        </div>
        
        {/* Streak callout (if active) */}
        {currentStreak > 1 && (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/30 border border-accent/20 animate-float-in">
            <Flame className="h-5 w-5 text-destructive" />
            <span className="font-medium text-foreground">
              {(t.sessionComplete?.streakCelebration || '{count} day streak!')
                .replace('{count}', String(currentStreak))}
            </span>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-4 justify-center pt-4">
          <Button 
            variant="outline" 
            size="lg"
            onClick={onRepeat}
            className="h-12 px-6 bg-background/80 backdrop-blur-sm"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> 
            {t.breathe.repeat}
          </Button>
          <Button 
            size="lg"
            onClick={onContinue}
            className="h-12 px-6 shadow-lg"
          >
            {t.common.continue}
          </Button>
        </div>
      </div>
    </div>
  );
}
