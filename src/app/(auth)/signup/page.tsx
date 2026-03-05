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
import { Sparkles, Zap, Users, Award, ChevronDown, CheckCircle2, ShieldCheck, Globe, Coins, LayoutGrid, Eye, EyeOff, ArrowRight, PenSquare, Loader2, Brush, BookOpen } from "lucide-react";
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
      
      if (!userDoc.exists()) {
        const user = auth.currentUser;
        const slug = (user?.displayName || 'user').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
        
        await setDoc(doc(db, 'users', uid), {
          uid: uid,
          email: user?.email,
          displayName: user?.displayName || 'Nouveau Voyageur',
          photoURL: user?.photoURL || '',
          slug: slug,
          afriCoins: 0,
          bio: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
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

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: values.email,
        displayName: values.name,
        slug: slug,
        role: values.accountType,
        afriCoins: 0,
        bio: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
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
      
      if (error.code === 'auth/internal-error') {
        errorMessage = "Le Hub rencontre une difficulté technique. Vérifiez votre connexion.";
      } else if (error.code.includes('app-check') || error.message.includes('app-check')) {
        errorMessage = "Sécurité Firebase : App Check bloque l'accès. Veuillez désactiver l'Enforcement dans votre Console Firebase.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Cet email est déjà utilisé par un autre compte.";
      }

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
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        await signInWithRedirect(auth, provider!);
      } else {
        await signInWithPopup(auth, provider!);
        const user = auth.currentUser;
        if (user) {
          await checkUserRoleAndRedirect(user.uid);
        }
      }
    } catch (error: any) {
      console.error("Social login error:", error);
      let errorMessage = "La connexion a échoué. Veuillez réessayer.";
      
      if (error.code.includes('app-check') || error.message.includes('app-check')) {
        errorMessage = "Vérification de sécurité échouée (App Check).";
      }
      
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" });
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
      toast({ title: "Erreur", description: "Impossible de configurer le rôle.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (showRoleSelection) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950 p-6 animate-in fade-in zoom-in-95 duration-700">
        <div className="max-w-4xl w-full space-y-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-black text-white gold-resplendant tracking-tighter">Choisissez votre Destinée</h2>
            <p className="text-stone-400 text-lg md:text-xl font-light italic leading-relaxed">
              "Le Hub s'adapte à votre vision. Comment souhaitez-vous marquer l'histoire ?"
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <button 
              disabled={isLoading}
              onClick={() => handleRoleChoice('artist_draft')}
              className="group relative p-10 rounded-[3rem] bg-stone-900 border-2 border-white/5 hover:border-primary transition-all duration-500 text-center space-y-6 overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="mx-auto w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <Brush className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-display font-black text-white">Je suis Artiste</h3>
                <p className="text-stone-500 text-sm italic font-light">"Je veux créer, publier mes récits et bâtir mon propre univers."</p>
              </div>
              <div className="pt-4">
                <Badge className="bg-primary text-black font-black uppercase text-[10px] px-6 py-1 shadow-lg">Accès Atelier Pro</Badge>
              </div>
            </button>

            <button 
              disabled={isLoading}
              onClick={() => handleRoleChoice('reader')}
              className="group relative p-10 rounded-[3rem] bg-stone-900 border-2 border-white/5 hover:border-emerald-500 transition-all duration-500 text-center space-y-6 overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="mx-auto w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <BookOpen className="h-12 w-12 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-display font-black text-white">Je suis Lecteur</h3>
                <p className="text-stone-500 text-sm italic font-light">"Je veux explorer les récits, suivre mes auteurs favoris et soutenir l'art."</p>
              </div>
              <div className="pt-4">
                <Badge className="bg-emerald-500 text-white font-black uppercase text-[10px] px-6 py-1 shadow-lg">Accès Bibliothèque</Badge>
              </div>
            </button>
          </div>

          {isLoading && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-stone-950 min-h-screen">
      <section className="relative min-h-[40vh] flex flex-col items-center justify-center overflow-hidden px-4 py-8 md:py-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.2),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <div key={p.id} className="particle bg-primary/20" style={{ top: p.top, left: p.left, '--dur': p.dur, '--del': p.del, '--tx': p.tx, '--ty': p.ty } as any} />
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-5xl w-full text-center space-y-4 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-display font-black leading-tight text-white tracking-tighter drop-shadow-[0_0_20px_rgba(212,168,67,0.3)]">
              Rejoignez NexusHub – <br/>
              <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-shimmer">Créez et Découvrez</span> des Histoires Africaines
            </h1>
            <p className="text-sm md:text-base text-stone-300 font-light max-w-2xl mx-auto leading-relaxed italic">
              Devenez artiste Pro/Draft, lisez gratuitement, connectez-vous à une communauté panafricaine. 
              <span className="block font-bold text-primary mt-1 uppercase tracking-[0.2em] text-[10px]">Inscription gratuite et instantanée !</span>
            </p>
          </div>
          <div className="pt-4 flex flex-col items-center gap-1 animate-bounce">
            <p className="text-[8px] uppercase tracking-[0.4em] font-black text-primary/60">Commencez ci-dessous</p>
            <ChevronDown className="h-4 w-4 text-primary" />
          </div>
        </div>
      </section>

      <section className="relative py-8 md:py-16 px-4 md:px-6 bg-stone-950 border-t border-primary/10 flex-1">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
          <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="text-center lg:text-left">
              <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-1">Inscrivez-vous en un clic</h2>
              <p className="text-stone-400 text-[11px] md:text-sm">Le moyen le plus rapide pour commencer votre voyage.</p>
            </div>

            <div className="flex flex-col gap-2.5">
              <button 
                disabled={!!isSocialLoading}
                onClick={() => handleSocialLogin('Google')}
                className="h-11 md:h-12 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-sm md:text-base gap-3 flex items-center justify-center group overflow-hidden relative shadow-xl transition-all active:scale-95"
              >
                {isSocialLoading === 'Google' ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c1.61-3.21 2.53-7.07 2.53-10.34z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continuer avec Google
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 py-1 md:py-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
              <span className="text-[8px] md:text-[9px] uppercase font-black tracking-[0.3em] text-primary/60">Ou par email</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
            </div>
          </div>

          <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl rounded-2xl animate-in fade-in slide-in-from-right-10 duration-1000 overflow-hidden">
            <div className="h-1.5 w-full bg-primary" />
            <CardHeader className="text-center pb-2 pt-6">
              <CardTitle className="text-lg md:text-xl font-display font-bold text-white">Créer un compte</CardTitle>
              <CardDescription className="text-[10px] md:text-xs">Initialisez votre présence dans le Hub.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-stone-300 text-[10px] md:text-xs font-bold uppercase tracking-widest">Pseudo Public</FormLabel>
                        <FormControl>
                          <Input placeholder="L'Aventurier" {...field} className="bg-white/5 border-white/10 h-10 md:h-11 rounded-xl focus:border-primary transition-all text-xs md:text-sm text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-stone-300 text-[10px] md:text-xs font-bold uppercase tracking-widest">Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="voyageur@nexus.hub" {...field} className="bg-white/5 border-white/10 h-10 md:h-11 rounded-xl focus:border-primary transition-all text-xs md:text-sm text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-stone-300 text-[10px] md:text-xs font-bold uppercase tracking-widest">Mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showPassword ? "text" : "password"} {...field} className="bg-white/5 border-white/10 h-10 md:h-11 rounded-xl pr-10 focus:border-primary transition-all text-xs md:text-sm text-white" />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-stone-500" onClick={() => setShowPassword(!showPassword)}>
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
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-stone-300 text-[10px] md:text-xs font-bold uppercase tracking-widest">Destinée au Hub</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-3 gap-2">
                            {[
                              { value: "reader", label: "Lecteur", icon: BookOpen },
                              { value: "artist_draft", label: "Draft", icon: PenSquare },
                              { value: "artist_pro", label: "Pro", icon: Award },
                            ].map((item) => (
                              <FormItem key={item.value} className="flex items-center space-y-0">
                                <FormControl><RadioGroupItem value={item.value} className="sr-only" id={item.value} /></FormControl>
                                <label htmlFor={item.value} className={cn("flex-1 flex flex-col items-center justify-center p-2 rounded-xl border-2 border-white/10 cursor-pointer transition-all hover:bg-white/5", field.value === item.value ? "border-primary bg-primary/10 text-primary" : "text-stone-400 grayscale")}>
                                  <item.icon className="h-4 w-4 mb-1" />
                                  <span className="text-[8px] font-black uppercase">{item.label}</span>
                                </label>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-xl border border-white/5 p-3 bg-white/5">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" /></FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-[9px] text-stone-400">J'accepte les Conditions et la Politique de Confidentialité.</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-black text-sm bg-primary text-black gold-shimmer">
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "S'inscrire au Hub"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col border-t border-white/5 py-6 bg-white/5">
              <div className="text-center text-[10px] text-stone-400">Déjà un compte ? <Link href="/login" className="font-black text-primary hover:underline uppercase tracking-widest">Se connecter</Link></div>
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
