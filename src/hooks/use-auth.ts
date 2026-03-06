
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
                preferences: { language: 'fr', theme: 'dark', privacy: { showCurrentReading: true, showHistory: true } }
              }, { merge: true });
            } catch (err) {
              console.error("Failed to repair profile:", err);
            } finally {
              setIsInitializing(false);
            }
          }
        }, (error) => {
          console.error("Error fetching user profile: ", error);
          setProfile(null);
          setLoading(false);
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
