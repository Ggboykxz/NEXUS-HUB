'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        const unsubscribeSnapshot = onSnapshot(userDocRef, async (snapshot) => {
          if (snapshot.exists()) {
            setProfile(snapshot.data() as UserProfile);
            setLoading(false);
          } else if (!isInitializing) {
            // Détection d'un compte orphelin : Auth existe mais Firestore est vide
            setIsInitializing(true);
            try {
              console.log("Repairing orphan profile for:", user.uid);
              const baseName = user.displayName || user.email?.split('@')[0] || 'voyageur';
              const slug = baseName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
              
              await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'Nouveau Voyageur',
                photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
                slug: slug,
                role: 'reader',
                level: 1,
                afriCoins: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                readingStats: { chaptersRead: 0, totalReadTime: 0 },
                readingStreak: { currentCount: 0, lastReadDate: '', longestStreak: 0 },
                preferences: { language: 'fr', theme: 'dark', privacy: { showCurrentReading: true, showHistory: true } }
              }, { merge: true });
            } catch (err: any) {
              // Si c'est une erreur de permission, on attend que les règles se propagent
              if (err.code === 'permission-denied') {
                console.warn("Permission denied during profile repair, retrying later...");
              } else {
                console.error("Failed to repair profile:", err);
              }
            } finally {
              setIsInitializing(false);
            }
          }
        }, (error) => {
          // Si l'erreur est 'insufficient permissions', cela peut arriver si le doc n'existe pas encore
          // et que les règles restreignent la lecture aux docs existants appartenant à l'UID.
          if (error.code === 'permission-denied') {
            setProfile(null);
            // On laisse le chargement à true pour permettre au bloc de réparation de s'exécuter
          } else {
            console.error("Error fetching user profile: ", error);
            setProfile(null);
            setLoading(false);
          }
        });
        
        return () => unsubscribeSnapshot();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isInitializing]);

  return { currentUser, profile, loading: loading || isInitializing };
}
