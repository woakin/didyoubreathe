import { useCallback, useRef, useEffect } from 'react';
import { BreathPhase } from '@/types/breathing';

interface UseHapticFeedbackProps {
  enabled?: boolean;
}

export function useHapticFeedback({ enabled = true }: UseHapticFeedbackProps = {}) {
  const lastPhaseRef = useRef<BreathPhase>('idle');
  const continuousIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  // Haptic patterns for different events (duration in ms)
  const patterns = {
    // Gentle tap for phase transitions
    phaseStart: [15],
    // Soft double-tap for inhale start
    inhaleStart: [20, 50, 15],
    // Single medium tap for exhale start
    exhaleStart: [25],
    // Light pulse for hold
    holdStart: [10, 30, 10],
    // Success pattern for completion
    complete: [15, 50, 15, 50, 30],
    // Button press feedback
    buttonPress: [10],
    // Countdown tick
    tick: [5],
  };

  const vibrate = useCallback((pattern: number[]) => {
    if (!enabled || !isSupported) return;
    
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      // Silently fail - haptics are optional enhancement
      console.debug('Haptic feedback not available:', error);
    }
  }, [enabled, isSupported]);

  // Stop any continuous haptic pattern
  const stopContinuous = useCallback(() => {
    if (continuousIntervalRef.current) {
      clearInterval(continuousIntervalRef.current);
      continuousIntervalRef.current = null;
    }
  }, []);

  // Continuous haptic for inhale - growing intensity
  const startContinuousInhale = useCallback(() => {
    if (!enabled || !isSupported) return null;
    
    stopContinuous();
    
    // Progressive intensity: soft → stronger
    const intensities = [12, 18, 25, 32, 40];
    let index = 0;
    
    // Trigger first vibration immediately
    navigator.vibrate(intensities[0]);
    index++;
    
    const interval = setInterval(() => {
      if (index < intensities.length) {
        try {
          navigator.vibrate(intensities[index]);
        } catch (e) {
          // Silently fail
        }
        index++;
      } else {
        // Restart the pattern for longer inhales
        index = 0;
      }
    }, 700); // Every 700ms for ~4s inhale cycle
    
    continuousIntervalRef.current = interval;
    return interval;
  }, [enabled, isSupported, stopContinuous]);

  // Continuous haptic for exhale - decreasing intensity
  const startContinuousExhale = useCallback(() => {
    if (!enabled || !isSupported) return null;
    
    stopContinuous();
    
    // Decreasing intensity: stronger → soft
    const intensities = [38, 28, 20, 14, 8];
    let index = 0;
    
    // Trigger first vibration immediately
    navigator.vibrate(intensities[0]);
    index++;
    
    const interval = setInterval(() => {
      if (index < intensities.length) {
        try {
          navigator.vibrate(intensities[index]);
        } catch (e) {
          // Silently fail
        }
        index++;
      } else {
        // Restart for longer exhales
        index = 0;
      }
    }, 700);
    
    continuousIntervalRef.current = interval;
    return interval;
  }, [enabled, isSupported, stopContinuous]);

  // Trigger haptic on phase change
  const onPhaseChange = useCallback((newPhase: BreathPhase) => {
    if (!enabled || !isSupported) return;
    if (newPhase === lastPhaseRef.current) return;

    const prevPhase = lastPhaseRef.current;
    lastPhaseRef.current = newPhase;

    // Stop any continuous pattern from previous phase
    stopContinuous();

    switch (newPhase) {
      case 'inhale':
        vibrate(patterns.inhaleStart);
        break;
      case 'exhale':
        vibrate(patterns.exhaleStart);
        break;
      case 'holdIn':
      case 'holdOut':
        vibrate(patterns.holdStart);
        break;
      case 'complete':
        vibrate(patterns.complete);
        break;
      case 'prepare':
        if (prevPhase === 'idle') {
          vibrate(patterns.phaseStart);
        }
        break;
    }
  }, [enabled, isSupported, vibrate, patterns, stopContinuous]);

  // Manual haptic triggers
  const triggerButtonPress = useCallback(() => {
    vibrate(patterns.buttonPress);
  }, [vibrate, patterns]);

  const triggerTick = useCallback(() => {
    vibrate(patterns.tick);
  }, [vibrate, patterns]);

  const triggerCustom = useCallback((pattern: number[]) => {
    vibrate(pattern);
  }, [vibrate]);

  // Stop any ongoing vibration
  const stop = useCallback(() => {
    stopContinuous();
    if (isSupported) {
      navigator.vibrate(0);
    }
  }, [isSupported, stopContinuous]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopContinuous();
      if (isSupported) {
        navigator.vibrate(0);
      }
    };
  }, [isSupported, stopContinuous]);

  return {
    isSupported,
    onPhaseChange,
    triggerButtonPress,
    triggerTick,
    triggerCustom,
    startContinuousInhale,
    startContinuousExhale,
    stopContinuous,
    stop,
  };
}
