import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Default voice for meditation
const DEFAULT_VOICE_ID = "spPXlKT5a4JMfbhPRAzA"; // Camila

// ============================================================
// SEGMENT-BASED SCRIPTS FOR REQUEST STITCHING
// Each technique is an array of short segments for consistent rhythm
// ============================================================

interface Segment {
  id: string;
  text: string;
  prevContext?: string;
  nextContext?: string;
}

// Diaphragmatic: 8 cycles (4-0-6-0 pattern)
const diaphragmaticSegments: Segment[] = [
  {
    id: "intro",
    text: `Bienvenido a la respiración diafragmática.
Encuentra una posición cómoda. Coloca una mano sobre tu abdomen.
<break time="1.0s"/>
Vamos a comenzar.
<break time="0.6s"/>`,
    nextContext: "Ciclo uno. Inhala dos tres cuatro."
  },
  {
    id: "ciclo_1",
    text: `Ciclo uno.
<break time="0.3s"/>
Inhala profundamente <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala lentamente <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro <break time="0.3s"/> cinco <break time="0.3s"/> seis.
<break time="0.5s"/>`,
    prevContext: "Vamos a comenzar.",
    nextContext: "Ciclo dos. Inhala dos tres cuatro."
  },
  {
    id: "ciclo_2",
    text: `Ciclo dos.
<break time="0.3s"/>
Inhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro <break time="0.3s"/> cinco <break time="0.3s"/> seis.
<break time="0.5s"/>`,
    prevContext: "Exhala lentamente dos tres cuatro cinco seis.",
    nextContext: "Ciclo tres. Inhala dos tres cuatro."
  },
  {
    id: "ciclo_3",
    text: `Ciclo tres.
<break time="0.3s"/>
Inhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro <break time="0.3s"/> cinco <break time="0.3s"/> seis.
<break time="0.5s"/>`,
    prevContext: "Exhala dos tres cuatro cinco seis.",
    nextContext: "Ciclo cuatro. Inhala dos tres cuatro."
  },
  {
    id: "ciclo_4",
    text: `Ciclo cuatro.
<break time="0.3s"/>
Inhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro <break time="0.3s"/> cinco <break time="0.3s"/> seis.
<break time="0.5s"/>`,
    prevContext: "Exhala dos tres cuatro cinco seis.",
    nextContext: "Ciclo cinco. Inhala dos tres cuatro."
  },
  {
    id: "ciclo_5",
    text: `Ciclo cinco.
<break time="0.3s"/>
Inhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro <break time="0.3s"/> cinco <break time="0.3s"/> seis.
<break time="0.5s"/>`,
    prevContext: "Exhala dos tres cuatro cinco seis.",
    nextContext: "Ciclo seis. Inhala dos tres cuatro."
  },
  {
    id: "ciclo_6",
    text: `Ciclo seis.
<break time="0.3s"/>
Inhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro <break time="0.3s"/> cinco <break time="0.3s"/> seis.
<break time="0.5s"/>`,
    prevContext: "Exhala dos tres cuatro cinco seis.",
    nextContext: "Ciclo siete. Inhala dos tres cuatro."
  },
  {
    id: "ciclo_7",
    text: `Ciclo siete.
<break time="0.3s"/>
Inhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro <break time="0.3s"/> cinco <break time="0.3s"/> seis.
<break time="0.5s"/>`,
    prevContext: "Exhala dos tres cuatro cinco seis.",
    nextContext: "Último ciclo. Inhala profundamente dos tres cuatro."
  },
  {
    id: "ciclo_8",
    text: `Último ciclo.
<break time="0.3s"/>
Inhala profundamente <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala completamente <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro <break time="0.3s"/> cinco <break time="0.3s"/> seis.
<break time="0.5s"/>`,
    prevContext: "Exhala dos tres cuatro cinco seis.",
    nextContext: "Excelente. Has completado la sesión."
  },
  {
    id: "cierre",
    text: `<break time="0.5s"/>
Excelente. Has completado la sesión.
<break time="0.5s"/>
Toma un momento para notar cómo te sientes.
<break time="0.5s"/>
Namaste.`,
    prevContext: "Exhala completamente dos tres cuatro cinco seis."
  }
];

