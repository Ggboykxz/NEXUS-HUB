'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, X, Download, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Afficher la bannière seulement si l'utilisateur n'a pas déjà fermé la session
      const dismissed = localStorage.getItem('pwa-dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[400px] z-[100] animate-in slide-in-from-bottom-10 duration-700">
      <div className="bg-stone-900 border border-primary/20 p-6 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Smartphone className="h-24 w-24 text-primary" />
        </div>
        
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-stone-500 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-display font-black text-white leading-tight">NexusHub sur ton écran</h3>
              <p className="text-[10px] uppercase font-black text-primary tracking-widest">Installation Rapide</p>
            </div>
          </div>

          <p className="text-stone-400 text-sm italic font-light leading-relaxed">
            "Installe NexusHub pour une lecture fluide, même hors-ligne, et accède à tes séries en un clic."
          </p>

          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handleInstall} 
              className="flex-1 rounded-xl bg-primary text-black font-black h-11 gold-shimmer"
            >
              Installer Maintenant
            </Button>
            <Button 
              onClick={handleDismiss}
              variant="outline" 
              className="rounded-xl border-white/10 text-white font-bold h-11"
            >
              Plus tard
            </Button>
          </div>

          <div className="flex items-center gap-2 pt-2 text-[8px] font-bold text-stone-600 uppercase tracking-[0.2em]">
            <Star className="h-2.5 w-2.5 text-primary fill-current" />
            Zéro stockage requis
            <span className="h-1 w-1 rounded-full bg-stone-800" />
            Lecture Offline
          </div>
        </div>
      </div>
    </div>
  );
}
