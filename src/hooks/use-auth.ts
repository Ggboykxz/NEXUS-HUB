'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Hook d'authentification centralisé, rendu sûr.
 * Le comportement de redirection qui causait le bug 404 a été supprimé.
 */
export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        
        const unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const profileData = { uid: snapshot.id, ...snapshot.data() } as UserProfile;
            setProfile(profileData);
            
            // Logique de redirection supprimée. Ne plus jamais rediriger depuis ce hook.
            // Le hook informe, il n'agit pas.

          } else {
            // Le profil n'est pas encore créé. C'est normal juste après le signup.
            setProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Auth hook snapshot error:", error);
          setProfile(null);
          setLoading(false);
        });

        return () => unsubscribeProfile();

      } else {
        setCurrentUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return { currentUser, profile, loading };
}
