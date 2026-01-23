import { BreathingTechnique } from '@/types/breathing';

// Base technique data (pattern remains the same for both languages)
interface BaseTechnique {
  id: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  pattern: {
    inhale: number;
    holdIn: number;
    exhale: number;
    holdOut: number;
    cycles: number;
  };
  color: string;
}

const baseTechniques: BaseTechnique[] = [
  {
    id: 'diaphragmatic',
    difficulty: 'beginner',
    durationMinutes: 5,
    pattern: {
      inhale: 4,
      holdIn: 0,
      exhale: 6,
      holdOut: 0,
      cycles: 8,
    },
    color: 'breath-inhale',
  },
  {
    id: 'box-breathing',
    difficulty: 'beginner',
    durationMinutes: 4,
    pattern: {
      inhale: 4,
      holdIn: 4,
      exhale: 4,
      holdOut: 4,
      cycles: 6,
    },
    color: 'breath-hold',
  },
  {
    id: '4-7-8',
    difficulty: 'intermediate',
    durationMinutes: 6,
    pattern: {
      inhale: 4,
      holdIn: 7,
      exhale: 8,
      holdOut: 0,
      cycles: 4,
    },
    color: 'breath-exhale',
  },
  {
    id: 'nadi-shodhana',
    difficulty: 'intermediate',
    durationMinutes: 8,
    pattern: {
      inhale: 4,
      holdIn: 4,
      exhale: 4,
      holdOut: 4,
      cycles: 10,
    },
    color: 'breath-glow',
  },
];

// Localized content for each technique
const localizedContent: Record<string, Record<'es' | 'en', { name: string; tagline: string; description: string; benefits: string[] }>> = {
  'diaphragmatic': {
    es: {
      name: 'Respiración Diafragmática',
      tagline: 'El ancla de tu calma',
      description: 'La base de toda respiración consciente. Activa tu diafragma para oxigenar profundamente cada célula de tu cuerpo.',
      benefits: ['Reduce el cortisol', 'Mejora la oxigenación', 'Calma el sistema nervioso'],
    },
    en: {
      name: 'Diaphragmatic Breathing',
      tagline: 'The anchor of your calm',
      description: 'The foundation of all conscious breathing. Activate your diaphragm to deeply oxygenate every cell in your body.',
      benefits: ['Reduces cortisol', 'Improves oxygenation', 'Calms the nervous system'],
    },
  },
  'box-breathing': {
    es: {
      name: 'Box Breathing',
      tagline: 'Enfoque y claridad',
      description: 'Técnica utilizada por Navy SEALs para mantener la calma bajo presión. Cuatro tiempos iguales como una caja perfecta.',
      benefits: ['Mejora la concentración', 'Reduce la ansiedad', 'Equilibra el sistema nervioso'],
    },
    en: {
      name: 'Box Breathing',
      tagline: 'Focus and clarity',
      description: 'A technique used by Navy SEALs to stay calm under pressure. Four equal intervals like a perfect box.',
      benefits: ['Improves concentration', 'Reduces anxiety', 'Balances the nervous system'],
    },
  },
  '4-7-8': {
    es: {
      name: 'Técnica 4-7-8',
      tagline: 'Puente hacia el sueño',
      description: 'Desarrollada por el Dr. Andrew Weil, esta técnica activa profundamente el sistema nervioso parasimpático.',
      benefits: ['Facilita el sueño', 'Reduce el estrés', 'Activa el nervio vago'],
    },
    en: {
      name: '4-7-8 Technique',
      tagline: 'Bridge to sleep',
      description: 'Developed by Dr. Andrew Weil, this technique deeply activates the parasympathetic nervous system.',
      benefits: ['Facilitates sleep', 'Reduces stress', 'Activates the vagus nerve'],
    },
  },
  'nadi-shodhana': {
    es: {
      name: 'Nadi Shodhana',
      tagline: 'Equilibrio energético',
      description: 'Respiración alterna nasal del yoga. Armoniza los hemisferios cerebrales y equilibra la energía vital.',
      benefits: ['Equilibra los hemisferios', 'Mejora la claridad mental', 'Reduce la tensión'],
    },
    en: {
      name: 'Nadi Shodhana',
      tagline: 'Energy balance',
      description: 'Alternate nostril breathing from yoga. Harmonizes brain hemispheres and balances vital energy.',
      benefits: ['Balances hemispheres', 'Improves mental clarity', 'Reduces tension'],
    },
  },
};

export const getBreathingTechniques = (language: 'es' | 'en'): BreathingTechnique[] => {
  return baseTechniques.map((base) => {
    const content = localizedContent[base.id][language];
    return {
      ...base,
      ...content,
    };
  });
};

export const getTechniqueById = (id: string, language: 'es' | 'en' = 'es'): BreathingTechnique | undefined => {
  const techniques = getBreathingTechniques(language);
  return techniques.find((t) => t.id === id);
};

// Legacy export for backward compatibility (Spanish)
export const breathingTechniques: BreathingTechnique[] = getBreathingTechniques('es');