// Box Breathing: 6 cycles (4-4-4-4 pattern)
const boxBreathingSegments: Segment[] = [
  {
    id: "intro",
    text: `Bienvenido a Box Breathing.
Esta técnica te ayudará a encontrar enfoque y claridad.
<break time="1.0s"/>
Prepárate para comenzar.
<break time="0.6s"/>`,
    nextContext: "Ciclo uno. Inhala dos tres cuatro."
  },
  {
    id: "ciclo_1",
    text: `Ciclo uno.
<break time="0.3s"/>
Inhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén el aire <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Pausa <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.5s"/>`,
    prevContext: "Prepárate para comenzar.",
    nextContext: "Ciclo dos. Inhala dos tres cuatro."
  },
  {
    id: "ciclo_2",
    text: `Ciclo dos.
<break time="0.3s"/>
Inhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Pausa <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.5s"/>`,
    prevContext: "Pausa dos tres cuatro.",
    nextContext: "Ciclo tres. Inhala dos tres cuatro."
  },
  {
    id: "ciclo_3",
    text: `Ciclo tres.
<break time="0.3s"/>
Inhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Pausa <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.5s"/>`,
    prevContext: "Pausa dos tres cuatro.",
    nextContext: "Ciclo cuatro. Inhala dos tres cuatro."
  },
  {
    id: "ciclo_4",
    text: `Ciclo cuatro.
<break time="0.3s"/>
Inhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Pausa <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.5s"/>`,
    prevContext: "Pausa dos tres cuatro.",
    nextContext: "Ciclo cinco. Inhala dos tres cuatro."
  },
  {
    id: "ciclo_5",
    text: `Ciclo cinco.
<break time="0.3s"/>
Inhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Pausa <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.5s"/>`,
    prevContext: "Pausa dos tres cuatro.",
    nextContext: "Último ciclo. Inhala profundamente dos tres cuatro."
  },
  {
    id: "ciclo_6",
    text: `Último ciclo.
<break time="0.3s"/>
Inhala profundamente <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala completamente <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Pausa final <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.5s"/>`,
    prevContext: "Pausa dos tres cuatro.",
    nextContext: "Excelente. Has completado la sesión."
  },
  {
    id: "cierre",
    text: `<break time="0.5s"/>
Excelente. Has completado la sesión.
<break time="0.5s"/>
Toma un momento para notar cómo te sientes.
<break time="0.5s"/>
Namaste.`,
    prevContext: "Pausa final dos tres cuatro."
  }
];

// 4-7-8: 4 cycles
const fourSevenEightSegments: Segment[] = [
  {
    id: "intro",
    text: `Bienvenido a la técnica cuatro siete ocho.
Esta práctica te preparará para un descanso profundo.
<break time="1.0s"/>
Relaja los hombros y cierra los ojos.
<break time="0.6s"/>`,
    nextContext: "Ciclo uno. Inhala por la nariz dos tres cuatro."
  },
  {
    id: "ciclo_1",
    text: `Ciclo uno.
<break time="0.3s"/>
Inhala por la nariz <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén el aire <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro <break time="0.3s"/> cinco <break time="0.3s"/> seis <break time="0.3s"/> siete.
<break time="0.15s"/>
Exhala por la boca <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro <break time="0.3s"/> cinco <break time="0.3s"/> seis <break time="0.3s"/> siete <break time="0.3s"/> ocho.
<break time="0.5s"/>`,
    prevContext: "Relaja los hombros y cierra los ojos.",
    nextContext: "Ciclo dos. Inhala dos tres cuatro."
  },
  {
    id: "ciclo_2",
    text: `Ciclo dos.
<break time="0.3s"/>
Inhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro <break time="0.3s"/> cinco <break time="0.3s"/> seis <break time="0.3s"/> siete.
<break time="0.15s"/>
Exhala lentamente <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro <break time="0.3s"/> cinco <break time="0.3s"/> seis <break time="0.3s"/> siete <break time="0.3s"/> ocho.
<break time="0.5s"/>`,
    prevContext: "Exhala por la boca dos tres cuatro cinco seis siete ocho.",
    nextContext: "Ciclo tres. Inhala dos tres cuatro."
  },
  {
    id: "ciclo_3",
    text: `Ciclo tres.
<break time="0.3s"/>
Inhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro <break time="0.3s"/> cinco <break time="0.3s"/> seis <break time="0.3s"/> siete.
<break time="0.15s"/>
Exhala <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro <break time="0.3s"/> cinco <break time="0.3s"/> seis <break time="0.3s"/> siete <break time="0.3s"/> ocho.
<break time="0.5s"/>`,
    prevContext: "Exhala lentamente dos tres cuatro cinco seis siete ocho.",
    nextContext: "Último ciclo. Inhala profundamente dos tres cuatro."
  },
  {
    id: "ciclo_4",
    text: `Último ciclo.
<break time="0.3s"/>
Inhala profundamente <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro <break time="0.3s"/> cinco <break time="0.3s"/> seis <break time="0.3s"/> siete.
<break time="0.15s"/>
Exhala completamente <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro <break time="0.3s"/> cinco <break time="0.3s"/> seis <break time="0.3s"/> siete <break time="0.3s"/> ocho.
<break time="0.5s"/>`,
    prevContext: "Exhala dos tres cuatro cinco seis siete ocho.",
    nextContext: "Excelente. Has completado la sesión."
  },
  {
    id: "cierre",
    text: `<break time="0.5s"/>
Excelente. Has completado la sesión.
<break time="0.5s"/>
Toma un momento para notar cómo te sientes.
<break time="0.5s"/>
Namaste.`,
    prevContext: "Exhala completamente dos tres cuatro cinco seis siete ocho."
  }
];

