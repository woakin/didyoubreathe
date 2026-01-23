import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Default voice for meditation
const DEFAULT_VOICE_ID = "spPXlKT5a4JMfbhPRAzA"; // Camila

// Scripts with SSML <break> tags for precise 1-second pauses between counts
// Using eleven_turbo_v2_5 which has stable SSML support
// Scripts with SSML <break> tags - using 0.7s for ~1.0-1.5s real pauses
const breathingScriptsV2: Record<string, string> = {
  diaphragmatic: `Bienvenido a la respiración diafragmática.

Encuentra una posición cómoda. Coloca una mano sobre tu abdomen.

<break time="1.5s"/>

Vamos a comenzar.

<break time="1.0s"/>

Inhala profundamente <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala lentamente <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro <break time="0.7s"/> cinco <break time="0.7s"/> seis.

<break time="0.7s"/>

Inhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro <break time="0.7s"/> cinco <break time="0.7s"/> seis.

<break time="0.7s"/>

Inhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro <break time="0.7s"/> cinco <break time="0.7s"/> seis.

<break time="0.7s"/>

Inhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro <break time="0.7s"/> cinco <break time="0.7s"/> seis.

<break time="0.7s"/>

Inhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro <break time="0.7s"/> cinco <break time="0.7s"/> seis.

<break time="0.7s"/>

Inhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro <break time="0.7s"/> cinco <break time="0.7s"/> seis.

<break time="0.7s"/>

Inhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro <break time="0.7s"/> cinco <break time="0.7s"/> seis.

<break time="0.7s"/>

Inhala profundamente <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala completamente <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro <break time="0.7s"/> cinco <break time="0.7s"/> seis.`,

  "box-breathing": `Bienvenido a Box Breathing.

Esta técnica te ayudará a encontrar enfoque y claridad.

<break time="1.5s"/>

Prepárate para comenzar.

<break time="1.0s"/>

Inhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Mantén el aire <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Pausa <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.7s"/>

Inhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Mantén <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Pausa <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.7s"/>

Inhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Mantén <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Pausa <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.7s"/>

Inhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Mantén <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Pausa <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.7s"/>

Inhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Mantén <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Pausa <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.7s"/>

Inhala profundamente <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Mantén <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala completamente <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Pausa final <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.`,

  "4-7-8": `Bienvenido a la técnica cuatro siete ocho.

Esta práctica te preparará para un descanso profundo.

<break time="1.5s"/>

Relaja los hombros y cierra los ojos.

<break time="1.0s"/>

Inhala por la nariz <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Mantén el aire <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro <break time="0.7s"/> cinco <break time="0.7s"/> seis <break time="0.7s"/> siete.

<break time="0.3s"/>

Exhala por la boca <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro <break time="0.7s"/> cinco <break time="0.7s"/> seis <break time="0.7s"/> siete <break time="0.7s"/> ocho.

<break time="0.7s"/>

Inhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Mantén <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro <break time="0.7s"/> cinco <break time="0.7s"/> seis <break time="0.7s"/> siete.

<break time="0.3s"/>

Exhala lentamente <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro <break time="0.7s"/> cinco <break time="0.7s"/> seis <break time="0.7s"/> siete <break time="0.7s"/> ocho.

<break time="0.7s"/>

Inhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Mantén <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro <break time="0.7s"/> cinco <break time="0.7s"/> seis <break time="0.7s"/> siete.

<break time="0.3s"/>

Exhala <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro <break time="0.7s"/> cinco <break time="0.7s"/> seis <break time="0.7s"/> siete <break time="0.7s"/> ocho.

<break time="0.7s"/>

Inhala profundamente <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Mantén <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro <break time="0.7s"/> cinco <break time="0.7s"/> seis <break time="0.7s"/> siete.

<break time="0.3s"/>

Exhala completamente <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro <break time="0.7s"/> cinco <break time="0.7s"/> seis <break time="0.7s"/> siete <break time="0.7s"/> ocho.`,

  "nadi-shodhana": `Bienvenido a Nadi Shodhana, la respiración alterna.

Usa tu pulgar derecho para cerrar la fosa nasal derecha.

<break time="1.5s"/>

Vamos a equilibrar tu energía.

<break time="1.0s"/>

Inhala por la fosa izquierda <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Cierra ambas fosas y mantén <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala por la derecha <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Pausa <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.7s"/>

Inhala por la derecha <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Mantén <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala por la izquierda <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Pausa <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.7s"/>

Inhala por la izquierda <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Mantén <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala por la derecha <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Pausa <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.7s"/>

Inhala por la derecha <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Mantén <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala por la izquierda <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Pausa <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.7s"/>

Inhala por la izquierda <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Mantén <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala por la derecha <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Pausa <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.7s"/>

Inhala por la derecha <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Mantén <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala por la izquierda <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Pausa <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.7s"/>

Inhala por la izquierda <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Mantén <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala por la derecha <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Pausa <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.7s"/>

Inhala por la derecha <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Mantén <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Exhala por la izquierda <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.

<break time="0.3s"/>

Pausa final <break time="0.7s"/> dos <break time="0.7s"/> tres <break time="0.7s"/> cuatro.`,
};

