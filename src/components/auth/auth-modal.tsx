'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  BookOpen, 
  Zap, 
  Heart, 
  Users, 
  Sparkles,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from 'next/link';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
}

export function AuthModal({ isOpen, onClose, action }: AuthModalProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleSocialLogin = (platform: string) => {
    // Logic for social login
    console.log(`Login with ${platform}`);
  };

  const teaserBenefits = [
    { icon: Zap, text: "Accédez à des chapitres exclusifs et Premium" },
    { icon: Users, text: "Rejoignez la communauté et discutez avec d'autres fans" },
    { icon: Heart, text: "Sauvegardez vos favoris et recevez des alertes" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none bg-stone-950 shadow-2xl">
        <div className="relative overflow-hidden">
          {/* Gold Decorative Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer" />

          <div className="relative z-10 p-8">
            <DialogHeader className="text-center space-y-4">
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-2xl md:text-3xl font-display font-black gold-resplendant drop-shadow-[0_0_10px_rgba(212,168,67,0.3)]">
                Action Réservée aux Membres !
              </DialogTitle>
              <DialogDescription className="text-stone-300 font-light italic text-sm">
                Connectez-vous ou inscrivez-vous en un clic pour <span className="text-primary font-bold">{action}</span>. C'est gratuit et rapide !
              </DialogDescription>
            </DialogHeader>

            {/* Teaser Benefits */}
            <div className="mt-8 space-y-3 bg-white/5 rounded-2xl p-5 border border-white/5">
              {teaserBenefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="bg-primary/20 p-1 rounded-md mt-0.5">
                    <benefit.icon className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-[11px] font-bold text-stone-200 tracking-tight leading-snug">{benefit.text}</p>
                </div>
              ))}
              <p className="text-[9px] text-primary/60 font-black uppercase tracking-[0.2em] pt-2 text-center">
                12k lecteurs ont déjà rejoint l'aventure
              </p>
            </div>

            {/* Social Login Options */}
            <div className="mt-8 space-y-3">
              <Button 
                onClick={() => handleSocialLogin('Google')}
                variant="outline" 
                className="w-full h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-3 transition-all active:scale-95 group overflow-hidden relative shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <i className="fa-brands fa-google text-lg text-red-500" />
                Continuer avec Google
              </Button>
              <Button 
                onClick={() => handleSocialLogin('X')}
                variant="outline" 
                className="w-full h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-3 transition-all active:scale-95 group overflow-hidden relative shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <i className="fa-brands fa-x-twitter text-lg" />
                Continuer avec X (Twitter)
              </Button>
              
              <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[9px] uppercase font-black tracking-[0.3em] text-stone-500">Ou</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {!showEmailForm ? (
                <Button 
                  onClick={() => setShowEmailForm(true)}
                  variant="ghost" 
                  className="w-full text-stone-400 hover:text-primary transition-colors text-xs font-bold"
                >
                  <Mail className="mr-2 h-4 w-4" /> Utiliser mon Email
                </Button>
              ) : (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Input 
                    placeholder="Email" 
                    className="bg-white/5 border-white/10 h-11 rounded-xl text-white" 
                  />
                  <Input 
                    type="password" 
                    placeholder="Mot de passe" 
                    className="bg-white/5 border-white/10 h-11 rounded-xl text-white" 
                  />
                  <Button className="w-full h-11 rounded-xl font-black bg-primary text-black gold-shimmer">
                    Se Connecter
                  </Button>
                  <button 
                    onClick={() => setShowEmailForm(false)}
                    className="w-full text-center text-[10px] text-stone-500 hover:text-stone-300"
                  >
                    Retour aux options rapides
                  </button>
                </div>
              )}
            </div>

            {/* Inscription Teaser */}
            <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-4">
              <p className="text-xs text-stone-400 font-medium">
                Pas encore membre ? <Link href="/signup" onClick={onClose} className="text-primary font-bold hover:underline">Inscrivez-vous en 10 secondes !</Link>
              </p>
              <div className="flex justify-center items-center gap-4 text-[10px] font-bold text-stone-600 uppercase tracking-widest">
                <div className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> RGPD</div>
                <div className="h-1 w-1 rounded-full bg-stone-800" />
                <div className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> Gratuit</div>
              </div>
            </div>

            {/* Close Link */}
            <button 
              onClick={onClose}
              className="mt-6 w-full text-center text-[10px] text-stone-500 hover:text-stone-300 transition-colors"
            >
              Continuer sans s'authentifier
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
