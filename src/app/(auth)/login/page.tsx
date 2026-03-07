'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowRight, Loader2, BookOpen, Brush } from "lucide-react";
import { cn } from '@/lib/utils';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, User, getIdToken } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const formSchema = z.object({
  email: z.string().email({ message: "Email invalide." }),
  password: z.string().min(1, { message: "Mot de passe requis." }),
});

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [pendingUid, setPendingUid] = useState<string | null>(null);

  const callbackUrl = searchParams.get('callbackUrl');
  const redirectTo = (callbackUrl && callbackUrl.startsWith('/')) ? callbackUrl : '/';

  const getRedirectForRole = (role: string) => {
    if (role.startsWith('artist')) return '/dashboard/creations';
    if (role === 'admin') return '/dashboard';
    return redirectTo;
  };

  const createSession = async (user: User) => {
    try {
      const idToken = await getIdToken(user, true);
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
      });
      return response.ok;
    } catch (e) {
      console.error("Session creation error", e);
      return false;
    }
  };

  const checkUserRoleAndRedirect = async (uid: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      let userDoc = await getDoc(doc(db, 'users', uid));
      
      if (!userDoc.exists() || !userDoc.data()?.role) {
        setPendingUid(uid);
        setShowRoleSelection(true);
        if (!userDoc.exists()) {
          // Robust creation with multiple attempts if needed
          await setDoc(doc(db, 'users', uid), {
            uid, email: user.email, displayName: user.displayName || 'Voyageur',
            photoURL: user.photoURL || `https://picsum.photos/seed/${uid}/200/200`, 
            afriCoins: 0, createdAt: serverTimestamp(),
            readingStats: { chaptersRead: 0, totalReadTime: 0 },
            preferences: { language: 'fr', theme: 'dark', privacy: { showCurrentReading: true, showHistory: true } }
          }, { merge: true });
        }
      } else {
        const role = userDoc.data()?.role;
        const sessionCreated = await createSession(user);
        if (sessionCreated) {
          toast({ title: "Content de vous revoir !" });
          window.location.href = getRedirectForRole(role);
        } else {
          toast({ title: "Erreur de session", description: "Veuillez réessayer.", variant: "destructive" });
        }
      }
    } catch (error) {
      console.error("Error in checkUserRoleAndRedirect:", error);
      toast({ title: "Erreur d'authentification", variant: "destructive" });
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      await checkUserRoleAndRedirect(userCredential.user.uid);
    } catch (error: any) {
      toast({ title: "Erreur", description: "Email ou mot de passe incorrect.", variant: "destructive" });
      setIsLoading(false);
    }
  }

  const handleSocialLogin = async (platform: 'Google' | 'Facebook' | 'Apple') => {
    let provider;
    if (platform === 'Google') provider = new GoogleAuthProvider();
    else if (platform === 'Facebook') provider = new FacebookAuthProvider();
    else provider = new OAuthProvider('apple.com');

    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) await checkUserRoleAndRedirect(result.user.uid);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') toast({ title: "Échec de connexion", variant: "destructive" });
    }
  };

  const handleRoleChoice = async (role: string) => {
    if (!pendingUid || !auth.currentUser) return;
    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'users', pendingUid), { role, updatedAt: serverTimestamp() });
      const sessionCreated = await createSession(auth.currentUser);
      if (sessionCreated) {
        toast({ title: "Destinée choisie !" });
        window.location.href = getRedirectForRole(role);
      } else {
        toast({ title: "Erreur de session", variant: "destructive" });
        setIsLoading(false);
      }
    } catch (e) {
      console.error("Role choice error:", e);
      toast({ title: "Erreur", variant: "destructive" });
      setIsLoading(false);
    }
  };

  if (showRoleSelection) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950 p-6">
        <div className="max-w-4xl w-full text-center space-y-12 animate-in zoom-in-95 duration-700">
          <h2 className="text-4xl md:text-6xl font-display font-black text-white gold-resplendant">Quelle est votre destinée ?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <button 
              disabled={isLoading}
              onClick={() => handleRoleChoice('artist_draft')} 
              className="p-10 rounded-[3rem] bg-stone-900 border-2 border-white/5 hover:border-primary transition-all group space-y-6 disabled:opacity-50"
            >
              <Brush className="h-16 w-16 mx-auto text-primary group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-black text-white">Je suis Artiste</h3>
            </button>
            <button 
              disabled={isLoading}
              onClick={() => handleRoleChoice('reader')} 
              className="p-10 rounded-[3rem] bg-stone-900 border-2 border-white/5 hover:border-emerald-500 transition-all group space-y-6 disabled:opacity-50"
            >
              <BookOpen className="h-16 w-16 mx-auto text-emerald-500 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-black text-white">Je suis Lecteur</h3>
            </button>
          </div>
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mt-4" />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-stone-950 w-full">
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 bg-stone-950">
        <div className="w-full max-w-md space-y-10">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-display font-black text-white tracking-tighter">Bienvenue au Hub</h2>
            <p className="text-stone-500 text-sm italic">Accédez à vos légendes africaines.</p>
          </div>

          <div className="space-y-4">
            <Button onClick={() => handleSocialLogin('Google')} variant="outline" size="lg" className="w-full h-12 rounded-xl border-white/10 bg-white/5 text-white font-bold gap-4">
              Connexion avec Google
            </Button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] font-black uppercase text-stone-600">Ou par email</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest">Email</FormLabel>
                    <FormControl><Input placeholder="voyageur@nexus.hub" {...field} className="bg-white/5 border-white/10 h-11 rounded-xl text-white" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <div className="flex items-center justify-between"><FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest">Mot de passe</FormLabel><Link href="/forgot-password" title="Réinitialiser" className="text-[9px] text-primary hover:underline font-bold uppercase">Oublié ?</Link></div>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} className="bg-white/5 border-white/10 h-11 rounded-xl pr-12 text-white" />
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-stone-500" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl font-black text-lg bg-primary text-black shadow-xl gold-shimmer">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Se Connecter au Hub"}
                </Button>
              </form>
            </Form>
          </div>

          <div className="pt-8 border-t border-white/5 text-center">
            <Button asChild variant="outline" className="h-11 rounded-xl border-primary text-primary font-black uppercase text-[10px]"><Link href="/signup">Créer mon Compte Gratuit <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-950 flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
