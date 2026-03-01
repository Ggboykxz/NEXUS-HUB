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
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ShieldCheck, Lock, Eye, EyeOff, ArrowRight, BookOpen, Zap, Sparkles, Loader2 } from "lucide-react";
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider 
} from 'firebase/auth';

const formSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  password: z.string().min(1, { message: "Le mot de passe est requis." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [particles, setParticles] = useState<{id: number, top: string, left: string, dur: string, del: string, tx: string, ty: string}[]>([]);

  useEffect(() => {
    const newParticles = [...Array(12)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      dur: `${6 + Math.random() * 4}s`,
      del: `${Math.random() * 5}s`,
      tx: `${Math.random() * 80 - 40}px`,
      ty: `${Math.random() * -150}px`
    }));
    setParticles(newParticles);
  }, []);

  const setSessionCookie = () => {
    // Crée un cookie de session pour le middleware
    document.cookie = "nexushub-session=active; path=/; max-age=86400; SameSite=Lax";
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      setSessionCookie();
      toast({
        title: "Connexion réussie !",
        description: "Heureux de vous revoir parmi nous.",
      });
      router.push('/');
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect.",
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
      await signInWithPopup(auth, provider);
      setSessionCookie();
      toast({
        title: `Connecté avec ${platform}`,
        description: "Bienvenue sur NexusHub !",
      });
      router.push('/');
      router.refresh();
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

  return (
    <div className="flex flex-col bg-stone-950 min-h-screen">
      <section className="relative min-h-[40vh] flex flex-col items-center justify-center overflow-hidden px-4 py-8">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[1px]" />
          
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <div 
                key={p.id} 
                className="particle bg-primary/30" 
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

        <div className="relative z-10 max-w-4xl w-full text-center space-y-4 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-display font-black text-white leading-tight gold-resplendant drop-shadow-[0_0_15px_rgba(212,168,67,0.4)]">
              Connexion à NexusHub
            </h1>
            <p className="text-sm md:text-lg text-stone-300 font-light max-w-2xl mx-auto leading-relaxed italic">
              Accédez instantanément à vos histoires panafricaines immersives. Reprenez votre voyage là où vous l'avez laissé.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {[
              { icon: BookOpen, text: "Reprenez votre lecture" },
              { icon: Zap, text: "Chapitres exclusifs" },
              { icon: Sparkles, text: "Communauté créative" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-primary font-bold text-[10px] md:text-xs uppercase tracking-widest">
                <div className="bg-primary/20 p-1 rounded-full"><item.icon className="h-3 w-3" /></div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-col items-center gap-1 animate-bounce">
            <p className="text-[8px] uppercase tracking-[0.4em] font-black text-primary/60">Connectez-vous ci-dessous</p>
            <ChevronDown className="h-4 w-4 text-primary" />
          </div>
        </div>
      </section>

      <section className="relative py-8 md:py-12 px-4 md:px-6 bg-stone-950 border-t border-primary/10 flex-1">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
          <div className="space-y-6 animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="text-center lg:text-left">
              <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-1">Choisissez votre méthode</h2>
              <p className="text-stone-400 text-sm">Sécurisé et sans mot de passe.</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                size="lg" 
                disabled={!!isSocialLoading}
                onClick={() => handleSocialLogin('Google')}
                className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-4 group overflow-hidden relative shadow-lg"
              >
                {isSocialLoading === 'Google' ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c1.61-3.21 2.53-7.07 2.53-10.34z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Se Connecter avec Google
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                disabled={!!isSocialLoading}
                onClick={() => handleSocialLogin('Facebook')}
                className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-4 group overflow-hidden relative shadow-lg"
              >
                {isSocialLoading === 'Facebook' ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Se Connecter avec Facebook
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                disabled={!!isSocialLoading}
                onClick={() => handleSocialLogin('Apple')}
                className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-4 group overflow-hidden relative shadow-lg"
              >
                {isSocialLoading === 'Apple' ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.152 6.896c-.548 0-1.411-.516-2.438-.516-1.357 0-2.714.836-3.407 2.015-1.412 2.4-.364 5.922 1.004 7.81.67.924 1.46 1.962 2.555 1.962.991 0 1.39-.636 2.585-.636 1.196 0 1.541.636 2.585.636 1.111 0 1.804-.937 2.471-1.848.774-1.068 1.09-2.096 1.114-2.148-.025-.013-2.135-.782-2.156-3.126-.021-1.96 1.602-2.898 1.677-2.95-.923-1.28-2.364-1.425-2.888-1.425-.122 0-.244 0-.36-.001-.012 0-.022 0-.033 0-.011 0-.021 0-.032 0-.412.001-.865.021-1.105.021zM12.093 5.22c.579-1.173.483-2.256.422-2.596-.051-.287-.519-.282-1.504.282-.466.267-.931.947-.931 1.626 0 .68.465 1.36.931 1.626.466.267.931.267 1.082-.938z"/>
                    </svg>
                    Se Connecter avec Apple
                  </>
                )}
              </Button>
            </div>

            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 group hover:border-primary/30 transition-all">
                <Lock className="h-5 w-5 text-primary" />
                <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider">Connexion Sécurisée</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 group hover:border-emerald-500/30 transition-all">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider">RGPD Compliant</span>
              </div>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-right-10 duration-1000">
            <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden">
              <div className="h-1 w-full bg-primary" />
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-display font-bold">Ou utilisez votre email</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-stone-300 text-xs font-bold uppercase tracking-widest">Email</FormLabel>
                          <FormControl>
                            <Input placeholder="votreemail@example.com" {...field} className="bg-white/5 border-white/10 h-11 rounded-xl focus:border-primary transition-all" />
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
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-stone-300 text-xs font-bold uppercase tracking-widest">Mot de passe</FormLabel>
                            <Link href="/forgot-password" title="Réinitialiser mon mot de passe" className="text-[10px] text-primary hover:underline font-bold">Oublié ?</Link>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••"
                                {...field} 
                                className="bg-white/5 border-white/10 h-11 rounded-xl pr-12 focus:border-primary transition-all" 
                              />
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-stone-500 hover:text-white"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center space-x-2 pb-2">
                      <Checkbox id="remember" className="border-white/20 data-[state=checked]:bg-primary" />
                      <label htmlFor="remember" className="text-xs text-stone-400 font-medium cursor-pointer">Se souvenir de moi</label>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-black text-base bg-primary hover:bg-primary/90 text-black shadow-[0_0_20px_rgba(212,168,67,0.3)] transition-all active:scale-95 group overflow-hidden relative">
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                          Se Connecter
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col border-t border-white/5 py-6 bg-white/5">
                <div className="text-center space-y-4">
                  <p className="text-stone-400 text-sm">Pas encore membre ?</p>
                  <Button asChild variant="outline" className="w-full h-11 rounded-xl border-primary text-primary font-bold hover:bg-primary hover:text-black transition-all">
                    <Link href="/signup">Créer un Compte Gratuit <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">Rejoignez-nous en 10 secondes !</p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-6 border-t border-white/5 bg-stone-950 text-center">
        <p className="text-[9px] text-stone-600 uppercase font-black tracking-[0.3em] flex items-center justify-center gap-4">
          <span>Plateforme Certifiée</span>
          <span className="h-1 w-1 rounded-full bg-stone-800" />
          <span>Protection des Données</span>
          <span className="h-1 w-1 rounded-full bg-stone-800" />
          <span>Inclusion Créative</span>
        </p>
      </section>
    </div>
  );
}
