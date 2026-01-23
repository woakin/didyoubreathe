import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { es, Translations } from './translations/es';
import { en } from './translations/en';

export type Language = 'es' | 'en';

const LANGUAGE_STORAGE_KEY = 'app-language';

const translations: Record<Language, Translations> = { es, en };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const detectLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';
  
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === 'es' || stored === 'en') return stored;
  
  const browserLang = navigator.language.slice(0, 2);
  return browserLang === 'es' ? 'es' : 'en';
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  useEffect(() => {
    const detected = detectLanguage();
    setLanguageState(detected);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return React.createElement(
    LanguageContext.Provider,
    { value },
    children
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export { LanguageContext };
export type { Translations };
