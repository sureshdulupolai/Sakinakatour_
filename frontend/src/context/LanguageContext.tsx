import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  badge?: string;
}

export const INDIAN_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', badge: 'Default' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', badge: 'National' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', badge: 'Mumbai' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', badge: 'Popular' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी' },
];

interface LanguageContextType {
  currentLang: string;
  currentLanguageOption: LanguageOption;
  setLanguage: (code: string) => void;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLangState] = useState<string>(() => {
    return localStorage.getItem('sakinaka_user_lang') || 'en';
  });

  const currentLanguageOption = 
    INDIAN_LANGUAGES.find((l) => l.code === currentLang) || INDIAN_LANGUAGES[0];

  const applyGoogleTranslateLanguage = (langCode: string) => {
    // Set cookies for Google Translate client
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    if (domain) {
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${domain};`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain};`;
    }

    // Try finding Google's combo select element
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change'));
    } else {
      // If translate element script is loading, retry slightly later
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const delayedCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (delayedCombo) {
          delayedCombo.value = langCode;
          delayedCombo.dispatchEvent(new Event('change'));
          clearInterval(interval);
        } else if (attempts > 15) {
          clearInterval(interval);
        }
      }, 300);
    }
  };

  const setLanguage = (code: string) => {
    setCurrentLangState(code);
    localStorage.setItem('sakinaka_user_lang', code);
    applyGoogleTranslateLanguage(code);
  };

  useEffect(() => {
    const saved = localStorage.getItem('sakinaka_user_lang');
    if (saved && saved !== 'en') {
      applyGoogleTranslateLanguage(saved);
    }
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        currentLanguageOption,
        setLanguage,
        languages: INDIAN_LANGUAGES,
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

