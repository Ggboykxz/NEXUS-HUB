'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCcw, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

/**
 * Page d'erreur globale pour NexusHub.
 * Capture les erreurs inattendues dans l'App Router.
 * Désormais connectée à un système de reporting Firestore pour supervision.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 1. Log local pour le développement
    console.error('NexusHub Global Error:', error);

    // 2. Reporting automatique vers Firestore pour supervision Admin
    const reportError = async () => {
      try {
        await addDoc(collection(db, 'errorLogs'), {
          message: error.message || 'Unknown error',
          digest: error.digest || 'no-digest',
          pathname: typeof window !== 'undefined' ? window.location.pathname : 'server-side',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          timestamp: new Date().toISOString(),
          status: 'unread'
        });
      } catch (err) {
        // On évite les boucles infinies en ne relançant pas d'erreur ici si le log échoue
        console.error('Failed to report error to Firestore:', err);
      }
    };

    reportError();
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center selection:bg-destructive/20">
      {/* Visuel d'alerte */}
      <div className="relative mb-8">
        <div className="bg-destructive/10 p-8 rounded-full animate-pulse">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-background border border-destructive/20 p-2 rounded-lg shadow-xl">
          <ShieldAlert className="h-5 w-5 text-destructive" />
        </div>
      </div>

      {/* Message principal */}
      <h1 className="text-4xl md:text-5xl font-display font-black mb-4 tracking-tighter text-foreground">
        Une anomalie dans le Hub
      </h1>
      
      <p className="text-muted-foreground text-lg max-w-md mb-12 leading-relaxed font-light italic">
        "Nos scribes numériques ont rencontré un obstacle imprévu lors du chargement de l'histoire. Pas d'inquiétude, l'immersion reprendra bientôt."
      </p>

      {/* Actions de secours */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => reset()} 
          size="lg" 
          className="h-14 px-10 rounded-full font-bold text-lg gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <RefreshCcw className="h-5 w-5" />
          Réessayer le chargement
        </Button>
        
        <Button 
          asChild 
          variant="outline" 
          size="lg" 
          className="h-14 px-10 rounded-full font-bold text-lg gap-2 border-primary text-primary hover:bg-primary/5 transition-all active:scale-95"
        >
          <Link href="/">
            <Home className="h-5 w-5" />
            Retour à l'accueil
          </Link>
        </Button>
      </div>

      {/* Identifiant technique */}
      <div className="mt-16 pt-8 border-t border-border/50 w-full max-w-xs">
        <p className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
          Code Incident : {error.digest || 'Internal Nexus Fault'}
        </p>
        <p className="text-[8px] text-muted-foreground/60 mt-2 italic">
          L'équipe technique a été notifiée automatiquement.
        </p>
      </div>
    </div>
  );
}
