
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
      return response.ok;
    } catch (e) {
      console.error("Erreur session cookie", e);
      return false;
    }
  };

  const handleSuccessfulLogin = useCallback(async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Initialisation sécurisée pour les logins sociaux
      const baseName = user.displayName || user.email?.split('@')[0] || 'voyageur';
      const slug = baseName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Nouveau Voyageur',
        photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
        slug: slug,
        afriCoins: 0,
        level: 1,
        subscribersCount: 0,
        followedCount: 0,
        isCertified: false,
        isBanned: false,
        isVerified: false,
        onboardingCompleted: false,
        bio: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        readingStats: {
          preferredGenres: {},
          totalReadTime: 0,
          chaptersRead: 0,
          favoriteArtists: []
        },
        readingStreak: {
          currentCount: 0,
          lastReadDate: '',
          longestStreak: 0,
          weeklyCoins: 0
        },
        preferences: {
          theme: 'dark',
          language: 'fr',
          privacy: {
            showCurrentReading: true,
            showHistory: true
          }
        }
      }, { merge: true });
    }

    const userData = (await getDoc(userRef)).data();

    if (!userData?.role) {
      setPendingUser(user);
      setView('role_selection');
    } else {
      await createSession(user);
      toast({ title: "Connexion réussie", description: "Bon retour au Hub !" });
      resetState();
      router.refresh();
    }
  }, [router, toast]);

  useEffect(() => {
    if (isOpen) {
      getRedirectResult(auth).then(async (result) => {
        if (result?.user) {
          await handleSuccessfulLogin(result.user);
        }
      }).catch(console.error);
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
      const result = await signInWithPopup(auth, provider!);
      if (result.user) await handleSuccessfulLogin(result.user);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') toast({ title: "Échec", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('email');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleSuccessfulLogin(userCredential.user);
    } catch (error: any) {
      toast({ title: "Erreur d'accès", description: "Vérifiez vos identifiants.", variant: "destructive" });
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
      await createSession(pendingUser);
      toast({ title: "Destinée scellée !", description: "Bienvenue au Hub." });
      resetState();
      router.refresh();
    } catch (e) {
      toast({ title: "Erreur", description: "Action impossible.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  if (view === 'role_selection') {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && resetState()}>
        <DialogContent className="max-w-[380px] p-8 border-none bg-stone-950 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-black text-white gold-resplendant text-center">Choisissez votre rôle</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 pt-6">
            <button onClick={() => handleRoleChoice('artist_draft')} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary transition-all text-center space-y-3 group">
              <Brush className="h-8 w-8 mx-auto text-primary group-hover:scale-110" />
              <p className="font-bold text-[10px] uppercase text-white">Artiste</p>
            </button>
            <button onClick={() => handleRoleChoice('reader')} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500 transition-all text-center space-y-3 group">
              <BookOpen className="h-8 w-8 mx-auto text-emerald-500 group-hover:scale-110" />
              <p className="font-bold text-[10px] uppercase text-white">Lecteur</p>
            </button>
          </div>
          {isLoading === 'role' && <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mt-4" />}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetState()}>
      <DialogContent className="max-w-[380px] p-0 overflow-hidden border-none bg-stone-950 shadow-2xl rounded-[2.5rem]">
        <div className="p-8 space-y-6">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto bg-primary/10 p-3 rounded-2xl w-fit"><Lock className="h-6 w-6 text-primary" /></div>
            <DialogTitle className="text-2xl font-display font-black gold-resplendant">Identification</DialogTitle>
            <DialogDescription className="text-stone-400 text-xs italic">Connectez-vous pour <span className="text-primary font-bold">{action}</span>.</DialogDescription>
          </DialogHeader>

          {view === 'main' ? (
            <div className="space-y-3">
              <Button onClick={() => handleSocialLogin('Google')} disabled={!!isLoading} variant="outline" className="w-full h-12 rounded-xl border-white/10 bg-white/5 text-white font-bold gap-4">
                {isLoading === 'Google' ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continuer avec Google"}
              </Button>
              <Button variant="ghost" onClick={() => setView('email')} className="w-full h-10 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-primary transition-all">
                <Mail className="h-4 w-4 mr-2" /> Email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-4">
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

          <div className="pt-4 border-t border-white/5 text-center">
            <p className="text-xs text-stone-500">Pas encore de compte ? <Link href="/signup" onClick={resetState} className="text-primary font-bold hover:underline">S'inscrire</Link></p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
