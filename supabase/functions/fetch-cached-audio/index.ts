import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Storage-only edge function that fetches pre-cached audio and timestamps.
 * This function NEVER calls ElevenLabs API.
 * If audio is not found in storage, it returns { found: false }.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { techniqueId, voiceId } = await req.json();

    if (!techniqueId || !voiceId) {
      return new Response(
        JSON.stringify({ error: "Missing techniqueId or voiceId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const bucket = "audio-guides";
    
    // Expected file naming convention (v4 = with timestamps)
    const audioFileName = `${techniqueId}_${voiceId}_v4.mp3`;
    const timestampsFileName = `${techniqueId}_${voiceId}_v4_timestamps.json`;

    console.log(`[fetch-cached-audio] Looking for: ${audioFileName}`);

    // Check if audio file exists
    const { data: audioData, error: audioError } = await supabaseAdmin.storage
      .from(bucket)
      .download(audioFileName);

    if (audioError || !audioData) {
      console.log(`[fetch-cached-audio] Audio not found: ${audioFileName}`, audioError?.message);
      
      // Also check for legacy _full.mp3 naming
      const legacyAudioFileName = `${techniqueId}_${voiceId}_es_full.mp3`;
      const { data: legacyAudioData, error: legacyError } = await supabaseAdmin.storage
        .from(bucket)
        .download(legacyAudioFileName);
      
      if (legacyError || !legacyAudioData) {
        console.log(`[fetch-cached-audio] Legacy audio also not found: ${legacyAudioFileName}`);
        return new Response(
          JSON.stringify({ 
            found: false, 
            reason: "Audio not pre-generated for this voice/technique combination" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Legacy audio found but no timestamps - return with timer fallback flag
      const { data: legacyUrlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(legacyAudioFileName);
      
      console.log(`[fetch-cached-audio] Returning legacy audio (no timestamps): ${legacyAudioFileName}`);
      return new Response(
        JSON.stringify({
          found: true,
          audioUrl: legacyUrlData.publicUrl,
          timestamps: null,
          useTimerMode: true, // Signal to use timer-based visualization
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Audio found, now get timestamps
    const { data: timestampsData, error: timestampsError } = await supabaseAdmin.storage
      .from(bucket)
      .download(timestampsFileName);

    let timestamps = null;
    if (!timestampsError && timestampsData) {
      const timestampsText = await timestampsData.text();
      try {
        timestamps = JSON.parse(timestampsText);
      } catch (parseError) {
        console.warn(`[fetch-cached-audio] Failed to parse timestamps: ${parseError}`);
      }
    } else {
      console.log(`[fetch-cached-audio] Timestamps not found: ${timestampsFileName}`);
    }

    // Get public URL for audio
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(audioFileName);

    console.log(`[fetch-cached-audio] Returning cached audio: ${audioFileName}`);
    
    return new Response(
      JSON.stringify({
        found: true,
        audioUrl: urlData.publicUrl,
        timestamps: timestamps,
        useTimerMode: timestamps === null, // If no timestamps, use timer mode
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[fetch-cached-audio] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
