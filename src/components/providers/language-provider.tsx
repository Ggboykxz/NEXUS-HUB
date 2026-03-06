'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, translations } from '@/lib/translations';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

// Helper to safely access nested properties
const get = (obj: any, path: string, defaultValue: string = path): string => {
  const result = path
    .split('.')
    .reduce((r, k) => (r || {})[k], obj);
  return result && typeof result === 'string' ? result : defaultValue;
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');

  // 1. Initial load from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('nexushub-lang') as Language;
    if (savedLang && ['fr', 'en', 'sw', 'ha', 'am', 'ar'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  // 2. Sync language from Firestore when user logs in
  const syncLangFromFirestore = useCallback(async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const preferredLang = userData?.preferences?.language;
        if (preferredLang && language !== preferredLang) {
          console.log(`Syncing language from Firestore: ${preferredLang}`);
          setLanguageState(preferredLang);
          localStorage.setItem('nexushub-lang', preferredLang);
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
    if (lang === language) return;
    
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
    // Get translation from current language
    const translation = get(translations[language], path, '' /* Use empty string to detect missing */);
    if (translation) return translation;

    // Fallback to English
    const fallbackTranslation = get(translations.en, path, path);
    return fallbackTranslation;
  }, [language]);

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
