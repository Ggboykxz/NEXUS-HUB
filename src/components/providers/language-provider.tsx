'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

// Define the Language type that was previously in translations.ts
export type Language = 'fr' | 'en' | 'sw' | 'ha' | 'am' | 'ar';
const availableLanguages: Language[] = ['fr', 'en', 'sw', 'ha', 'am', 'ar'];

// Helper to safely access nested properties
const get = (obj: any, path: string, defaultValue: string = path): string => {
  if (!obj) return defaultValue;
  const result = path
    .split('.')
    .reduce((r, k) => (r || {})[k], obj);
  return typeof result === 'string' ? result : defaultValue;
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');
  const [translations, setTranslations] = useState<any>({});
  const [fallbackTranslations, setFallbackTranslations] = useState<any>({});

  // 1. Initial load from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('nexushub-lang') as Language;
    if (savedLang && availableLanguages.includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  // 2. Fetch translations based on language
  useEffect(() => {
    let active = true;

    async function loadTranslations() {
        // Always load English as fallback
        try {
            const enRes = await fetch('/locales/en/common.json');
            const enData = await enRes.json();
            if (!active) return;
            setFallbackTranslations(enData);

            if (language === 'en') {
                setTranslations(enData);
            } else {
                try {
                    const langRes = await fetch(`/locales/${language}/common.json`);
                    const langData = await langRes.json();
                    if (!active) return;
                    setTranslations(langData);
                } catch (e) {
                    console.error(`Could not load ${language} locale, falling back to English.`);
                    setTranslations(enData); // Fallback to English
                }
            }
        } catch(e) {
            console.error("Could not load English locale. Translations will not work.", e)
        }
    }

    loadTranslations();

    return () => {
        active = false;
    };
  }, [language]);

  // 3. Sync language from Firestore when user logs in
  const syncLangFromFirestore = useCallback(async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const preferredLang = userData?.preferences?.language as Language;
        if (preferredLang && availableLanguages.includes(preferredLang) && language !== preferredLang) {
          console.log(`Syncing language from Firestore: ${preferredLang}`);
          setLanguageState(preferredLang);
        }
      }
    } catch (e) {
      console.error("Failed to fetch language preference from Firestore", e);
    }
  }, [language]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        syncLangFromFirestore(user);
      }
    });
    return () => unsubscribe();
  }, [syncLangFromFirestore]);

  const setLanguage = async (lang: Language) => {
    if (lang === language || !availableLanguages.includes(lang)) return;

    setLanguageState(lang);
    localStorage.setItem('nexushub-lang', lang);

    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { 'preferences.language': lang });
      } catch (e) {
        console.error("Failed to sync language to Firestore", e);
      }
    }
  };

  const t = useCallback((path: string): string => {
    const translation = get(translations, path);
    if (translation !== path) return translation;

    const fallbackTranslation = get(fallbackTranslations, path);
    return fallbackTranslation;
  }, [translations, fallbackTranslations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
