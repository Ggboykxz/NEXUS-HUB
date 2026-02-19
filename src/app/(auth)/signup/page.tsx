'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/checkbox';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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
    console.log("Form values:", values);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('accountType', values.accountType === 'reader' ? 'reader' : 'artist');
    localStorage.setItem('userId', values.accountType === 'reader' ? 'reader-1' : '1');
    window.dispatchEvent(new Event('loginStateChange'));

    toast({
      title: "Bienvenue sur NexusHub !",
      description: "Votre compte a été créé avec succès. Découvrez vos recommandations personnalisées.",
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
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden px-4">
        {/* Background Animé Gold */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.2),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
          
          {/* Particules Shimmer */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div 
                key={i} 
                className="particle bg-primary/20" 
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  '--dur': `${5 + Math.random() * 5}s`,
                  '--del': `${Math.random() * 5}s`,
                  '--tx': `${Math.random() * 100 - 50}px`,
                  '--ty': `${Math.random() * -200}px`
                } as any} 
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-5xl w-full text-center space-y-8 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-display font-black leading-[1.1] text-white tracking-tighter drop-shadow-[0_0_30px_rgba(212,168,67,0.4)]">
              Rejoignez NexusHub – <br/>
              <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-shimmer">
                Créez et Découvrez
              </span> <br/>
              des Histoires Africaines
            </h1>

            <p className="text-lg md:text-xl text-stone-300 font-light max-w-3xl mx-auto leading-relaxed italic">
              Devenez artiste Pro/Draft, lisez gratuitement, connectez-vous à une communauté panafricaine. 
              <span className="block font-bold text-primary mt-2 uppercase tracking-[0.2em] text-sm">Inscription gratuite et instantanée !</span>
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-6">
            {[
              { icon: Zap, text: "Publiez en un clic", color: "text-primary" },
              { icon: Sparkles, text: "Univers mythologiques", color: "text-accent" },
              { icon: Users, text: "Soutenez des créateurs", color: "text-emerald-500" },
              { icon: Award, text: "AfriCoins et Premium", color: "text-amber-500" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl group hover:border-primary/50 hover:bg-white/[0.08] transition-all duration-500 shadow-2xl">
                <div className={cn("bg-white/5 p-2 rounded-lg group-hover:scale-110 transition-all duration-500", item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-xs md:text-sm font-bold text-stone-200 tracking-tight">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-12 flex flex-col items-center gap-3 animate-bounce">
            <p className="text-[10px] uppercase tracking-[0.5em] font-black text-primary/60">Commencez ci-dessous</p>
            <ChevronDown className="h-6 w-6 text-primary" />
          </div>
        </div>
      </section>

      {/* SECTION AUTHENTIFICATION */}
      <section className="relative py-24 px-6 bg-stone-950 border-t border-primary/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          
          {/* 2. OPTIONS DE CONNEXION SOCIALE */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-display font-bold text-white mb-2">Inscrivez-vous en un clic</h2>
              <p className="text-stone-400">Le moyen le plus rapide pour commencer votre voyage.</p>
            </div>

            <div className="flex flex-col gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleSocialLogin('Google')}
                className="h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-lg gap-4 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <i className="fa-brands fa-google text-2xl text-red-500" />
                Continuer avec Google
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleSocialLogin('X')}
                className="h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-lg gap-4 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <i className="fa-brands fa-x-twitter text-2xl" />
                Continuer avec X (Twitter)
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleSocialLogin('Facebook')}
                className="h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-lg gap-4 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <i className="fa-brands fa-facebook text-2xl text-blue-600" />
                Continuer avec Facebook
              </Button>
            </div>

            <div className="flex items-center gap-4 py-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-primary/60">Ou par email</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-2 rounded-lg"><ShieldCheck className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">Sécurité Garantie</p>
                  <p className="text-xs text-stone-400">Vos données sont protégées et conformes RGPD.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. FORMULAIRE EMAIL MINIMAL */}
          <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl rounded-3xl animate-in fade-in slide-in-from-right-10 duration-1000">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-display font-bold">Créer un compte</CardTitle>
              <CardDescription>Remplissez les informations ci-dessous.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" data-netlify="true" name="inscription">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-stone-300">Pseudo Unique</FormLabel>
                        <FormControl>
                          <Input placeholder="VotrePseudo" {...field} className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-primary transition-all" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-stone-300">Email Professionnel</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="nom@exemple.com" {...field} className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-primary transition-all" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-stone-300">Mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              {...field} 
                              className="bg-white/5 border-white/10 h-12 rounded-xl pr-12 focus:border-primary transition-all" 
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
                  <FormField
                    control={form.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-stone-300">Je rejoins en tant que...</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                          >
                            {[
                              { value: "reader", label: "Lecteur", icon: Globe },
                              { value: "artist_draft", label: "Artiste Draft", icon: PenSquare },
                              { value: "artist_pro", label: "Artiste Pro", icon: Award },
                            ].map((item) => (
                              <FormItem key={item.value} className="flex items-center space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={item.value} className="sr-only" id={item.value} />
                                </FormControl>
                                <label
                                  htmlFor={item.value}
                                  className={cn(
                                    "flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 border-white/10 cursor-pointer transition-all hover:bg-white/5",
                                    field.value === item.value ? "border-primary bg-primary/10 text-primary" : "text-stone-400"
                                  )}
                                >
                                  <item.icon className="h-5 w-5 mb-1" />
                                  <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
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
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-white/5 p-4 bg-white/5">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-black"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-xs text-stone-400 font-light">
                            J'accepte les <Link href="/legal/terms" className="text-primary hover:underline">Conditions d'Utilisation</Link> et la <Link href="/legal/privacy" className="text-primary hover:underline">Politique de Confidentialité</Link>.
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90 text-black shadow-[0_0_20px_rgba(212,168,67,0.3)] transition-all active:scale-95 group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    S'inscrire Gratuitement
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col border-t border-white/5 pt-6 mt-4">
              <div className="text-center text-sm text-stone-400">
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
      <section className="py-24 px-6 bg-gradient-to-b from-stone-950 to-stone-900 overflow-hidden relative">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white drop-shadow-[0_0_15px_rgba(212,168,67,0.3)]">Pourquoi Rejoindre NexusHub ?</h2>
            <p className="text-stone-400 max-w-2xl mx-auto">Le premier hub créatif panafricain pour les passionnés de narration visuelle.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: Users, 
                title: "Communauté Inclusive", 
                desc: "Connectez-vous avec des artistes du Gabon et de toute l'Afrique.", 
                color: "bg-blue-500/10 text-blue-500" 
              },
              { 
                icon: Coins, 
                title: "Monétisation Facile", 
                desc: "Gagnez avec les AfriCoins, dons et merchandising officiel.", 
                color: "bg-amber-500/10 text-amber-500" 
              },
              { 
                icon: LayoutGrid, 
                title: "World Building Immersif", 
                desc: "Accédez à des outils de création inspirés de la culture africaine.", 
                color: "bg-primary/10 text-primary" 
              },
              { 
                icon: CheckCircle2, 
                title: "Gratuit pour Toujours", 
                desc: "Draft gratuit, Pro sur validation pour les talents confirmés.", 
                color: "bg-emerald-500/10 text-emerald-500" 
              },
            ].map((item, i) => (
              <Card key={i} className="bg-white/5 border-white/10 hover:border-primary/30 transition-all duration-500 group rounded-3xl">
                <CardContent className="p-8 space-y-4">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500", item.color)}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-20 relative rounded-3xl overflow-hidden aspect-[21/9] md:aspect-[32/9] border border-white/10 shadow-2xl">
            <Image 
              src="https://images.unsplash.com/photo-1544256718-3bcf237f3974" 
              alt="Artiste en création" 
              fill 
              className="object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-1000"
              data-ai-hint="artist drawing"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/60 to-transparent flex items-center p-8 md:p-16">
              <div className="max-w-xl space-y-4">
                <Badge className="bg-primary text-black font-black">MOODBOARD CRÉATIF</Badge>
                <h3 className="text-3xl md:text-4xl font-display font-bold text-white">Prêt à marquer l'histoire ?</h3>
                <p className="text-stone-300 italic">"Chaque trait est un pont entre nos traditions et le futur de la BD mondiale."</p>
                <Button variant="link" className="p-0 text-primary font-bold gap-2">
                  Découvrir notre manifeste <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NOTE DE CONFIDENTIALITÉ & LIENS LÉGAUX */}
      <section className="py-12 border-t border-white/5 bg-stone-950">
        <div className="container max-w-4xl mx-auto px-6 text-center space-y-6">
          <p className="text-[10px] text-stone-600 uppercase font-bold tracking-[0.2em] max-w-md mx-auto leading-relaxed">
            En vous inscrivant, vous rejoignez le premier hub créatif panafricain. Vos données sont protégées conforme RGPD. Pas de spam, que des updates créatives.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-stone-500">
            <Link href="/legal/terms" className="hover:text-primary transition-colors">Conditions d'Utilisation</Link>
            <span className="opacity-20">|</span>
            <Link href="/legal/privacy" className="hover:text-primary transition-colors">Politique de Confidentialité</Link>
            <span className="opacity-20">|</span>
            <Link href="/login" className="text-primary font-bold">Déjà un compte ? Connexion</Link>
          </div>
        </div>
      </section>
    </div>
  );
}