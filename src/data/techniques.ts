import { BreathingTechnique } from '@/types/breathing';

export const breathingTechniques: BreathingTechnique[] = [
  {
    id: 'diaphragmatic',
    name: 'Respiración Diafragmática',
    tagline: 'El ancla de tu calma',
    description: 'La base de toda respiración consciente. Activa tu diafragma para oxigenar profundamente cada célula de tu cuerpo.',
    difficulty: 'beginner',
    durationMinutes: 5,
    pattern: {
      inhale: 4,
      holdIn: 0,
      exhale: 6,
      holdOut: 0,
      cycles: 8,
    },
    benefits: [
      'Reduce el cortisol',
      'Mejora la oxigenación',
      'Calma el sistema nervioso',
    ],
    color: 'breath-inhale',
  },
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    tagline: 'Enfoque y claridad',
    description: 'Técnica utilizada por Navy SEALs para mantener la calma bajo presión. Cuatro tiempos iguales como una caja perfecta.',
    difficulty: 'beginner',
    durationMinutes: 4,
    pattern: {
      inhale: 4,
      holdIn: 4,
      exhale: 4,
      holdOut: 4,
      cycles: 6,
    },
    benefits: [
      'Mejora la concentración',
      'Reduce la ansiedad',
      'Equilibra el sistema nervioso',
    ],
    color: 'breath-hold',
  },
  {
    id: '4-7-8',
    name: 'Técnica 4-7-8',
    tagline: 'Puente hacia el sueño',
    description: 'Desarrollada por el Dr. Andrew Weil, esta técnica activa profundamente el sistema nervioso parasimpático.',
    difficulty: 'intermediate',
    durationMinutes: 6,
    pattern: {
      inhale: 4,
      holdIn: 7,
      exhale: 8,
      holdOut: 0,
      cycles: 4,
    },
    benefits: [
      'Facilita el sueño',
      'Reduce el estrés',
      'Activa el nervio vago',
    ],
    color: 'breath-exhale',
  },
  {
    id: 'nadi-shodhana',
    name: 'Nadi Shodhana',
    tagline: 'Equilibrio energético',
    description: 'Respiración alterna nasal del yoga. Armoniza los hemisferios cerebrales y equilibra la energía vital.',
    difficulty: 'intermediate',
    durationMinutes: 8,
    pattern: {
      inhale: 4,
      holdIn: 4,
      exhale: 4,
      holdOut: 4,
      cycles: 10,
    },
    benefits: [
      'Equilibra los hemisferios',
      'Mejora la claridad mental',
      'Reduce la tensión',
    ],
    color: 'breath-glow',
  },
];

export const getTechniqueById = (id: string): BreathingTechnique | undefined => {
  return breathingTechniques.find((t) => t.id === id);
};
