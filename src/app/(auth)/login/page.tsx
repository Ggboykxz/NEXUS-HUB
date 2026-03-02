'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  Users, 
  Sparkles, 
  Globe, 
  Trophy,
  ChevronRight,
  Zap,
  BookOpen,
  Brush
} from "lucide-react";
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { auth, db } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  password: z.string().min(1, { message: "Le mot de passe est requis." }),
});

const SHOWCASE_IMAGES = [
  "https://res.cloudinary.com/demo/image/upload/v1/samples/hero-afrofuturism.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/stories/orisha-chronicles.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/stories/scifi-africa.jpg"
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl');
  const redirectTo = (callbackUrl && callbackUrl.startsWith('/')) ? callbackUrl : '/';

  useEffect(() => {
    const interval = setInterval(() => {
      setImageLoaded(false);
      setHeroIndex((prev) => (prev + 1) % SHOWCASE_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const setSessionCookie = async (role: string) => {
    try {
      await fetch('/api/auth/session', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
    } catch (e) {
      console.error("Erreur session cookie", e);
    }
  };

  const checkUserRoleAndRedirect = async (uid: string) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists() || !userDoc.data()?.role) {
      setPendingUid(uid);
      setShowRoleSelection(true);
      
      if (!userDoc.exists()) {
        const user = auth.currentUser;
        await setDoc(doc(db, 'users', uid), {
          uid: uid,
          email: user?.email,
          displayName: user?.displayName || 'Nouveau Voyageur',
          photoURL: user?.photoURL || '',
          afriCoins: 0,
          bio: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    } else {
      const role = userDoc.data()?.role || 'reader';
      await setSessionCookie(role);
      toast({ title: "Connexion réussie !", description: "Heureux de vous revoir." });
      router.push(redirectTo);
      router.refresh();
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
    } finally {
      setIsLoading(false);
    }
  }

  const handleSocialLogin = async (platform: 'Google' | 'Facebook' | 'Apple') => {
    setIsSocialLoading(platform);
    let provider;
    switch (platform) {
      case 'Google': provider = new GoogleAuthProvider(); break;
      case 'Facebook': provider = new FacebookAuthProvider(); break;
      case 'Apple': provider = new OAuthProvider('apple.com'); break;
    }

    try {
      await signInWithPopup(auth, provider!);
      const user = auth.currentUser;
      if (user) {
        await checkUserRoleAndRedirect(user.uid);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/popup-blocked') {
        toast({ title: "Popup bloqué", description: "Redirection vers la page sécurisée..." });
        await signInWithRedirect(auth, provider!);
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast({ title: "Connexion annulée", description: "La fenêtre de connexion a été fermée." });
      } else {
        toast({ title: "Erreur", description: "La connexion a échoué. Vérifiez vos identifiants.", variant: "destructive" });
      }
    } finally {
      setIsSocialLoading(null);
    }
  };

  const handleRoleChoice = async (role: 'reader' | 'artist_draft') => {
    if (!pendingUid) return;
    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'users', pendingUid), { 
        role,
        updatedAt: serverTimestamp()
      });
      await setSessionCookie(role);
      toast({ title: "Destinée choisie !", description: "Bienvenue au Hub." });
      router.push(redirectTo);
      router.refresh();
    } catch (e) {
      toast({ title: "Erreur", description: "Action impossible.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (showRoleSelection) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950 p-6">
        <div className="max-w-4xl w-full text-center space-y-12 animate-in zoom-in-95 duration-700">
          <h2 className="text-4xl md:text-6xl font-display font-black text-white gold-resplendant">Quelle est votre destinée ?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <button onClick={() => handleRoleChoice('artist_draft')} className="p-10 rounded-[3rem] bg-stone-900 border-2 border-white/5 hover:border-primary transition-all group space-y-6">
              <Brush className="h-16 w-16 mx-auto text-primary group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-black text-white">Je suis Artiste</h3>
            </button>
            <button onClick={() => handleRoleChoice('reader')} className="p-10 rounded-[3rem] bg-stone-900 border-2 border-white/5 hover:border-emerald-500 transition-all group space-y-6">
              <BookOpen className="h-16 w-16 mx-auto text-emerald-500 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-black text-white">Je suis Lecteur</h3>
            </button>
          </div>
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-stone-950 w-full">
      <div className="hidden md:flex relative w-1/2 flex-col overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 z-0">
          <Image key={heroIndex} src={SHOWCASE_IMAGES[heroIndex]} alt="Nexus" fill className={cn("object-cover transition-all duration-1000", imageLoaded ? "opacity-30 scale-100 blur-[2px]" : "opacity-0 scale-105 blur-xl")} onLoad={() => setImageLoaded(true)} priority />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-transparent to-stone-950" />
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-center p-12 lg:p-20 space-y-12">
          <Link href="/" className="font-display font-black text-3xl tracking-tighter text-white gold-resplendant">NexusHub<span className="text-primary">.</span></Link>
          <h1 className="text-5xl lg:text-7xl font-display font-black text-white leading-[0.9] tracking-tighter">L'Art Africain, <br/><span className="gold-resplendant">Sans Frontières</span></h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 bg-stone-950">
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-right-10 duration-1000">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-display font-black text-white tracking-tighter">Bienvenue au Hub</h2>
            <p className="text-stone-500 text-sm italic">Accédez à vos légendes africaines.</p>
          </div>

          <div className="space-y-4">
            <Button onClick={() => handleSocialLogin('Google')} disabled={!!isSocialLoading} variant="outline" size="lg" className="w-full h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-4">
              {isSocialLoading === 'Google' ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Connexion avec Google'}
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => handleSocialLogin('Facebook')} disabled={!!isSocialLoading} variant="outline" className="h-12 rounded-xl border-white/10 bg-white/5 text-white font-bold gap-2">
                {isSocialLoading === 'Facebook' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Facebook'}
              </Button>
              <Button onClick={() => handleSocialLogin('Apple')} disabled={!!isSocialLoading} variant="outline" className="h-12 rounded-xl border-white/10 bg-white/5 text-white font-bold gap-2">
                {isSocialLoading === 'Apple' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apple'}
              </Button>
            </div>

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
                <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90 text-black shadow-xl gold-shimmer">
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