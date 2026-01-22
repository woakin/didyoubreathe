import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Paco voice - native Spanish, clear and calm
const DEFAULT_VOICE_ID = "UDJf7VRO3sTy4sABpNWO";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, phraseKey, voiceId = DEFAULT_VOICE_ID, isFullGuide = false } = await req.json();

    if (!text || !phraseKey) {
      return new Response(
        JSON.stringify({ error: "Missing text or phraseKey" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check if audio already exists in storage
    const fileName = `${phraseKey}.mp3`;
    const { data: existingFile } = await supabase.storage
      .from("audio-guides")
      .getPublicUrl(fileName);

    // Verify file exists by checking list
    const { data: fileList } = await supabase.storage
      .from("audio-guides")
      .list("", { search: fileName });

    if (fileList && fileList.length > 0 && fileList.some(f => f.name === fileName)) {
      return new Response(
        JSON.stringify({ audioUrl: existingFile.publicUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Voice settings optimized for synchronized breathing guides
    // Using speed 1.0 for precise timing synchronization
    const voiceSettings = {
      stability: 0.7,
      similarity_boost: 0.8,
      style: 0.0,  // No style exaggeration for consistent timing
      use_speaker_boost: true,
      speed: 1.0,  // Normal speed for precise sync with visual timer
    };

    // Generate audio with ElevenLabs
    // For long texts (full guides), use the standard endpoint which handles up to 5000 chars
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error("ElevenLabs API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate audio", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioBuffer = await ttsResponse.arrayBuffer();

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("audio-guides")
      .upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to store audio" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("audio-guides")
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ audioUrl: publicUrlData.publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
