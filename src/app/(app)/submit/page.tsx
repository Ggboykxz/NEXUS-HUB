'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Globe, ChevronRight, CheckCircle2, UploadCloud, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth, functions } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SubmitPage() {
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    format: 'Webtoon' as any,
    description: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async () => {
    if (!isAuthenticated) {
      openAuthModal('lancer votre premier projet');
      return;
    }
    
    setIsCreating(true);
    try {
      const submitStoryFn = httpsCallable(functions, 'submitStory');
      const result = await submitStoryFn(formData);
      const { id } = result.data as { id: string };

      toast({
        title: "Œuvre créée avec succès !",
        description: "Validation serveur réussie. Bienvenue dans votre nouvel univers.",
      });
      
      router.push(`/dashboard/creations/${id}`);
    } catch (error: any) {
      toast({
        title: "Erreur lors de la création",
        description: error.message || "Une erreur est survenue côté serveur.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
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
          Prêt à partager votre vision avec le monde ? Votre œuvre sera validée par nos services avant publication.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
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
            <CardDescription>Les données saisies sont validées côté serveur pour votre sécurité.</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 min-h-[400px]">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'œuvre</Label>
                  <Input 
                    id="title" 
                    placeholder="Ex: Les Guerriers du Kasaï" 
                    className="h-12 text-lg" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre Principal</Label>
                    <Select onValueChange={(val) => setFormData({...formData, genre: val})}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Sélectionner un genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mythologie">Mythologie</SelectItem>
                        <SelectItem value="Afrofuturisme">Afrofuturisme</SelectItem>
                        <SelectItem value="Histoire">Histoire</SelectItem>
                        <SelectItem value="Fantaisie">Fantaisie</SelectItem>
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="synopsis">Synopsis (Min. 10 caractères)</Label>
                  <Textarea 
                    id="synopsis" 
                    placeholder="Décrivez votre univers..." 
                    className="min-h-[150px] text-base" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <Label>Format de Lecture</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Webtoon', 'BD', 'Roman Illustré'].map((f) => (
                      <div key={f} className="relative group">
                        <input 
                          type="radio" 
                          name="format" 
                          id={f} 
                          className="peer sr-only" 
                          checked={formData.format === f}
                          onChange={() => setFormData({...formData, format: f})}
                        />
                        <label htmlFor={f} className="flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/5">
                          <span className="font-bold text-sm">{f}</span>
                        </label>
                      </div>
                    ))}
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
                  <h3 className="text-xl font-bold">Prêt pour la validation serveur</h3>
                  <p className="text-sm text-muted-foreground">
                    En cliquant sur "Lancer le projet", notre service Cloud Function validera vos données et initialisera votre espace de création.
                  </p>
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
                disabled={isCreating || !formData.title || !formData.genre}
                className="px-12 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
              >
                {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Validation...</> : "Lancer le projet"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
