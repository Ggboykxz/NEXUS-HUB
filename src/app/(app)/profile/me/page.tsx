'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { UserProfile, Story } from '@/lib/types';
import ArtistDetailClient from '@/app/(app)/artiste/[slug]/artist-detail-client';
import { Button } from "@/components/ui/button";

/**
 * Page /profile/me - La solution définitive.
 * Gère le chargement robuste du profil et des œuvres associées.
 * Inclut désormais un tri côté client pour éviter les erreurs d'index Firestore.
 */
export default function MePage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [profileData, setProfileData] = useState<{
    profile: UserProfile;
    stories?: Story[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }

      const fetchUserProfileWithRetry = async (uid: string, retries = 5, delay = 700): Promise<UserProfile | null> => {
        for (let i = 0; i < retries; i++) {
          const userDocRef = doc(db, 'users', uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            if (data.role?.startsWith('artist') && !data.slug) {
              await new Promise(resolve => setTimeout(resolve, delay + i * 200));
              continue;
            }
            return { uid: userDocSnap.id, ...data } as UserProfile;
          }
          await new Promise(resolve => setTimeout(resolve, delay + i * 200));
        }
        return null;
      };

      try {
        const userProfile = await fetchUserProfileWithRetry(user.uid);

        if (!userProfile) {
          throw new Error("Votre profil est introuvable ou sa création a échoué. Veuillez contacter le support.");
        }

        if (userProfile.role?.startsWith('artist')) {
          const storiesRef = collection(db, 'stories');
          // FIX: Requête simplifiée pour éviter le besoin d'un index composite.
          const q = query(storiesRef, where('artistId', '==', userProfile.uid));
          const storiesSnap = await getDocs(q);
          
          let stories = storiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Story);

          // FIX: Tri des œuvres côté client pour garantir l'ordre correct.
          // Gère à la fois les Timestamps Firebase et les objets date standards.
          stories.sort((a, b) => {
            const timeA = a.updatedAt instanceof Timestamp 
              ? a.updatedAt.toMillis() 
              : (a.updatedAt as any)?._seconds * 1000 || new Date(a.updatedAt as any).getTime() || 0;
            const timeB = b.updatedAt instanceof Timestamp 
              ? b.updatedAt.toMillis() 
              : (b.updatedAt as any)?._seconds * 1000 || new Date(b.updatedAt as any).getTime() || 0;
            return timeB - timeA; // Tri décroissant (plus récent en premier)
          });
          
          setProfileData({ profile: userProfile, stories: stories });
          setStatus('success');
        } else {
          router.replace('/');
        }
      } catch (e: any) {
        console.error("Erreur critique lors du chargement du profil:", e);
        if (e.message?.includes('requires an index')) {
            setErrorMessage("Erreur de base de données : Un index requis est manquant. Le tri est maintenant effectué dans l'application pour contourner ce problème. Veuillez réessayer.");
        } else {
            setErrorMessage(e.message || "Une erreur inconnue est survenue.");
        }
        setStatus('error');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-950 text-center">
         <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
        <p className="text-stone-300 font-display font-black uppercase text-sm tracking-widest">
          Chargement de votre univers...
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-950 text-center px-4">
        <h2 className="text-2xl font-bold text-rose-500">Erreur de Profil</h2>
        <p className="text-stone-400 italic max-w-md mb-6">{errorMessage}</p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  if (status === 'success' && profileData?.profile.role?.startsWith('artist')) {
    return (
      <ArtistDetailClient 
        artist={profileData.profile} 
        artistStories={profileData.stories || []} 
      />
    );
  }
  
  return null;
}
