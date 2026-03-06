'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Lock,
  Mail,
  Loader2,
  Brush,
  BookOpen,
  Eye,
  EyeOff
} from "lucide-react";
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  getRedirectResult,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
}

export function AuthModal({ isOpen, onClose, action }: AuthModalProps) {
  const [view, setView] = useState<'main' | 'email' | 'role_selection'>('main');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();
  const { toast } = useToast();

  const resetState = () => {
    setView('main');
    setIsLoading(null);
    setPendingUser(null);
    setEmail('');
    setPassword('');
    onClose();
  };
  
  const createSession = async (user: User) => {
    try {
      const idToken = await user.getIdToken(true);
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create session cookie.');
      }
      
      return true;
    } catch (e) {
      console.error("Erreur session cookie", e);
      toast({ title: "Erreur de session", description: "Impossible de valider votre session.", variant: "destructive" });
      return false;
    }
  };

  const handleSuccessfulLogin = useCallback(async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create user doc for the first time
      try {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Nouveau Voyageur',
          photoURL: user.photoURL || '',
          afriCoins: 0,
          bio: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (e) {
        console.error("Failed to create user document", e);
        toast({ title: "Erreur de compte", description: "Impossible de créer votre profil.", variant: "destructive" });
        return;
      }
    }

    const userData = (await getDoc(userRef)).data(); // re-fetch to be sure

    if (!userData?.role) {
      // If no role, prompt for selection
      setPendingUser(user);
      setView('role_selection');
    } else {
      // Existing user with a role, create session and finish
      const sessionCreated = await createSession(user);
      if (sessionCreated) {
        toast({ title: "Connexion réussie", description: "Bon retour au Hub !" });
        resetState();
        router.refresh();
      }
    }
  }, [router, toast]);

  // Handle redirect from social providers on mobile
  useEffect(() => {
    if (isOpen) {
      getRedirectResult(auth).then(async (result) => {
        if (result?.user) {
          setIsLoading('social');
          await handleSuccessfulLogin(result.user);
          setIsLoading(null);
        }
      }).catch((error) => {
        console.error("Modal redirect auth error:", error);
      });
    }
  }, [isOpen, handleSuccessfulLogin]);

  const handleSocialLogin = async (platform: 'Google' | 'Facebook' | 'Apple') => {
    setIsLoading(platform);
    let provider;
    
    switch (platform) {
      case 'Google': provider = new GoogleAuthProvider(); break;
      case 'Facebook': provider = new FacebookAuthProvider(); break;
      case 'Apple': provider = new OAuthProvider('apple.com'); break;
    }

    try {
      // We will now prefer popup, Firebase handles fallback to redirect if needed.
      const result = await signInWithPopup(auth, provider!);
      if (result.user) {
        await handleSuccessfulLogin(result.user);
      }
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled') {
         toast({ title: "Échec de connexion", description: "Une erreur est survenue.", variant: "destructive" });
         console.error("Social login error:", error);
      }
    } finally {
      setIsLoading(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading('email');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleSuccessfulLogin(userCredential.user);
    } catch (error: any) {
      toast({ title: "Accès refusé", description: "Email ou mot de passe incorrect.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  const handleRoleChoice = async (role: 'reader' | 'artist_draft') => {
    if (!pendingUser) return;
    setIsLoading('role');
    try {
      await updateDoc(doc(db, 'users', pendingUser.uid), { 
        role,
        updatedAt: serverTimestamp()
      });
      
      const sessionCreated = await createSession(pendingUser);
      if(sessionCreated) {
        toast({ title: "Profil configuré !", description: "Bienvenue au Hub." });
        resetState();
        router.refresh();
      }
    } catch (e) {
      toast({ title: "Erreur", description: "Impossible de sauvegarder votre rôle.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  if (view === 'role_selection') {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && resetState()}>
        <DialogContent className="max-w-[90vw] sm:max-w-[500px] p-8 border-none bg-stone-950 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-black text-white gold-resplendant text-center">Quelle est votre destinée ?</DialogTitle>
            <DialogDescription className="text-center text-stone-400">Sélectionnez votre rôle sur la plateforme NexusHub</DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleRoleChoice('artist_draft')} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary transition-all text-center space-y-3 group">
                <Brush className="h-8 w-8 mx-auto text-primary group-hover:scale-110 transition-transform" />
                <p className="font-bold text-xs uppercase tracking-widest text-white">Artiste</p>
              </button>
              <button onClick={() => handleRoleChoice('reader')} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500 transition-all text-center space-y-3 group">
                <BookOpen className="h-8 w-8 mx-auto text-emerald-500 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-xs uppercase tracking-widest text-white">Lecteur</p>
              </button>
            </div>
            {isLoading === 'role' && <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetState()}>
      <DialogContent className="max-w-[90vw] sm:max-w-[380px] p-0 overflow-hidden border-none bg-stone-950 shadow-2xl rounded-[2.5rem]">
        <div className="p-8 space-y-6">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto bg-primary/10 p-3 rounded-2xl w-fit"><Lock className="h-6 w-6 text-primary" /></div>
            <DialogTitle className="text-2xl font-display font-black gold-resplendant">Identification</DialogTitle>
            <DialogDescription className="text-stone-400 text-xs italic font-light">
              Connectez-vous pour <span className="text-primary font-bold">{action}</span>.
            </DialogDescription>
          </DialogHeader>

          {view === 'main' && (
            <div className="space-y-3 animate-in fade-in">
              <Button onClick={() => handleSocialLogin('Google')} disabled={!!isLoading} variant="outline" className="w-full h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-4">
                {isLoading === 'Google' ? <Loader2 className="h-5 w-5 animate-spin" /> : <><svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c1.61-3.21 2.53-7.07 2.53-10.34z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Google</>}
              </Button>
               <div className="flex items-center gap-4 py-1">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] font-black uppercase text-stone-600 tracking-widest">Ou</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <Button variant="ghost" onClick={() => setView('email')} className="w-full h-10 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-primary transition-all">
                <Mail className="h-4 w-4 mr-2" /> Utiliser un Email
              </Button>
            </div>
          )}

          {view === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="bg-white/5 border-white/10 h-11 rounded-xl text-xs" required />
              <div className="relative">
                <Input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Mot de passe" className="bg-white/5 border-white/10 h-11 rounded-xl text-xs pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button disabled={isLoading === 'email'} className="w-full h-12 rounded-xl bg-primary text-black font-black gold-shimmer">
                {isLoading === 'email' ? <Loader2 className="h-5 w-5 animate-spin" /> : "Se Connecter"}
              </Button>
              <button type="button" onClick={() => setView('main')} className="w-full text-xs font-bold uppercase text-stone-500 hover:text-white">Retour</button>
            </form>
          )}

          <div className="pt-4 border-t border-white/5 text-center space-y-4">
            <p className="text-xs text-stone-500">Pas encore de compte ? <Link href="/signup" onClick={resetState} className="text-primary font-bold hover:underline">S'inscrire</Link></p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
