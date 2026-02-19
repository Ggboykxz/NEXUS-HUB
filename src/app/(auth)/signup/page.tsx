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
import { Sparkles, Zap, Users, Award, ChevronDown, CheckCircle2, ShieldCheck, Globe, Coins, LayoutGrid, Eye, EyeOff, ArrowRight, PenSquare } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Footer from '@/components/common/footer';

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
  const [particles, setParticles] = useState<{id: number, top: string, left: string, dur: string, del: string, tx: string, ty: string}[]>([]);

  useEffect(() => {
    // Generate particles on client side to avoid hydration mismatch
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('accountType', values.accountType === 'reader' ? 'reader' : 'artist');
    localStorage.setItem('userId', values.accountType === 'reader' ? 'reader-1' : '1');
    window.dispatchEvent(new Event('loginStateChange'));

    toast({
      title: "Bienvenue sur NexusHub !",
      description: "Votre compte a été créé avec succès.",
    });

    router.push('/');
  }

  const handleSocialLogin = (platform: string) => {
    toast({
      title: `Connexion avec ${platform}`,
      description: "Redirection vers le service d'authentification...",
    });
  };

  return (
    <div className="flex flex-col bg-stone-950">
      {/* 1. HERO BANNER - ACCUEIL ENGAGEANT */}
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

      {/* SECTION AUTHENTIFICATION */}
      <section className="relative py-8 md:py-16 px-4 md:px-6 bg-stone-950 border-t border-primary/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
          
          <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="text-center lg:text-left">
              <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-1">Inscrivez-vous en un clic</h2>
              <p className="text-stone-400 text-[11px] md:text-sm">Le moyen le plus rapide pour commencer votre voyage.</p>
            </div>

            <div className="flex flex-col gap-2.5">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleSocialLogin('Google')}
                className="h-11 md:h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-sm md:text-base gap-3 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <i className="fa-brands fa-google text-lg md:text-xl text-red-500" />
                Continuer avec Google
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleSocialLogin('X')}
                className="h-11 md:h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-sm md:text-base gap-3 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <i className="fa-brands fa-x-twitter text-lg md:text-xl" />
                Continuer avec X (Twitter)
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleSocialLogin('Facebook')}
                className="h-11 md:h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-sm md:text-base gap-3 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <i className="fa-brands fa-facebook text-lg md:text-xl text-blue-600" />
                Continuer avec Facebook
              </Button>
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

          <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl rounded-2xl animate-in fade-in slide-in-from-right-10 duration-1000">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg md:text-xl font-display font-bold">Créer un compte</CardTitle>
              <CardDescription className="text-[10px] md:text-xs">Remplissez les informations ci-dessous.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-stone-300 text-[10px] md:text-xs">Pseudo Unique</FormLabel>
                        <FormControl>
                          <Input placeholder="VotrePseudo" {...field} className="bg-white/5 border-white/10 h-9 md:h-10 rounded-lg focus:border-primary transition-all text-xs md:text-sm" />
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
                        <FormLabel className="text-stone-300 text-[10px] md:text-xs">Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="nom@exemple.com" {...field} className="bg-white/5 border-white/10 h-9 md:h-10 rounded-lg focus:border-primary transition-all text-xs md:text-sm" />
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
                        <FormLabel className="text-stone-300 text-[10px] md:text-xs">Mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              {...field} 
                              className="bg-white/5 border-white/10 h-9 md:h-10 rounded-lg pr-10 focus:border-primary transition-all text-xs md:text-sm" 
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-stone-500 hover:text-white"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
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
                        <FormLabel className="text-stone-300 text-[10px] md:text-xs">Je rejoins en tant que...</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-3 gap-2"
                          >
                            {[
                              { value: "reader", label: "Lecteur", icon: Globe },
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
                                    "flex-1 flex flex-col items-center justify-center p-1.5 md:p-2 rounded-lg border-2 border-white/10 cursor-pointer transition-all hover:bg-white/5",
                                    field.value === item.value ? "border-primary bg-primary/10 text-primary" : "text-stone-400"
                                  )}
                                >
                                  <item.icon className="h-3.5 w-3.5 md:h-4 md:w-4 mb-1" />
                                  <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-tight">{item.label}</span>
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
                      <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-lg border border-white/5 p-2 md:p-3 bg-white/5">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-black h-3 w-3 md:h-3.5 md:w-3.5"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-[9px] md:text-[10px] text-stone-400 font-light">
                            J'accepte les <Link href="/legal/terms" className="text-primary hover:underline">Conditions</Link> et la <Link href="/legal/privacy" className="text-primary hover:underline">Politique</Link>.
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-11 md:h-12 rounded-xl font-black text-sm md:text-base bg-primary hover:bg-primary/90 text-black shadow-[0_0_15px_rgba(212,168,67,0.25)] transition-all active:scale-95 group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    S'inscrire Gratuitement
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col border-t border-white/5 pt-3 md:pt-4 mt-1 md:mt-2">
              <div className="text-center text-[10px] md:text-xs text-stone-400">
                Déjà un compte ?{" "}
                <Link href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
                  Se connecter
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* 4. TEASER AVANTAGES */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-gradient-to-b from-stone-950 to-stone-900 overflow-hidden relative">
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10" />
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12 space-y-2 md:space-y-3">
            <h2 className="text-2xl md:text-4xl font-display font-bold text-white drop-shadow-[0_0_10px_rgba(212,168,67,0.2)]">Pourquoi Rejoindre NexusHub ?</h2>
            <p className="text-stone-400 text-xs md:text-sm max-w-xl mx-auto">Le premier hub créatif panafricain pour les passionnés de narration visuelle.</p>
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
              <Card key={i} className="bg-white/5 border-white/10 hover:border-primary/30 transition-all duration-500 group rounded-xl md:rounded-2xl">
                <CardContent className="p-4 md:p-6 space-y-2 md:space-y-3">
                  <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500", item.color)}>
                    <item.icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <h3 className="text-sm md:text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-stone-400 text-[9px] md:text-xs leading-relaxed line-clamp-2">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