// Nadi Shodhana: 10 cycles (alternating nostrils)
const nadiShodhanaSegments: Segment[] = [
  {
    id: "intro",
    text: `Bienvenido a Nadi Shodhana, la respiración alterna.
Usa tu pulgar derecho para cerrar la fosa nasal derecha.
<break time="1.0s"/>
Vamos a equilibrar tu energía.
<break time="0.6s"/>`,
    nextContext: "Ciclo uno. Inhala por la fosa izquierda dos tres cuatro."
  },
  {
    id: "ciclo_1",
    text: `Ciclo uno.
<break time="0.3s"/>
Inhala por la fosa izquierda <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Cierra ambas fosas y mantén <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala por la derecha <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Pausa <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.5s"/>`,
    prevContext: "Vamos a equilibrar tu energía.",
    nextContext: "Ciclo dos. Inhala por la derecha dos tres cuatro."
  },
  {
    id: "ciclo_2",
    text: `Ciclo dos.
<break time="0.3s"/>
Inhala por la derecha <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala por la izquierda <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Pausa <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.5s"/>`,
    prevContext: "Pausa dos tres cuatro.",
    nextContext: "Ciclo tres. Inhala por la izquierda dos tres cuatro."
  },
  {
    id: "ciclo_3",
    text: `Ciclo tres.
<break time="0.3s"/>
Inhala por la izquierda <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala por la derecha <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Pausa <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.5s"/>`,
    prevContext: "Pausa dos tres cuatro.",
    nextContext: "Ciclo cuatro. Inhala por la derecha dos tres cuatro."
  },
  {
    id: "ciclo_4",
    text: `Ciclo cuatro.
<break time="0.3s"/>
Inhala por la derecha <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala por la izquierda <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Pausa <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.5s"/>`,
    prevContext: "Pausa dos tres cuatro.",
    nextContext: "Ciclo cinco. Inhala por la izquierda dos tres cuatro."
  },
  {
    id: "ciclo_5",
    text: `Ciclo cinco.
<break time="0.3s"/>
Inhala por la izquierda <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala por la derecha <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Pausa <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.5s"/>`,
    prevContext: "Pausa dos tres cuatro.",
    nextContext: "Ciclo seis. Inhala por la derecha dos tres cuatro."
  },
  {
    id: "ciclo_6",
    text: `Ciclo seis.
<break time="0.3s"/>
Inhala por la derecha <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala por la izquierda <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Pausa <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.5s"/>`,
    prevContext: "Pausa dos tres cuatro.",
    nextContext: "Ciclo siete. Inhala por la izquierda dos tres cuatro."
  },
  {
    id: "ciclo_7",
    text: `Ciclo siete.
<break time="0.3s"/>
Inhala por la izquierda <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala por la derecha <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Pausa <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.5s"/>`,
    prevContext: "Pausa dos tres cuatro.",
    nextContext: "Ciclo ocho. Inhala por la derecha dos tres cuatro."
  },
  {
    id: "ciclo_8",
    text: `Ciclo ocho.
<break time="0.3s"/>
Inhala por la derecha <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala por la izquierda <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Pausa <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.5s"/>`,
    prevContext: "Pausa dos tres cuatro.",
    nextContext: "Ciclo nueve. Inhala por la izquierda dos tres cuatro."
  },
  {
    id: "ciclo_9",
    text: `Ciclo nueve.
<break time="0.3s"/>
Inhala por la izquierda <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala por la derecha <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Pausa <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.5s"/>`,
    prevContext: "Pausa dos tres cuatro.",
    nextContext: "Último ciclo. Inhala profundamente por la derecha dos tres cuatro."
  },
  {
    id: "ciclo_10",
    text: `Último ciclo.
<break time="0.3s"/>
Inhala profundamente por la derecha <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Mantén <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Exhala completamente por la izquierda <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.15s"/>
Pausa final <break time="0.3s"/> dos <break time="0.3s"/> tres <break time="0.3s"/> cuatro.
<break time="0.5s"/>`,
    prevContext: "Pausa dos tres cuatro.",
    nextContext: "Excelente. Has completado la sesión."
  },
  {
    id: "cierre",
    text: `<break time="0.5s"/>
Excelente. Has completado la sesión.
<break time="0.5s"/>
Toma un momento para notar cómo te sientes.
<break time="0.5s"/>
Namaste.`,
    prevContext: "Pausa final dos tres cuatro."
  }
];

