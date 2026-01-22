import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getScriptForTechnique } from '@/data/breathingScripts';

interface UseVoiceGuideProps {
  techniqueId: string;
  enabled: boolean;
}

const VOICE_STORAGE_KEY = 'breathe-voice-preference';
const DEFAULT_VOICE_ID = 'UDJf7VRO3sTy4sABpNWO'; // Paco - native Spanish voice

// Get user's preferred voice from localStorage
const getSelectedVoice = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(VOICE_STORAGE_KEY) || DEFAULT_VOICE_ID;
  }
  return DEFAULT_VOICE_ID;
};

export function useVoiceGuide({ techniqueId, enabled }: UseVoiceGuideProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fullAudio = useRef<HTMLAudioElement | null>(null);
  const hasUserInteracted = useRef(false);

  // Mark that user has interacted (needed for audio autoplay)
  const markUserInteraction = useCallback(() => {
    hasUserInteracted.current = true;
  }, []);

  // Get the cache key for the full audio guide
  const getAudioKey = useCallback(() => {
    const voiceId = getSelectedVoice();
    return `${techniqueId.replace(/-/g, '_')}_${voiceId}_full`;
  }, [techniqueId]);

  // Pre-generate or fetch the full audio guide
  const preloadAudio = useCallback(async () => {
    if (!enabled || !techniqueId) return;

    const script = getScriptForTechnique(techniqueId);
    if (!script) {
      setError('No script available for this technique');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const audioKey = getAudioKey();
      const voiceId = getSelectedVoice();

      const response = await supabase.functions.invoke('generate-breath-guide', {
        body: { 
          text: script.script, 
          phraseKey: audioKey, 
          voiceId,
          isFullGuide: true 
        },
      });

      if (response.error) {
        console.error('Error generating full guide:', response.error);
        setError('No se pudo generar la guía de voz');
        return;
      }

      const audioUrl = response.data?.audioUrl;
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.preload = 'auto';
        
        await new Promise<void>((resolve, reject) => {
          audio.oncanplaythrough = () => resolve();
          audio.onerror = () => reject(new Error('Failed to load audio'));
          audio.load();
        });

        fullAudio.current = audio;
        setIsReady(true);
      }
    } catch (err) {
      console.error('Error preloading full audio:', err);
      setError('No se pudo cargar la guía de voz');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, techniqueId, getAudioKey]);

  // Play the full guide from the beginning
  const playFullGuide = useCallback(() => {
    if (!enabled || !hasUserInteracted.current || !fullAudio.current) return;

    fullAudio.current.currentTime = 0;
    fullAudio.current.play().catch((err) => {
      console.warn('Audio playback failed:', err);
    });
  }, [enabled]);

  // Pause the guide
  const pauseGuide = useCallback(() => {
    if (fullAudio.current) {
      fullAudio.current.pause();
    }
  }, []);

  // Resume the guide
  const resumeGuide = useCallback(() => {
    if (!enabled || !hasUserInteracted.current || !fullAudio.current) return;

    fullAudio.current.play().catch((err) => {
      console.warn('Audio playback failed:', err);
    });
  }, [enabled]);

  // Stop the guide completely
  const stop = useCallback(() => {
    if (fullAudio.current) {
      fullAudio.current.pause();
      fullAudio.current.currentTime = 0;
    }
  }, []);

  return {
    isLoading,
    isReady,
    error,
    preloadAudio,
    playFullGuide,
    pauseGuide,
    resumeGuide,
    stop,
    markUserInteraction,
  };
}
