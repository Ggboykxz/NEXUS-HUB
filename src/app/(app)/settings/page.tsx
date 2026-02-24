'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, CircleDollarSign, Coins, ShieldAlert, Zap, Globe, Loader2, 
  Award, Star, TrendingUp, Sparkles, Lock, Eye, Users, ShieldCheck,
  Bell, Palette, UserCircle, Smartphone
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
        photoURL: profile.photoURL,
        preferences: profile.preferences
      });
      toast({ title: "Paramètres enregistrés !", description: "Vos préférences ont été mises à jour." });
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

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <Settings className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold font-display tracking-tight">Configuration Nexus</h1>
            <p className="text-stone-500 font-light italic">Gérez votre identité numérique et votre vie privée.</p>
          </div>
        </div>
        <Button onClick={handleUpdateProfile} className="rounded-full px-10 h-12 font-black shadow-xl shadow-primary/20 bg-primary text-black gold-shimmer">
          Enregistrer tout
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-muted/50 p-1 rounded-2xl h-auto mb-10 border border-border/50">
          <TabsTrigger value="profile" className="rounded-xl py-3 font-bold text-xs uppercase">Profil</TabsTrigger>
          <TabsTrigger value="privacy" className="rounded-xl py-3 font-bold text-xs uppercase">Vie Privée</TabsTrigger>
          <TabsTrigger value="africoins" className="rounded-xl py-3 font-bold text-xs uppercase">AfriCoins</TabsTrigger>
          {isArtist && <TabsTrigger value="progression" className="rounded-xl py-3 font-bold text-xs uppercase">Parcours</TabsTrigger>}
          <TabsTrigger value="notifications" className="rounded-xl py-3 font-bold text-xs uppercase">Alertes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-8 animate-in fade-in duration-500">
          <Card className="border-none bg-card shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-stone-950/50 p-8 border-b border-white/5">
              <CardTitle className="text-2xl font-display font-black text-white">Identité Publique</CardTitle>
              <CardDescription className="text-stone-400">Ces informations sont visibles par toute la communauté.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-background ring-4 ring-primary shadow-2xl transition-transform group-hover:scale-105">
                    <AvatarImage src={profile.photoURL || ''} alt="Avatar" />
                    <AvatarFallback className="text-3xl font-black">{profile.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button variant="secondary" size="icon" className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full border-4 border-card shadow-xl"><Smartphone className="h-4 w-4" /></Button>
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">URL de l'image de profil</Label>
                    <Input 
                      value={profile.photoURL || ''} 
                      onChange={(e) => setProfile({...profile, photoURL: e.target.value})}
                      placeholder="https://..." 
                      className="rounded-2xl bg-muted/30 border-none h-12 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Pseudo Public</Label>
                  <Input 
                    value={profile.displayName || ''} 
                    onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                    placeholder="Votre nom" 
                    className="rounded-2xl bg-muted/30 border-none h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Statut Social</Label>
                  <div className="bg-muted/30 h-12 rounded-2xl flex items-center px-4 border border-border/50 text-xs font-bold gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Membre Certifié NexusHub
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Ma Biographie (Le code du voyageur)</Label>
                <Textarea
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  placeholder="Parlez de vos inspirations culturelles..."
                  className="min-h-[150px] rounded-[2rem] bg-muted/30 border-none p-6 text-base italic font-light"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-8 animate-in fade-in duration-500">
          <Card className="border-none bg-card shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-stone-950/50 p-8 border-b border-white/5">
              <CardTitle className="text-2xl font-display font-black text-white flex items-center gap-3">
                <Lock className="h-6 w-6 text-primary" /> Contrôle Social & Vie Privée
              </CardTitle>
              <CardDescription className="text-stone-400">Décidez de ce que les autres lecteurs et artistes peuvent voir.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              {[
                { 
                  key: 'isPublicLibrary', 
                  icon: UserCircle, 
                  title: 'Vitrine Publique', 
                  desc: 'Affiche vos favoris et votre collection sur votre profil.',
                  color: 'text-primary'
                },
                { 
                  key: 'showCurrentReading', 
                  icon: Eye, 
                  title: 'Activité en Direct', 
                  desc: 'Affiche "[Pseudo] lit actuellement [Titre]" à vos abonnés.',
                  color: 'text-emerald-500'
                },
                { 
                  key: 'showReadingHistory', 
                  icon: History, 
                  title: 'Historique Partagé', 
                  desc: 'Permet à l\'IA de suggérer des œuvres similaires basées sur vos amis.',
                  color: 'text-cyan-500'
                },
                { 
                  key: 'allowFollowers', 
                  icon: Users, 
                  title: 'Abonnements Autorisés', 
                  desc: 'Permet aux autres membres de vous suivre.',
                  color: 'text-orange-500'
                }
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between gap-8 group">
                  <div className="flex gap-4 items-start">
                    <div className={cn("p-3 rounded-2xl bg-white/5 mt-1 group-hover:scale-110 transition-transform", pref.color)}>
                      <pref.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black tracking-tight">{pref.title}</h4>
                      <p className="text-stone-500 text-sm italic font-light">{pref.desc}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={(profile.preferences?.privacy as any)?.[pref.key]} 
                    onCheckedChange={(val) => {
                      const newPriv = { ...profile.preferences?.privacy, [pref.key]: val };
                      setProfile({ ...profile, preferences: { ...profile.preferences!, privacy: newPriv as any } });
                    }} 
                  />
                </div>
              ))}
            </CardContent>
            <CardFooter className="bg-primary/5 p-8 border-t border-primary/10">
              <p className="text-xs text-stone-500 italic">"La vie privée est un droit. Vos lectures ne sont partagées que si vous le décidez."</p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="africoins" className="mt-6 space-y-6">
          <Card className="border-none bg-stone-950 text-white shadow-2xl rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-10"><Coins className="h-48 w-48 text-primary" /></div>
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between w-full">
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-display font-black text-primary">Portefeuille Hub</CardTitle>
                  <CardDescription className="text-stone-400">Vos fonds pour soutenir la création panafricaine.</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-black text-white gold-resplendant">{profile.afriCoins || 0} 🪙</p>
                  <p className="text-[10px] uppercase font-black text-emerald-500 tracking-widest mt-1">Solde Actif</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-10">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { amount: 100, price: '1,99€', bonus: '+0%' },
                  { amount: 550, price: '9,99€', bonus: '+10%', hot: true },
                  { amount: 1200, price: '19,99€', bonus: '+20%' },
                ].map(pack => (
                  <Card key={pack.amount} className={cn(
                    "p-6 text-center border-2 transition-all cursor-pointer rounded-3xl",
                    pack.hot ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10 scale-105" : "border-white/5 bg-white/5 hover:border-primary/30"
                  )}>
                    <p className="text-3xl font-black mb-1">{pack.amount} 🪙</p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Bonus: {pack.bonus}</p>
                    <p className="text-xl font-bold mb-6">{pack.price}</p>
                    <Button className={cn("w-full rounded-xl font-black", pack.hot ? "bg-primary text-black" : "bg-white/10")}>Choisir</Button>
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
