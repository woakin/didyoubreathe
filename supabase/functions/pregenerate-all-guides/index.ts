import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Voces optimizadas para meditación
const ALL_VOICES = [
  { id: "spPXlKT5a4JMfbhPRAzA", name: "Camila" },
  { id: "rixsIpPlTphvsJd2mI03", name: "Isabel" },
];

// All breathing scripts with their content
const breathingScripts = {
  diaphragmatic: {
    script: `Bienvenido a la respiración diafragmática.
Encuentra una posición cómoda. Coloca una mano sobre tu abdomen.
Vamos a comenzar.

Inhala profundamente... dos... tres... cuatro.
Exhala lentamente... dos... tres... cuatro... cinco... seis.

Inhala... dos... tres... cuatro.
Exhala... dos... tres... cuatro... cinco... seis.

Inhala... dos... tres... cuatro.
Exhala... dos... tres... cuatro... cinco... seis.

Inhala... dos... tres... cuatro.
Exhala... dos... tres... cuatro... cinco... seis.

Inhala... dos... tres... cuatro.
Exhala... dos... tres... cuatro... cinco... seis.

Inhala... dos... tres... cuatro.
Exhala... dos... tres... cuatro... cinco... seis.

Inhala... dos... tres... cuatro.
Exhala... dos... tres... cuatro... cinco... seis.

Inhala profundamente... dos... tres... cuatro.
Exhala completamente... dos... tres... cuatro... cinco... seis.`,
  },
  "box-breathing": {
    script: `Bienvenido a Box Breathing.
Esta técnica te ayudará a encontrar enfoque y claridad.
Prepárate para comenzar.

Inhala... dos... tres... cuatro.
Mantén el aire... dos... tres... cuatro.
Exhala... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Inhala... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Inhala... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Inhala... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Inhala... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Inhala profundamente... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala completamente... dos... tres... cuatro.
Pausa final... dos... tres... cuatro.`,
  },
  "4-7-8": {
    script: `Bienvenido a la técnica cuatro, siete, ocho.
Esta práctica te preparará para un descanso profundo.
Relaja los hombros y cierra los ojos.

Inhala por la nariz... dos... tres... cuatro.
Mantén el aire... dos... tres... cuatro... cinco... seis... siete.
Exhala por la boca... dos... tres... cuatro... cinco... seis... siete... ocho.

Inhala... dos... tres... cuatro.
Mantén... dos... tres... cuatro... cinco... seis... siete.
Exhala lentamente... dos... tres... cuatro... cinco... seis... siete... ocho.

Inhala... dos... tres... cuatro.
Mantén... dos... tres... cuatro... cinco... seis... siete.
Exhala... dos... tres... cuatro... cinco... seis... siete... ocho.

Inhala profundamente... dos... tres... cuatro.
Mantén... dos... tres... cuatro... cinco... seis... siete.
Exhala completamente... dos... tres... cuatro... cinco... seis... siete... ocho.`,
  },
  "nadi-shodhana": {
    script: `Bienvenido a Nadi Shodhana, la respiración alterna.
Usa tu pulgar derecho para cerrar la fosa nasal derecha.
Vamos a equilibrar tu energía.

Inhala por la fosa izquierda... dos... tres... cuatro.
Cierra ambas fosas y mantén... dos... tres... cuatro.
Exhala por la derecha... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Inhala por la derecha... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala por la izquierda... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Inhala por la izquierda... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala por la derecha... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Inhala por la derecha... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala por la izquierda... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Inhala por la izquierda... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala por la derecha... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Inhala por la derecha... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala por la izquierda... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Inhala por la izquierda... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala por la derecha... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Inhala por la derecha... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala por la izquierda... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Inhala por la izquierda... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala por la derecha... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Inhala por la derecha... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala por la izquierda... dos... tres... cuatro.
Pausa final... dos... tres... cuatro.`,
  },
};

async function generateAudio(text: string, voiceId: string): Promise<ArrayBuffer> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85,
          style: 0.0,
          use_speaker_boost: true,
          speed: 1.0,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  return response.arrayBuffer();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY not configured");
    }

    // Parse request body for optional voiceIds filter
    let voicesToGenerate = ALL_VOICES;
    try {
      const body = await req.json();
      if (body.voiceIds && Array.isArray(body.voiceIds)) {
        voicesToGenerate = ALL_VOICES.filter(v => body.voiceIds.includes(v.id));
      }
    } catch {
      // No body or invalid JSON, use all voices
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const results: Record<string, Record<string, { success: boolean; error?: string; url?: string }>> = {};

    // Process each voice
    for (const voice of voicesToGenerate) {
      results[voice.name] = {};

      // Process each technique for this voice
      for (const [techniqueId, { script }] of Object.entries(breathingScripts)) {
        const fileName = `${techniqueId.replace(/-/g, "_")}_${voice.id}_full.mp3`;

        try {
          // Check if file already exists
          const { data: existingFile } = await supabase.storage
            .from("audio-guides")
            .list("", { search: fileName });

          if (existingFile && existingFile.length > 0) {
            const { data: urlData } = supabase.storage
              .from("audio-guides")
              .getPublicUrl(fileName);

            results[voice.name][techniqueId] = {
              success: true,
              url: urlData.publicUrl,
            };
            console.log(`[${voice.name}/${techniqueId}] Already exists, skipping`);
            continue;
          }

          // Generate audio
          console.log(`[${voice.name}/${techniqueId}] Generating audio...`);
          const audioBuffer = await generateAudio(script, voice.id);

          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from("audio-guides")
            .upload(fileName, audioBuffer, {
              contentType: "audio/mpeg",
              upsert: true,
            });

          if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
          }

          const { data: urlData } = supabase.storage
            .from("audio-guides")
            .getPublicUrl(fileName);

          results[voice.name][techniqueId] = {
            success: true,
            url: urlData.publicUrl,
          };
          console.log(`[${voice.name}/${techniqueId}] Generated and uploaded successfully`);
        } catch (error) {
          console.error(`[${voice.name}/${techniqueId}] Error:`, error);
          results[voice.name][techniqueId] = {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: "Pre-generation complete",
        voices: voicesToGenerate.map(v => v.name),
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Pre-generation error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
