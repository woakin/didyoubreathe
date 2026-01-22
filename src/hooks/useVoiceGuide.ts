import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BreathPhase } from '@/types/breathing';

interface VoicePhrase {
  phase: BreathPhase;
  text: string;
  key: string;
}

interface UseVoiceGuideProps {
  techniqueId: string;
  enabled: boolean;
}

// Phrases for each breathing phase
const getPhrasesForTechnique = (techniqueId: string): VoicePhrase[] => {
  const baseKey = techniqueId.replace(/-/g, '_');
  
  return [
    { phase: 'inhale', text: 'Inhala profundamente...', key: `${baseKey}_inhale` },
    { phase: 'holdIn', text: 'Mantén el aire...', key: `${baseKey}_hold_in` },
    { phase: 'exhale', text: 'Exhala lentamente...', key: `${baseKey}_exhale` },
    { phase: 'holdOut', text: 'Pausa y relájate...', key: `${baseKey}_hold_out` },
    { phase: 'complete', text: 'Bien hecho. Has completado tu práctica de respiración.', key: `${baseKey}_complete` },
  ];
};

export function useVoiceGuide({ techniqueId, enabled }: UseVoiceGuideProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioCache = useRef<Map<BreathPhase, HTMLAudioElement>>(new Map());
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const hasUserInteracted = useRef(false);

  // Mark that user has interacted (needed for audio autoplay)
  const markUserInteraction = useCallback(() => {
    hasUserInteracted.current = true;
  }, []);

  // Pre-generate all audio phrases sequentially to avoid rate limits
  const preloadAudio = useCallback(async () => {
    if (!enabled || !techniqueId) return;

    setIsLoading(true);
    setError(null);

    const phrases = getPhrasesForTechnique(techniqueId);
    audioCache.current.clear();

    try {
      // Process sequentially to avoid ElevenLabs rate limits (max 2 concurrent)
      for (const phrase of phrases) {
        try {
          const response = await supabase.functions.invoke('generate-breath-guide', {
            body: { text: phrase.text, phraseKey: phrase.key },
          });

          if (response.error) {
            console.warn(`Error generating audio for ${phrase.key}:`, response.error);
            continue;
          }

          const audioUrl = response.data?.audioUrl;
          if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.preload = 'auto';
            
            // Wait for audio to be loadable
            await new Promise<void>((resolve) => {
              audio.oncanplaythrough = () => resolve();
              audio.onerror = () => {
                console.warn(`Failed to load audio: ${phrase.key}`);
                resolve();
              };
              audio.load();
            });

            audioCache.current.set(phrase.phase, audio);
          }
        } catch (err) {
          console.warn(`Error processing phrase ${phrase.key}:`, err);
        }
        
        // Small delay between requests to be safe
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setIsReady(audioCache.current.size > 0);
    } catch (err) {
      console.error('Error preloading audio:', err);
      setError('No se pudo cargar la guía de voz');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, techniqueId]);

  // Play audio for a specific phase
  const playPhase = useCallback((phase: BreathPhase) => {
    if (!enabled || !hasUserInteracted.current) return;

    // Stop current audio if playing
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
    }

    const audio = audioCache.current.get(phase);
    if (audio) {
      currentAudio.current = audio;
      audio.currentTime = 0;
      audio.play().catch((err) => {
        console.warn('Audio playback failed:', err);
      });
    }
  }, [enabled]);

  // Stop all audio
  const stop = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
      currentAudio.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      audioCache.current.clear();
    };
  }, [stop]);

  return {
    isLoading,
    isReady,
    error,
    preloadAudio,
    playPhase,
    stop,
    markUserInteraction,
  };
}
