'use client';

import { useState, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { 
  Award, 
  Eye, 
  EyeOff, 
  Loader2, 
  Brush, 
  BookOpen, 
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/checkbox-ui-fix';
import { cn } from '@/lib/utils';
import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { setRoleCookie } from '@/lib/actions/auth-actions';

const signupSchema = z.object({
  name: z.string().min(2, { message: "Le pseudo doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  slug: z.string().min(3, { message: "Le @slug doit faire 3 caractères min." }).regex(/^[a-z0-9-]+$/, { message: "Lettres minuscules, chiffres et tirets uniquement." }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "L'acceptation est obligatoire.",
  }),
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'reader' | 'artist_draft' | 'translator'>('reader');

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { 
      name: "", 
      email: "", 
      slug: "", 
      password: "", 
      acceptTerms: false,
    },
  });

  const handleNextStep = async () => {
    const fieldsToValidate = ['name', 'email', 'slug', 'password', 'acceptTerms'] as const;
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setStep(2);
  };

  const roles = [
    { id: 'reader', label: 'Lecteur', icon: BookOpen, color: 'text-stone-400', bonus: '50 🪙' },
    { id: 'artist_draft', label: 'Artiste', icon: Brush, color: 'text-orange-500', bonus: '100 🪙' },
    { id: 'translator', label: 'Traducteur', icon: Award, color: 'text-emerald-500', bonus: '75 🪙' },
  ];

  async function onSubmit(values: SignupValues) {
    setIsLoading(true);
    try {
      // 1. Création Auth
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: values.name });
      
      // 2. Construction du profil Firestore (Sanitisation stricte pour éviter les 'undefined')
      const commonData = {
        uid: user.uid,
        email: user.email || "",
        displayName: values.name,
        slug: values.slug.toLowerCase(),
        role: selectedRole,
        level: 1,
        photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        onboardingCompleted: false,
        isBanned: false,
        isCertified: false,
        bio: "",
        preferences: { 
          language: 'fr', 
          theme: 'dark',
          privacy: { showCurrentReading: true, showHistory: true }
        }
      };

      let roleSpecificData: any = {};

      if (selectedRole === 'reader') {
        roleSpecificData = {
          afriCoins: 50,
          readingStats: { chaptersRead: 0, totalReadTime: 0, preferredGenres: [] },
          readingStreak: { currentCount: 0, lastReadDate: "", longestStreak: 0 }
        };
      } else if (selectedRole === 'artist_draft') {
        roleSpecificData = {
          afriCoins: 100,
          subscribersCount: 0,
          followedCount: 0,
          portfolioUrl: ""
        };
      } else if (selectedRole === 'translator') {
        roleSpecificData = {
          afriCoins: 75,
          translatorLanguages: ['fr'],
          translationsCount: 0,
        };
      }

      const finalProfile = { ...commonData, ...roleSpecificData };

      // 3. Sauvegarde dans la collection 'users'
      await setDoc(doc(db, 'users', user.uid), finalProfile, { merge: true });
      
      // 4. Synchronisation Cookies (Client + Serveur)
      document.cookie = `nexushub-role=${selectedRole}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      await setRoleCookie(selectedRole);

      toast({ title: "Bienvenue au Hub !", description: "Votre profil a été initialisé." });
      
      // 5. Redirection immédiate
      const target = selectedRole.startsWith('artist') ? '/dashboard/creations' : (selectedRole === 'translator' ? '/dashboard/translations' : '/');
      
      // Petit délai pour laisser les cookies se propager
      setTimeout(() => {
        window.location.replace(target);
      }, 100);

    } catch (error: any) {
      console.error("Signup error:", error);
      let message = "Une erreur est survenue.";
      if (error.code === 'auth/email-already-in-use') message = "Cet email est déjà utilisé.";
      toast({ title: "Action impossible", description: message, variant: "destructive" });
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col bg-stone-950 min-h-screen">
      <section className="relative py-12 px-4 md:px-6 flex-1 flex items-center justify-center">
        <div className="max-w-xl w-full">
          <Card className="border-white/10 bg-stone-900/50 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] overflow-hidden">
            <div className="h-1.5 w-full bg-primary" />
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-10">
                <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] font-black px-4 py-1 mb-4">Étape {step} sur 2</Badge>
                <h1 className="text-3xl font-display font-black text-white gold-resplendant">
                  {step === 1 ? "Identité du Voyageur" : "Choisissez votre Destinée"}
                </h1>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {step === 1 ? (
                    <div className="space-y-6 animate-in fade-in duration-500">
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest">Pseudo</FormLabel>
                            <FormControl><Input placeholder="Ex: Scribe du Nil" {...field} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="slug" render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest">@slug</FormLabel>
                            <FormControl><Input placeholder="scribe-nil" {...field} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-stone-300 text-[10px] font-black uppercase tracking-widest">Email</FormLabel>
                          <FormControl><Input type="email" placeholder="voyageur@nexus.hub" {...field} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

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

                      <FormField control={form.control} name="acceptTerms" render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0 p-4 rounded-2xl bg-white/5 border border-white/5">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <FormLabel className="text-[10px] text-stone-400 font-light italic leading-tight">J'accepte de respecter la charte de bienveillance du Hub.</FormLabel>
                        </FormItem>
                      )} />

                      <Button type="button" onClick={handleNextStep} className="w-full h-16 rounded-2xl font-black text-lg bg-primary text-black gold-shimmer shadow-xl shadow-primary/20">
                        Étape suivante <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                      <div className="grid grid-cols-1 gap-4">
                        {roles.map((r) => (
                          <button 
                            key={r.id} 
                            type="button" 
                            onClick={() => setSelectedRole(r.id as any)} 
                            className={cn(
                              "flex items-center p-6 rounded-[2rem] border-2 transition-all gap-6 text-left", 
                              selectedRole === r.id ? "bg-primary/10 border-primary shadow-2xl" : "bg-white/5 border-white/5 opacity-60 hover:opacity-100"
                            )}
                          >
                            <div className={cn("p-4 rounded-2xl bg-white/5", selectedRole === r.id && r.color)}>
                              <r.icon className="h-8 w-8" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-display font-black text-xl text-white">{r.label}</h3>
                              <p className="text-[10px] uppercase font-bold text-stone-500">Bonus initial : {r.bonus}</p>
                            </div>
                            {selectedRole === r.id && <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-black font-black">✓</div>}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-4">
                        <Button type="button" variant="ghost" onClick={() => setStep(1)} className="flex-1 h-16 rounded-2xl font-bold text-stone-500">
                          <ArrowLeft className="mr-2 h-5 w-5" /> Retour
                        </Button>
                        <Button type="submit" disabled={isLoading} className="flex-[2] h-16 rounded-2xl font-black text-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20">
                          {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Invoquer mon Profil"}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
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