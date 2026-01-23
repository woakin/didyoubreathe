/**
 * Simplified breathing scripts for audio-driven synchronization.
 * Uses natural punctuation instead of excessive SSML break tags.
 * The UI will follow actual audio timestamps, not fixed timers.
 */

export interface BreathingScriptV2 {
  techniqueId: string;
  script: string;
}

// Diafragmática: 4-0-6-0 x 8 cycles
export const diaphragmaticScriptV2: BreathingScriptV2 = {
  techniqueId: 'diaphragmatic',
  script: `Bienvenido a la respiración diafragmática.
Encuentra una posición cómoda. Coloca una mano sobre tu abdomen.

Vamos a comenzar.

Inhala profundamente, dos, tres, cuatro.
Exhala lentamente, dos, tres, cuatro, cinco, seis.

Inhala, dos, tres, cuatro.
Exhala, dos, tres, cuatro, cinco, seis.

Inhala, dos, tres, cuatro.
Exhala, dos, tres, cuatro, cinco, seis.

Inhala, dos, tres, cuatro.
Exhala, dos, tres, cuatro, cinco, seis.

Inhala, dos, tres, cuatro.
Exhala, dos, tres, cuatro, cinco, seis.

Inhala, dos, tres, cuatro.
Exhala, dos, tres, cuatro, cinco, seis.

Inhala, dos, tres, cuatro.
Exhala, dos, tres, cuatro, cinco, seis.

Inhala profundamente, dos, tres, cuatro.
Exhala completamente, dos, tres, cuatro, cinco, seis.`,
};

// Box Breathing: 4-4-4-4 x 6 cycles
export const boxBreathingScriptV2: BreathingScriptV2 = {
  techniqueId: 'box-breathing',
  script: `Bienvenido a Box Breathing.
Esta técnica te ayudará a encontrar enfoque y claridad.

Prepárate para comenzar.

Inhala, dos, tres, cuatro.
Mantén el aire, dos, tres, cuatro.
Exhala, dos, tres, cuatro.
Pausa, dos, tres, cuatro.

Inhala, dos, tres, cuatro.
Mantén, dos, tres, cuatro.
Exhala, dos, tres, cuatro.
Pausa, dos, tres, cuatro.

Inhala, dos, tres, cuatro.
Mantén, dos, tres, cuatro.
Exhala, dos, tres, cuatro.
Pausa, dos, tres, cuatro.

Inhala, dos, tres, cuatro.
Mantén, dos, tres, cuatro.
Exhala, dos, tres, cuatro.
Pausa, dos, tres, cuatro.

Inhala, dos, tres, cuatro.
Mantén, dos, tres, cuatro.
Exhala, dos, tres, cuatro.
Pausa, dos, tres, cuatro.

Inhala profundamente, dos, tres, cuatro.
Mantén, dos, tres, cuatro.
Exhala completamente, dos, tres, cuatro.
Pausa final, dos, tres, cuatro.`,
};

// 4-7-8: 4-7-8-0 x 4 cycles
export const technique478ScriptV2: BreathingScriptV2 = {
  techniqueId: '4-7-8',
  script: `Bienvenido a la técnica cuatro, siete, ocho.
Esta práctica te preparará para un descanso profundo.

Relaja los hombros y cierra los ojos.

Inhala por la nariz, dos, tres, cuatro.
Mantén el aire, dos, tres, cuatro, cinco, seis, siete.
Exhala por la boca, dos, tres, cuatro, cinco, seis, siete, ocho.

Inhala, dos, tres, cuatro.
Mantén, dos, tres, cuatro, cinco, seis, siete.
Exhala lentamente, dos, tres, cuatro, cinco, seis, siete, ocho.

Inhala, dos, tres, cuatro.
Mantén, dos, tres, cuatro, cinco, seis, siete.
Exhala, dos, tres, cuatro, cinco, seis, siete, ocho.

Inhala profundamente, dos, tres, cuatro.
Mantén, dos, tres, cuatro, cinco, seis, siete.
Exhala completamente, dos, tres, cuatro, cinco, seis, siete, ocho.`,
};

// Nadi Shodhana: 4-4-4-4 x 10 cycles
export const nadiShodhanaScriptV2: BreathingScriptV2 = {
  techniqueId: 'nadi-shodhana',
  script: `Bienvenido a Nadi Shodhana, la respiración alterna.
Usa tu pulgar derecho para cerrar la fosa nasal derecha.

Vamos a equilibrar tu energía.

Inhala por la fosa izquierda, dos, tres, cuatro.
Cierra ambas fosas y mantén, dos, tres, cuatro.
Exhala por la derecha, dos, tres, cuatro.
Pausa, dos, tres, cuatro.

Inhala por la derecha, dos, tres, cuatro.
Mantén, dos, tres, cuatro.
Exhala por la izquierda, dos, tres, cuatro.
Pausa, dos, tres, cuatro.

Inhala por la izquierda, dos, tres, cuatro.
Mantén, dos, tres, cuatro.
Exhala por la derecha, dos, tres, cuatro.
Pausa, dos, tres, cuatro.

Inhala por la derecha, dos, tres, cuatro.
Mantén, dos, tres, cuatro.
Exhala por la izquierda, dos, tres, cuatro.
Pausa, dos, tres, cuatro.

Inhala por la izquierda, dos, tres, cuatro.
Mantén, dos, tres, cuatro.
Exhala por la derecha, dos, tres, cuatro.
Pausa, dos, tres, cuatro.

Inhala por la derecha, dos, tres, cuatro.
Mantén, dos, tres, cuatro.
Exhala por la izquierda, dos, tres, cuatro.
Pausa, dos, tres, cuatro.

Inhala por la izquierda, dos, tres, cuatro.
Mantén, dos, tres, cuatro.
Exhala por la derecha, dos, tres, cuatro.
Pausa, dos, tres, cuatro.

Inhala por la derecha, dos, tres, cuatro.
Mantén, dos, tres, cuatro.
Exhala por la izquierda, dos, tres, cuatro.
Pausa, dos, tres, cuatro.

Inhala por la izquierda, dos, tres, cuatro.
Mantén, dos, tres, cuatro.
Exhala por la derecha, dos, tres, cuatro.
Pausa, dos, tres, cuatro.

Inhala por la derecha, dos, tres, cuatro.
Mantén, dos, tres, cuatro.
Exhala por la izquierda, dos, tres, cuatro.
Pausa final, dos, tres, cuatro.`,
};

// Map for easy lookup
export const breathingScriptsV2: Record<string, BreathingScriptV2> = {
  'diaphragmatic': diaphragmaticScriptV2,
  'box-breathing': boxBreathingScriptV2,
  '4-7-8': technique478ScriptV2,
  'nadi-shodhana': nadiShodhanaScriptV2,
};

export const getScriptV2ForTechnique = (techniqueId: string): BreathingScriptV2 | undefined => {
  return breathingScriptsV2[techniqueId];
};
