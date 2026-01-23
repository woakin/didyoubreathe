import { useCallback, useRef, useEffect } from 'react';
import { BreathPhase } from '@/types/breathing';

interface UseHapticFeedbackProps {
  enabled?: boolean;
}

export function useHapticFeedback({ enabled = true }: UseHapticFeedbackProps = {}) {
  const lastPhaseRef = useRef<BreathPhase>('idle');
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

  // Trigger haptic on phase change
  const onPhaseChange = useCallback((newPhase: BreathPhase) => {
    if (!enabled || !isSupported) return;
    if (newPhase === lastPhaseRef.current) return;

    const prevPhase = lastPhaseRef.current;
    lastPhaseRef.current = newPhase;

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
  }, [enabled, isSupported, vibrate, patterns]);

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
    if (isSupported) {
      navigator.vibrate(0);
    }
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        navigator.vibrate(0);
      }
    };
  }, [isSupported]);

  return {
    isSupported,
    onPhaseChange,
    triggerButtonPress,
    triggerTick,
    triggerCustom,
    stop,
  };
}
