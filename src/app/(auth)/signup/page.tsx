'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/navigation";
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
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

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

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  const [particles, setParticles] = useState<{id: number, top: string, left: string, dur: string, del: string, tx: string, ty: string}[]>([]);

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

  const setSessionCookie = () => {
    document.cookie = "nexushub-session=active; path=/; max-age=86400; SameSite=Lax";
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

  const checkUserRoleAndRedirect = async (uid: string) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists() || !userDoc.data()?.role) {
      setPendingUid(uid);
      setShowRoleSelection(true);
      
      // Initialize basic doc if it doesn't exist
      if (!userDoc.exists()) {
        const user = auth.currentUser;
        await setDoc(doc(db, 'users', uid), {
          uid: uid,
          email: user?.email,
          displayName: user?.displayName || 'Nouveau Voyageur',
          photoURL: user?.photoURL || '',
          afriCoins: 0,
          bio: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
    } else {
      setSessionCookie();
      router.push('/');
      router.refresh();
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.name });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: values.email,
        displayName: values.name,
        role: values.accountType,
        afriCoins: 0,
        bio: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setSessionCookie();
      toast({
        title: "Bienvenue sur NexusHub !",
        description: "Votre compte a été créé avec succès.",
      });

      router.push('/');
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue.",
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
      const userCredential = await signInWithPopup(auth, provider!);
      await checkUserRoleAndRedirect(userCredential.user.uid);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erreur d'authentification",
        description: "La connexion a été annulée ou a échoué.",
        variant: "destructive",
      });
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
        updatedAt: new Date().toISOString()
      });
      setSessionCookie();
      toast({
        title: role === 'reader' ? "Destinée : Lecteur" : "Destinée : Artiste",
        description: "Votre profil a été configuré. Bienvenue au Hub !",
      });
      router.push('/');
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
            {/* Card 1: Artist */}
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

            {/* Card 2: Reader */}
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
    <div className="flex flex-col bg-stone-950">
      <section className="relative min-h-[40vh] flex flex-col items-center justify-center overflow-hidden px-4 py-8 md:py-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.2),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
          
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <div 
                key={p.id} 
                className="particle bg-primary/20" 
                style={{
                  top: p.top,
                  left: p.left,
                  '--dur': p.dur,
                  '--del': p.del,
                  '--tx': p.tx,
                  '--ty': p.ty
                } as any} 
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-5xl w-full text-center space-y-4 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-display font-black leading-tight text-white tracking-tighter drop-shadow-[0_0_20px_rgba(212,168,67,0.3)]">
              Rejoignez NexusHub – <br/>
              <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-shimmer">
                Créez et Découvrez
              </span> <br/>
              des Histoires Africaines
            </h1>

            <p className="text-sm md:text-base text-stone-300 font-light max-w-2xl mx-auto leading-relaxed italic">
              Devenez artiste Pro/Draft, lisez gratuitement, connectez-vous à une communauté panafricaine. 
              <span className="block font-bold text-primary mt-1 uppercase tracking-[0.2em] text-[10px]">Inscription gratuite et instantanée !</span>
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {[
              { icon: Zap, text: "Publiez en un clic", color: "text-primary" },
              { icon: Sparkles, text: "Univers mythologiques", color: "text-accent" },
              { icon: Users, text: "Soutenez des créateurs", color: "text-emerald-500" },
              { icon: Award, text: "AfriCoins et Premium", color: "text-amber-500" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-lg group hover:border-primary/50 transition-all shadow-xl">
                <div className={cn("bg-white/5 p-1 rounded-md", item.color)}>
                  <item.icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-[10px] font-bold text-stone-200 tracking-tight">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-col items-center gap-1 animate-bounce">
            <p className="text-[8px] uppercase tracking-[0.4em] font-black text-primary/60">Commencez ci-dessous</p>
            <ChevronDown className="h-4 w-4 text-primary" />
          </div>
        </div>
      </section>

      <section className="relative py-8 md:py-16 px-4 md:px-6 bg-stone-950 border-t border-primary/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        
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
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <i className="fa-brands fa-google text-lg md:text-xl text-red-500" />
                    Continuer avec Google
                  </>
                )}
              </button>
              <button 
                disabled={!!isSocialLoading}
                onClick={() => handleSocialLogin('Facebook')}
                className="h-11 md:h-12 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-sm md:text-base gap-3 flex items-center justify-center group overflow-hidden relative shadow-xl transition-all active:scale-95"
              >
                {isSocialLoading === 'Facebook' ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <i className="fa-brands fa-facebook text-lg md:text-xl text-blue-600" />
                    Continuer avec Facebook
                  </>
                )}
              </button>
              <button 
                disabled={!!isSocialLoading}
                onClick={() => handleSocialLogin('Apple')}
                className="h-11 md:h-12 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-sm md:text-base gap-3 flex items-center justify-center group overflow-hidden relative shadow-xl transition-all active:scale-95"
              >
                {isSocialLoading === 'Apple' ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <i className="fa-brands fa-apple text-lg md:text-xl" />
                    Continuer avec Apple
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 py-1 md:py-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
              <span className="text-[8px] md:text-[9px] uppercase font-black tracking-[0.3em] text-primary/60">Ou par email</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-xl md:rounded-2xl p-4 md:p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-1.5 rounded-lg"><ShieldCheck className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="text-[11px] md:text-xs font-bold text-white leading-tight">Sécurité Garantie</p>
                  <p className="text-[9px] md:text-[10px] text-stone-400">Vos données sont protégées conforme RGPD.</p>
                </div>
              </div>
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
                        <FormLabel className="text-stone-300 text-[10px] md:text-xs font-bold uppercase tracking-widest">Pseudo Unique</FormLabel>
                        <FormControl>
                          <Input placeholder="L'Aventurier" {...field} className="bg-white/5 border-white/10 h-10 md:h-11 rounded-xl focus:border-primary transition-all text-xs md:text-sm text-white" />
                        </FormControl>
                        <FormMessage className="text-[9px] md:text-[10px]" />
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
                        <FormMessage className="text-[9px] md:text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-stone-300 text-[10px] md:text-xs font-bold uppercase tracking-widest">Mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              {...field} 
                              className="bg-white/5 border-white/10 h-10 md:h-11 rounded-xl pr-10 focus:border-primary transition-all text-xs md:text-sm text-white" 
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-stone-500 hover:text-white"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-[9px] md:text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-stone-300 text-[10px] md:text-xs font-bold uppercase tracking-widest">Je rejoins en tant que...</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-3 gap-2"
                          >
                            {[
                              { value: "reader", label: "Lecteur", icon: BookOpen },
                              { value: "artist_draft", label: "Draft", icon: PenSquare },
                              { value: "artist_pro", label: "Pro", icon: Award },
                            ].map((item) => (
                              <FormItem key={item.value} className="flex items-center space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={item.value} className="sr-only" id={item.value} />
                                </FormControl>
                                <label
                                  htmlFor={item.value}
                                  className={cn(
                                    "flex-1 flex flex-col items-center justify-center p-2 md:p-3 rounded-xl border-2 border-white/10 cursor-pointer transition-all hover:bg-white/5",
                                    field.value === item.value ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(212,168,67,0.2)]" : "text-stone-400 grayscale hover:grayscale-0"
                                  )}
                                >
                                  <item.icon className="h-4 w-4 md:h-5 md:w-5 mb-1.5" />
                                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                                </label>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage className="text-[9px] md:text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-xl border border-white/5 p-3 bg-white/5">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-black h-3.5 w-3.5"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-[9px] md:text-[10px] text-stone-400 font-light leading-snug">
                            J'accepte les <Link href="/legal/terms" className="text-primary font-bold hover:underline">Conditions</Link> et la <Link href="/legal/privacy" className="text-primary font-bold hover:underline">Politique de Confidentialité</Link>.
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading} className="w-full h-12 md:h-14 rounded-xl font-black text-sm md:text-base bg-primary hover:bg-primary/90 text-black shadow-[0_0_20px_rgba(212,168,67,0.3)] transition-all active:scale-95 group overflow-hidden relative mt-2 gold-shimmer">
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                      <>
                        S'inscrire au Hub
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col border-t border-white/5 py-6 bg-white/5">
              <div className="text-center text-[10px] md:text-xs text-stone-400 font-medium">
                Déjà un compte ?{" "}
                <Link href="/login" className="font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">
                  Se connecter
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4 md:px-6 bg-gradient-to-b from-stone-950 to-stone-900 overflow-hidden relative">
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10" />
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12 space-y-2 md:space-y-3">
            <h2 className="text-2xl md:text-4xl font-display font-bold text-white drop-shadow-[0_0_10px_rgba(212,168,67,0.2)]">Pourquoi Rejoindre NexusHub ?</h2>
            <p className="text-stone-400 text-xs md:text-sm max-w-xl mx-auto italic font-light">Le premier hub créatif panafricain pour les passionnés de narration visuelle.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { 
                icon: Users, 
                title: "Inclusivité", 
                desc: "Connectez-vous avec des artistes du Gabon et d'Afrique.", 
                color: "bg-blue-500/10 text-blue-500" 
              },
              { 
                icon: Coins, 
                title: "Revenus", 
                desc: "Gagnez avec les AfriCoins et dons.", 
                color: "bg-amber-500/10 text-amber-500" 
              },
              { 
                icon: LayoutGrid, 
                title: "Immersion", 
                desc: "Outils de création inspirés de la culture africaine.", 
                color: "bg-primary/10 text-primary" 
              },
              { 
                icon: CheckCircle2, 
                title: "Gratuité", 
                desc: "Draft gratuit, Pro sur validation.", 
                color: "bg-emerald-500/10 text-emerald-500" 
              },
            ].map((item, i) => (
              <Card key={i} className="bg-stone-900 border-white/5 hover:border-primary/30 transition-all duration-500 group rounded-[2rem] overflow-hidden shadow-xl">
                <CardContent className="p-6 md:p-8 space-y-4">
                  <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner", item.color)}>
                    <item.icon className="h-6 w-6 md:h-7 md:w-7" />
                  </div>
                  <h3 className="text-sm md:text-lg font-black text-white uppercase tracking-tight">{item.title}</h3>
                  <p className="text-stone-500 text-[10px] md:text-xs leading-relaxed line-clamp-3 italic font-light">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
