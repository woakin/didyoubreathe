import { describe, it, expect } from 'vitest';
import { processAlignmentToCues, parseTimestampResponse } from './timestampProcessor';

describe('timestampProcessor', () => {
  describe('processAlignmentToCues', () => {
    it('should extract words and assign phases correctly', () => {
      const alignment = {
        characters: ['i', 'n', 'h', 'a', 'l', 'a', ' ', 'u', 'n', 'o'],
        character_start_times_seconds: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        character_end_times_seconds: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1],
      };

      const result = processAlignmentToCues(alignment, 'tech-1', 'voice-1');

      expect(result.cues).toHaveLength(2);
      expect(result.cues[0]).toEqual({
        word: 'inhala',
        time: 0.1,
        phase: 'inhale',
      });
      expect(result.cues[1]).toEqual({
        word: 'uno',
        time: 0.8,
        phase: 'inhale',
        count: 1,
      });
      expect(result.totalDuration).toBe(1.1);
    });

    it('should handle accented characters and normalization', () => {
      const alignment = {
        characters: ['i', 'n', 'h', 'á', 'l', 'a'],
        character_start_times_seconds: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
        character_end_times_seconds: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
      };

      const result = processAlignmentToCues(alignment, 'tech-1', 'voice-1');

      expect(result.cues[0]).toEqual({
        word: 'inhála',
        time: 0.1,
        phase: 'inhale',
      });
    });

    it('should handle multiple phase keywords', () => {
      const alignment = {
        characters: ['i', 'n', 'h', 'a', 'l', 'a', ' ', 'e', 'x', 'h', 'a', 'l', 'a'],
        character_start_times_seconds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        character_end_times_seconds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      };

      const result = processAlignmentToCues(alignment, 'tech-1', 'voice-1');

      expect(result.cues).toHaveLength(2);
      expect(result.cues[0].phase).toBe('inhale');
      expect(result.cues[1].phase).toBe('exhale');
    });

    it('should handle empty alignment', () => {
      const alignment = {
        characters: [],
        character_start_times_seconds: [],
        character_end_times_seconds: [],
      };

      const result = processAlignmentToCues(alignment, 'tech-1', 'voice-1');

      expect(result.cues).toHaveLength(0);
      expect(result.totalDuration).toBe(0);
    });
  });

  describe('parseTimestampResponse', () => {
    it('should parse ElevenLabs response correctly', () => {
      const response = {
        audio_base64: 'base64data',
        alignment: {
          characters: ['v', 'a', 'm', 'o', 's'],
          character_start_times_seconds: [0.1, 0.2, 0.3, 0.4, 0.5],
          character_end_times_seconds: [0.2, 0.3, 0.4, 0.5, 0.6],
        },
      };

      const result = parseTimestampResponse(response, 'tech-1', 'voice-1');

      expect(result.audioBase64).toBe('base64data');
      expect(result.timestamps.techniqueId).toBe('tech-1');
      expect(result.timestamps.voiceId).toBe('voice-1');
      expect(result.timestamps.cues[0]).toEqual({
        word: 'vamos',
        time: 0.1,
        phase: 'prepare',
      });
      expect(result.timestamps.totalDuration).toBe(0.6);
    });
  });
});
