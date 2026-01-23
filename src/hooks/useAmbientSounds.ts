import { useRef, useState, useCallback, useEffect } from 'react';

export type AmbientSoundType = 'rain' | 'forest' | 'waves' | 'none';

const AMBIENT_SOUNDS: Record<Exclude<AmbientSoundType, 'none'>, string> = {
  rain: '/audio/ambient-rain.mp3',
  forest: '/audio/ambient-forest.mp3',
  waves: '/audio/ambient-waves.mp3',
};

interface UseAmbientSoundsReturn {
  currentSound: AmbientSoundType;
  volume: number;
  isPlaying: boolean;
  play: (soundType: Exclude<AmbientSoundType, 'none'>) => void;
  stop: () => void;
  fadeOut: (duration?: number) => Promise<void>;
  setVolume: (volume: number) => void;
}

export function useAmbientSounds(initialVolume = 0.3): UseAmbientSoundsReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [currentSound, setCurrentSound] = useState<AmbientSoundType>('none');
  const [volume, setVolumeState] = useState(initialVolume);
  const [isPlaying, setIsPlaying] = useState(false);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  const play = useCallback((soundType: Exclude<AmbientSoundType, 'none'>) => {
    // Stop current sound if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(AMBIENT_SOUNDS[soundType]);
    audio.loop = true;
    audio.volume = volume;
    
    audio.play().then(() => {
      audioRef.current = audio;
      setCurrentSound(soundType);
      setIsPlaying(true);
    }).catch(err => {
      console.warn('Failed to play ambient sound:', err);
    });
  }, [volume]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setCurrentSound('none');
    setIsPlaying(false);
  }, []);

  const fadeOut = useCallback((duration = 2000): Promise<void> => {
    return new Promise((resolve) => {
      if (!audioRef.current || !isPlaying) {
        resolve();
        return;
      }

      const audio = audioRef.current;
      const startVolume = audio.volume;
      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = startVolume / steps;
      let currentStep = 0;

      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(0, startVolume - volumeStep * currentStep);
        
        if (currentStep >= steps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
          }
          stop();
          resolve();
        }
      }, stepDuration);
    });
  }, [isPlaying, stop]);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  return {
    currentSound,
    volume,
    isPlaying,
    play,
    stop,
    fadeOut,
    setVolume,
  };
}
