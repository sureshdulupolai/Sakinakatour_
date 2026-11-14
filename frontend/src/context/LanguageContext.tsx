import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, TranslationStrings, getTranslation } from '../translations';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const INDIAN_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
];

interface LanguageContextType {
  currentLang: string;
  currentLanguageOption: LanguageOption;
  setLanguage: (code: string) => void;
  languages: LanguageOption[];
  t: (key: keyof TranslationStrings, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLangState] = useState<string>(() => {
    return localStorage.getItem('sakinaka_user_lang') || 'en';
  });

  const currentLanguageOption =
    INDIAN_LANGUAGES.find((l) => l.code === currentLang) || INDIAN_LANGUAGES[0];

  const applyGoogleTranslate = (langCode: string) => {
    // Set cookies for Google Translate client
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/auto/${langCode}; path=/;`;
    if (domain && domain !== 'localhost') {
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${domain};`;
      document.cookie = `googtrans=/auto/${langCode}; path=/; domain=${domain};`;
    }

    // Try finding Google's combo select element
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change'));
      combo.dispatchEvent(new Event('input'));
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const delayedCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (delayedCombo) {
          delayedCombo.value = langCode;
          delayedCombo.dispatchEvent(new Event('change'));
          delayedCombo.dispatchEvent(new Event('input'));
          clearInterval(interval);
        } else if (attempts > 12) {
          clearInterval(interval);
        }
      }, 250);
    }
  };

  const setLanguage = (code: string) => {
    setCurrentLangState(code);
    localStorage.setItem('sakinaka_user_lang', code);
    applyGoogleTranslate(code);
  };

  const t = (key: keyof TranslationStrings, fallback?: string): string => {
    return getTranslation(currentLang, key) || fallback || '';
  };

  useEffect(() => {
    const saved = localStorage.getItem('sakinaka_user_lang');
    if (saved && saved !== 'en') {
      applyGoogleTranslate(saved);
    }
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        currentLanguageOption,
        setLanguage,
        languages: INDIAN_LANGUAGES,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