// Map technique IDs to their segments
const techniqueSegments: Record<string, Segment[]> = {
  diaphragmatic: diaphragmaticSegments,
  "box-breathing": boxBreathingSegments,
  "4-7-8": fourSevenEightSegments,
  "nadi-shodhana": nadiShodhanaSegments,
};

// ============================================================
// TIMESTAMP PROCESSING
// ============================================================

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

function processAlignmentToCues(
  alignment: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  },
  timeOffset: number = 0
): { cues: AudioCue[]; segmentDuration: number } {
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
        time: start + timeOffset,
        phase: currentPhase,
      });
    } else if (NUMBER_WORDS[word]) {
      cues.push({
        word,
        time: start + timeOffset,
        phase: currentPhase,
        count: NUMBER_WORDS[word],
      });
    }
  }

  const segmentDuration = alignment.character_end_times_seconds[
    alignment.character_end_times_seconds.length - 1
  ] || 0;

  return { cues, segmentDuration };
}

// ============================================================
// AUDIO BUFFER UTILITIES
// ============================================================

function concatAudioBuffers(buffers: Uint8Array[]): Uint8Array {
  const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buffer of buffers) {
    result.set(buffer, offset);
    offset += buffer.length;
  }
  return result;
}

// ============================================================
// MAIN HANDLER
// ============================================================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY not configured");
    }

    const { techniqueId, voiceId = DEFAULT_VOICE_ID, forceRegenerate = false } = await req.json();

    if (!techniqueId || !techniqueSegments[techniqueId]) {
      return new Response(
        JSON.stringify({ error: "Invalid technique ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const audioFileName = `${techniqueId.replace(/-/g, "_")}_${voiceId}_v4.mp3`;
    const timestampsFileName = `${techniqueId.replace(/-/g, "_")}_${voiceId}_v4_timestamps.json`;

    // Check if files already exist
    if (!forceRegenerate) {
      const { data: existingFiles } = await supabase.storage
        .from("audio-guides")
        .list("", { search: audioFileName });

      if (existingFiles && existingFiles.length > 0) {
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

    const segments = techniqueSegments[techniqueId];
    console.log(`Generating audio with stitching for ${techniqueId} (${segments.length} segments)...`);

    const audioBuffers: Uint8Array[] = [];
    const allCues: AudioCue[] = [];
    let totalDuration = 0;

    // Generate each segment with context
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`  Generating segment ${i + 1}/${segments.length}: ${segment.id}`);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: segment.text,
            model_id: "eleven_turbo_v2_5",
            previous_text: segment.prevContext,
            next_text: segment.nextContext,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.80,
              style: 0.0,
              use_speaker_boost: true,
              speed: 0.85,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error for segment ${segment.id}: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.audio_base64 || !data.alignment) {
        throw new Error(`Invalid response for segment ${segment.id}`);
      }

      // Decode base64 audio for this segment
      const audioBytes = Uint8Array.from(atob(data.audio_base64), c => c.charCodeAt(0));
      audioBuffers.push(audioBytes);

      // Process cues with time offset
      const { cues, segmentDuration } = processAlignmentToCues(data.alignment, totalDuration);
      allCues.push(...cues);
      totalDuration += segmentDuration;

      console.log(`    Segment ${segment.id}: ${segmentDuration.toFixed(2)}s, ${cues.length} cues`);
    }

    // Concatenate all audio buffers
    const combinedAudio = concatAudioBuffers(audioBuffers);
    console.log(`Combined audio: ${(combinedAudio.length / 1024).toFixed(1)} KB, ${totalDuration.toFixed(2)}s total`);

    const timestamps = {
      techniqueId,
      voiceId,
      totalDuration,
      cues: allCues,
    };

    // Upload combined audio file
    const { error: audioUploadError } = await supabase.storage
      .from("audio-guides")
      .upload(audioFileName, combinedAudio.buffer, {
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

    console.log(`Successfully generated ${techniqueId} with stitching: ${allCues.length} cues, ${totalDuration.toFixed(2)}s`);

    return new Response(
      JSON.stringify({
        audioUrl: urlData.publicUrl,
        timestamps,
        cached: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating audio with stitching:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
