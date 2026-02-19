import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { BreathingBlob } from '@/components/BreathingBlob';
import { DynamicMeshBackground } from '@/components/DynamicMeshBackground';
import { SessionComplete } from '@/components/SessionComplete';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { getTechniqueById } from '@/data/techniques';
import { getVoicesForLanguage, getDefaultVoiceForLanguage } from '@/data/voicesByLanguage';
import { useVoiceGuideV2 } from '@/hooks/useVoiceGuideV2';
import { useAudioDrivenSession } from '@/hooks/useAudioDrivenSession';
import { useBreathingSession } from '@/hooks/useBreathingSession';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useAmbientSounds, AmbientSoundType } from '@/hooks/useAmbientSounds';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/i18n';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Play, Pause, Square, RotateCcw, Volume2, VolumeX, Sparkles, CloudRain, Trees, Waves, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const VOICE_STORAGE_KEY = 'breathe-voice-preference';
const INCOMPLETE_SESSION_KEY = 'breathe-incomplete-session';

export default function BreatheV2() {
  const { techniqueId } = useParams<{ techniqueId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const lastPhaseRef = useRef<string>('idle');
  const hapticIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Session stats for completion screen
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    todayMinutes: 0,
    streak: 0,
    todaySessions: 0,
  });
  const [showComplete, setShowComplete] = useState(false);
  
  // Zen Mode state
  const [zenMode, setZenMode] = useState(false);
  const [zenButtonVisible, setZenButtonVisible] = useState(true);
  const zenButtonTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ambientSounds = useAmbientSounds(0.3);
  const availableVoices = getVoicesForLanguage(language);
  const defaultVoice = getDefaultVoiceForLanguage(language);
  
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(VOICE_STORAGE_KEY);
      const validIds = availableVoices.map(v => v.id);
      if (saved && validIds.includes(saved)) {
        return saved;
      }
    }
    return defaultVoice;
  });

  // Haptic feedback hook
  const haptics = useHapticFeedback({ enabled: true });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update voice when language changes
  useEffect(() => {
    const saved = localStorage.getItem(VOICE_STORAGE_KEY);
    const validIds = availableVoices.map(v => v.id);
    if (!saved || !validIds.includes(saved)) {
      setSelectedVoice(defaultVoice);
      localStorage.setItem(VOICE_STORAGE_KEY, defaultVoice);
    }
  }, [language, availableVoices, defaultVoice]);

  const handleVoiceChange = useCallback((voiceId: string) => {
    setSelectedVoice(voiceId);
    localStorage.setItem(VOICE_STORAGE_KEY, voiceId);
  }, []);

  // Read custom cycles from navigation state (IKEA Effect)
  const customCycles = (location.state as any)?.customCycles as number | undefined;

  const technique = useMemo(() => {
    const base = getTechniqueById(techniqueId || '', language);
    if (base && customCycles) {
      return {
        ...base,
        pattern: { ...base.pattern, cycles: customCycles },
      };
    }
    return base;
  }, [techniqueId, language, customCycles]);

  // Voice guide with timestamps
  const voiceGuide = useVoiceGuideV2({
    techniqueId: techniqueId || '',
    enabled: voiceEnabled,
    voiceId: selectedVoice,
  });

  // Fetch today's total minutes helper
  const fetchTodayStats = useCallback(async () => {
    if (!user) return { todayMinutes: 0, streak: 0, todaySessions: 0 };
    
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = `${today}T00:00:00`;
    const endOfDay = `${today}T23:59:59`;
    
    const [sessionsResult, streakResult] = await Promise.all([
      supabase
        .from('breathing_sessions')
        .select('duration_seconds')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay),
      supabase
        .from('daily_streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .maybeSingle(),
    ]);
    
    const totalSeconds = sessionsResult.data?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0;
    return {
      todayMinutes: Math.round(totalSeconds / 60),
      streak: streakResult.data?.current_streak || 0,
      todaySessions: sessionsResult.data?.length || 0,
    };
  }, [user]);

  // Audio-driven session (when voice is enabled)
  const audioDrivenSession = useAudioDrivenSession({
    timestamps: voiceGuide.timestamps,
    audioElement: voiceGuide.audioElement,
    enabled: voiceEnabled && voiceGuide.isReady,
    onComplete: useCallback(async () => {
      if (!technique) return;
      // Zeigarnik: clear incomplete session
      localStorage.removeItem(INCOMPLETE_SESSION_KEY);

      const duration = voiceGuide.timestamps 
        ? Math.round(voiceGuide.timestamps.totalDuration) 
        : 0;

      if (!user) {
        setSessionStats({ duration, todayMinutes: 0, streak: 0, todaySessions: 1 });
        setShowComplete(true);
        return;
      }

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

        let newStreak = 1;
        if (streakData) {
          const lastSessionDate = streakData.last_session_date;
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

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
        }

        const stats = await fetchTodayStats();
        setSessionStats({
          duration,
          todayMinutes: stats.todayMinutes,
          streak: newStreak,
          todaySessions: stats.todaySessions,
        });
        setShowComplete(true);
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }, [user, technique, voiceGuide.timestamps, fetchTodayStats]),
  });

  // Fallback timer-driven session (when voice is disabled)
  const timerSession = useBreathingSession({
    pattern: technique?.pattern || { inhale: 4, holdIn: 0, exhale: 4, holdOut: 0, cycles: 1 },
    preparationTime: 0,
    onComplete: useCallback(async () => {
      if (!technique) return;
      // Zeigarnik: clear incomplete session
      localStorage.removeItem(INCOMPLETE_SESSION_KEY);

      const p = technique.pattern;
      const duration = (p.inhale + p.holdIn + p.exhale + p.holdOut) * p.cycles;

      if (!user) {
        setSessionStats({ duration, todayMinutes: 0, streak: 0, todaySessions: 1 });
        setShowComplete(true);
        return;
      }

      try {
        await supabase.from('breathing_sessions').insert({
          user_id: user.id,
          technique: technique.id,
          duration_seconds: duration,
        });
        
        const stats = await fetchTodayStats();
        setSessionStats({
          duration,
          todayMinutes: stats.todayMinutes,
          streak: stats.streak,
          todaySessions: stats.todaySessions,
        });
        setShowComplete(true);
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }, [user, technique, fetchTodayStats]),
  });

  // Determine which session to use
  const isAudioDriven = voiceEnabled && voiceGuide.isReady && !voiceGuide.useTimerMode;
  const sessionState = isAudioDriven ? audioDrivenSession.state : timerSession.state;

  // Trigger haptic feedback on phase changes - includes continuous haptics
  useEffect(() => {
    const currentPhase = sessionState.currentPhase;
    const active = sessionState.isActive;
    const paused = sessionState.isPaused;
    
    if (currentPhase !== lastPhaseRef.current) {
      haptics.onPhaseChange(currentPhase);
      lastPhaseRef.current = currentPhase;
    }
    
    // Clear previous continuous haptic interval
    if (hapticIntervalRef.current) {
      clearInterval(hapticIntervalRef.current);
      hapticIntervalRef.current = null;
    }
    
    // Start continuous haptic for active breathing phases
    if (active && !paused) {
      if (currentPhase === 'inhale') {
        hapticIntervalRef.current = haptics.startContinuousInhale();
      } else if (currentPhase === 'exhale') {
        hapticIntervalRef.current = haptics.startContinuousExhale();
      }
    }
    
    return () => {
      if (hapticIntervalRef.current) {
        clearInterval(hapticIntervalRef.current);
        hapticIntervalRef.current = null;
      }
    };
  }, [sessionState.currentPhase, sessionState.isActive, sessionState.isPaused, haptics]);

  // Preload audio when component mounts or voice changes
  useEffect(() => {
    if (voiceEnabled && !voiceGuide.isReady && !voiceGuide.isLoading && !voiceGuide.hasFailed) {
      voiceGuide.preloadAudio();
    }
  }, [voiceEnabled, techniqueId, selectedVoice, voiceGuide.isReady, voiceGuide.isLoading, voiceGuide.hasFailed]);

  // Auto-fallback when voice fails to load
  useEffect(() => {
    if (voiceGuide.hasFailed && voiceEnabled && !sessionState.isActive) {
      toast.info(`${t.breathe.voiceUnavailable} — ${t.breathe.usingTimer}`);
    }
  }, [voiceGuide.hasFailed]);

  // Stop voice when navigating away
  useEffect(() => {
    return () => {
      voiceGuide.stop();
      haptics.stop();
      ambientSounds.fadeOut(500);
    };
  }, []);

  // Toggle Zen Mode
  const toggleZenMode = useCallback(() => {
    setZenMode(prev => {
      const next = !prev;
      if (next) {
        // Auto-hide the sparkles button after 3s
        setZenButtonVisible(true);
        zenButtonTimerRef.current = setTimeout(() => setZenButtonVisible(false), 3000);
      } else {
        if (zenButtonTimerRef.current) clearTimeout(zenButtonTimerRef.current);
        setZenButtonVisible(true);
      }
      return next;
    });
  }, []);

  // Show zen button on screen tap when hidden
  const handleScreenTap = useCallback(() => {
    if (zenMode && !zenButtonVisible) {
      setZenButtonVisible(true);
      if (zenButtonTimerRef.current) clearTimeout(zenButtonTimerRef.current);
      zenButtonTimerRef.current = setTimeout(() => setZenButtonVisible(false), 3000);
    }
  }, [zenMode, zenButtonVisible]);

  // Handle ambient sound selection
  const handleAmbientChange = useCallback((sound: Exclude<AmbientSoundType, 'none'>) => {
    if (ambientSounds.currentSound === sound) {
      ambientSounds.stop();
    } else {
      ambientSounds.play(sound);
    }
  }, [ambientSounds]);

  const handleStart = useCallback(async () => {
    haptics.triggerButtonPress();
    voiceGuide.markUserInteraction();

    // Zeigarnik: mark session as incomplete
    if (techniqueId) {
      localStorage.setItem(INCOMPLETE_SESSION_KEY, JSON.stringify({
        techniqueId,
        startedAt: Date.now(),
      }));
    }

    if (voiceEnabled) {
      // If voice has failed, fall back to timer silently
      if (voiceGuide.hasFailed) {
        timerSession.start();
        return;
      }

      if (!voiceGuide.isReady && !voiceGuide.isLoading) {
        toast.loading(t.breathe.loadingVoice, { id: 'voice-loading' });
        const loaded = await voiceGuide.preloadAudio();
        toast.dismiss('voice-loading');

        if (loaded) {
          if (voiceGuide.useTimerMode) {
            toast.info('Usando modo visual con audio');
            voiceGuide.play();
            timerSession.start();
          } else {
            voiceGuide.play();
          }
        } else {
          timerSession.start();
        }
      } else if (voiceGuide.isReady) {
        if (voiceGuide.useTimerMode) {
          voiceGuide.play();
          timerSession.start();
        } else {
          voiceGuide.play();
        }
      }
    } else {
      timerSession.start();
    }
  }, [voiceGuide, voiceEnabled, timerSession, t, haptics]);

  const handlePause = useCallback(() => {
    haptics.triggerButtonPress();
    if (isAudioDriven) {
      voiceGuide.pause();
    } else {
      timerSession.pause();
    }
  }, [isAudioDriven, voiceGuide, timerSession, haptics]);

  const handleResume = useCallback(() => {
    haptics.triggerButtonPress();
    if (isAudioDriven) {
      voiceGuide.resume();
    } else {
      timerSession.resume();
    }
  }, [isAudioDriven, voiceGuide, timerSession, haptics]);

  const handleStop = useCallback(() => {
    haptics.triggerButtonPress();
    voiceGuide.stop();
    timerSession.stop();
    audioDrivenSession.reset();
  }, [voiceGuide, timerSession, audioDrivenSession, haptics]);

  if (!technique) {
    return (
      <MainLayout withBottomNav={false}>
        <PageTransition className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">{t.breathe.techniqueNotFound}</p>
            <Button variant="link" onClick={() => navigate('/techniques')}>
              {t.breathe.backToTechniques}
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
  const isFullyImmersed = isActive && !isPaused && currentPhase !== 'complete';
  const showZenUI = zenMode && isActive && !isPaused;

  return (
    <>
      {/* Dynamic mesh gradient background */}
      <DynamicMeshBackground phase={currentPhase} isActive={isActive} />
      
      <MainLayout className="bg-transparent" withBottomNav={false}>
        <PageTransition className="flex flex-col min-h-screen px-6 py-8">
          {/* Zen Mode toggle - always visible during active session */}
          {isActive && !isPaused && currentPhase !== 'complete' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleZenMode}
                      className={cn(
                        "absolute top-4 right-4 z-20 bg-background/30 backdrop-blur-sm transition-all duration-500",
                        zenMode && "bg-primary/20 text-primary",
                        zenMode && !zenButtonVisible && "opacity-0 pointer-events-none"
                      )}
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {zenMode ? t.breathe.exitZen : t.breathe.zenMode}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

          {/* Header with glassmorphism - fades during active session or Zen Mode */}
          <header className={cn(
            "flex items-center justify-between mb-6 animate-fade-in",
            "transition-all duration-700 ease-in-out",
            (isFullyImmersed || showZenUI) && "opacity-0 pointer-events-none"
          )}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/techniques')}
              className="bg-background/50 backdrop-blur-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="text-center px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm">
              <h1 className="font-semibold text-foreground">{technique.name}</h1>
              <p className="text-xs text-muted-foreground">
                {currentPhase === 'prepare' 
                  ? t.breathe.preparation
                  : isAudioDriven 
                    ? t.breathe.followVoice
                    : t.breathe.cycleOf
                        .replace('{current}', String(timerSession.state.currentCycle))
                        .replace('{total}', String(timerSession.state.totalCycles))}
              </p>
            </div>
            
            <div className="w-10" />
          </header>

          <div className="flex-1 flex flex-col items-center justify-center -mt-12" onClick={handleScreenTap}>
            {isAudioDriven ? (
              <BreathingBlob
                phase={audioDrivenSession.state.currentPhase}
                phaseProgress={audioDrivenSession.state.progress}
                totalProgress={audioDrivenSession.state.totalProgress}
                isActive={audioDrivenSession.state.isActive}
                currentCount={audioDrivenSession.state.currentCount}
                hideText={showZenUI}
                hideRing={showZenUI}
              />
            ) : (
              <BreathingBlob
                phase={timerSession.state.currentPhase}
                phaseTimeRemaining={timerSession.state.phaseTimeRemaining}
                phaseDuration={getPhaseDuration(timerSession.state.currentPhase)}
                totalProgress={
                  timerSession.state.totalTimeRemaining !== undefined
                    ? 1 - timerSession.state.totalTimeRemaining / 
                      ((technique.pattern.inhale + technique.pattern.holdIn + 
                        technique.pattern.exhale + technique.pattern.holdOut) * technique.pattern.cycles)
                    : 0
                }
                isActive={timerSession.state.isActive}
                hideText={showZenUI}
                hideRing={showZenUI}
              />
            )}

            {/* Zen Mode ambient sound picker */}
            {showZenUI && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-background/30 backdrop-blur-md animate-fade-in">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAmbientChange('rain')}
                        className={cn(
                          "h-9 w-9 transition-colors",
                          ambientSounds.currentSound === 'rain' && "text-primary bg-primary/20"
                        )}
                      >
                        <CloudRain className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t.breathe.rain}</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAmbientChange('forest')}
                        className={cn(
                          "h-9 w-9 transition-colors",
                          ambientSounds.currentSound === 'forest' && "text-primary bg-primary/20"
                        )}
                      >
                        <Trees className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t.breathe.forest}</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAmbientChange('waves')}
                        className={cn(
                          "h-9 w-9 transition-colors",
                          ambientSounds.currentSound === 'waves' && "text-primary bg-primary/20"
                        )}
                      >
                        <Waves className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t.breathe.waves}</TooltipContent>
                  </Tooltip>

                  {ambientSounds.currentSound !== 'none' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => ambientSounds.stop()}
                          className="h-9 w-9 text-muted-foreground"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t.breathe.noAmbient}</TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>
              </div>
            )}

            {/* Pattern display with glassmorphism */}
            {!isActive && (
              <div className="mt-8 text-center animate-fade-in px-6 py-4 rounded-2xl bg-background/60 backdrop-blur-sm">
                <p className="text-sm text-muted-foreground mb-2">{t.breathe.pattern}</p>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <span className="text-breath-inhale">{technique.pattern.inhale}s {t.breathe.inhale}</span>
                  {technique.pattern.holdIn > 0 && (
                    <span className="text-breath-hold">• {technique.pattern.holdIn}s {t.breathe.hold}</span>
                  )}
                  <span className="text-breath-exhale">• {technique.pattern.exhale}s {t.breathe.exhale}</span>
                  {technique.pattern.holdOut > 0 && (
                    <span className="text-muted-foreground">• {technique.pattern.holdOut}s {t.breathe.pause}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Controls with glassmorphism - hide in Zen Mode */}
          <div className={cn(
            "flex flex-col items-center gap-6 py-8 pb-12 animate-fade-in transition-all duration-500",
            showZenUI && "opacity-0 pointer-events-none"
          )}>
            {/* Voice toggle + selector */}
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-background/50 backdrop-blur-sm min-h-[44px]">
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

              {/* Voice unavailable indicator */}
              {voiceEnabled && voiceGuide.hasFailed && (
                <span className="text-xs text-muted-foreground/70 ml-1">
                  {t.breathe.voiceUnavailable}
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-4">
              {!isActive ? (
                <Button
                  size="lg"
                  onClick={handleStart}
                  disabled={voiceGuide.isLoading}
                  className={cn(
                    "w-40 h-14 text-lg shadow-lg",
                    !voiceGuide.isLoading && "animate-button-breathe"
                  )}
                >
                  {voiceGuide.isLoading ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm">{t.breathe.findingGuide}</span>
                      <div className="w-24 h-1 rounded-full bg-primary-foreground/30 overflow-hidden">
                        <div className="h-full bg-primary-foreground/70 rounded-full animate-pulse-loading" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      {t.breathe.start}
                    </>
                  )}
                </Button>
              ) : currentPhase === 'complete' ? (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleStart}
                    className="h-14 bg-background/80 backdrop-blur-sm"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    {t.breathe.repeat}
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => navigate('/techniques')}
                    className="h-14 shadow-lg"
                  >
                    {t.common.continue}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleStop}
                    className="h-14 w-14 bg-background/80 backdrop-blur-sm"
                  >
                    <Square className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={isPaused ? handleResume : handlePause}
                    className="w-40 h-14 text-lg shadow-lg"
                  >
                    {isPaused ? (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        {t.breathe.resume}
                      </>
                    ) : (
                      <>
                        <Pause className="h-5 w-5 mr-2" />
                        {t.breathe.pauseBtn}
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </PageTransition>
      </MainLayout>
      
      {/* Celebration overlay */}
      {showComplete && (
        <SessionComplete
          sessionDuration={sessionStats.duration}
          todayTotalMinutes={sessionStats.todayMinutes}
          currentStreak={sessionStats.streak}
          todaySessions={sessionStats.todaySessions}
          isAnonymous={!user}
          onRepeat={() => {
            setShowComplete(false);
            handleStart();
          }}
          onContinue={() => {
            setShowComplete(false);
            navigate('/techniques');
          }}
          onCreateAccount={() => {
            setShowComplete(false);
            navigate('/auth');
          }}
        />
      )}
    </>
  );
}
