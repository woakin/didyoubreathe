import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioTimestamps } from '@/types/breathing';

interface UseVoiceGuideV2Props {
  techniqueId: string;
  enabled: boolean;
  voiceId?: string;
}

const VOICE_STORAGE_KEY = 'breathe-voice-preference';
const DEFAULT_VOICE_ID = 'spPXlKT5a4JMfbhPRAzA'; // Camila

const STORAGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/audio-guides`;

const getSelectedVoice = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(VOICE_STORAGE_KEY) || DEFAULT_VOICE_ID;
  }
  return DEFAULT_VOICE_ID;
};

/** Try to load an Audio element from a URL with a timeout */
async function tryLoadAudio(url: string, timeoutMs = 10000): Promise<HTMLAudioElement> {
  const audio = new Audio(url);
  audio.preload = 'auto';

  await Promise.race([
    new Promise<void>((resolve, reject) => {
      audio.oncanplaythrough = () => resolve();
      audio.onerror = () => reject(new Error('Failed to load audio'));
      audio.load();
    }),
    new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Audio load timeout')), timeoutMs)
    ),
  ]);

  return audio;
}

export function useVoiceGuideV2({ techniqueId, enabled, voiceId }: UseVoiceGuideV2Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timestamps, setTimestamps] = useState<AudioTimestamps | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [useTimerMode, setUseTimerMode] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasUserInteracted = useRef(false);
  const prevVoiceIdRef = useRef(voiceId);

  // Reset state when voiceId changes to force reload
  useEffect(() => {
    if (prevVoiceIdRef.current !== voiceId) {
      prevVoiceIdRef.current = voiceId;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsReady(false);
      setHasFailed(false);
      setAudioElement(null);
      setTimestamps(null);
    }
  }, [voiceId]);

  const markUserInteraction = useCallback(() => {
    hasUserInteracted.current = true;
  }, []);

  const preloadAudio = useCallback(async (): Promise<boolean> => {
    if (!enabled || !techniqueId) return false;

    setIsLoading(true);
    setError(null);
    setHasFailed(false);
    setUseTimerMode(false);

    try {
      const effectiveVoiceId = voiceId || getSelectedVoice();
      const fileId = techniqueId.replace(/-/g, '_');

      const audioUrl = `${STORAGE_BASE}/${fileId}_${effectiveVoiceId}_v4.mp3`;
      const timestampsUrl = `${STORAGE_BASE}/${fileId}_${effectiveVoiceId}_v4_timestamps.json`;

      // Fetch timestamps (non-blocking, OK if missing)
      let timestampsData: AudioTimestamps | null = null;
      try {
        const res = await fetch(timestampsUrl);
        if (res.ok) {
          timestampsData = await res.json();
        }
      } catch {
        // Timestamps missing is fine
      }

      // Try loading v4 audio
      let audio: HTMLAudioElement;
      try {
        audio = await tryLoadAudio(audioUrl);
      } catch {
        // v4 not found — try legacy filename
        console.log(`[useVoiceGuideV2] v4 audio not found, trying legacy: ${fileId}_${effectiveVoiceId}_es_full.mp3`);
        try {
          const legacyUrl = `${STORAGE_BASE}/${fileId}_${effectiveVoiceId}_es_full.mp3`;
          audio = await tryLoadAudio(legacyUrl);
          timestampsData = null; // Legacy files have no timestamps
        } catch {
          console.log(`[useVoiceGuideV2] No audio available for ${fileId}/${effectiveVoiceId}`);
          setError('Guía de voz no disponible');
          setHasFailed(true);
          setIsLoading(false);
          return false;
        }
      }

      // Audio loaded successfully
      audioRef.current = audio;
      setAudioElement(audio);

      if (timestampsData) {
        setTimestamps(timestampsData);
        setUseTimerMode(false);
      } else {
        setTimestamps(null);
        setUseTimerMode(true);
      }

      setIsReady(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Error preloading audio:', err);
      setError('Guía de voz no disponible');
      setHasFailed(true);
      setIsLoading(false);
      return false;
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
    hasFailed,
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
