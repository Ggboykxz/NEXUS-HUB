'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, Coins, Zap, Globe, Loader2, 
  ShieldCheck, Smartphone, CreditCard, Bitcoin, Check,
  UserCircle, Eye, History, Users, Crown, Star,
  Banknote, Landmark, Wallet, ArrowUpRight, ChevronRight,
  AlertCircle, ShieldAlert, LogOut, Trash2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, getIdToken } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/lib/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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

  // Fetch Payouts History (Artist only)
  const { data: payouts = [], isLoading: loadingPayouts } = useQuery({
    queryKey: ['payouts-history', profile?.uid],
    enabled: !!profile?.uid && profile.role?.startsWith('artist'),
    queryFn: async () => {
      const q = query(
        collection(db, 'users', profile!.uid, 'payouts'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    }
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;

    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        displayName: profile.displayName,
        bio: profile.bio,
        photoURL: profile.photoURL,
        preferences: profile.preferences,
        paymentMethod: (profile as any).paymentMethod || {},
        payoutThreshold: (profile as any).payoutThreshold || 20
      });
      toast({ title: "Paramètres enregistrés !", description: "Vos préférences ont été mises à jour." });
    } catch (error) {
      toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
    }
  };

  const handleRevokeAllSessions = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsRevoking(true);
    try {
      // 1. Forcer le rafraîchissement du token pour prouver l'activité récente
      const token = await getIdToken(user, true);

      // 2. Appeler l'API de révocation
      const response = await fetch('/api/auth/revoke', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Échec de la révocation serveur');

      // 3. Déconnexion locale
      await signOut(auth);
      
      toast({ 
        title: "Sécurité activée", 
        description: "Tous vos appareils ont été déconnectés avec succès." 
      });

      router.push('/');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({ 
        title: "Erreur de sécurité", 
        description: "Impossible de déconnecter les autres appareils pour le moment.",
        variant: "destructive"
      });
    } finally {
      setIsRevoking(false);
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

  const isArtist = profile.role?.startsWith('artist');

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
            <p className="text-stone-500 font-light italic">Identité numérique et économie du Hub.</p>
          </div>
        </div>
        <Button onClick={handleUpdateProfile} className="rounded-full px-10 h-12 font-black shadow-xl shadow-primary/20 bg-primary text-black gold-shimmer">
          Enregistrer les modifications
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className={cn(
          "grid w-full bg-muted/50 p-1 rounded-2xl h-auto mb-10 border border-border/50",
          isArtist ? "grid-cols-4" : "grid-cols-3"
        )}>
          <TabsTrigger value="profile" className="rounded-xl py-3 font-bold text-xs uppercase">Profil</TabsTrigger>
          <TabsTrigger value="africoins" className="rounded-xl py-3 font-bold text-xs uppercase">AfriCoins</TabsTrigger>
          {isArtist && <TabsTrigger value="revenues" className="rounded-xl py-3 font-bold text-xs uppercase gap-2"><Banknote className="h-3.5 w-3.5" /> Revenus</TabsTrigger>}
          <TabsTrigger value="privacy" className="rounded-xl py-3 font-bold text-xs uppercase">Sécurité</TabsTrigger>
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

        {isArtist && (
          <TabsContent value="revenues" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-none bg-stone-900 text-white shadow-2xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl font-display font-black text-primary">Mode de Paiement</CardTitle>
                  <CardDescription className="text-stone-400">Configurez la réception de vos gains.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500">Type de Compte</Label>
                      <Select 
                        value={(profile as any).paymentMethod?.type || 'momo'} 
                        onValueChange={(val) => setProfile({
                          ...profile, 
                          paymentMethod: { ...(profile as any).paymentMethod, type: val } 
                        } as any)}
                      >
                        <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-stone-900 border-white/10">
                          <SelectItem value="momo">Mobile Money (Afrique)</SelectItem>
                          <SelectItem value="iban">Virement Bancaire (IBAN)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(profile as any).paymentMethod?.type === 'iban' ? (
                      <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500">IBAN du compte</Label>
                        <Input 
                          placeholder="FR76 3000..." 
                          value={(profile as any).paymentMethod?.iban || ''}
                          onChange={(e) => setProfile({
                            ...profile, 
                            paymentMethod: { ...(profile as any).paymentMethod, iban: e.target.value } 
                          } as any)}
                          className="h-12 bg-white/5 border-white/10 rounded-xl"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500">Opérateur</Label>
                          <Select 
                            value={(profile as any).paymentMethod?.provider || 'Airtel'} 
                            onValueChange={(val) => setProfile({
                              ...profile, 
                              paymentMethod: { ...(profile as any).paymentMethod, provider: val } 
                            } as any)}
                          >
                            <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-stone-900 border-white/10">
                              <SelectItem value="Airtel">Airtel Money</SelectItem>
                              <SelectItem value="Orange">Orange Money</SelectItem>
                              <SelectItem value="Moov">Moov Money</SelectItem>
                              <SelectItem value="Wave">Wave</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500">Numéro de téléphone</Label>
                          <Input 
                            placeholder="+241 07..." 
                            value={(profile as any).paymentMethod?.phone || ''}
                            onChange={(e) => setProfile({
                              ...profile, 
                              paymentMethod: { ...(profile as any).paymentMethod, phone: e.target.value } 
                            } as any)}
                            className="h-12 bg-white/5 border-white/10 rounded-xl"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 pt-4">
                      <div className="flex justify-between items-center mb-1">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500">Seuil de virement automatique</Label>
                        <Badge variant="outline" className="text-primary border-primary/20 text-[10px]">Min. 20€</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <Input 
                          type="number" 
                          value={(profile as any).payoutThreshold || 20}
                          onChange={(e) => setProfile({ ...profile, payoutThreshold: parseInt(e.target.value) || 20 } as any)}
                          className="h-12 bg-white/5 border-white/10 rounded-xl text-lg font-black"
                        />
                        <span className="text-xl font-black text-white">€</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none bg-stone-950 text-white shadow-2xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center gap-3 text-emerald-500 mb-2">
                    <ShieldCheck className="h-6 w-6" />
                    <CardTitle className="text-xl font-display font-black">Sécurité des Gains</CardTitle>
                  </div>
                  <CardDescription className="text-stone-400 italic">
                    "Vos revenus sont protégés par le Nexus Core. Les virements sont effectués automatiquement chaque mois dès que le seuil est atteint."
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Solde Actuel</span>
                      <span className="text-2xl font-black text-primary">{profile.afriCoins} 🪙</span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '45%' }} />
                    </div>
                    <p className="text-[9px] text-stone-500 text-center uppercase font-bold">45% avant le prochain virement</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-white/5 bg-card shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 border-b border-white/5">
                <CardTitle className="text-2xl font-display font-black flex items-center gap-3">
                  <History className="h-6 w-6 text-primary" /> Historique des Virements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent border-white/5">
                        <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest">Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Méthode</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Montant</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Statut</TableHead>
                        <TableHead className="px-8"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingPayouts ? (
                        [1, 2].map(i => (
                          <TableRow key={i} className="animate-pulse border-white/5">
                            <TableCell colSpan={5} className="px-8 py-6"><div className="h-4 bg-muted rounded w-full" /></TableCell>
                          </TableRow>
                        ))
                      ) : payouts.length > 0 ? payouts.map((p: any) => (
                        <TableRow key={p.id} className="border-white/5 group hover:bg-muted/20 transition-colors">
                          <TableCell className="px-8 font-medium text-xs">
                            {p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : 'En attente'}
                          </TableCell>
                          <TableCell className="text-xs uppercase font-bold text-stone-500">
                            {p.method}
                          </TableCell>
                          <TableCell className="font-black text-sm text-emerald-500">
                            {p.amount}€
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(
                              "text-[8px] uppercase font-black border-none",
                              p.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                            )}>
                              {p.status === 'completed' ? 'Viré' : 'En cours'}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-8 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-500 group-hover:text-primary"><ChevronRight className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="py-20 text-center text-stone-500 italic text-sm">
                            "Aucun virement n'a encore été effectué pour le moment."
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none bg-stone-900 text-white shadow-2xl rounded-[2.5rem] overflow-hidden">
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

            <Card className="border-none bg-stone-900 text-white shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-rose-950/20 p-8 border-b border-rose-500/10">
                <div className="flex items-center gap-3 text-rose-500">
                  <ShieldAlert className="h-6 w-6" />
                  <CardTitle className="text-2xl font-display font-black">Sécurité du Compte</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                    <p className="text-xs text-rose-200/70 italic leading-relaxed">
                      "Une activité suspecte ? Déconnectez instantanément tous les appareils reliés à votre compte NexusHub."
                    </p>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    onClick={handleRevokeAllSessions}
                    disabled={isRevoking}
                    className="w-full h-12 rounded-xl font-black gap-2 shadow-xl shadow-destructive/20"
                  >
                    {isRevoking ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                    Déconnecter tous les appareils
                  </Button>
                </div>

                <Separator className="bg-white/5" />

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-stone-500 tracking-widest">Zone de Danger</p>
                  <Button 
                    variant="ghost" 
                    className="w-full h-12 rounded-xl text-stone-500 hover:text-rose-500 hover:bg-rose-500/10 font-bold gap-2 transition-all"
                  >
                    <Trash2 className="h-4 w-4" /> Supprimer mon compte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
