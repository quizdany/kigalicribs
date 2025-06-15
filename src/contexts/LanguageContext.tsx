
"use client";

import type { Language } from '@/types';
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface LanguageContextType {
  selectedLanguage: Language;
  setSelectedLanguage: (language: Language) => void;
  supportedLanguages: Language[];
}

export const defaultLanguage: Language = { code: 'en', name: 'English' };

export const supportedLanguagesList: Language[] = [
  defaultLanguage,
  { code: 'fr', name: 'Français' },
  { code: 'rw', name: 'Kinyarwanda' },
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(defaultLanguage);

  return (
    <LanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage, supportedLanguages: supportedLanguagesList }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
