'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ShieldCheck, Lock, Mail, ArrowRight, Sparkles, BookOpen, CheckCircle2, Zap, Globe, Loader2 } from "lucide-react";
import { cn } from '@/lib/utils';

const formSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
});

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast({
        title: "Lien envoyé !",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",
      });
    }, 1500);
  }

  return (
    <div className="flex flex-col bg-stone-950 min-h-screen">
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
            <h1 className="text-3xl md:text-5xl font-display font-black text-white leading-tight gold-resplendant drop-shadow-[0_0_15px_rgba(212,168,67,0.4)]">
              Mot de Passe Oublié ?
            </h1>
            <p className="text-sm md:text-lg text-stone-300 font-light max-w-2xl mx-auto leading-relaxed italic">
              Pas de panique ! Entrez votre email et on vous envoie un lien pour réinitialiser votre mot de passe en quelques minutes.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {[
              { icon: Mail, text: "Lien sécurisé envoyé immédiatement" },
              { icon: BookOpen, text: "Reprenez vos lectures sans attendre" },
              { icon: ShieldCheck, text: "Protection des données RGPD" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-primary font-bold text-[10px] md:text-xs uppercase tracking-widest">
                <div className="bg-primary/20 p-1.5 rounded-full"><item.icon className="h-3 w-3" /></div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {!isSubmitted && (
            <div className="pt-8 flex flex-col items-center gap-2 animate-bounce">
              <p className="text-[9px] uppercase tracking-[0.4em] font-black text-primary/60">Entrez votre email ci-dessous</p>
              <ChevronDown className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </section>

      {/* 2. FORMULAIRE UNIQUE */}
      <section className="relative py-12 md:py-20 px-4 md:px-6 bg-stone-950 border-t border-primary/10 flex-1">
        <div className="max-w-md mx-auto">
          {!isSubmitted ? (
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden">
                <div className="h-1 w-full bg-primary" />
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-display font-bold">Réinitialisation</CardTitle>
                  <CardDescription className="text-stone-400 text-xs mt-2">
                    Entrez l'email associé à votre compte NexusHub.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-stone-300 text-xs font-bold uppercase tracking-widest">Email de récupération</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="votreemail@example.com" 
                                {...field} 
                                autoFocus
                                className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-primary transition-all text-white" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl font-black text-base bg-primary hover:bg-primary/90 text-black shadow-[0_0_20px_rgba(212,168,67,0.3)] transition-all active:scale-95 group overflow-hidden relative"
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            Envoyer le Lien
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col border-t border-white/5 py-6 bg-white/5">
                  <div className="text-center">
                    <Link href="/login" className="text-stone-400 text-sm hover:text-primary transition-colors flex items-center justify-center gap-2">
                      <ArrowRight className="h-4 w-4 rotate-180" /> Retour à la Connexion
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="animate-in zoom-in duration-700">
              <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden text-center">
                <div className="h-1 w-full bg-emerald-500" />
                <CardHeader>
                  <div className="mx-auto bg-emerald-500/20 p-3 rounded-full w-fit mb-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <CardTitle className="text-2xl font-display font-bold text-white">Vérifiez votre boîte mail !</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-stone-300 text-sm leading-relaxed">
                    Si l'email existe dans notre base, un lien sécurisé a été envoyé. 
                    Vérifiez votre boîte de réception et vos courriers indésirables.
                  </p>
                  <div className="bg-white/5 rounded-xl p-4 text-xs text-stone-400 italic">
                    Le lien expirera automatiquement dans 30 minutes par mesure de sécurité.
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 py-6">
                  <Button asChild variant="outline" className="w-full h-11 rounded-xl border-emerald-500/50 text-emerald-500 hover:bg-emerald-500 hover:text-black">
                    <Link href="/login">Retour à la Connexion</Link>
                  </Button>
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">
                    Rien reçu ? <button onClick={() => setIsSubmitted(false)} className="text-primary hover:underline font-bold">Réessayer</button>
                  </p>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* SECURITY INDICATORS */}
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 text-center group hover:border-primary/30 transition-all">
              <Lock className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider">Lien HTTPS Sécurisé</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 text-center group hover:border-primary/30 transition-all">
              <Globe className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider">Inclusion Panafricaine</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA ALTERNATIF */}
      <section className="py-12 border-t border-white/5 bg-stone-900/50 text-center px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-stone-400 text-sm">Vous vous souvenez de votre mot de passe maintenant ?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild variant="outline" className="rounded-full px-8 h-10 border-primary text-primary hover:bg-primary hover:text-black font-bold">
              <Link href="/login">Se Connecter</Link>
            </Button>
            <span className="text-stone-600 font-black text-xs uppercase tracking-widest">OU</span>
            <Link href="/signup" className="text-primary font-bold text-sm hover:underline">Créer un compte gratuit</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
