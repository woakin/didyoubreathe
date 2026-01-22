/**
 * Complete breathing guide scripts for pre-generated audio.
 * Each script is timed to match the exact duration of the technique.
 */

export interface BreathingScript {
  techniqueId: string;
  totalDurationSeconds: number;
  script: string;
}

// Helper to generate counting for a phase
const count = (seconds: number, action: string): string => {
  if (seconds <= 0) return '';
  const counts = Array.from({ length: seconds }, (_, i) => i + 1).join('... ');
  return `${action}... ${counts}`;
};

// Diafragmática: 4-0-6-0 x 8 cycles = 80s + intro/outro ~= 95s
export const diaphragmaticScript: BreathingScript = {
  techniqueId: 'diaphragmatic',
  totalDurationSeconds: 95,
  script: `Bienvenido a la respiración diafragmática.
Encuentra una posición cómoda. Coloca una mano sobre tu abdomen.
Vamos a comenzar.

Primer ciclo.
Inhala profundamente... dos... tres... cuatro.
Exhala lentamente... dos... tres... cuatro... cinco... seis.

Segundo ciclo.
Inhala... dos... tres... cuatro.
Exhala... dos... tres... cuatro... cinco... seis.

Tercer ciclo.
Inhala... dos... tres... cuatro.
Exhala... dos... tres... cuatro... cinco... seis.

Cuarto ciclo.
Inhala... dos... tres... cuatro.
Exhala... dos... tres... cuatro... cinco... seis.

Quinto ciclo.
Inhala... dos... tres... cuatro.
Exhala... dos... tres... cuatro... cinco... seis.

Sexto ciclo.
Inhala... dos... tres... cuatro.
Exhala... dos... tres... cuatro... cinco... seis.

Séptimo ciclo.
Inhala... dos... tres... cuatro.
Exhala... dos... tres... cuatro... cinco... seis.

Último ciclo.
Inhala profundamente... dos... tres... cuatro.
Exhala completamente... dos... tres... cuatro... cinco... seis.

Excelente. Has completado tu práctica. Observa cómo te sientes.`,
};

// Box Breathing: 4-4-4-4 x 6 cycles = 96s + intro/outro ~= 115s
export const boxBreathingScript: BreathingScript = {
  techniqueId: 'box-breathing',
  totalDurationSeconds: 115,
  script: `Bienvenido a Box Breathing.
Esta técnica te ayudará a encontrar enfoque y claridad.
Prepárate para comenzar.

Primer ciclo.
Inhala... dos... tres... cuatro.
Mantén el aire... dos... tres... cuatro.
Exhala... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Segundo ciclo.
Inhala... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Tercer ciclo.
Inhala... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Cuarto ciclo.
Inhala... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Quinto ciclo.
Inhala... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Último ciclo.
Inhala profundamente... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala completamente... dos... tres... cuatro.
Pausa final... dos... tres... cuatro.

Perfecto. Has completado tu práctica de Box Breathing. Bien hecho.`,
};

// 4-7-8: 4-7-8-0 x 4 cycles = 76s + intro/outro ~= 90s
export const technique478Script: BreathingScript = {
  techniqueId: '4-7-8',
  totalDurationSeconds: 90,
  script: `Bienvenido a la técnica 4-7-8.
Esta práctica te preparará para un descanso profundo.
Relaja los hombros y cierra los ojos.

Primer ciclo.
Inhala por la nariz... dos... tres... cuatro.
Mantén el aire... dos... tres... cuatro... cinco... seis... siete.
Exhala por la boca... dos... tres... cuatro... cinco... seis... siete... ocho.

Segundo ciclo.
Inhala... dos... tres... cuatro.
Mantén... dos... tres... cuatro... cinco... seis... siete.
Exhala lentamente... dos... tres... cuatro... cinco... seis... siete... ocho.

Tercer ciclo.
Inhala... dos... tres... cuatro.
Mantén... dos... tres... cuatro... cinco... seis... siete.
Exhala... dos... tres... cuatro... cinco... seis... siete... ocho.

Último ciclo.
Inhala profundamente... dos... tres... cuatro.
Mantén... dos... tres... cuatro... cinco... seis... siete.
Exhala completamente... dos... tres... cuatro... cinco... seis... siete... ocho.

Maravilloso. Tu cuerpo está ahora en un estado de calma profunda.`,
};

// Nadi Shodhana: 4-4-4-4 x 10 cycles = 160s + intro/outro ~= 180s
export const nadiShodhanaScript: BreathingScript = {
  techniqueId: 'nadi-shodhana',
  totalDurationSeconds: 180,
  script: `Bienvenido a Nadi Shodhana, la respiración alterna.
Usa tu pulgar derecho para cerrar la fosa nasal derecha.
Vamos a equilibrar tu energía.

Primer ciclo.
Inhala por la fosa izquierda... dos... tres... cuatro.
Cierra ambas fosas y mantén... dos... tres... cuatro.
Exhala por la derecha... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Segundo ciclo.
Inhala por la derecha... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala por la izquierda... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Tercer ciclo.
Inhala por la izquierda... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala por la derecha... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Cuarto ciclo.
Inhala por la derecha... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala por la izquierda... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Quinto ciclo.
Inhala por la izquierda... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala por la derecha... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Sexto ciclo.
Inhala por la derecha... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala por la izquierda... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Séptimo ciclo.
Inhala por la izquierda... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala por la derecha... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Octavo ciclo.
Inhala por la derecha... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala por la izquierda... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Noveno ciclo.
Inhala por la izquierda... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala por la derecha... dos... tres... cuatro.
Pausa... dos... tres... cuatro.

Último ciclo.
Inhala por la derecha... dos... tres... cuatro.
Mantén... dos... tres... cuatro.
Exhala por la izquierda... dos... tres... cuatro.
Pausa final... dos... tres... cuatro.

Namaste. Has equilibrado tu energía vital. Siente la armonía en tu interior.`,
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
