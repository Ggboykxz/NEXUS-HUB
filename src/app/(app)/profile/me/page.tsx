'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

/**
 * Route de redirection intelligente.
 * Dirige les artistes vers leur vitrine publique (/artiste/[slug])
 * et les lecteurs vers leur profil personnel (/profile/[uid]).
 */
export default function ProfileMePage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            // Si c'est un artiste, on privilégie sa vitrine publique via son slug
            if (data.role?.startsWith('artist') && data.slug) {
              router.replace(`/artiste/${data.slug}`);
            } else {
              router.replace(`/profile/${user.uid}`);
            }
          } else {
            // Fallback si le doc n'est pas encore prêt
            router.replace(`/profile/${user.uid}`);
          }
        } catch (e) {
          router.replace(`/profile/${user.uid}`);
        }
      } else {
        router.replace('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-stone-950">
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
