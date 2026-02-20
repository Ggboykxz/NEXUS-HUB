'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, PenSquare, ArrowRight, UploadCloud, BookOpen, Users, Globe, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuthModal } from '@/components/providers/auth-modal-provider';

export default function SubmitPage() {
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();

  const handleCreate = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      openAuthModal('lancer votre premier projet');
      return;
    }
    
    setIsCreating(true);
    setTimeout(() => {
      setIsCreating(false);
      toast({
        title: "Œuvre créée avec succès !",
        description: "Bienvenue dans votre nouvel univers. Redirection vers l'Atelier...",
      });
      // Simulate redirection
    }, 2000);
  };

  const steps = [
    { id: 1, label: "Informations" },
    { id: 2, label: "Format & Équipe" },
    { id: 3, label: "Finalisation" },
  ];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">Lancer un Nouveau Projet</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Prêt à partager votre vision avec le monde ? Remplissez les détails ci-dessous pour commencer votre aventure sur NexusHub.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 -z-10" />
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                step === s.id ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" : 
                step > s.id ? "bg-emerald-500 border-emerald-500 text-white" : "bg-card border-muted text-muted-foreground"
              )}>
                {step > s.id ? <CheckCircle2 className="h-6 w-6" /> : s.id}
              </div>
              <span className={cn("text-xs font-bold uppercase tracking-wider", step === s.id ? "text-primary" : "text-muted-foreground")}>{s.label}</span>
            </div>
          ))}
        </div>

        <Card className="shadow-2xl border-primary/10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              {step === 1 && <BookOpen className="text-primary" />}
              {step === 2 && <Users className="text-primary" />}
              {step === 3 && <Globe className="text-primary" />}
              {steps[step - 1].label}
            </CardTitle>
            <CardDescription>Remplissez les détails essentiels de votre œuvre.</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 min-h-[400px]">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'œuvre</Label>
                  <Input id="title" placeholder="Ex: Les Guerriers du Kasaï" className="h-12 text-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre Principal</Label>
                    <Select>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Sélectionner un genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mythology">Mythologie</SelectItem>
                        <SelectItem value="scifi">Afrofuturisme</SelectItem>
                        <SelectItem value="history">Histoire</SelectItem>
                        <SelectItem value="fantasy">Fantaisie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut de Publication</Label>
                    <Select defaultValue="ongoing">
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ongoing">En cours</SelectItem>
                        <SelectItem value="completed">Terminé</SelectItem>
                        <SelectItem value="teaser">Teaser / À venir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="synopsis">Synopsis (Multilingue recommandé)</Label>
                  <Textarea id="synopsis" placeholder="Décrivez votre univers en quelques lignes..." className="min-h-[150px] text-base leading-relaxed" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <Label>Format de Lecture</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Webtoon', 'BD', 'One-shot', 'Roman'].map((f) => (
                      <div key={f} className="relative group">
                        <input type="radio" name="format" id={f} className="peer sr-only" />
                        <label htmlFor={f} className="flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/5">
                          <span className="font-bold text-sm">{f}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <Label>Équipe Créative (Optionnel)</Label>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Input placeholder="Email du collaborateur" className="flex-1" />
                      <Select>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scenarist">Scénariste</SelectItem>
                          <SelectItem value="colorist">Coloriste</SelectItem>
                          <SelectItem value="illustrator">Illustrateur</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={() => handleCreate()} variant="outline">Ajouter</Button>
                    </div>
                    <p className="text-xs text-muted-foreground italic">Les collaborateurs recevront une invitation par email pour rejoindre le projet.</p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-center py-8">
                <div className="mx-auto w-32 h-48 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                  <UploadCloud className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-primary">Couverture</span>
                </div>
                <div className="max-w-md mx-auto space-y-4">
                  <h3 className="text-xl font-bold">Presque terminé !</h3>
                  <p className="text-sm text-muted-foreground">
                    En publiant votre œuvre, vous acceptez les conditions d'utilisation de NexusHub. Votre œuvre sera d'abord publiée dans l'espace <strong>NexusHub Draft</strong>.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="secondary">Inclusion Multilingue</Badge>
                    <Badge variant="secondary">Protection Droits d'Auteur</Badge>
                    <Badge variant="secondary">Communauté Panafricaine</Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
            <Button 
              variant="ghost" 
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Précédent
            </Button>
            
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} className="px-8 gap-2">
                Suivant <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleCreate} 
                disabled={isCreating}
                className="px-12 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
              >
                {isCreating ? "Création en cours..." : "Lancer le projet"}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Informational Section (Toggleable or below) */}
        <div className="mt-20 pt-12 border-t border-dashed">
           <div className="flex flex-col md:flex-row items-center gap-12 opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex-1 space-y-4">
                <h2 className="text-2xl font-bold font-display">Rappel des Parcours</h2>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-orange-500/50 text-orange-500">Draft</Badge>
                  <p className="text-sm">Espace libre pour tous les créateurs. Bâtissez votre audience sans barrières.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="bg-emerald-500">Pro</Badge>
                  <p className="text-sm">Sur invitation uniquement. Accès à la monétisation premium (AfriCoins) et visibilité accrue.</p>
                </div>
              </div>
              <Button variant="link" asChild className="text-primary font-bold">
                <Link href="/about">En savoir plus sur nos engagements <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}