// Phase keywords mapping
const PHASE_KEYWORDS: Record<string, string> = {
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

interface AudioCue {
  word: string;
  time: number;
  phase?: string;
  count?: number;
}

function extractWordsFromAlignment(alignment: {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}): Array<{ word: string; start: number; end: number }> {
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

  if (currentWord.trim()) {
    words.push({
      word: currentWord.trim().toLowerCase(),
      start: wordStart,
      end: wordEnd,
    });
  }

  return words;
}

function processAlignmentToCues(alignment: {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}): { cues: AudioCue[]; totalDuration: number } {
  const words = extractWordsFromAlignment(alignment);
  const cues: AudioCue[] = [];
  let currentPhase = 'prepare';

  for (const { word, start } of words) {
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
      cues.push({
        word,
        time: start,
        phase: currentPhase,
        count: NUMBER_WORDS[word],
      });
    }
  }

  const totalDuration = alignment.character_end_times_seconds[
    alignment.character_end_times_seconds.length - 1
  ] || 0;

  return { cues, totalDuration };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY not configured");
    }

    const { techniqueId, voiceId = DEFAULT_VOICE_ID, forceRegenerate = false } = await req.json();

    if (!techniqueId || !breathingScriptsV2[techniqueId]) {
      return new Response(
        JSON.stringify({ error: "Invalid technique ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const audioFileName = `${techniqueId.replace(/-/g, "_")}_${voiceId}_v2.mp3`;
    const timestampsFileName = `${techniqueId.replace(/-/g, "_")}_${voiceId}_timestamps.json`;

    // Check if files already exist
    if (!forceRegenerate) {
      const { data: existingFiles } = await supabase.storage
        .from("audio-guides")
        .list("", { search: audioFileName });

      if (existingFiles && existingFiles.length > 0) {
        // Try to get existing timestamps
        const { data: timestampsData } = await supabase.storage
          .from("audio-guides")
          .download(timestampsFileName);

        if (timestampsData) {
          const timestamps = JSON.parse(await timestampsData.text());
          const { data: urlData } = supabase.storage
            .from("audio-guides")
            .getPublicUrl(audioFileName);

          return new Response(
            JSON.stringify({
              audioUrl: urlData.publicUrl,
              timestamps,
              cached: true,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    const script = breathingScriptsV2[techniqueId];
    console.log(`Generating audio with timestamps for ${techniqueId}...`);

    // Call ElevenLabs with-timestamps endpoint
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: script,
          model_id: "eleven_turbo_v2_5", // Turbo v2.5 has stable SSML <break> support
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.80,
            style: 0.0,
            use_speaker_boost: true,
            speed: 0.85, // Slightly slower for meditation
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.audio_base64 || !data.alignment) {
      throw new Error("Invalid response from ElevenLabs - missing audio or alignment data");
    }

    // Process alignment to cues
    const { cues, totalDuration } = processAlignmentToCues(data.alignment);

    const timestamps = {
      techniqueId,
      voiceId,
      totalDuration,
      cues,
    };

    // Decode base64 audio
    const audioBytes = Uint8Array.from(atob(data.audio_base64), c => c.charCodeAt(0));

    // Upload audio file
    const { error: audioUploadError } = await supabase.storage
      .from("audio-guides")
      .upload(audioFileName, audioBytes.buffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (audioUploadError) {
      throw new Error(`Audio upload failed: ${audioUploadError.message}`);
    }

    // Upload timestamps JSON
    const timestampsBlob = new Blob([JSON.stringify(timestamps, null, 2)], {
      type: "application/json",
    });
    const { error: timestampsUploadError } = await supabase.storage
      .from("audio-guides")
      .upload(timestampsFileName, timestampsBlob, {
        contentType: "application/json",
        upsert: true,
      });

    if (timestampsUploadError) {
      throw new Error(`Timestamps upload failed: ${timestampsUploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("audio-guides")
      .getPublicUrl(audioFileName);

    console.log(`Successfully generated ${techniqueId} with ${cues.length} cues, duration: ${totalDuration}s`);

    return new Response(
      JSON.stringify({
        audioUrl: urlData.publicUrl,
        timestamps,
        cached: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating audio with timestamps:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
