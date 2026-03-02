'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '@/lib/translations';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    const savedLang = localStorage.getItem('nexushub-lang') as Language;
    if (savedLang && ['fr', 'en', 'sw', 'ha', 'am', 'ar'].includes(savedLang)) {
      setLanguageState(savedLang);
    }

    // Sync from Firestore when user logs in
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Here we could also fetch from user doc preferences
        // For now we persist from UI choice to Firestore
      }
    });

    return () => unsubscribe();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('nexushub-lang', lang);

    // Sync to Firestore if logged in
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'preferences.language': lang
        });
      } catch (e) {
        console.error("Failed to sync language to Firestore", e);
      }
    }
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    let result: any = translations[language];
    
    for (const key of keys) {
      if (result && result[key]) {
        result = result[key];
      } else {
        // Fallback to English if key missing in current lang
        let fallback: any = translations['en'];
        for (const fKey of keys) {
          if (fallback && fallback[fKey]) fallback = fallback[fKey];
          else { fallback = path; break; }
        }
        return typeof fallback === 'string' ? fallback : path;
      }
    }
    
    return typeof result === 'string' ? result : path;
  };

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
