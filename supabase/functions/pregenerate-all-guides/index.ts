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

// All breathing scripts with precise SSML break tags for 1-second pauses
const breathingScripts = {
  diaphragmatic: {
    script: `Bienvenido a la respiración diafragmática.
Encuentra una posición cómoda. Coloca una mano sobre tu abdomen.
Vamos a comenzar.

Inhala profundamente <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala lentamente <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro <break time="1.0s"/> cinco <break time="1.0s"/> seis.

Inhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro <break time="1.0s"/> cinco <break time="1.0s"/> seis.

Inhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro <break time="1.0s"/> cinco <break time="1.0s"/> seis.

Inhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro <break time="1.0s"/> cinco <break time="1.0s"/> seis.

Inhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro <break time="1.0s"/> cinco <break time="1.0s"/> seis.

Inhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro <break time="1.0s"/> cinco <break time="1.0s"/> seis.

Inhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro <break time="1.0s"/> cinco <break time="1.0s"/> seis.

Inhala profundamente <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala completamente <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro <break time="1.0s"/> cinco <break time="1.0s"/> seis.`,
  },
  "box-breathing": {
    script: `Bienvenido a Box Breathing.
Esta técnica te ayudará a encontrar enfoque y claridad.
Prepárate para comenzar.

Inhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén el aire <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Pausa <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.

Inhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Pausa <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.

Inhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Pausa <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.

Inhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Pausa <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.

Inhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Pausa <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.

Inhala profundamente <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala completamente <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Pausa final <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.`,
  },
  "4-7-8": {
    script: `Bienvenido a la técnica cuatro, siete, ocho.
Esta práctica te preparará para un descanso profundo.
Relaja los hombros y cierra los ojos.

Inhala por la nariz <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén el aire <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro <break time="1.0s"/> cinco <break time="1.0s"/> seis <break time="1.0s"/> siete.
Exhala por la boca <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro <break time="1.0s"/> cinco <break time="1.0s"/> seis <break time="1.0s"/> siete <break time="1.0s"/> ocho.

Inhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro <break time="1.0s"/> cinco <break time="1.0s"/> seis <break time="1.0s"/> siete.
Exhala lentamente <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro <break time="1.0s"/> cinco <break time="1.0s"/> seis <break time="1.0s"/> siete <break time="1.0s"/> ocho.

Inhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro <break time="1.0s"/> cinco <break time="1.0s"/> seis <break time="1.0s"/> siete.
Exhala <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro <break time="1.0s"/> cinco <break time="1.0s"/> seis <break time="1.0s"/> siete <break time="1.0s"/> ocho.

Inhala profundamente <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro <break time="1.0s"/> cinco <break time="1.0s"/> seis <break time="1.0s"/> siete.
Exhala completamente <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro <break time="1.0s"/> cinco <break time="1.0s"/> seis <break time="1.0s"/> siete <break time="1.0s"/> ocho.`,
  },
  "nadi-shodhana": {
    script: `Bienvenido a Nadi Shodhana, la respiración alterna.
Usa tu pulgar derecho para cerrar la fosa nasal derecha.
Vamos a equilibrar tu energía.

Inhala por la fosa izquierda <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Cierra ambas fosas y mantén <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala por la derecha <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Pausa <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.

Inhala por la derecha <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala por la izquierda <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Pausa <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.

Inhala por la izquierda <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala por la derecha <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Pausa <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.

Inhala por la derecha <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala por la izquierda <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Pausa <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.

Inhala por la izquierda <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala por la derecha <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Pausa <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.

Inhala por la derecha <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala por la izquierda <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Pausa <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.

Inhala por la izquierda <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala por la derecha <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Pausa <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.

Inhala por la derecha <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala por la izquierda <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Pausa <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.

Inhala por la izquierda <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala por la derecha <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Pausa <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.

Inhala por la derecha <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Mantén <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Exhala por la izquierda <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.
Pausa final <break time="1.0s"/> dos <break time="1.0s"/> tres <break time="1.0s"/> cuatro.`,
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
          stability: 0.85,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
          speed: 0.95,
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

    // Parse request body for optional voiceIds filter and force flag
    let voicesToGenerate = ALL_VOICES;
    let forceRegenerate = false;
    
    try {
      const body = await req.json();
      if (body.voiceIds && Array.isArray(body.voiceIds)) {
        voicesToGenerate = ALL_VOICES.filter(v => body.voiceIds.includes(v.id));
      }
      if (body.force === true) {
        forceRegenerate = true;
      }
    } catch {
      // No body or invalid JSON, use defaults
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
          // Check if file already exists (skip if not forcing)
          if (!forceRegenerate) {
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
          }

          // Generate audio
          console.log(`[${voice.name}/${techniqueId}] Generating audio with precise timing...`);
          const audioBuffer = await generateAudio(script, voice.id);

          // Upload to storage (upsert to overwrite existing)
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
        forceRegenerate,
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
