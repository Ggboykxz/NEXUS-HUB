'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User, getIdToken } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';

/**
 * Hook personnalisé pour gérer l'état d'authentification et le profil Firestore.
 * Gère les permissions insuffisantes avec patience.
 */
export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        // On écoute les changements du profil en temps réel
        const unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists() && snapshot.data()?.role) {
            setProfile(snapshot.data() as UserProfile);
            setLoading(false);
          } else {
            // Si le doc n'existe pas encore, on attend le processus de création initié par signup/login
            setProfile(null);
            // On ne passe pas loading à false ici pour laisser le temps au rituel de finir
          }
        }, (error) => {
          // Erreur de permission courante lors de la connexion initiale avant que le doc soit prêt
          if (error.code !== 'permission-denied') {
            console.warn("Auth snapshot error:", error.code);
          }
          setLoading(false);
        });
        
        return () => unsubscribeSnapshot();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { currentUser, profile, loading };
}