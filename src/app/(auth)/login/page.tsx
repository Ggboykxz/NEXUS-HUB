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
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  Users, 
  Sparkles, 
  Globe, 
  Trophy,
  ChevronRight,
  Zap,
  BookOpen
} from "lucide-react";
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
import Image from 'next/image';

const formSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  password: z.string().min(1, { message: "Le mot de passe est requis." }),
});

const SHOWCASE_IMAGES = [
  "https://res.cloudinary.com/demo/image/upload/v1/samples/hero-afrofuturism.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/stories/orisha-chronicles.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/stories/scifi-africa.jpg"
];

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Rotation des images de vitrine
  useEffect(() => {
    const interval = setInterval(() => {
      setImageLoaded(false);
      setHeroIndex((prev) => (prev + 1) % SHOWCASE_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const setSessionCookie = () => {
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
      await signInWithPopup(auth, provider!);
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
    <div className="flex min-h-screen bg-stone-950">
      {/* PANNEAU DE VITRINE (GAUCHE - MD+) */}
      <div className="hidden md:flex relative w-1/2 flex-col overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 z-0">
          <Image
            key={heroIndex}
            src={SHOWCASE_IMAGES[heroIndex]}
            alt="Nexus Showcase"
            fill
            className={cn(
              "object-cover transition-all duration-1000",
              imageLoaded ? "opacity-30 scale-100 blur-[2px]" : "opacity-0 scale-105 blur-xl"
            )}
            onLoad={() => setImageLoaded(true)}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-transparent to-stone-950" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center p-12 lg:p-20 space-y-12">
          <div className="space-y-6">
            <Link href="/" className="inline-block group">
              <span className="font-display font-black text-3xl tracking-tighter text-white gold-resplendant">NexusHub<span className="text-primary">.</span></span>
            </Link>
            <h1 className="text-5xl lg:text-7xl font-display font-black text-white leading-[0.9] tracking-tighter animate-in fade-in slide-in-from-left-8 duration-700">
              L'Art Africain, <br/>
              <span className="gold-resplendant">Sans Frontières</span>
            </h1>
            <p className="text-stone-400 text-lg max-w-md italic font-light leading-relaxed animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
              "Redécouvrez la narration visuelle à travers les prismes du continent. Rejoignez le voyage."
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {[
              { icon: Users, label: "50k+ Lecteurs", sub: "Communauté active" },
              { icon: Sparkles, label: "200+ Artistes", sub: "Talents certifiés" },
              { icon: Globe, label: "15 Pays", sub: "Héritage panafricain" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl w-fit group hover:border-primary/30 transition-all">
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary group-hover:scale-110 transition-transform">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-white leading-tight">{stat.label}</p>
                  <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 p-12 lg:p-20 pt-0">
          <div className="flex items-center gap-4 text-stone-600 text-[10px] font-black uppercase tracking-[0.3em]">
            <span>Secured By Nexus Core</span>
            <div className="h-1 w-1 rounded-full bg-stone-800" />
            <span>v4.3.0</span>
          </div>
        </div>
      </div>

      {/* PANNEAU DE CONNEXION (DROITE) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 bg-stone-950 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-right-10 duration-1000">
          <div className="text-center md:text-left space-y-2">
            <Badge className="md:hidden bg-primary text-black mb-4 uppercase tracking-widest font-black text-[10px] px-4 py-1">NexusHub</Badge>
            <h2 className="text-3xl font-display font-black text-white tracking-tighter">Bienvenue au Hub</h2>
            <p className="text-stone-500 text-sm italic">Accédez à votre bibliothèque et vos favoris.</p>
          </div>

          <div className="space-y-4">
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
                    Connexion avec Google
                  </>
                )}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  disabled={!!isSocialLoading}
                  onClick={() => handleSocialLogin('Facebook')}
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-3 group overflow-hidden relative"
                >
                  <svg className="h-4 w-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>
                <Button 
                  variant="outline" 
                  disabled={!!isSocialLoading}
                  onClick={() => handleSocialLogin('Apple')}
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold gap-3 group overflow-hidden relative"
                >
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.152 6.896c-.548 0-1.411-.516-2.438-.516-1.357 0-2.714.836-3.407 2.015-1.412 2.4-.364 5.922 1.004 7.81.67.924 1.46 1.962 2.555 1.962.991 0 1.39-.636 2.585-.636 1.196 0 1.541.636 2.585.636 1.111 0 1.804-.937 2.471-1.848.774-1.068 1.09-2.096 1.114-2.148-.025-.013-2.135-.782-2.156-3.126-.021-1.96 1.602-2.898 1.677-2.95-.923-1.28-2.364-1.425-2.888-1.425-.122 0-.244 0-.36-.001-.012 0-.022 0-.033 0-.011 0-.021 0-.032 0-.412.001-.865.021-1.105.021zM12.093 5.22c.579-1.173.483-2.256.422-2.596-.051-.287-.519-.282-1.504.282-.466.267-.931.947-.931 1.626 0 .68.465 1.36.931 1.626.466.267.931.267 1.082-.938z"/>
                  </svg>
                  Apple
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-600">Ou par email</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="voyageur@nexus.hub" {...field} className="bg-white/5 border-white/10 h-11 rounded-xl focus:border-primary transition-all text-white" />
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
                        <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest">Mot de passe</FormLabel>
                        <Link href="/forgot-password" title="Réinitialiser mon mot de passe" className="text-[9px] text-primary hover:underline font-bold uppercase tracking-widest">Oublié ?</Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••"
                            {...field} 
                            className="bg-white/5 border-white/10 h-11 rounded-xl pr-12 focus:border-primary transition-all text-white" 
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
                  <label htmlFor="remember" className="text-[10px] text-stone-500 font-bold uppercase tracking-widest cursor-pointer">Se souvenir de moi</label>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90 text-black shadow-xl shadow-primary/20 transition-all active:scale-95 group relative overflow-hidden gold-shimmer">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Se Connecter au Hub"}
                </Button>
              </form>
            </Form>
          </div>

          <div className="pt-8 border-t border-white/5 text-center space-y-4">
            <p className="text-stone-400 text-sm italic font-light">"Chaque légende commence par un premier pas."</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild variant="outline" className="w-full sm:w-auto h-11 rounded-xl border-primary text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-black transition-all">
                <Link href="/signup">Créer mon Compte Gratuit <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
