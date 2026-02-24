'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SponsoredPanelProps {
  className?: string;
}

export function SponsoredPanel({ className }: SponsoredPanelProps) {
  return (
    <div className={cn("w-full max-w-[800px] mx-auto py-12 px-4", className)}>
      <div className="relative aspect-[16/9] rounded-3xl overflow-hidden group shadow-2xl border-4 border-stone-900 bg-stone-900">
        <Image 
          src="https://picsum.photos/seed/ad-africa/1200/800" 
          alt="Publicité Culturelle" 
          fill 
          className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 text-[8px] font-black uppercase tracking-widest px-3">
            Contenu Sponsorisé
          </Badge>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
          <div className="space-y-1 max-w-md">
            <h4 className="text-xl font-display font-black text-white leading-tight">Découvrez les saveurs du Sahel</h4>
            <p className="text-xs text-stone-300 font-light italic">"L'art culinaire au service de la narration."</p>
          </div>
          <button className="bg-primary text-black h-10 w-10 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-90">
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute top-4 right-4 opacity-40 hover:opacity-100 transition-opacity">
          <Info className="h-4 w-4 text-white cursor-help" title="Pourquoi cette publicité ? NexusHub sélectionne des partenaires en affinité avec la culture africaine." />
        </div>
      </div>
      
      <p className="text-center text-[10px] text-stone-600 uppercase font-black tracking-[0.3em] mt-4">
        Supportez les créateurs en découvrant nos partenaires
      </p>
    </div>
  );
}
