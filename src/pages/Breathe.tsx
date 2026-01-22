import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { BreathingCircle } from '@/components/BreathingCircle';
import { Button } from '@/components/ui/button';
import { getTechniqueById } from '@/data/techniques';
import { useBreathingSession } from '@/hooks/useBreathingSession';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Play, Pause, Square, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function Breathe() {
  const { techniqueId } = useParams<{ techniqueId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessionStartTime] = useState<Date | null>(null);

  const technique = useMemo(() => {
    return getTechniqueById(techniqueId || '');
  }, [techniqueId]);

  const calculateTotalTime = useCallback(() => {
    if (!technique) return 0;
    const p = technique.pattern;
    return (p.inhale + p.holdIn + p.exhale + p.holdOut) * p.cycles;
  }, [technique]);

  const handleSessionComplete = useCallback(async () => {
    if (!user || !technique) return;

    const duration = calculateTotalTime();

    try {
      // Save session
      await supabase.from('breathing_sessions').insert({
        user_id: user.id,
        technique: technique.id,
        duration_seconds: duration,
      });

      // Update streak
      const today = new Date().toISOString().split('T')[0];
      const { data: streakData } = await supabase
        .from('daily_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (streakData) {
        const lastSessionDate = streakData.last_session_date;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = 1;
        if (lastSessionDate === yesterdayStr) {
          newStreak = streakData.current_streak + 1;
        } else if (lastSessionDate === today) {
          newStreak = streakData.current_streak;
        }

        await supabase
          .from('daily_streaks')
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, streakData.longest_streak),
            last_session_date: today,
          })
          .eq('user_id', user.id);

        if (newStreak > streakData.current_streak) {
          toast.success(`🔥 ¡Racha de ${newStreak} días!`);
        }
      }

      toast.success('Sesión completada. ¡Bien hecho!');
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }, [user, technique, calculateTotalTime]);

  const { state, start, pause, resume, stop } = useBreathingSession({
    pattern: technique?.pattern || { inhale: 4, holdIn: 0, exhale: 4, holdOut: 0, cycles: 1 },
    onComplete: handleSessionComplete,
  });

  if (!technique) {
    return (
      <MainLayout>
        <PageTransition className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Técnica no encontrada</p>
            <Button variant="link" onClick={() => navigate('/techniques')}>
              Volver a técnicas
            </Button>
          </div>
        </PageTransition>
      </MainLayout>
    );
  }

  const getPhaseDuration = (phase: string) => {
    switch (phase) {
      case 'inhale':
        return technique.pattern.inhale;
      case 'holdIn':
        return technique.pattern.holdIn;
      case 'exhale':
        return technique.pattern.exhale;
      case 'holdOut':
        return technique.pattern.holdOut;
      default:
        return 1;
    }
  };

  const totalDuration = calculateTotalTime();

  return (
    <MainLayout>
      <PageTransition className="flex flex-col min-h-screen px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 animate-fade-in">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/techniques')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="text-center">
            <h1 className="font-semibold text-foreground">{technique.name}</h1>
            <p className="text-xs text-muted-foreground">
              Ciclo {state.currentCycle} de {state.totalCycles}
            </p>
          </div>
          
          <div className="w-10" /> {/* Spacer for alignment */}
        </header>

        {/* Main breathing area */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-12">
          <BreathingCircle
            phase={state.currentPhase}
            phaseTimeRemaining={state.phaseTimeRemaining}
            phaseDuration={getPhaseDuration(state.currentPhase)}
            totalTimeRemaining={state.totalTimeRemaining}
            totalDuration={totalDuration}
            isActive={state.isActive}
          />

          {/* Pattern display */}
          {!state.isActive && (
            <div className="mt-8 text-center animate-fade-in">
              <p className="text-sm text-muted-foreground mb-2">Patrón de respiración</p>
              <div className="flex items-center gap-2 text-foreground font-medium">
                <span className="text-breath-inhale">{technique.pattern.inhale}s inhala</span>
                {technique.pattern.holdIn > 0 && (
                  <span className="text-breath-hold">• {technique.pattern.holdIn}s mantén</span>
                )}
                <span className="text-breath-exhale">• {technique.pattern.exhale}s exhala</span>
                {technique.pattern.holdOut > 0 && (
                  <span className="text-muted-foreground">• {technique.pattern.holdOut}s pausa</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 py-8 animate-fade-in">
          {!state.isActive ? (
            <Button
              size="lg"
              onClick={start}
              className="w-40 h-14 text-lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Comenzar
            </Button>
          ) : state.currentPhase === 'complete' ? (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={start}
                className="h-14"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Repetir
              </Button>
              <Button
                size="lg"
                onClick={() => navigate('/techniques')}
                className="h-14"
              >
                Continuar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={stop}
                className="h-14 w-14"
              >
                <Square className="h-5 w-5" />
              </Button>
              
              <Button
                size="lg"
                onClick={state.isPaused ? resume : pause}
                className="w-40 h-14 text-lg"
              >
                {state.isPaused ? (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Continuar
                  </>
                ) : (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Pausar
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </PageTransition>
    </MainLayout>
  );
}
