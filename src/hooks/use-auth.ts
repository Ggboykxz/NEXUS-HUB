'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { setRoleCookie } from '@/lib/actions/auth-actions';

/**
 * Hook d'authentification centralisé utilisant exclusivement le SDK Client.
 * Synchronise le cookie de rôle pour le middleware.
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
          if (snapshot.exists() && snapshot.data()?.role) {
            const profileData = snapshot.data() as UserProfile;
            setProfile(profileData);
            
            // Synchronisation du cookie de rôle en tâche de fond
            setRoleCookie(profileData.role).catch(() => {});
            
            setLoading(false);
          } else {
            // Le profil n'existe pas encore ou est en cours de création
            setProfile(null);
            // On ne stoppe pas le loading ici pour laisser le temps au signup de finir
          }
        }, (error) => {
          console.warn("Firestore profile sync error:", error.code);
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
