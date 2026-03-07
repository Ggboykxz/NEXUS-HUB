'use client';

import { useState, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowRight, Loader2, BookOpen, Brush, Crown, Award } from "lucide-react";
import { cn } from '@/lib/utils';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { setRoleCookie } from '@/lib/actions/auth-actions';

const formSchema = z.object({
  email: z.string().email({ message: "Email invalide." }),
  password: z.string().min(1, { message: "Mot de passe requis." }),
});

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const redirectByRole = (role: string) => {
    if (role === 'admin') return router.push('/admin');
    if (role.startsWith('artist')) return router.push('/dashboard/creations');
    if (role === 'translator') return router.push('/dashboard/translations');
    return router.push(callbackUrl);
  };

  const checkUserAndRedirect = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists() || !userDoc.data()?.role) {
        setPendingUser(user);
        setShowRoleSelection(true);
        setIsLoading(false);
      } else {
        const role = userDoc.data()?.role;
        await setRoleCookie(role); // Informe le middleware
        toast({ title: "Bon retour au Hub !" });
        redirectByRole(role);
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur d'accès", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      await checkUserAndRedirect(userCredential.user);
    } catch (error: any) {
      toast({ title: "Erreur", description: "Email ou mot de passe incorrect.", variant: "destructive" });
      setIsLoading(false);
    }
  }

  const handleSocialLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) await checkUserAndRedirect(result.user);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') toast({ title: "Échec de connexion", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const handleRoleChoice = async (role: string) => {
    if (!pendingUser) return;
    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', pendingUser.uid);
      const baseName = pendingUser.displayName || pendingUser.email?.split('@')[0] || 'voyageur';
      const slug = baseName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
      
      await setDoc(userRef, {
        uid: pendingUser.uid,
        email: pendingUser.email,
        displayName: pendingUser.displayName || 'Nouveau Voyageur',
        slug,
        role,
        afriCoins: role === 'premium_reader' ? 50 : 0,
        level: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        preferences: { language: 'fr', theme: 'dark', privacy: { showCurrentReading: true, showHistory: true } }
      }, { merge: true });

      await setRoleCookie(role);
      redirectByRole(role);
    } catch (e) {
      toast({ title: "Erreur", variant: "destructive" });
      setIsLoading(false);
    }
  };

  if (showRoleSelection) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950 p-6">
        <div className="max-w-4xl w-full text-center space-y-12">
          <h2 className="text-4xl md:text-6xl font-display font-black text-white gold-resplendant">Quelle est votre destinée ?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'reader', label: 'Lecteur', icon: BookOpen, color: 'text-stone-400' },
              { id: 'premium_reader', label: 'Premium', icon: Crown, color: 'text-amber-500' },
              { id: 'artist_draft', label: 'Artiste Draft', icon: Brush, color: 'text-orange-500' },
              { id: 'artist_pro', label: 'Artiste Pro', icon: Award, color: 'text-emerald-500' },
            ].map((r) => (
              <button key={r.id} disabled={isLoading} onClick={() => handleRoleChoice(r.id)} className="p-8 rounded-[2rem] bg-stone-900 border-2 border-white/5 hover:border-primary transition-all group space-y-4">
                <r.icon className={cn("h-10 w-10 mx-auto group-hover:scale-110 transition-transform", r.color)} />
                <h3 className="text-xs font-black text-white uppercase">{r.label}</h3>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-stone-950 w-full justify-center items-center p-6">
      <div className="w-full max-w-md space-y-10">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-display font-black text-white tracking-tighter">Bienvenue au Hub</h2>
          <p className="text-stone-500 text-sm italic">Accédez à vos légendes africaines.</p>
        </div>

        <div className="space-y-4">
          <Button onClick={handleSocialLogin} disabled={isLoading} variant="outline" size="lg" className="w-full h-12 rounded-xl border-white/10 bg-white/5 text-white font-bold gap-4">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Connexion avec Google"}
          </Button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[10px] font-black uppercase text-stone-600">Ou par email</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest">Email</FormLabel>
                  <FormControl><Input placeholder="voyageur@nexus.hub" {...field} className="bg-white/5 border-white/10 h-11 rounded-xl text-white" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <div className="flex items-center justify-between"><FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest">Mot de passe</FormLabel></div>
                  <FormControl>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} className="bg-white/5 border-white/10 h-11 rounded-xl pr-12 text-white" />
                      <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-stone-500" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl font-black text-lg bg-primary text-black shadow-xl gold-shimmer">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Se Connecter au Hub"}
              </Button>
            </form>
          </Form>
        </div>

        <div className="text-center text-xs text-stone-500">
          Pas encore de compte ? <Link href="/signup" className="text-primary font-bold hover:underline">S'inscrire</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-950 flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
