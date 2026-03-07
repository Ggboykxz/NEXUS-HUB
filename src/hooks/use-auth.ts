'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User, getIdToken } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRepairing, setIsRepairing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        const unsubscribeSnapshot = onSnapshot(userDocRef, async (snapshot) => {
          if (snapshot.exists() && snapshot.data()?.role) {
            setProfile(snapshot.data() as UserProfile);
            setLoading(false);
          } else if (!isRepairing) {
            // RÉPARATION AUTOMATIQUE : Auth existe mais le profil Firestore est vide
            setIsRepairing(true);
            try {
              await getIdToken(user, true); // Forcer les permissions
              const baseName = user.displayName || user.email?.split('@')[0] || 'voyageur';
              const slug = baseName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
              
              await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'Nouveau Voyageur',
                slug: slug,
                role: 'reader',
                afriCoins: 0,
                level: 1,
                subscribersCount: 0,
                followedCount: 0,
                isCertified: false,
                isBanned: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                readingStats: { preferredGenres: {}, totalReadTime: 0, chaptersRead: 0, favoriteArtists: [] },
                readingStreak: { currentCount: 0, lastReadDate: '', longestStreak: 0 },
                preferences: { language: 'fr', theme: 'dark', privacy: { showCurrentReading: true, showHistory: true } }
              }, { merge: true });
            } catch (err: any) {
              console.error("Profile repair failed:", err);
            } finally {
              setIsRepairing(false);
            }
          }
        }, (error) => {
          if (error.code !== 'permission-denied') {
            console.error("Auth snapshot error:", error);
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
  }, [isRepairing]);

  return { currentUser, profile, loading: loading || isRepairing };
}