'use client';

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

const formSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  password: z.string().nonempty({ message: "Le mot de passe est requis." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('accountType', 'reader');
    localStorage.setItem('userId', 'reader-1');
    window.dispatchEvent(new Event('loginStateChange'));

    toast({
      title: "Connexion réussie !",
      description: "Bienvenue à nouveau !",
    });

    router.push('/');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-950">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.05),transparent_70%)]" />
      </div>
      
      <div className="relative z-10 w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-3xl tracking-tight text-white inline-block mb-2">
            NexusHub<span className="text-primary">.</span>
          </Link>
          <p className="text-stone-400 text-sm italic">Heureux de vous revoir parmi nous.</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Connexion</CardTitle>
            <CardDescription>
              Entrez votre email ci-dessous pour vous connecter à votre compte.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="grid gap-4">
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
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button type="submit" className="w-full">Se connecter</Button>
                <div className="mt-4 text-center text-sm">
                  Vous n'avez pas de compte?{" "}
                  <Link href="/signup" className="underline text-primary hover:text-primary/80 transition-colors">
                    S'inscrire
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
