import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { BreathingCircle } from '@/components/BreathingCircle';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTechniqueById } from '@/data/techniques';
import { useVoiceGuideV2 } from '@/hooks/useVoiceGuideV2';
import { useAudioDrivenSession } from '@/hooks/useAudioDrivenSession';
import { useBreathingSession } from '@/hooks/useBreathingSession';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Play, Pause, Square, RotateCcw, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const VOICE_STORAGE_KEY = 'breathe-voice-preference';
const DEFAULT_VOICE_ID = 'spPXlKT5a4JMfbhPRAzA';

const availableVoices = [
  { id: 'spPXlKT5a4JMfbhPRAzA', name: 'Camila' },
  { id: 'rixsIpPlTphvsJd2mI03', name: 'Isabel' },
];

export default function BreatheV2() {
  const { techniqueId } = useParams<{ techniqueId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(VOICE_STORAGE_KEY) || DEFAULT_VOICE_ID;
    }
    return DEFAULT_VOICE_ID;
  });

  const handleVoiceChange = useCallback((voiceId: string) => {
    setSelectedVoice(voiceId);
    localStorage.setItem(VOICE_STORAGE_KEY, voiceId);
  }, []);

  const technique = useMemo(() => {
    return getTechniqueById(techniqueId || '');
  }, [techniqueId]);

  // Voice guide with timestamps
  const voiceGuide = useVoiceGuideV2({
    techniqueId: techniqueId || '',
    enabled: voiceEnabled,
    voiceId: selectedVoice,
  });

  // Audio-driven session (when voice is enabled)
  const audioDrivenSession = useAudioDrivenSession({
    timestamps: voiceGuide.timestamps,
    audioElement: voiceGuide.audioElement,
    enabled: voiceEnabled && voiceGuide.isReady,
    onComplete: useCallback(async () => {
      if (!user || !technique || !voiceGuide.timestamps) return;

      const duration = Math.round(voiceGuide.timestamps.totalDuration);

      try {
        await supabase.from('breathing_sessions').insert({
          user_id: user.id,
          technique: technique.id,
          duration_seconds: duration,
        });

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
    }, [user, technique, voiceGuide.timestamps]),
  });

  // Fallback timer-driven session (when voice is disabled)
  const timerSession = useBreathingSession({
    pattern: technique?.pattern || { inhale: 4, holdIn: 0, exhale: 4, holdOut: 0, cycles: 1 },
    preparationTime: 0,
    onComplete: useCallback(async () => {
      if (!user || !technique) return;

      const p = technique.pattern;
      const duration = (p.inhale + p.holdIn + p.exhale + p.holdOut) * p.cycles;

      try {
        await supabase.from('breathing_sessions').insert({
          user_id: user.id,
          technique: technique.id,
          duration_seconds: duration,
        });
        toast.success('Sesión completada. ¡Bien hecho!');
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }, [user, technique]),
  });

  // Determine which session to use
  const isAudioDriven = voiceEnabled && voiceGuide.isReady;
  const sessionState = isAudioDriven ? audioDrivenSession.state : timerSession.state;

  // Preload audio when component mounts or voice changes
  useEffect(() => {
    if (voiceEnabled && !voiceGuide.isReady && !voiceGuide.isLoading) {
      voiceGuide.preloadAudio();
    }
  }, [voiceEnabled, techniqueId, selectedVoice, voiceGuide.isReady, voiceGuide.isLoading]);

  // Stop voice when navigating away
  useEffect(() => {
    return () => {
      voiceGuide.stop();
    };
  }, []);

  const handleStart = useCallback(async () => {
    voiceGuide.markUserInteraction();

    if (voiceEnabled) {
      if (!voiceGuide.isReady && !voiceGuide.isLoading) {
        toast.loading('Preparando guía de voz...', { id: 'voice-loading' });
        const loaded = await voiceGuide.preloadAudio();
        toast.dismiss('voice-loading');

        if (loaded) {
          voiceGuide.play();
        } else {
          // Fallback to timer mode
          timerSession.start();
        }
      } else if (voiceGuide.isReady) {
        voiceGuide.play();
      }
    } else {
      timerSession.start();
    }
  }, [voiceGuide, voiceEnabled, timerSession]);

  const handlePause = useCallback(() => {
    if (isAudioDriven) {
      voiceGuide.pause();
    } else {
      timerSession.pause();
    }
  }, [isAudioDriven, voiceGuide, timerSession]);

  const handleResume = useCallback(() => {
    if (isAudioDriven) {
      voiceGuide.resume();
    } else {
      timerSession.resume();
    }
  }, [isAudioDriven, voiceGuide, timerSession]);

  const handleStop = useCallback(() => {
    voiceGuide.stop();
    timerSession.stop();
    audioDrivenSession.reset();
  }, [voiceGuide, timerSession, audioDrivenSession]);

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

  const isActive = sessionState.isActive;
  const isPaused = sessionState.isPaused;
  const currentPhase = sessionState.currentPhase;

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
              {currentPhase === 'prepare' 
                ? 'Preparación...' 
                : isAudioDriven 
                  ? 'Sigue la guía de voz'
                  : `Ciclo ${timerSession.state.currentCycle} de ${timerSession.state.totalCycles}`}
            </p>
          </div>
          
          <div className="w-10" />
        </header>

        {/* Main breathing area */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-12">
          {isAudioDriven ? (
            <BreathingCircle
              phase={audioDrivenSession.state.currentPhase}
              phaseProgress={audioDrivenSession.state.progress}
              totalProgress={audioDrivenSession.state.totalProgress}
              isActive={audioDrivenSession.state.isActive}
              currentCount={audioDrivenSession.state.currentCount}
            />
          ) : (
            <BreathingCircle
              phase={timerSession.state.currentPhase}
              phaseTimeRemaining={timerSession.state.phaseTimeRemaining}
              phaseDuration={getPhaseDuration(timerSession.state.currentPhase)}
              totalTimeRemaining={timerSession.state.totalTimeRemaining}
              totalDuration={(technique.pattern.inhale + technique.pattern.holdIn + technique.pattern.exhale + technique.pattern.holdOut) * technique.pattern.cycles}
              isActive={timerSession.state.isActive}
            />
          )}

          {/* Pattern display */}
          {!isActive && (
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
        <div className="flex flex-col items-center gap-4 py-8 animate-fade-in">
          {/* Voice toggle + selector */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              disabled={isActive}
              className={cn(
                "h-9 w-9",
                voiceEnabled ? "text-primary" : "text-muted-foreground"
              )}
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            
            <Select
              value={selectedVoice}
              onValueChange={handleVoiceChange}
              disabled={isActive}
            >
              <SelectTrigger 
                className={cn(
                  "w-24 h-9 border-none bg-transparent text-sm focus:ring-0 focus:ring-offset-0",
                  !voiceEnabled && "opacity-50"
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableVoices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center gap-4">
            {!isActive ? (
              <Button
                size="lg"
                onClick={handleStart}
                disabled={voiceGuide.isLoading}
                className="w-40 h-14 text-lg"
              >
                {voiceGuide.isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Comenzar
                  </>
                )}
              </Button>
            ) : currentPhase === 'complete' ? (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleStart}
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
                  onClick={handleStop}
                  className="h-14 w-14"
                >
                  <Square className="h-5 w-5" />
                </Button>
                
                <Button
                  size="lg"
                  onClick={isPaused ? handleResume : handlePause}
                  className="w-40 h-14 text-lg"
                >
                  {isPaused ? (
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
        </div>
      </PageTransition>
    </MainLayout>
  );
}
