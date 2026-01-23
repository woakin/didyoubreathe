import type { Language } from '@/i18n';

export interface Voice {
  id: string;
  name: string;
  description: {
    es: string;
    en: string;
  };
}

// Spanish voices - optimized for meditation
export const spanishVoices: Voice[] = [
  { 
    id: 'spPXlKT5a4JMfbhPRAzA', 
    name: 'Camila', 
    description: {
      es: 'Voz suave y fluida para meditación',
      en: 'Soft and flowing voice for meditation',
    }
  },
  { 
    id: 'rixsIpPlTphvsJd2mI03', 
    name: 'Isabel', 
    description: {
      es: 'Voz tranquila y serena',
      en: 'Calm and serene voice',
    }
  },
];

// English voices - optimized for meditation
export const englishVoices: Voice[] = [
  { 
    id: 'FGY2WhTYpPnrIDTdsKH5', 
    name: 'Laura', 
    description: {
      es: 'Voz suave ideal para meditación',
      en: 'Soft voice ideal for meditation',
    }
  },
  { 
    id: 'SAz9YHcvj6GT2YYXdXww', 
    name: 'River', 
    description: {
      es: 'Voz calmada y fluida',
      en: 'Calm and flowing voice',
    }
  },
];

export const getVoicesForLanguage = (language: Language): Voice[] => {
  return language === 'es' ? spanishVoices : englishVoices;
};

export const getDefaultVoiceForLanguage = (language: Language): string => {
  return language === 'es' ? 'spPXlKT5a4JMfbhPRAzA' : 'FGY2WhTYpPnrIDTdsKH5';
};

export const getAllVoices = (): { es: Voice[]; en: Voice[] } => ({
  es: spanishVoices,
  en: englishVoices,
});
