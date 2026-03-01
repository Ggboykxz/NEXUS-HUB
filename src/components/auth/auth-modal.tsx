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
  Sparkles,
  Loader2
} from "lucide-react";
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider 
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
}

export function AuthModal({ isOpen, onClose, action }: AuthModalProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSocialLogin = async (platform: 'Google' | 'Facebook' | 'Apple') => {
    setIsLoading(platform);
    let provider;
    
    switch (platform) {
      case 'Google':
        provider = new GoogleAuthProvider();
        break;
      case 'Facebook':
        provider = new FacebookAuthProvider();
        break;
      case 'Apple':
        provider = new OAuthProvider('apple.com');
        break;
    }

    try {
      await signInWithPopup(auth, provider!);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur NexusHub !",
      });
      onClose();
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Impossible de se connecter.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
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

            <div className="mt-4 space-y-2">
              <Button 
                onClick={() => handleSocialLogin('Google')}
                disabled={!!isLoading}
                variant="outline" 
                className="w-full h-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-3 text-xs group overflow-hidden relative shadow-lg"
              >
                {isLoading === 'Google' ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c1.61-3.21 2.53-7.07 2.53-10.34z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continuer avec Google
                  </>
                )}
              </Button>
              <Button 
                onClick={() => handleSocialLogin('Facebook')}
                disabled={!!isLoading}
                variant="outline" 
                className="w-full h-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-3 text-xs group overflow-hidden relative shadow-lg"
              >
                {isLoading === 'Facebook' ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <svg className="h-4 w-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Continuer avec Facebook
                  </>
                )}
              </Button>
              <Button 
                onClick={() => handleSocialLogin('Apple')}
                disabled={!!isLoading}
                variant="outline" 
                className="w-full h-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-3 text-xs group overflow-hidden relative shadow-lg"
              >
                {isLoading === 'Apple' ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.152 6.896c-.548 0-1.411-.516-2.438-.516-1.357 0-2.714.836-3.407 2.015-1.412 2.4-.364 5.922 1.004 7.81.67.924 1.46 1.962 2.555 1.962.991 0 1.39-.636 2.585-.636 1.196 0 1.541.636 2.585.636 1.111 0 1.804-.937 2.471-1.848.774-1.068 1.09-2.096 1.114-2.148-.025-.013-2.135-.782-2.156-3.126-.021-1.96 1.602-2.898 1.677-2.95-.923-1.28-2.364-1.425-2.888-1.425-.122 0-.244 0-.36-.001-.012 0-.022 0-.033 0-.011 0-.021 0-.032 0-.412.001-.865.021-1.105.021zM12.093 5.22c.579-1.173.483-2.256.422-2.596-.051-.287-.519-.282-1.504.282-.466.267-.931.947-.931 1.626 0 .68.465 1.36.931 1.626.466.267.931.267 1.082-.938z"/>
                    </svg>
                    Continuer avec Apple
                  </>
                )}
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
