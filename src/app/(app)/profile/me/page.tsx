'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

/**
 * Route de redirection intelligente pour le profil utilisateur actuel.
 * Redirige de /profile/me vers /profile/{uid}
 */
export default function ProfileMePage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace(`/profile/${user.uid}`);
      } else {
        router.replace('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-stone-950">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-[0.3em]">
        Accès à votre sanctuaire...
      </p>
    </div>
  );
}