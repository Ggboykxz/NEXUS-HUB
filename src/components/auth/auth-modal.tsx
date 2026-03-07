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
  EyeOff,
  Crown,
  Award
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
  User,
  getIdToken
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
      const idToken = await getIdToken(user, true);
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

  const getRedirectForRole = (role: string) => {
    if (role.startsWith('artist')) return '/dashboard/creations';
    if (role === 'admin') return '/dashboard';
    return '/';
  };

  const handleSuccessfulLogin = useCallback(async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists() || !userDoc.data()?.role) {
        setPendingUser(user);
        setView('role_selection');
      } else {
        const userData = userDoc.data();
        const sessionOk = await createSession(user);
        if (sessionOk) {
          toast({ title: "Connexion réussie", description: "Bon retour au Hub !" });
          window.location.href = getRedirectForRole(userData.role);
          resetState();
        } else {
          toast({ title: "Erreur de session", variant: "destructive" });
        }
      }
    } catch (error) {
      console.error("Login handling error:", error);
      toast({ title: "Erreur lors de la connexion", variant: "destructive" });
    }
  }, [toast, router]);

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

  const handleRoleChoice = async (role: string) => {
    if (!pendingUser) return;
    setIsLoading('role');
    try {
      const userRef = doc(db, 'users', pendingUser.uid);
      const baseName = pendingUser.displayName || pendingUser.email?.split('@')[0] || 'voyageur';
      const slug = baseName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
      
      await setDoc(userRef, {
        uid: pendingUser.uid,
        email: pendingUser.email,
        displayName: pendingUser.displayName || 'Nouveau Voyageur',
        slug,
        role,
        afriCoins: role === 'premium_reader' ? 50 : 0,
        level: 1,
        subscribersCount: 0,
        followedCount: 0,
        isCertified: role === 'artist_pro' || role === 'artist_elite',
        isBanned: false,
        isVerified: false,
        onboardingCompleted: false,
        bio: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        readingStats: { preferredGenres: {}, totalReadTime: 0, chaptersRead: 0, favoriteArtists: [] },
        readingStreak: { currentCount: 0, lastReadDate: '', longestStreak: 0 },
        preferences: { language: 'fr', theme: 'dark', privacy: { showCurrentReading: true, showHistory: true } }
      }, { merge: true });

      const sessionOk = await createSession(pendingUser);
      if (sessionOk) {
        toast({ title: "Destinée scellée !", description: "Bienvenue au Hub." });
        window.location.href = getRedirectForRole(role);
        resetState();
      } else {
        throw new Error("Session fail");
      }
    } catch (e) {
      toast({ title: "Erreur", description: "Impossible de valider votre rôle.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  if (view === 'role_selection') {
    const roles = [
      { id: 'reader', label: 'Lecteur', icon: BookOpen, color: 'text-stone-400' },
      { id: 'premium_reader', label: 'Premium', icon: Crown, color: 'text-amber-500' },
      { id: 'artist_draft', label: 'Artiste Draft', icon: Brush, color: 'text-orange-500' },
      { id: 'artist_pro', label: 'Artiste Pro', icon: Award, color: 'text-emerald-500' },
    ];

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && resetState()}>
        <DialogContent className="max-w-[400px] p-8 border-none bg-stone-950 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-black text-white gold-resplendant text-center">Choisissez votre rôle</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 pt-6">
            {roles.map((r) => (
              <button 
                key={r.id}
                disabled={!!isLoading} 
                onClick={() => handleRoleChoice(r.id)} 
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary transition-all text-center space-y-3 group disabled:opacity-50"
              >
                <r.icon className={cn("h-8 w-8 mx-auto group-hover:scale-110 transition-transform", r.color)} />
                <p className="font-bold text-[10px] uppercase text-white">{r.label}</p>
              </button>
            ))}
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
