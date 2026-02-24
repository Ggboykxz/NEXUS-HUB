'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, Coins, Zap, Globe, Loader2, 
  ShieldCheck, Smartphone, CreditCard, Bitcoin, Check,
  UserCircle, Eye, History, Users, Crown, Star
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
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

  const paymentMethods = [
    { id: 'momo', name: 'Mobile Money', icon: Smartphone, countries: 'MTN, Orange, Wave, M-Pesa' },
    { id: 'card', name: 'Carte Bancaire', icon: CreditCard, countries: 'Visa, Mastercard (Flutterwave)' },
    { id: 'crypto', name: 'Cryptomonnaies', icon: Bitcoin, countries: 'USDC / CFA-T' },
  ];

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <Settings className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold font-display tracking-tight">Configuration</h1>
            <p className="text-stone-500 font-light italic">Identité numérique et économie AfriCoins.</p>
          </div>
        </div>
        <Button onClick={handleUpdateProfile} className="rounded-full px-10 h-12 font-black shadow-xl shadow-primary/20 bg-primary text-black gold-shimmer">
          Enregistrer
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-2xl h-auto mb-10 border border-border/50">
          <TabsTrigger value="profile" className="rounded-xl py-3 font-bold text-xs uppercase">Profil</TabsTrigger>
          <TabsTrigger value="africoins" className="rounded-xl py-3 font-bold text-xs uppercase">AfriCoins</TabsTrigger>
          <TabsTrigger value="privacy" className="rounded-xl py-3 font-bold text-xs uppercase">Vie Privée</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-8 animate-in fade-in duration-500">
          <Card className="border-none bg-card shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-stone-950/50 p-8 border-b border-white/5">
              <CardTitle className="text-2xl font-display font-black text-white">Identité Publique</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <Avatar className="h-32 w-32 border-4 border-background ring-4 ring-primary shadow-2xl">
                  <AvatarImage src={profile.photoURL || ''} alt="Avatar" />
                  <AvatarFallback className="text-3xl font-black">{profile.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Pseudo</Label>
                    <Input 
                      value={profile.displayName || ''} 
                      onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                      className="rounded-2xl bg-muted/30 border-none h-12"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Biographie</Label>
                <Textarea
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="min-h-[120px] rounded-[2rem] bg-muted/30 border-none p-6 italic"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="africoins" className="space-y-8 animate-in fade-in duration-500">
          <Card className="border-none bg-stone-950 text-white shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl font-display font-black text-primary">Portefeuille</CardTitle>
                  <CardDescription className="text-stone-400">Rechargez vos AfriCoins.</CardDescription>
                </div>
                <p className="text-5xl font-black text-white">{profile.afriCoins || 0} 🪙</p>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-12">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { coins: 50, label: "Starter", price: "1,00€ / 100 FCFA" },
                  { coins: 100, label: "Standard", price: "1,99€ / 200 FCFA" },
                  { coins: 550, label: "Elite", price: "9,99€ / 1000 FCFA", bonus: "+10%" },
                ].map(pack => (
                  <Card key={pack.coins} className="p-6 text-center border-white/5 bg-white/5 hover:border-primary transition-all cursor-pointer rounded-3xl group">
                    <p className="text-3xl font-black group-hover:text-primary transition-colors">{pack.coins} 🪙</p>
                    <p className="text-[10px] font-black text-primary uppercase mt-1">{pack.label}</p>
                    <p className="text-sm font-bold mt-4 text-stone-400">{pack.price}</p>
                  </Card>
                ))}
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-display font-black text-white">Méthode Adaptative</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={cn(
                        "relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4",
                        selectedMethod === method.id ? "border-emerald-500 bg-emerald-500/10" : "border-white/5 bg-white/5 hover:border-white/20"
                      )}
                    >
                      <method.icon className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="font-bold text-sm">{method.name}</p>
                        <p className="text-[9px] text-stone-500">{method.countries}</p>
                      </div>
                      {selectedMethod === method.id && <Check className="absolute top-2 right-2 h-4 w-4 text-emerald-500" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <Button className="flex-1 h-14 rounded-2xl bg-emerald-500 text-black font-black">
                  Activer le Pass Mensuel (30 🪙)
                </Button>
                <Button className="flex-1 h-14 rounded-2xl bg-primary text-black font-black">
                  Passer au Ticket VIP (50 🪙)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-8 animate-in fade-in duration-500">
          <Card className="border-none bg-card shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-stone-950/50 p-8 border-b border-white/5">
              <CardTitle className="text-2xl font-display font-black text-white">Contrôle Social</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-black">Activité en Direct</Label>
                  <p className="text-xs text-muted-foreground italic">Affiche vos lectures actuelles à vos abonnés.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-black">Historique Partagé</Label>
                  <p className="text-xs text-muted-foreground italic">Permet aux amis de voir ce que vous avez terminé.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
