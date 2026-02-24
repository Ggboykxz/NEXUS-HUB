'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, CircleDollarSign, Coins, ShieldAlert, Zap, Globe, Loader2, Award, Star, TrendingUp, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { UserProfile } from '@/lib/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;

    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        displayName: profile.displayName,
        bio: profile.bio,
        photoURL: profile.photoURL
      });
      toast({ title: "Profil mis à jour !" });
    } catch (error) {
      toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Accès réservé aux membres</h1>
        <p className="text-muted-foreground mb-8">Veuillez vous connecter pour gérer vos paramètres.</p>
        <Button asChild><Link href="/login">Se connecter</Link></Button>
      </div>
    );
  }

  const isArtist = profile.role?.includes('artist');

  const getLevelLabel = (level: string) => {
    switch(level) {
        case 'emergent': return { icon: Sparkles, label: '🌱 Émergent', share: '15%' };
        case 'draft': return { icon: Star, label: '⭐ Draft', share: '30%' };
        case 'pro': return { icon: Award, label: '🏆 Pro', share: '60%' };
        case 'elite': return { icon: Award, label: '👑 Elite', share: '70%' };
        default: return { icon: Sparkles, label: '🌱 Émergent', share: '15%' };
    }
  }

  const currentLevel = getLevelLabel(profile.level || 'emergent');

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Settings className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-bold font-display">Paramètres du Compte</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-2xl h-12">
          <TabsTrigger value="profile" className="rounded-xl">Profil</TabsTrigger>
          {isArtist && <TabsTrigger value="progression" className="rounded-xl">Parcours</TabsTrigger>}
          <TabsTrigger value="africoins" className="rounded-xl">AfriCoins</TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl">Sécurité</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card className="border-none bg-card shadow-xl rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle>{isArtist ? "Profil d'Artiste" : "Profil Lecteur"}</CardTitle>
              <CardDescription>Gérez votre identité publique sur NexusHub.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className={cn("h-24 w-24", isArtist && "border-2 border-primary")}>
                    <AvatarImage src={profile.photoURL || ''} alt="Avatar" />
                    <AvatarFallback>{profile.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="avatar-url">URL de l'avatar</Label>
                    <Input 
                      id="avatar-url" 
                      value={profile.photoURL || ''} 
                      onChange={(e) => setProfile({...profile, photoURL: e.target.value})}
                      placeholder="https://..." 
                      className="rounded-xl bg-muted/30 border-none h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">{isArtist ? "Nom d'artiste" : "Nom d'affichage"}</Label>
                  <Input 
                    id="name" 
                    value={profile.displayName || ''} 
                    onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                    placeholder="Votre nom" 
                    className="rounded-xl bg-muted/30 border-none h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    placeholder="Parlez de votre univers..."
                    className="min-h-[120px] rounded-xl bg-muted/30 border-none"
                  />
                </div>

                <Button type="submit" className="w-full sm:w-auto h-11 px-8 rounded-xl font-bold">Enregistrer</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {isArtist && (
            <TabsContent value="progression" className="mt-6 space-y-6">
                <Card className="border-none bg-stone-900 text-white shadow-2xl rounded-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingUp className="h-24 w-24" /></div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl font-black font-display text-primary">
                            <currentLevel.icon className="h-8 w-8" /> 
                            Statut : {currentLevel.label}
                        </CardTitle>
                        <CardDescription className="text-stone-400">Votre progression vers le prochain palier de revenus.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Part de Revenus Actuelle</p>
                                <p className="text-4xl font-black text-primary">{currentLevel.share}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-stone-500">Objectif Prochain Niveau</span>
                                    <span className="text-primary">{profile.subscribersCount} abonnés</span>
                                </div>
                                <Progress value={Math.min(100, (profile.subscribersCount / 5000) * 100)} className="h-2 bg-white/5" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-white/5 p-6 flex justify-between items-center">
                        <p className="text-xs text-stone-400 italic">"Gagnez en vues et en abonnés pour augmenter vos revenus."</p>
                        <Button asChild variant="outline" size="sm" className="rounded-xl border-primary/20 text-primary">
                            <Link href="/draft">Détails du Programme</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </TabsContent>
        )}

        <TabsContent value="africoins" className="mt-6 space-y-6">
          <Card className="border-primary/20 bg-card shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2 font-display font-black">
                    <Coins className="text-primary h-6 w-6" /> Portefeuille AfriCoins
                </CardTitle>
                <CardDescription>Gérez votre solde et vos transactions.</CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg py-1 px-4 h-10 rounded-xl bg-primary/10 text-primary border-none font-black">{profile.afriCoins || 0} 🪙</Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { coins: 100, price: '1,99€' },
                  { coins: 550, price: '9,99€', popular: true },
                  { coins: 1200, price: '19,99€' }
                ].map((pack) => (
                  <Card key={pack.coins} className={cn("p-6 text-center border-2 transition-all cursor-pointer rounded-2xl", pack.popular ? "border-primary shadow-lg" : "border-muted hover:border-primary/50")}>
                    {pack.popular && <Badge className="mb-2 bg-primary text-black font-black text-[8px]">Populaire</Badge>}
                    <p className="text-3xl font-black mb-2">{pack.coins} 🪙</p>
                    <p className="text-xs text-muted-foreground mb-4">{pack.price}</p>
                    <Button variant={pack.popular ? "default" : "outline"} className="w-full rounded-xl">Choisir</Button>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
