'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
  Award, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  Brush, 
  BookOpen, 
  Crown,
  Zap,
  ShieldCheck
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/checkbox-ui-fix';
import { cn } from '@/lib/utils';
import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  User,
  getIdToken
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

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
  ]),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "L'acceptation des conditions est obligatoire.",
  }),
});

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [particles, setParticles] = useState<{id: number, top: string, left: string, dur: string, del: string, tx: string, ty: string}[]>([]);

  const callbackUrl = searchParams.get('callbackUrl');
  const redirectTo = (callbackUrl && callbackUrl.startsWith('/')) ? callbackUrl : '/';

  useEffect(() => {
    const newParticles = [...Array(15)].map((_, i) => ({
      id: i, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
      dur: `${5 + Math.random() * 5}s`, del: `${Math.random() * 5}s`,
      tx: `${Math.random() * 100 - 50}px`, ty: `${Math.random() * -200}px`
    }));
    setParticles(newParticles);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", accountType: "reader", acceptTerms: false },
  });

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

  const handleSuccessfulSignup = async (user: User, role: string, name: string) => {
    setIsCreatingProfile(true);
    
    let attempts = 0;
    const maxAttempts = 5;
    let success = false;

    while (attempts < maxAttempts && !success) {
      try {
        await getIdToken(user, true);
        
        const userRef = doc(db, 'users', user.uid);
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
        
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: name,
          photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
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
            language: 'fr', 
            theme: 'dark', 
            privacy: { 
              showCurrentReading: true, 
              showHistory: true 
            } 
          }
        }, { merge: true });

        success = true;
      } catch (error) {
        attempts++;
        console.warn(`Tentative de création de profil ${attempts}/${maxAttempts} échouée...`);
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    if (success) {
      const sessionCreated = await createSession(user);
      if (sessionCreated) {
        setTimeout(() => {
          window.location.href = getRedirectForRole(role);
        }, 1500);
      } else {
        window.location.href = '/login';
      }
    } else {
      toast({ 
        title: "Compte créé, profil en attente", 
        description: "Veuillez vous reconnecter pour finaliser votre profil.", 
        variant: "default" 
      });
      window.location.href = '/login';
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(userCredential.user, { displayName: values.name });
      await handleSuccessfulSignup(userCredential.user, values.accountType, values.name);
    } catch (error: any) {
      let msg = "Erreur lors de l'inscription.";
      if (error.code === 'auth/email-already-in-use') msg = "Cet email est déjà utilisé.";
      toast({ title: "Échec", description: msg, variant: "destructive" });
      setIsLoading(false);
    }
  }

  if (isCreatingProfile) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-stone-950 p-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.2),transparent_70%)]" />
        
        <div className="relative z-10 text-center space-y-12 animate-in fade-in zoom-in duration-1000">
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping" />
            <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin" />
            <div className="absolute inset-4 bg-primary/10 rounded-full flex items-center justify-center backdrop-blur-xl">
              <Sparkles className="h-12 w-12 text-primary animate-pulse" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-display font-black text-white gold-resplendant uppercase tracking-tighter">Rituel d'Initialisation</h2>
            <p className="text-stone-400 italic font-light max-w-sm mx-auto animate-pulse leading-relaxed">
              "Les scribes du Nexus gravent votre nom dans les annales éternelles du Hub. Veuillez patienter..."
            </p>
          </div>

          <div className="pt-8 space-y-6">
            <div className="flex gap-2 justify-center">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-3 h-12 bg-white/5 rounded-full overflow-hidden border border-white/10"
                >
                  <div 
                    className="w-full bg-primary animate-bounce" 
                    style={{ 
                      height: '100%', 
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: '1.5s' 
                    }} 
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 text-stone-600 text-[8px] font-black uppercase tracking-[0.4em]">
              <ShieldCheck className="h-3 w-3" /> Chiffrement du profil actif
            </div>
          </div>
        </div>
      </div>
    );
  }

  const roles = [
    { id: 'reader', label: 'Lecteur', icon: BookOpen, desc: 'Accès standard', color: 'text-stone-400' },
    { id: 'premium_reader', label: 'Premium', icon: Crown, desc: 'Avantages exclusifs', color: 'text-amber-500' },
    { id: 'artist_draft', label: 'Artiste Draft', icon: Brush, desc: 'Publiez librement', color: 'text-orange-500' },
    { id: 'artist_pro', label: 'Artiste Pro', icon: Award, desc: 'Monétisation active', color: 'text-emerald-500' },
  ];

  return (
    <div className="flex flex-col bg-stone-950 min-h-screen">
      <section className="relative min-h-[30vh] flex flex-col items-center justify-center overflow-hidden px-4 py-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.2),transparent_70%)]" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <div key={p.id} className="particle bg-primary/20" style={{ top: p.top, left: p.left, '--dur': p.dur, '--del': p.del, '--tx': p.tx, '--ty': p.ty } as any} />
            ))}
          </div>
        </div>
        <div className="relative z-10 text-center space-y-4">
          <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] font-black px-4 py-1">Éclosion Légendaire</Badge>
          <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter gold-resplendant">Forgez votre Histoire</h1>
        </div>
      </section>

      <section className="relative py-12 px-4 md:px-6 bg-stone-950 border-t border-primary/10 flex-1">
        <div className="max-w-2xl mx-auto">
          <Card className="border-white/10 bg-stone-900/50 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] overflow-hidden">
            <div className="h-1.5 w-full bg-primary" />
            <CardContent className="p-8 md:p-12">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest">Pseudo</FormLabel>
                        <FormControl><Input placeholder="Scribe_du_Kasaï" {...field} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest">Email</FormLabel>
                        <FormControl><Input type="email" placeholder="voyageur@nexus.hub" {...field} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest">Mot de passe</FormLabel>
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
                      <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest">Votre destinée</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-3">
                          {roles.map((r) => (
                            <button key={r.id} type="button" onClick={() => field.onChange(r.id)} className={cn("flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all text-center gap-2", field.value === r.id ? "bg-primary/10 border-primary" : "bg-white/5 border-white/5 text-stone-500")}>
                              <r.icon className={cn("h-5 w-5", field.value === r.id ? r.color : "text-stone-600")} />
                              <span className="text-[9px] font-black uppercase">{r.label}</span>
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="acceptTerms" render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="text-[10px] text-stone-400 font-light italic">J'accepte les conditions et je jure de respecter la bienveillance du Hub.</FormLabel>
                    </FormItem>
                  )} />

                  <Button type="submit" disabled={isLoading} className="w-full h-16 rounded-2xl font-black text-lg bg-primary text-black gold-shimmer">
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "S'inscrire au Hub"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="border-t border-white/5 py-6 bg-white/5">
              <div className="text-center w-full text-xs text-stone-500">Déjà un compte ? <Link href="/login" className="font-black text-primary hover:underline uppercase ml-2">Connexion</Link></div>
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
