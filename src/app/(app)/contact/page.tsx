'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Twitter, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
        <div className="text-center mb-12">
            <h1 className="text-5xl font-bold font-display mb-4">Contactez-nous</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Une question, une suggestion ou un problème ? Nous sommes là pour vous aider.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare />
                        Envoyer un message
                    </CardTitle>
                    <CardDescription>
                        Remplissez le formulaire et notre équipe vous répondra dans les plus brefs délais.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Votre nom</Label>
                        <Input id="name" placeholder="Prénom Nom" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Votre email</Label>
                        <Input id="email" type="email" placeholder="email@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Votre message</Label>
                        <Textarea id="message" placeholder="Écrivez votre message ici..." className="min-h-[150px]" />
                    </div>
                    <Button className="w-full">Envoyer</Button>
                </CardContent>
            </Card>

            <div className="space-y-8">
                 <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2">
                            <Mail />
                            Par email
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Pour les demandes générales et le support :</p>
                        <a href="mailto:contact@nexushub.com" className="text-lg text-primary font-semibold hover:underline">
                            contact@nexushub.com
                        </a>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                         <CardTitle>Suivez-nous</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="text-muted-foreground mb-4">Restez connectés avec nous sur les réseaux sociaux.</p>
                       <div className="flex gap-4">
                          <Button asChild variant="outline" size="icon">
                            <Link href="#"><Twitter className="h-5 w-5" /></Link>
                          </Button>
                          <Button asChild variant="outline" size="icon">
                            <Link href="#"><Instagram className="h-5 w-5" /></Link>
                          </Button>
                          <Button asChild variant="outline" size="icon">
                            <Link href="#"><Facebook className="h-5 w-5" /></Link>
                          </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
