import { AudioCue, BreathPhase } from '@/types/breathing';

interface ElevenLabsAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

interface ElevenLabsResponse {
  audio_base64: string;
  alignment: ElevenLabsAlignment;
  normalized_alignment?: ElevenLabsAlignment;
}

// Keywords that indicate phase changes
const PHASE_KEYWORDS: Record<string, BreathPhase> = {
  'inhala': 'inhale',
  'exhala': 'exhale',
  'mantén': 'holdIn',
  'manten': 'holdIn',
  'pausa': 'holdOut',
  'prepárate': 'prepare',
  'preparate': 'prepare',
  'bienvenido': 'prepare',
  'bienvenida': 'prepare',
  'comenzar': 'prepare',
  'vamos': 'prepare',
};

// Number words to detect counts
const NUMBER_WORDS: Record<string, number> = {
  'uno': 1,
  'dos': 2,
  'tres': 3,
  'cuatro': 4,
  'cinco': 5,
  'seis': 6,
  'siete': 7,
  'ocho': 8,
};

/**
 * Convert character-level alignment to word-level timestamps
 */
function extractWords(alignment: ElevenLabsAlignment): Array<{ word: string; start: number; end: number }> {
  const words: Array<{ word: string; start: number; end: number }> = [];
  let currentWord = '';
  let wordStart = 0;
  let wordEnd = 0;

  for (let i = 0; i < alignment.characters.length; i++) {
    const char = alignment.characters[i];
    const start = alignment.character_start_times_seconds[i];
    const end = alignment.character_end_times_seconds[i];

    if (char === ' ' || char === '\n' || char === ',' || char === '.') {
      if (currentWord.trim()) {
        words.push({
          word: currentWord.trim().toLowerCase(),
          start: wordStart,
          end: wordEnd,
        });
      }
      currentWord = '';
      wordStart = end;
    } else {
      if (!currentWord) {
        wordStart = start;
      }
      currentWord += char;
      wordEnd = end;
    }
  }

  // Don't forget the last word
  if (currentWord.trim()) {
    words.push({
      word: currentWord.trim().toLowerCase(),
      start: wordStart,
      end: wordEnd,
    });
  }

  return words;
}

/**
 * Process ElevenLabs alignment data into AudioCues for UI synchronization
 */
export function processAlignmentToCues(
  alignment: ElevenLabsAlignment,
  techniqueId: string,
  voiceId: string
): { cues: AudioCue[]; totalDuration: number } {
  const words = extractWords(alignment);
  const cues: AudioCue[] = [];
  let currentPhase: BreathPhase = 'prepare';

  for (const { word, start } of words) {
    // Check if this word indicates a phase change
    const normalizedWord = word.replace(/[áéíóú]/g, match => {
      const map: Record<string, string> = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' };
      return map[match] || match;
    });

    const phaseKeyword = Object.keys(PHASE_KEYWORDS).find(
      key => normalizedWord.includes(key)
    );

    if (phaseKeyword) {
      currentPhase = PHASE_KEYWORDS[phaseKeyword];
      cues.push({
        word,
        time: start,
        phase: currentPhase,
      });
    } else if (NUMBER_WORDS[word]) {
      // This is a count number
      cues.push({
        word,
        time: start,
        phase: currentPhase,
        count: NUMBER_WORDS[word],
      });
    }
  }

  // Calculate total duration from last character
  const totalDuration = alignment.character_end_times_seconds[
    alignment.character_end_times_seconds.length - 1
  ] || 0;

  return { cues, totalDuration };
}

/**
 * Parse the full ElevenLabs with-timestamps response
 */
export function parseTimestampResponse(
  response: ElevenLabsResponse,
  techniqueId: string,
  voiceId: string
): { audioBase64: string; timestamps: { techniqueId: string; voiceId: string; totalDuration: number; cues: AudioCue[] } } {
  const { cues, totalDuration } = processAlignmentToCues(
    response.alignment,
    techniqueId,
    voiceId
  );

  return {
    audioBase64: response.audio_base64,
    timestamps: {
      techniqueId,
      voiceId,
      totalDuration,
      cues,
    },
  };
}
