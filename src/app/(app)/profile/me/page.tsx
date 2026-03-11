'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

/**
 * Dispatcher intelligent post-authentification.
 * Oriente l'utilisateur vers le tableau de bord approprié selon son rôle.
 */
export default function ProfileMePage() {
  const { currentUser, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // On attend que l'état d'authentification soit stabilisé
    if (loading) return;

    // Si pas d'utilisateur connecté, retour au login
    if (!currentUser) {
      router.replace('/login');
      return;
    }

    // Une fois le profil chargé, on redirige selon le rôle
    if (profile) {
      const role = profile.role?.toLowerCase() || '';
      
      if (role.startsWith('artist')) {
        router.replace('/dashboard/creations');
      } else if (role === 'translator') {
        router.replace('/dashboard/translations');
      } else if (role === 'admin') {
        router.replace('/dashboard');
      } else {
        // Lecteurs (standard et premium)
        router.replace(`/profile/${currentUser.uid}`);
      }
    } else {
      // Cas rare où le profil n'est pas encore créé (onboarding)
      router.replace('/');
    }
  }, [currentUser, profile, loading, router]);

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