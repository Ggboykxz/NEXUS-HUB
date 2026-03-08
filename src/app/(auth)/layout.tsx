'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

/**
 * Layout pour les pages d'authentification (login, signup, etc.).
 * Cette version est épurée de toute logique de redirection côté client qui causait le bug 404.
 * La responsabilité de la redirection est désormais entièrement gérée par les pages elles-mêmes
 * et la page /profile/me, ce qui est une approche beaucoup plus robuste.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // La logique de redirection qui se trouvait ici a été supprimée.
  // Elle vérifiait si l'utilisateur était connecté et tentait de le rediriger,
  // ce qui créait une "race condition" fatale juste après l'inscription.

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-stone-950 font-sans">
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-stone-900/50 relative overflow-hidden">
        <div className="absolute inset-0 -m-32 opacity-10">
          <Image 
            src="/assets/images/pattern.svg" 
            alt="Fond géométrique" 
            layout="fill" 
            objectFit="cover" 
          />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-display font-black text-white gold-resplendant leading-tight">
            Nexus Hub
          </h1>
          <p className="text-stone-400 mt-4 max-w-md italic">
            Là où les légendes africaines prennent vie. Connectez-vous pour explorer des mondes, créer des récits et rejoindre la communauté.
          </p>
        </div>
      </div>
      <main className="flex items-center justify-center p-4">
        <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
