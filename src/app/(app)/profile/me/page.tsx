'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';

/**
 * Dispatcher intelligent post-authentification.
 * Oriente l'utilisateur vers le tableau de bord approprié selon son rôle.
 */
export default function ProfileMePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile | null>({
    queryKey: ['user-profile', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return null;
      const userDocRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
      }
      return null;
    },
    enabled: !!currentUser,
  });

  useEffect(() => {
    const loading = authLoading || profileLoading;
    if (loading) {
      return; // Wait until all data is loaded
    }

    if (!currentUser) {
      router.replace('/login');
      return;
    }

    if (profile) {
      const role = profile.role?.toLowerCase() || '';
      
      if (role.startsWith('artist')) {
        router.replace('/dashboard/creations');
      } else if (role === 'translator') {
        router.replace('/dashboard/translations');
      } else if (role === 'admin') {
        router.replace('/dashboard');
      } else {
        // Readers (standard and premium)
        router.replace(`/profile/${currentUser.uid}`);
      }
    } else {
      // Profile doesn't exist yet (e.g., during onboarding)
      // or user document is missing. Redirect to a safe place.
      router.replace('/');
    }
  }, [currentUser, profile, authLoading, profileLoading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-950">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full" />
      </div>
      <div className="space-y-2 text-center">
        <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-[0.3em]">Nexus Dispatcher</p>
        <p className="text-stone-600 text-[9px] uppercase font-bold italic">Synchronisation de votre destinée...</p>
      </div>
    </div>
  );
}
