import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AudioTimestamps } from '@/types/breathing';

interface UseVoiceGuideV2Props {
  techniqueId: string;
  enabled: boolean;
  voiceId?: string;
}

const VOICE_STORAGE_KEY = 'breathe-voice-preference';
const DEFAULT_VOICE_ID = 'spPXlKT5a4JMfbhPRAzA'; // Camila

const getSelectedVoice = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(VOICE_STORAGE_KEY) || DEFAULT_VOICE_ID;
  }
  return DEFAULT_VOICE_ID;
};

export function useVoiceGuideV2({ techniqueId, enabled, voiceId }: UseVoiceGuideV2Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timestamps, setTimestamps] = useState<AudioTimestamps | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasUserInteracted = useRef(false);
  const prevVoiceIdRef = useRef(voiceId);

  // Reset state when voiceId changes to force reload
  useEffect(() => {
    if (prevVoiceIdRef.current !== voiceId) {
      prevVoiceIdRef.current = voiceId;
      
      // Stop current audio if exists
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      // Reset states to trigger reload
      setIsReady(false);
      setAudioElement(null);
      setTimestamps(null);
    }
  }, [voiceId]);

  const markUserInteraction = useCallback(() => {
    hasUserInteracted.current = true;
  }, []);

  // State to track if we should use timer mode (audio found but no timestamps)
  const [useTimerMode, setUseTimerMode] = useState(false);

  // Fetch audio and timestamps from storage-only endpoint (NEVER generates audio)
  const preloadAudio = useCallback(async (): Promise<boolean> => {
    if (!enabled || !techniqueId) return false;

    setIsLoading(true);
    setError(null);
    setUseTimerMode(false);

    try {
      const effectiveVoiceId = voiceId || getSelectedVoice();

      // Call the storage-only endpoint (no ElevenLabs API calls)
      const response = await supabase.functions.invoke('fetch-cached-audio', {
        body: { techniqueId, voiceId: effectiveVoiceId },
      });

      if (response.error) {
        console.error('Error fetching cached audio:', response.error);
        setError('Guía de voz no disponible');
        return false;
      }

      const { found, audioUrl, timestamps: timestampsData, useTimerMode: shouldUseTimer } = response.data;

      // Audio not pre-generated for this combination
      if (!found) {
        console.log(`[useVoiceGuideV2] Audio not cached for ${techniqueId}/${effectiveVoiceId}`);
        setError('Guía de voz no disponible para esta combinación');
        return false;
      }

      // Audio found - preload it
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.preload = 'auto';

        await new Promise<void>((resolve, reject) => {
          audio.oncanplaythrough = () => resolve();
          audio.onerror = () => reject(new Error('Failed to load audio'));
          audio.load();
        });

        audioRef.current = audio;
        setAudioElement(audio);
        
        // Set timestamps if available
        if (timestampsData && !shouldUseTimer) {
          setTimestamps(timestampsData);
        } else {
          setTimestamps(null);
          setUseTimerMode(true); // Signal to use timer-based visualization
        }
        
        setIsReady(true);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error preloading audio:', err);
      setError('Guía de voz no disponible');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [enabled, techniqueId, voiceId]);

  const play = useCallback(() => {
    if (!enabled || !hasUserInteracted.current || !audioRef.current) return;

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((err) => {
      console.warn('Audio playback failed:', err);
    });
  }, [enabled]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (!enabled || !hasUserInteracted.current || !audioRef.current) return;

    audioRef.current.play().catch((err) => {
      console.warn('Audio playback failed:', err);
    });
  }, [enabled]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return {
    isLoading,
    isReady,
    error,
    timestamps,
    audioElement,
    useTimerMode,
    preloadAudio,
    play,
    pause,
    resume,
    stop,
    markUserInteraction,
  };
}
