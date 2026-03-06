
'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ChevronDown, Award, Eye, EyeOff, ArrowRight, Loader2, Brush, BookOpen } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider,
  getRedirectResult
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const formSchema = z.object({
  name: z.string().min(2, { message: "Le pseudo doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." }),
  accountType: z.enum(["reader", "artist_draft", "artist_pro"], {
    required_error: "Vous devez sélectionner un type de compte.",
  }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions d'utilisation.",
  }),
});

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  const [particles, setParticles] = useState<{id: number, top: string, left: string, dur: string, del: string, tx: string, ty: string}[]>([]);

  const callbackUrl = searchParams.get('callbackUrl');
  const redirectTo = (callbackUrl && callbackUrl.startsWith('/')) ? callbackUrl : '/';

  useEffect(() => {
    const newParticles = [...Array(15)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      dur: `${5 + Math.random() * 5}s`,
      del: `${Math.random() * 5}s`,
      tx: `${Math.random() * 100 - 50}px`,
      ty: `${Math.random() * -200}px`
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    getRedirectResult(auth).then(async (result) => {
      if (result) {
        await checkUserRoleAndRedirect(result.user.uid);
      }
    }).catch((error) => {
      console.error("Redirect auth error:", error);
    });
  }, []);

  const setSessionCookie = async (role: string) => {
    try {
      await fetch('/api/auth/session', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
    } catch (e) {
      console.error("Erreur session", e);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      accountType: "reader",
      acceptTerms: false,
    },
  });

  const passwordValue = form.watch('password');

  const passwordStrength = useMemo(() => {
    if (!passwordValue) return 0;
    let score = 0;
    if (passwordValue.length >= 8) score++;
    if (/[A-Z]/.test(passwordValue)) score++;
    if (/[0-9]/.test(passwordValue)) score++;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score++;
    return score;
  }, [passwordValue]);

  const strengthColor = useMemo(() => {
    switch (passwordStrength) {
      case 1: return 'bg-rose-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-emerald-500';
      default: return 'bg-stone-800';
    }
  }, [passwordStrength]);

  const checkUserRoleAndRedirect = async (uid: string) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists() || !userDoc.data()?.role) {
      setPendingUid(uid);
      setShowRoleSelection(true);
    } else {
      const role = userDoc.data()?.role || 'reader';
      await setSessionCookie(role);
      router.push(redirectTo);
      router.refresh();
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.name });

      const slug = values.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

      // Création du document avec le schéma complet par défaut
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: values.email,
        displayName: values.name,
        slug: slug,
        role: values.accountType,
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
      });

      await setSessionCookie(values.accountType);
      toast({
        title: "Bienvenue sur NexusHub !",
        description: "Votre compte a été créé avec succès.",
      });

      router.push(redirectTo);
      router.refresh();
    } catch (error: any) {
      console.error("Signup error:", error);
      let errorMessage = "Une erreur est survenue lors de l'inscription.";
      if (error.code === 'auth/email-already-in-use') errorMessage = "Cet email est déjà utilisé.";
      if (error.message.includes('App Check')) errorMessage = "Vérification de sécurité échouée. Veuillez réessayer.";

      toast({
        title: "Échec de l'inscription",
        description: errorMessage,
        variant: "destructive",
      });
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
      const result = await signInWithPopup(auth, provider!);
      if (result.user) {
        await checkUserRoleAndRedirect(result.user.uid);
      }
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({ title: "Erreur", description: "La connexion sociale a échoué.", variant: "destructive" });
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
      toast({ title: "Profil configuré !", description: "Bienvenue au Hub." });
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950 p-6 animate-in fade-in zoom-in-95 duration-700">
        <div className="max-w-4xl w-full space-y-12 text-center">
          <h2 className="text-4xl md:text-6xl font-display font-black text-white gold-resplendant tracking-tighter">Choisissez votre Destinée</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <button disabled={isLoading} onClick={() => handleRoleChoice('artist_draft')} className="group p-10 rounded-[3rem] bg-stone-900 border-2 border-white/5 hover:border-primary transition-all duration-500 space-y-6">
              <Brush className="h-16 w-16 mx-auto text-primary group-hover:scale-110 transition-transform" />
              <h3 className="text-3xl font-display font-black text-white">Je suis Artiste</h3>
            </button>
            <button disabled={isLoading} onClick={() => handleRoleChoice('reader')} className="group p-10 rounded-[3rem] bg-stone-900 border-2 border-white/5 hover:border-emerald-500 transition-all duration-500 space-y-6">
              <BookOpen className="h-16 w-16 mx-auto text-emerald-500 group-hover:scale-110 transition-transform" />
              <h3 className="text-3xl font-display font-black text-white">Je suis Lecteur</h3>
            </button>
          </div>
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-stone-950 min-h-screen">
      <section className="relative min-h-[40vh] flex flex-col items-center justify-center overflow-hidden px-4 py-8 md:py-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.2),transparent_70%)]" />
          <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[1px]" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <div key={p.id} className="particle bg-primary/20" style={{ top: p.top, left: p.left, '--dur': p.dur, '--del': p.del, '--tx': p.tx, '--ty': p.ty } as any} />
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-5xl w-full text-center space-y-4 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-display font-black leading-tight text-white tracking-tighter drop-shadow-[0_0_20px_rgba(212,168,67,0.3)]">
              Rejoignez NexusHub
            </h1>
            <p className="text-sm md:text-base text-stone-300 font-light max-w-2xl mx-auto leading-relaxed italic">
              "Commencez votre légende dans le sanctuaire de la narration visuelle africaine."
            </p>
          </div>
          <div className="pt-4 flex flex-col items-center gap-1 animate-bounce">
            <ChevronDown className="h-4 w-4 text-primary" />
          </div>
        </div>
      </section>

      <section className="relative py-8 md:py-16 px-4 md:px-6 bg-stone-950 border-t border-primary/10 flex-1">
        <div className="max-w-md mx-auto space-y-8">
          <div className="flex flex-col gap-3">
            <button onClick={() => handleSocialLogin('Google')} disabled={!!isSocialLoading} className="h-12 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-3 flex items-center justify-center transition-all shadow-xl">
              {isSocialLoading === 'Google' ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continuer avec Google"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[10px] font-black uppercase text-stone-600 tracking-widest">Ou par email</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden">
            <div className="h-1.5 w-full bg-primary" />
            <CardHeader className="text-center pb-2 pt-6">
              <CardTitle className="text-xl font-display font-bold text-white">Créer un compte</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest">Pseudo</FormLabel>
                      <FormControl><Input placeholder="Votre Pseudo" {...field} className="bg-white/5 border-white/10 h-11 rounded-xl text-white" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest">Email</FormLabel>
                      <FormControl><Input type="email" placeholder="voyageur@nexus.hub" {...field} className="bg-white/5 border-white/10 h-11 rounded-xl text-white" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest">Mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} {...field} className="bg-white/5 border-white/10 h-11 rounded-xl text-white" />
                          <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 text-stone-500" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <div className="flex gap-1 h-1 mt-2">
                        {[1, 2, 3, 4].map((step) => (
                          <div key={step} className={cn("flex-1 rounded-full transition-all duration-500", passwordStrength >= step ? strengthColor : "bg-stone-800")} />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="accountType" render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest">Destinée au Hub</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-3 gap-2">
                          {[{ value: "reader", label: "Lecteur", icon: BookOpen }, { value: "artist_draft", label: "Draft", icon: Brush }].map((item) => (
                            <FormItem key={item.value} className="flex items-center space-y-0">
                              <FormControl><RadioGroupItem value={item.value} className="sr-only" id={item.value} /></FormControl>
                              <label htmlFor={item.value} className={cn("flex-1 flex flex-col items-center justify-center p-2 rounded-xl border-2 border-white/10 cursor-pointer transition-all", field.value === item.value ? "border-primary bg-primary/10 text-primary" : "text-stone-400")}>
                                <item.icon className="h-4 w-4 mb-1" />
                                <span className="text-[8px] font-black uppercase">{item.label}</span>
                              </label>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="acceptTerms" render={({ field }) => (
                    <FormItem className="flex items-start space-x-2 space-y-0 rounded-xl border border-white/5 p-3 bg-white/5">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="text-[9px] text-stone-400 leading-tight">J'accepte les Conditions et la Politique de Confidentialité.</FormLabel>
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-black text-sm bg-primary text-black gold-shimmer shadow-xl shadow-primary/20">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "S'inscrire au Hub"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="border-t border-white/5 py-4 bg-white/5">
              <div className="text-center w-full text-[10px] text-stone-400">Déjà un compte ? <Link href="/login" className="font-black text-primary hover:underline uppercase tracking-widest">Se connecter</Link></div>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-950 flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <SignupForm />
    </Suspense>
  );
}
