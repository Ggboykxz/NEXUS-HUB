'use client';

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
import { Sparkles, Zap, Users, Award, ChevronDown } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." }),
  accountType: z.enum(["reader", "artist"], {
    required_error: "Vous devez sélectionner un type de compte.",
  }),
});

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      accountType: "reader",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const isArtist = values.accountType === 'artist';
    const userId = isArtist ? '1' : 'reader-1'; 

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('accountType', values.accountType);
    localStorage.setItem('userId', userId);
    window.dispatchEvent(new Event('loginStateChange'));

    if (isArtist) {
      toast({
        title: "Compte artiste créé !",
        description: `Bienvenue, ${values.name} ! Vous allez être redirigé pour compléter votre profil.`,
      });
      router.push('/settings');
    } else {
      toast({
        title: "Compte créé !",
        description: `Bienvenue, ${values.name} ! Votre profil public est maintenant disponible.`,
      });
      router.push(`/profile/${userId}`);
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section - Exclusif à l'inscription */}
      <section className="relative min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center overflow-hidden px-4 border-b border-primary/10">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.1),transparent_50%)]" />
          <div className="hero-pattern opacity-[0.03] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-pulse duration-[4000ms]" />
        </div>

        <div className="relative z-10 max-w-4xl w-full text-center space-y-10">
          <div className="space-y-6 animate-in fade-in slide-in-from-top-8 duration-1000">
            <h1 className="text-4xl md:text-7xl font-display font-black leading-[1.1] text-white tracking-tighter drop-shadow-[0_0_20px_rgba(212,168,67,0.3)]">
              Rejoignez NexusHub – <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Créez</span> et Découvrez des Histoires Africaines
            </h1>

            <p className="text-lg md:text-2xl text-stone-300 font-light max-w-3xl mx-auto leading-relaxed italic">
              Devenez artiste Pro/Draft, lisez gratuitement, connectez-vous à une communauté panafricaine. 
              <span className="block font-bold text-primary mt-3 uppercase tracking-[0.1em] text-sm md:text-base">Inscription gratuite et instantanée !</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto pt-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {[
              { icon: Zap, text: "Publiez vos BD/webtoons en un clic" },
              { icon: Sparkles, text: "Accédez à des univers mythologiques" },
              { icon: Users, text: "Soutenez des créateurs gabonais" },
              { icon: Award, text: "AfriCoins et chapitres premium" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl group hover:border-primary/50 hover:bg-white/[0.08] transition-all duration-500 shadow-2xl">
                <div className="bg-primary/20 p-2.5 rounded-xl group-hover:bg-primary/40 group-hover:scale-110 transition-all duration-500">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm md:base font-bold text-stone-200 tracking-tight text-left leading-tight">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-16 flex flex-col items-center gap-4 animate-in fade-in duration-1000 delay-700">
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-primary/60">Commencez ci-dessous</p>
            <ChevronDown className="h-8 w-8 text-primary animate-bounce" />
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="relative flex flex-col items-center justify-center py-24 px-6 bg-stone-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Inscription</CardTitle>
              <CardDescription>
                Créez un compte pour commencer à explorer.
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Prénom Nom" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="m@example.com" {...field} />
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
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
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
                        <FormLabel>Je suis un...</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="reader" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Lecteur
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="artist" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Artiste
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex flex-col">
                  <Button type="submit" className="w-full">Créer un compte</Button>
                  <div className="mt-4 text-center text-sm">
                    Vous avez déjà un compte?{" "}
                    <Link href="/login" className="underline">
                      Se connecter
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
        
        <p className="mt-12 text-[9px] text-stone-600 uppercase font-bold tracking-[0.2em] text-center max-w-xs leading-relaxed">
          En vous inscrivant, vous rejoignez le premier hub créatif panafricain.
        </p>
      </section>
    </div>
  );
}
