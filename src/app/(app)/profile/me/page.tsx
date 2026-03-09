'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

/**
 * Page de redirection /profile/me.
 * Utilise exclusivement le SDK Client pour identifier l'utilisateur
 * et le rediriger vers son profil spécifique selon son rôle.
 */
export default function ProfileMePage() {
  const { currentUser, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // On attend que l'état d'authentification soit chargé
    if (loading) return;

    // Si aucun utilisateur n'est connecté, direction le login
    if (!currentUser) {
      router.replace('/login?callbackUrl=/profile/me');
      return;
    }

    // Une fois le profil chargé, on redirige selon le rôle
    if (profile) {
      if (profile.role?.startsWith('artist')) {
        // Les artistes vont sur leur vitrine publique (qui contient leurs outils de gestion)
        router.replace(`/artiste/${profile.slug}`);
      } else if (profile.role === 'translator') {
        // Les traducteurs vont sur leur dashboard spécifique
        router.replace('/dashboard/translations');
      } else {
        // Les lecteurs vont sur leur page de profil privée
        router.replace(`/profile/${currentUser.uid}`);
      }
    } else {
      // Cas rare : l'utilisateur existe en Auth mais pas en Firestore
      // On redirige vers l'accueil pour déclencher l'onboarding si nécessaire
      router.replace('/');
    }
  }, [currentUser, profile, loading, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-stone-950">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full" />
      </div>
      <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-[0.3em]">
        Accès à votre sanctuaire...
      </p>
    </div>
  );
}
