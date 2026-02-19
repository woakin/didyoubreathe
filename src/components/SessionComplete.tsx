import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n';
import { CheckCircle, Clock, Calendar, Flame, RotateCcw, BookmarkPlus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionCompleteProps {
  sessionDuration: number; // seconds
  todayTotalMinutes: number;
  currentStreak: number;
  todaySessions?: number;
  isAnonymous?: boolean;
  onRepeat: () => void;
  onContinue: () => void;
  onCreateAccount?: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

function ConfettiBurst() {
  const particles = useMemo(() => 
    [...Array(40)].map((_, i) => ({
      id: i,
      left: `${50 + (Math.random() - 0.5) * 60}%`,
      color: i % 5 === 0 ? 'bg-primary' 
           : i % 5 === 1 ? 'bg-accent' 
           : i % 5 === 2 ? 'bg-destructive/70'
           : i % 5 === 3 ? 'bg-breath-inhale'
           : 'bg-breath-exhale',
      size: i % 3 === 0 ? 'w-2 h-2' : i % 3 === 1 ? 'w-1.5 h-1.5' : 'w-1 h-1',
      shape: i % 4 === 0 ? 'rounded-full' : 'rounded-sm',
      delay: `${Math.random() * 0.5}s`,
      angle: (Math.random() - 0.5) * 200,
      distance: 100 + Math.random() * 300,
    })),
  []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className={cn("absolute opacity-0", p.color, p.size, p.shape)}
          style={{
            left: p.left,
            top: '40%',
            animationDelay: p.delay,
            animation: `confetti-burst 1.5s ease-out ${p.delay} forwards`,
            ['--confetti-x' as string]: `${p.angle}px`,
            ['--confetti-y' as string]: `-${p.distance}px`,
          }}
        />
      ))}
    </div>
  );
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

function DailyProgressBar({ completed, goal }: { completed: number; goal: number }) {
  const { t } = useLanguage();
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const percentage = Math.min((completed / goal) * 100, 100);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(percentage), 600);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="w-full space-y-2 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-primary font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          {(t.sessionComplete?.dailyProgress || '{completed} of {goal} daily breaths')
            .replace('{completed}', String(completed))
            .replace('{goal}', String(goal))}
        </span>
        <span className="text-muted-foreground">{Math.round(percentage)}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
          style={{ width: `${animatedWidth}%` }}
        />
      </div>
      {completed >= goal && (
        <p className="text-xs text-primary font-medium animate-fade-in">
          {t.sessionComplete?.dailyGoalReached || '🎉 Daily goal reached!'}
        </p>
      )}
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
  todaySessions = 1,
  isAnonymous = false,
  onRepeat,
  onContinue,
  onCreateAccount,
}: SessionCompleteProps) {
  const { t } = useLanguage();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const dailyGoal = 3;
  const sessionsCompleted = isAnonymous ? 1 : Math.min(todaySessions, dailyGoal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl animate-fade-in">
      <ConfettiBurst />
      <FloatingParticles />
      
      <div 
        className={cn(
          "relative z-10 text-center space-y-6 px-8 py-10 rounded-3xl bg-card/60 backdrop-blur-sm border border-border/50 shadow-2xl max-w-sm mx-4 transition-all duration-700",
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
          {!isAnonymous && (
            <StatItem 
              icon={<Calendar className="h-5 w-5" />} 
              value={`${todayTotalMinutes}m`} 
              label={t.sessionComplete?.today || 'Today'} 
            />
          )}
        </div>

        {/* Endowed progress bar */}
        <DailyProgressBar completed={sessionsCompleted} goal={dailyGoal} />
        
        {/* Streak callout (logged-in only) */}
        {!isAnonymous && currentStreak > 1 && (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/30 border border-accent/20 animate-float-in">
            <Flame className="h-5 w-5 text-destructive" />
            <span className="font-medium text-foreground">
              {(t.sessionComplete?.streakCelebration || '{count} day streak!')
                .replace('{count}', String(currentStreak))}
            </span>
          </div>
        )}

        {/* Anonymous signup prompt */}
        {isAnonymous && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3 animate-float-in">
            <div className="flex items-center justify-center gap-2 text-primary">
              <BookmarkPlus className="h-5 w-5" />
              <span className="font-semibold text-sm">
                {t.sessionComplete?.saveProgress || 'Save your calm'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.sessionComplete?.saveProgressDescription || 'Create a free account to track your streaks and breathing history'}
            </p>
            <Button
              size="sm"
              onClick={onCreateAccount}
              className="w-full shadow-md"
            >
              {t.sessionComplete?.createAccount || 'Create Account'}
            </Button>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-4 justify-center pt-2">
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

        {/* Maybe later link for anonymous */}
        {isAnonymous && (
          <button
            onClick={onContinue}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.sessionComplete?.maybeLater || 'Maybe later'}
          </button>
        )}
      </div>
    </div>
  );
}
