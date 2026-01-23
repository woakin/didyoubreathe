import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AudioTimestamps } from '@/types/breathing';

interface UseVoiceGuideV2Props {
  techniqueId: string;
  enabled: boolean;
}

const VOICE_STORAGE_KEY = 'breathe-voice-preference';
const DEFAULT_VOICE_ID = 'spPXlKT5a4JMfbhPRAzA'; // Camila

const getSelectedVoice = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(VOICE_STORAGE_KEY) || DEFAULT_VOICE_ID;
  }
  return DEFAULT_VOICE_ID;
};

export function useVoiceGuideV2({ techniqueId, enabled }: UseVoiceGuideV2Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timestamps, setTimestamps] = useState<AudioTimestamps | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasUserInteracted = useRef(false);

  const markUserInteraction = useCallback(() => {
    hasUserInteracted.current = true;
  }, []);

  // Fetch audio and timestamps from the new endpoint
  const preloadAudio = useCallback(async (): Promise<boolean> => {
    if (!enabled || !techniqueId) return false;

    setIsLoading(true);
    setError(null);

    try {
      const voiceId = getSelectedVoice();

      const response = await supabase.functions.invoke('generate-with-timestamps', {
        body: { techniqueId, voiceId },
      });

      if (response.error) {
        console.error('Error fetching audio with timestamps:', response.error);
        setError('No se pudo cargar la guía de voz');
        return false;
      }

      const { audioUrl, timestamps: timestampsData } = response.data;

      if (audioUrl && timestampsData) {
        // Create and preload audio element
        const audio = new Audio(audioUrl);
        audio.preload = 'auto';

        await new Promise<void>((resolve, reject) => {
          audio.oncanplaythrough = () => resolve();
          audio.onerror = () => reject(new Error('Failed to load audio'));
          audio.load();
        });

        audioRef.current = audio;
        setTimestamps(timestampsData);
        setIsReady(true);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error preloading audio:', err);
      setError('No se pudo cargar la guía de voz');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [enabled, techniqueId]);

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
    audioElement: audioRef.current,
    preloadAudio,
    play,
    pause,
    resume,
    stop,
    markUserInteraction,
  };
}
