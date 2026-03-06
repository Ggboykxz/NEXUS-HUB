
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
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  ChevronDown, 
  Award, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  Brush, 
  BookOpen, 
  Crown, 
  ShieldCheck, 
  Languages,
  ShieldAlert,
  Zap
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/checkbox-ui-fix'; // Utilisation d'un checkbox standard ou corrigé
import { cn } from '@/lib/utils';
import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider,
  getRedirectResult,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';

// Schema incluant TOUS les rôles de Types.ts
const formSchema = z.object({
  name: z.string().min(2, { message: "Le pseudo doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." }),
  accountType: z.enum([
    "reader", 
    "premium_reader", 
    "artist_draft", 
    "artist_pro", 
    "artist_elite", 
    "admin", 
    "translator"
  ], {
    required_error: "Vous devez sélectionner une destinée.",
  }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "L'acceptation des conditions est obligatoire.",
  }),
});

// Helper de création de document synchronisé avec Types.ts v4.3.0
const createFullUserDocument = (user: User, role: string, additionals: Partial<{displayName: string, email: string}> = {}) => {
  const slug = (additionals.displayName || user.displayName || "voyageur").toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
  
  return {
    uid: user.uid,
    email: additionals.email || user.email || '',
    displayName: additionals.displayName || user.displayName || 'Nouveau Voyageur',
    photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
    slug: slug,
    role: role,
    afriCoins: role === 'premium_reader' ? 50 : 0, // Bonus de bienvenue premium
    level: 1,
    subscribersCount: 0,
    followedCount: 0,
    isCertified: ['artist_pro', 'artist_elite', 'admin'].includes(role),
    isBanned: false,
    isVerified: false,
    onboardingCompleted: false,
    isMentor: role === 'artist_elite',
    isTranslator: role === 'translator',
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
      longestStreak: 0
    },
    preferences: {
      theme: 'dark',
      language: 'fr',
      privacy: {
        showCurrentReading: true,
        showHistory: true
      }
    }
  };
};

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
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

  const checkUserRoleAndRedirect = async (user: User) => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || !userDoc.data()?.role) {
      setPendingUser(user);
      setShowRoleSelection(true);
    } else {
      const role = userDoc.data()?.role || 'reader';
      await fetch('/api/auth/session', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }) 
      });
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
      const userDoc = createFullUserDocument(user, values.accountType, { displayName: values.name, email: values.email });
      await setDoc(doc(db, 'users', user.uid), userDoc);
      await fetch('/api/auth/session', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: values.accountType }) 
      });
      toast({ title: "Bienvenue au Hub !", description: "Votre compte a été initialisé avec succès." });
      router.push(redirectTo);
      router.refresh();
    } catch (error: any) {
      console.error("Signup error:", error);
      let msg = "Une erreur est survenue lors de l'accès aux archives.";
      if (error.code === 'auth/email-already-in-use') msg = "Cet email appartient déjà à une autre légende.";
      toast({ title: "Échec de l'éclosion", description: msg, variant: "destructive" });
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
      if (result.user) await checkUserRoleAndRedirect(result.user);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({ title: "Erreur Connexion", variant: "destructive" });
      }
    } finally {
      setIsSocialLoading(null);
    }
  };

  const handleRoleChoice = async (role: string) => {
    if (!pendingUser) return;
    setIsLoading(true);
    try {
      const userDocData = createFullUserDocument(pendingUser, role);
      await setDoc(doc(db, 'users', pendingUser.uid), userDocData);
      await fetch('/api/auth/session', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }) 
      });
      toast({ title: "Destinée choisie !", description: "Bienvenue voyageur." });
      router.push(redirectTo);
      router.refresh();
    } catch (e) {
      toast({ title: "Erreur", description: "Impossible de sceller votre destinée.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setShowRoleSelection(false);
    }
  };

  const roles = [
    { id: 'reader', label: 'Lecteur', icon: BookOpen, desc: 'Accès standard, bibliothèque et forums.', color: 'text-stone-400' },
    { id: 'premium_reader', label: 'Premium', icon: Crown, desc: 'Zéro pub, accès anticipé, +50 🪙.', color: 'text-amber-500' },
    { id: 'artist_draft', label: 'Artiste Draft', icon: Brush, desc: 'Publiez librement, progressez vers le Pro.', color: 'text-orange-500' },
    { id: 'artist_pro', label: 'Artiste Pro', icon: Award, desc: 'Monétisation active et outils IA.', color: 'text-emerald-500' },
    { id: 'artist_elite', label: 'Artiste Elite', icon: Zap, desc: 'Contrats Originals et mentorat.', color: 'text-primary' },
    { id: 'translator', label: 'Traducteur', icon: Languages, desc: 'Traduisez et gagnez des AfriCoins.', color: 'text-blue-500' },
    { id: 'admin', label: 'Admin Hub', icon: ShieldAlert, desc: 'Modération et gestion technique.', color: 'text-rose-500' },
  ];

  if (showRoleSelection) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950 p-6">
        <div className="max-w-4xl w-full space-y-12 text-center animate-in fade-in zoom-in-95 duration-700">
          <h2 className="text-4xl md:text-6xl font-display font-black text-white gold-resplendant tracking-tighter">Votre destinée au Hub</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roles.map((r) => (
              <button key={r.id} onClick={() => handleRoleChoice(r.id)} className="group p-6 rounded-[2rem] bg-stone-900 border-2 border-white/5 hover:border-primary transition-all duration-500 space-y-4">
                <r.icon className={cn("h-8 w-8 mx-auto group-hover:scale-110 transition-transform", r.color)} />
                <div className="space-y-1">
                  <p className="font-display font-black text-white text-xs uppercase">{r.label}</p>
                  <p className="text-[8px] text-stone-500 uppercase leading-tight">{r.desc}</p>
                </div>
              </button>
            ))}
          </div>
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-stone-950 min-h-screen">
      <section className="relative min-h-[35vh] flex flex-col items-center justify-center overflow-hidden px-4 py-12">
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
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">Éclosion Légendaire</Badge>
          <h1 className="text-4xl md:text-7xl font-display font-black leading-[0.85] text-white tracking-tighter drop-shadow-[0_0_20px_rgba(212,168,67,0.3)]">
            Forgez votre <br/><span className="gold-resplendant">Histoire</span>
          </h1>
        </div>
      </section>

      <section className="relative py-12 px-4 md:px-6 bg-stone-950 border-t border-primary/10 flex-1">
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="flex flex-col gap-3">
            <button onClick={() => handleSocialLogin('Google')} disabled={!!isSocialLoading} className="h-14 rounded-2xl border-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest gap-4 flex items-center justify-center transition-all shadow-xl">
              {isSocialLoading === 'Google' ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continuer avec Google"}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[10px] font-black uppercase text-stone-600 tracking-widest">Ou par email</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <Card className="border-white/10 bg-stone-900/50 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] overflow-hidden">
            <div className="h-1.5 w-full bg-primary" />
            <CardHeader className="text-center pb-2 pt-10">
              <CardTitle className="text-2xl font-display font-black text-white uppercase tracking-tighter">Création de Profil</CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-12">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest ml-1">Pseudo</FormLabel>
                        <FormControl><Input placeholder="Ex: Scribe_du_Kasaï" {...field} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest ml-1">Email</FormLabel>
                        <FormControl><Input type="email" placeholder="voyageur@nexus.hub" {...field} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest ml-1">Mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} {...field} className="bg-white/5 border-white/10 h-12 rounded-xl text-white pr-12" />
                          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="accountType" render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest ml-1">Destinée au Hub</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {roles.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => field.onChange(r.id)}
                              className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all text-center gap-2",
                                field.value === r.id 
                                  ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(212,168,67,0.2)]" 
                                  : "bg-white/5 border-white/5 text-stone-500 hover:bg-white/10"
                              )}
                            >
                              <r.icon className={cn("h-5 w-5", field.value === r.id ? r.color : "text-stone-600")} />
                              <span className="text-[9px] font-black uppercase tracking-tighter">{r.label}</span>
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="acceptTerms" render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0 rounded-2xl border border-white/5 p-4 bg-white/5">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="text-[10px] text-stone-400 leading-relaxed font-light italic">
                        J'accepte les conditions et je jure de respecter la bienveillance du sanctuaire NexusHub.
                      </FormLabel>
                    </FormItem>
                  )} />

                  <Button type="submit" disabled={isLoading} className="w-full h-16 rounded-2xl font-black text-lg bg-primary text-black gold-shimmer shadow-2xl shadow-primary/20">
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "S'inscrire au Hub"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="border-t border-white/5 py-6 bg-white/5">
              <div className="text-center w-full text-xs text-stone-500">
                Déjà un compte ? <Link href="/login" className="font-black text-primary hover:underline uppercase tracking-widest ml-2">Se connecter</Link>
              </div>
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
