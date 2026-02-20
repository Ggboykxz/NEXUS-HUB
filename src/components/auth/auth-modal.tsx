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
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Heart, 
  Users, 
  Zap, 
  Sparkles
} from "lucide-react";
import Link from 'next/link';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
}

export function AuthModal({ isOpen, onClose, action }: AuthModalProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleSocialLogin = (platform: string) => {
    console.log(`Login with ${platform}`);
    // Simulation de redirection ou traitement
  };

  const teaserBenefits = [
    { icon: Zap, text: "Accès exclusif" },
    { icon: Users, text: "Communauté" },
    { icon: Heart, text: "Favoris" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] sm:max-w-[360px] p-0 overflow-hidden border-none bg-stone-950 shadow-2xl rounded-2xl">
        <div className="relative overflow-hidden">
          {/* Gold Decorative Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />

          <div className="relative z-10 p-5 sm:p-6">
            <DialogHeader className="text-center space-y-2">
              <div className="mx-auto bg-primary/10 p-2 rounded-full w-fit mb-0.5">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-lg sm:text-xl font-display font-black gold-resplendant drop-shadow-[0_0_10px_rgba(212,168,67,0.3)] leading-tight">
                Membres Uniquement
              </DialogTitle>
              <DialogDescription className="text-stone-300 font-light italic text-[11px] sm:text-xs">
                Connectez-vous pour <span className="text-primary font-bold">{action}</span>.
              </DialogDescription>
            </DialogHeader>

            {/* Teaser Benefits */}
            <div className="mt-4 grid grid-cols-3 gap-2 bg-white/5 rounded-lg p-2.5 border border-white/5">
              {teaserBenefits.map((benefit, idx) => (
                <div key={idx} className="flex flex-col items-center text-center gap-1">
                  <div className="bg-primary/20 p-1 rounded-md shrink-0">
                    <benefit.icon className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-[8px] font-bold text-stone-200 tracking-tight leading-tight uppercase">{benefit.text}</p>
                </div>
              ))}
            </div>

            {/* Social Login Options */}
            <div className="mt-4 space-y-2">
              <Button 
                onClick={() => handleSocialLogin('Google')}
                variant="outline" 
                className="w-full h-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-3 text-xs group overflow-hidden relative shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <i className="fa-brands fa-google text-red-500 text-sm" />
                Continuer avec Google
              </Button>
              <Button 
                onClick={() => handleSocialLogin('Facebook')}
                variant="outline" 
                className="w-full h-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-3 text-xs group overflow-hidden relative shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <i className="fa-brands fa-facebook text-blue-600 text-sm" />
                Continuer avec Facebook
              </Button>
              <Button 
                onClick={() => handleSocialLogin('X')}
                variant="outline" 
                className="w-full h-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-3 text-xs group overflow-hidden relative shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <i className="fa-brands fa-x-twitter text-white text-sm" />
                Continuer avec X
              </Button>
              
              {!showEmailForm ? (
                <button 
                  onClick={() => setShowEmailForm(true)}
                  className="w-full text-center py-2 text-stone-500 hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Mail className="h-3 w-3" /> Utiliser mon Email
                </button>
              ) : (
                <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-300">
                  <Input 
                    placeholder="Email" 
                    className="bg-white/5 border-white/10 h-10 rounded-xl text-white text-xs focus:border-primary" 
                  />
                  <Input 
                    type="password" 
                    placeholder="Mot de passe" 
                    className="bg-white/5 border-white/10 h-10 rounded-xl text-white text-xs focus:border-primary" 
                  />
                  <Button className="w-full h-10 rounded-xl font-black bg-primary text-black gold-shimmer text-xs">
                    Se Connecter
                  </Button>
                  <button 
                    onClick={() => setShowEmailForm(false)}
                    className="w-full text-center text-[9px] text-stone-500 hover:text-stone-300 mt-1"
                  >
                    Retour aux options
                  </button>
                </div>
              )}
            </div>

            {/* Inscription Teaser */}
            <div className="mt-4 pt-4 border-t border-white/5 text-center space-y-2">
              <p className="text-[10px] text-stone-400 font-medium">
                Pas membre ? <Link href="/signup" onClick={onClose} className="text-primary font-bold hover:underline">S'inscrire gratuitement</Link>
              </p>
              <div className="flex justify-center items-center gap-3 text-[8px] font-bold text-stone-600 uppercase tracking-widest">
                <div className="flex items-center gap-1"><ShieldCheck className="h-2.5 w-2.5" /> Sécurisé</div>
                <div className="h-1 w-1 rounded-full bg-stone-800" />
                <div className="flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" /> 100% Gratuit</div>
              </div>
            </div>

            {/* Secondary Escape Link */}
            <button 
              onClick={onClose}
              className="mt-4 w-full text-center text-[9px] text-stone-600 hover:text-stone-400 transition-colors uppercase font-bold tracking-tighter"
            >
              Fermer
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
