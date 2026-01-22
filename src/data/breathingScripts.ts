/**
 * Complete breathing guide scripts for pre-generated audio.
 * Each script includes preparation time that syncs with visual preparation phase.
 */

export interface BreathingScript {
  techniqueId: string;
  preparationSeconds: number;  // Duration of intro/preparation
  breathingSeconds: number;    // Duration of breathing cycles only
  totalDurationSeconds: number; // Total = prep + breathing (no closing, ends with last cycle)
  script: string;
}

// Diafragmática: 4-0-6-0 x 8 cycles = 80s breathing
export const diaphragmaticScript: BreathingScript = {
  techniqueId: 'diaphragmatic',
  preparationSeconds: 10,
  breathingSeconds: 80,
  totalDurationSeconds: 90,
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
};

// Box Breathing: 4-4-4-4 x 6 cycles = 96s breathing
export const boxBreathingScript: BreathingScript = {
  techniqueId: 'box-breathing',
  preparationSeconds: 8,
  breathingSeconds: 96,
  totalDurationSeconds: 104,
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
};

// 4-7-8: 4-7-8-0 x 4 cycles = 76s breathing
export const technique478Script: BreathingScript = {
  techniqueId: '4-7-8',
  preparationSeconds: 10,
  breathingSeconds: 76,
  totalDurationSeconds: 86,
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
};

// Nadi Shodhana: 4-4-4-4 x 10 cycles = 160s breathing
export const nadiShodhanaScript: BreathingScript = {
  techniqueId: 'nadi-shodhana',
  preparationSeconds: 12,
  breathingSeconds: 160,
  totalDurationSeconds: 172,
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
};

// Map for easy lookup
export const breathingScripts: Record<string, BreathingScript> = {
  'diaphragmatic': diaphragmaticScript,
  'box-breathing': boxBreathingScript,
  '4-7-8': technique478Script,
  'nadi-shodhana': nadiShodhanaScript,
};

export const getScriptForTechnique = (techniqueId: string): BreathingScript | undefined => {
  return breathingScripts[techniqueId];
};
