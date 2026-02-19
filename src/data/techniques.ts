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
      description: 'Siente cómo la tensión se disuelve con cada respiración. La calma más natural que existe.',
      benefits: ['Reduce el cortisol', 'Mejora la oxigenación', 'Calma el sistema nervioso'],
    },
    en: {
      name: 'Diaphragmatic Breathing',
      tagline: 'The anchor of your calm',
      description: 'Feel tension dissolve with every breath. The most natural calm there is.',
      benefits: ['Reduces cortisol', 'Improves oxygenation', 'Calms the nervous system'],
    },
  },
  'box-breathing': {
    es: {
      name: 'Box Breathing',
      tagline: 'Enfoque y claridad',
      description: 'Encuentra claridad y enfoque en solo 4 minutos. Tu mente se calma, tu cuerpo responde.',
      benefits: ['Mejora la concentración', 'Reduce la ansiedad', 'Equilibra el sistema nervioso'],
    },
    en: {
      name: 'Box Breathing',
      tagline: 'Focus and clarity',
      description: 'Find clarity and focus in just 4 minutes. Your mind calms, your body responds.',
      benefits: ['Improves concentration', 'Reduces anxiety', 'Balances the nervous system'],
    },
  },
  '4-7-8': {
    es: {
      name: 'Técnica 4-7-8',
      tagline: 'Puente hacia el sueño',
      description: 'Tu cuerpo se prepara para descansar. Ideal antes de dormir o en momentos de estrés intenso.',
      benefits: ['Facilita el sueño', 'Reduce el estrés', 'Activa el nervio vago'],
    },
    en: {
      name: '4-7-8 Technique',
      tagline: 'Bridge to sleep',
      description: 'Your body prepares to rest. Perfect before sleep or during intense stress.',
      benefits: ['Facilitates sleep', 'Reduces stress', 'Activates the vagus nerve'],
    },
  },
  'nadi-shodhana': {
    es: {
      name: 'Nadi Shodhana',
      tagline: 'Equilibrio energético',
      description: 'Equilibra tu energía y aclara tu mente. Como un reinicio suave para tu sistema nervioso.',
      benefits: ['Equilibra los hemisferios', 'Mejora la claridad mental', 'Reduce la tensión'],
    },
    en: {
      name: 'Nadi Shodhana',
      tagline: 'Energy balance',
      description: 'Balance your energy and clear your mind. A gentle reset for your nervous system.',
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
