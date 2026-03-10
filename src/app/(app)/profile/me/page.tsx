
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

/**
 * Redirection intelligente post-authentification.
 * Résout les erreurs 404 en servant de point d'entrée unique.
 */
export default function ProfileMePage() {
  const { currentUser, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!currentUser) {
      router.replace('/login');
      return;
    }

    if (profile) {
      if (profile.role?.startsWith('artist')) {
        router.replace('/dashboard/creations');
      } else if (profile.role === 'translator') {
        router.replace('/dashboard/translations');
      } else {
        router.replace(`/profile/${currentUser.uid}`);
      }
    } else {
      // Cas de premier profil : redirection vers accueil pour onboarding
      router.replace('/');
    }
  }, [currentUser, profile, loading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-950">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-[0.3em]">Accès à votre sanctuaire...</p>
    </div>
  );
}
