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
import { ChevronDown, ShieldCheck, Lock, Eye, EyeOff, ArrowRight, Sparkles, BookOpen, CheckCircle2, Zap } from "lucide-react";
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  password: z.string().nonempty({ message: "Le mot de passe est requis." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [particles, setParticles] = useState<{id: number, top: string, left: string, dur: string, del: string, tx: string, ty: string}[]>([]);

  useEffect(() => {
    // Generate particles on client side to avoid hydration mismatch
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('accountType', 'reader');
    localStorage.setItem('userId', 'reader-1');
    window.dispatchEvent(new Event('loginStateChange'));

    toast({
      title: "Connexion réussie !",
      description: "Heureux de vous revoir parmi nous.",
    });

    router.push('/');
  }

  const handleSocialLogin = (platform: string) => {
    toast({
      title: `Connexion avec ${platform}`,
      description: "Sécurisation de la session en cours...",
    });
  };

  return (
    <div className="flex flex-col bg-stone-950">
      {/* 1. HERO / TITRE D'ACCUEIL IMMEDIAT */}
      <section className="relative min-h-[45vh] flex flex-col items-center justify-center overflow-hidden px-4 py-12">
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

        <div className="relative z-10 max-w-4xl w-full text-center space-y-6 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-display font-black text-white leading-tight gold-resplendant drop-shadow-[0_0_15px_rgba(212,168,67,0.4)] animate-pulse">
              Connexion à NexusHub
            </h1>
            <p className="text-sm md:text-lg text-stone-300 font-light max-w-2xl mx-auto leading-relaxed italic">
              Accédez instantanément à vos histoires panafricaines immersives. Reprenez votre voyage là où vous l'avez laissé.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {[
              { icon: BookOpen, text: "Reprenez votre lecture" },
              { icon: Zap, text: "Chapitres exclusifs" },
              { icon: Sparkles, text: "Communauté créative" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-primary font-bold text-[10px] md:text-xs uppercase tracking-widest">
                <div className="bg-primary/20 p-1.5 rounded-full"><item.icon className="h-3 w-3" /></div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-8 flex flex-col items-center gap-2 animate-bounce">
            <p className="text-[9px] uppercase tracking-[0.4em] font-black text-primary/60">Connectez-vous ci-dessous</p>
            <ChevronDown className="h-5 w-5 text-primary" />
          </div>
        </div>
      </section>

      {/* 2. OPTIONS DE CONNEXION RAPIDE & FORMULAIRE */}
      <section className="relative py-12 md:py-20 px-4 md:px-6 bg-stone-950 border-t border-primary/10">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
          
          {/* OPTIONS SOCIALES */}
          <div className="space-y-6 animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="text-center lg:text-left">
              <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-2">Choisissez votre méthode</h2>
              <p className="text-stone-400 text-sm">Sécurisé et sans mot de passe.</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleSocialLogin('Google')}
                className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-4 group overflow-hidden relative shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <i className="fa-brands fa-google text-xl text-red-500" />
                Se Connecter avec Google
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleSocialLogin('X')}
                className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-4 group overflow-hidden relative shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <i className="fa-brands fa-x-twitter text-xl" />
                Se Connecter avec X (Twitter)
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleSocialLogin('Facebook')}
                className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-4 group overflow-hidden relative shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <i className="fa-brands fa-facebook text-xl text-blue-600" />
                Se Connecter avec Facebook
              </Button>
            </div>

            {/* TRUST INDICATORS */}
            <div className="pt-8 grid grid-cols-2 gap-4">
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

          {/* FORMULAIRE EMAIL */}
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
                            <Link href="#" className="text-[10px] text-primary hover:underline font-bold">Oublié ?</Link>
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

                    <Button type="submit" className="w-full h-12 rounded-xl font-black text-base bg-primary hover:bg-primary/90 text-black shadow-[0_0_20px_rgba(212,168,67,0.3)] transition-all active:scale-95 group overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      Se Connecter
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

      {/* SECURITY BAR */}
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
