import { useState, useCallback, useRef, useEffect } from 'react';
import { BreathPhase, AudioTimestamps, AudioCue } from '@/types/breathing';

interface UseAudioDrivenSessionProps {
  timestamps: AudioTimestamps | null;
  audioElement: HTMLAudioElement | null;
  enabled: boolean;
  onComplete?: () => void;
}

interface AudioDrivenState {
  isActive: boolean;
  isPaused: boolean;
  currentPhase: BreathPhase;
  currentCount: number;
  progress: number; // 0-1 progress within current phase
  totalProgress: number; // 0-1 overall progress
}

export function useAudioDrivenSession({
  timestamps,
  audioElement,
  enabled,
  onComplete,
}: UseAudioDrivenSessionProps) {
  const [state, setState] = useState<AudioDrivenState>({
    isActive: false,
    isPaused: false,
    currentPhase: 'idle',
    currentCount: 0,
    progress: 0,
    totalProgress: 0,
  });

  const animationFrameRef = useRef<number | null>(null);
  const lastPhaseRef = useRef<BreathPhase>('idle');
  const timestampsRef = useRef(timestamps);
  const audioElementRef = useRef(audioElement);

  // Keep refs in sync with props to avoid stale closures
  useEffect(() => {
    timestampsRef.current = timestamps;
  }, [timestamps]);

  useEffect(() => {
    audioElementRef.current = audioElement;
  }, [audioElement]);

  // Find current cue based on audio time
  const findCurrentCue = useCallback((currentTime: number, cues: AudioCue[]): AudioCue | null => {
    if (!cues.length) return null;

    // Find the last cue that has started
    for (let i = cues.length - 1; i >= 0; i--) {
      if (currentTime >= cues[i].time) {
        return cues[i];
      }
    }
    return null;
  }, []);

  // Find next cue
  const findNextCue = useCallback((currentTime: number, cues: AudioCue[]): AudioCue | null => {
    if (!cues.length) return null;

    return cues.find(cue => cue.time > currentTime) || null;
  }, []);

  // Update state based on audio time - uses refs to avoid stale closures
  const updateFromAudioTime = useCallback(() => {
    const audio = audioElementRef.current;
    const ts = timestampsRef.current;
    
    if (!audio || !ts || !enabled) return;

    const currentTime = audio.currentTime;
    const totalDuration = ts.totalDuration;

    // Check if complete
    if (currentTime >= totalDuration - 0.1) {
      setState(prev => ({
        ...prev,
        isActive: false,
        currentPhase: 'complete',
        progress: 1,
        totalProgress: 1,
      }));
      onComplete?.();
      return;
    }

    const currentCue = findCurrentCue(currentTime, ts.cues);
    const nextCue = findNextCue(currentTime, ts.cues);

    if (currentCue) {
      const phase = currentCue.phase || 'prepare';
      
      // Calculate progress within current phase segment
      let phaseProgress = 0;
      if (nextCue) {
        const phaseDuration = nextCue.time - currentCue.time;
        phaseProgress = (currentTime - currentCue.time) / phaseDuration;
      }

      setState(prev => ({
        ...prev,
        isActive: true,
        currentPhase: phase,
        currentCount: currentCue.count || 0,
        progress: Math.min(phaseProgress, 1),
        totalProgress: currentTime / totalDuration,
      }));

      lastPhaseRef.current = phase;
    }

    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(updateFromAudioTime);
  }, [enabled, findCurrentCue, findNextCue, onComplete]);

  // Start animation loop when audio plays
  useEffect(() => {
    if (!audioElement || !enabled) return;

    const handlePlay = () => {
      setState(prev => ({ ...prev, isActive: true, isPaused: false }));
      animationFrameRef.current = requestAnimationFrame(updateFromAudioTime);
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, isPaused: true }));
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    const handleEnded = () => {
      setState(prev => ({
        ...prev,
        isActive: false,
        currentPhase: 'complete',
        progress: 1,
        totalProgress: 1,
      }));
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      onComplete?.();
    };

    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('ended', handleEnded);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioElement, enabled, updateFromAudioTime, onComplete]);

  // Reset state
  const reset = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setState({
      isActive: false,
      isPaused: false,
      currentPhase: 'idle',
      currentCount: 0,
      progress: 0,
      totalProgress: 0,
    });
    lastPhaseRef.current = 'idle';
  }, []);

  return {
    state,
    reset,
  };
}
