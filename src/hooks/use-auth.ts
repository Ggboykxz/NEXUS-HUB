'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';

/**
 * Hook d'authentification centralisé utilisant exclusivement le SDK Client.
 * Écoute en temps réel les changements du profil dans la collection 'users'.
 */
export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        const unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const profileData = snapshot.data() as UserProfile;
            setProfile(profileData);
            setLoading(false);
          } else {
            // Document absent pour le moment (cours de création)
            setProfile(null);
            // On laisse loading=true pour attendre que setDoc finisse côté signup
          }
        }, (error) => {
          if (error.code !== 'permission-denied') {
            console.warn("Firestore profile sync error:", error.code);
          }
          setLoading(false);
        });
        
        return () => unsubscribeSnapshot();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return { currentUser, profile, loading };
}