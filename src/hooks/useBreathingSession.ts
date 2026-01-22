import { useState, useCallback, useRef, useEffect } from 'react';
import { BreathingPattern, BreathPhase, SessionState } from '@/types/breathing';

interface UseBreathingSessionProps {
  pattern: BreathingPattern;
  preparationTime?: number;
  onComplete?: () => void;
}

export function useBreathingSession({ pattern, preparationTime = 0, onComplete }: UseBreathingSessionProps) {
  const calculateTotalTime = useCallback((p: BreathingPattern, prepTime: number): number => {
    const cycleTime = p.inhale + p.holdIn + p.exhale + p.holdOut;
    return prepTime + (cycleTime * p.cycles);
  }, []);

  const [state, setState] = useState<SessionState>({
    isActive: false,
    isPaused: false,
    currentPhase: 'inhale',
    currentCycle: 0,
    totalCycles: pattern.cycles,
    phaseTimeRemaining: pattern.inhale,
    totalTimeRemaining: calculateTotalTime(pattern, preparationTime),
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getNextPhase = useCallback((currentPhase: BreathPhase): BreathPhase => {
    switch (currentPhase) {
      case 'prepare':
        return 'inhale';
      case 'inhale':
        return pattern.holdIn > 0 ? 'holdIn' : 'exhale';
      case 'holdIn':
        return 'exhale';
      case 'exhale':
        return pattern.holdOut > 0 ? 'holdOut' : 'inhale';
      case 'holdOut':
        return 'inhale';
      default:
        return 'inhale';
    }
  }, [pattern]);

  const getPhaseDuration = useCallback((phase: BreathPhase): number => {
    switch (phase) {
      case 'prepare':
        return preparationTime;
      case 'inhale':
        return pattern.inhale;
      case 'holdIn':
        return pattern.holdIn;
      case 'exhale':
        return pattern.exhale;
      case 'holdOut':
        return pattern.holdOut;
      default:
        return 0;
    }
  }, [pattern, preparationTime]);

  const tick = useCallback(() => {
    setState((prev) => {
      if (prev.isPaused || !prev.isActive) return prev;

      const newPhaseTime = prev.phaseTimeRemaining - 1;
      const newTotalTime = prev.totalTimeRemaining - 1;

      // Session complete
      if (newTotalTime <= 0) {
        onComplete?.();
        return {
          ...prev,
          isActive: false,
          currentPhase: 'complete',
          phaseTimeRemaining: 0,
          totalTimeRemaining: 0,
        };
      }

      // Phase complete, move to next
      if (newPhaseTime <= 0) {
        const nextPhase = getNextPhase(prev.currentPhase);
        const isNewCycle = nextPhase === 'inhale' && prev.currentPhase !== 'inhale' && prev.currentPhase !== 'prepare';
        const isPrepToInhale = prev.currentPhase === 'prepare' && nextPhase === 'inhale';
        
        return {
          ...prev,
          currentPhase: nextPhase,
          currentCycle: isPrepToInhale ? 1 : (isNewCycle ? prev.currentCycle + 1 : prev.currentCycle),
          phaseTimeRemaining: getPhaseDuration(nextPhase),
          totalTimeRemaining: newTotalTime,
        };
      }

      return {
        ...prev,
        phaseTimeRemaining: newPhaseTime,
        totalTimeRemaining: newTotalTime,
      };
    });
  }, [getNextPhase, getPhaseDuration, onComplete]);

  useEffect(() => {
    if (state.isActive && !state.isPaused) {
      timerRef.current = setInterval(tick, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isActive, state.isPaused, tick]);

  const start = useCallback(() => {
    const hasPrep = preparationTime > 0;
    setState({
      isActive: true,
      isPaused: false,
      currentPhase: hasPrep ? 'prepare' : 'inhale',
      currentCycle: hasPrep ? 0 : 1,
      totalCycles: pattern.cycles,
      phaseTimeRemaining: hasPrep ? preparationTime : pattern.inhale,
      totalTimeRemaining: calculateTotalTime(pattern, preparationTime),
    });
  }, [pattern, preparationTime, calculateTotalTime]);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const stop = useCallback(() => {
    setState({
      isActive: false,
      isPaused: false,
      currentPhase: 'inhale',
      currentCycle: 0,
      totalCycles: pattern.cycles,
      phaseTimeRemaining: pattern.inhale,
      totalTimeRemaining: calculateTotalTime(pattern, preparationTime),
    });
  }, [pattern, preparationTime, calculateTotalTime]);

  return {
    state,
    start,
    pause,
    resume,
    stop,
  };
}
