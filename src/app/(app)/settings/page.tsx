'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, CircleDollarSign, Coins, ShieldAlert, Zap, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [accountType, setAccountType] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const type = localStorage.getItem('accountType');
    setAccountType(type);
  }, []);

  const handleCryptoPayment = () => {
    toast({
        title: "Initialisation Binance Afrique",
        description: "Redirection vers la passerelle Bitcoin/CFA sécurisée...",
    });
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Settings className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-bold font-display">Paramètres du Compte</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="africoins">AfriCoins</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          {accountType === 'artist' ? (
            <Card>
              <CardHeader>
                <CardTitle>Profil d'Artiste</CardTitle>
                <CardDescription>
                  Gérez votre identité artistique et vos liens sociaux.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 border-2 border-primary">
                    <AvatarImage src="" alt="Avatar d'artiste" />
                    <AvatarFallback>ART</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="avatar-url">URL de l'avatar</Label>
                    <Input id="avatar-url" placeholder="https://..." />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nom d'artiste</Label>
                  <Input id="name" placeholder="Votre nom ou pseudonyme" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie (Multilingue acceptée)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Parlez de votre univers..."
                    className="min-h-[120px]"
                  />
                </div>

                <Button className="w-full sm:w-auto">Enregistrer les modifications</Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Profil Lecteur</CardTitle>
                <CardDescription>Gérez vos informations publiques.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="" alt="Avatar de lecteur" />
                    <AvatarFallback>VOUS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="reader-avatar-url">URL de l'avatar</Label>
                    <Input id="reader-avatar-url" placeholder="https://..." />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reader-name">Votre nom</Label>
                  <Input id="reader-name" placeholder="Votre nom" />
                </div>

                <Button className="w-full sm:w-auto">Enregistrer les modifications</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="africoins" className="mt-6 space-y-6">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                    <Coins className="text-primary h-6 w-6" /> Portefeuille AfriCoins
                </CardTitle>
                <CardDescription>Convertissez votre talent en valeur réelle.</CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg py-1 px-4">150 🪙</Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <Alert className="bg-orange-500/10 border-orange-500/20 text-orange-500">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Sécurité Anti-Abus</AlertTitle>
                <AlertDescription>
                  Un cooldown de 15 minutes est appliqué après chaque achat massif pour protéger l'économie de la plateforme.
                </AlertDescription>
              </Alert>

              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="p-6 text-center border-2 hover:border-primary/50 transition-all cursor-pointer">
                    <p className="text-3xl font-bold mb-2">100 🪙</p>
                    <p className="text-sm text-muted-foreground mb-4">1,99€ ou ~1,300 CFA</p>
                    <Button variant="outline" className="w-full">Choisir</Button>
                </Card>
                <Card className="p-6 text-center border-2 border-primary relative overflow-hidden">
                    <Badge className="absolute top-2 right-2 bg-primary">Populaire</Badge>
                    <p className="text-3xl font-bold mb-2">550 🪙</p>
                    <p className="text-sm text-muted-foreground mb-4">9,99€ ou ~6,500 CFA</p>
                    <Button className="w-full">Choisir</Button>
                </Card>
                <Card className="p-6 text-center border-2 hover:border-primary/50 transition-all cursor-pointer">
                    <p className="text-3xl font-bold mb-2">1200 🪙</p>
                    <p className="text-sm text-muted-foreground mb-4">19,99€ ou ~13,000 CFA</p>
                    <Button variant="outline" className="w-full">Choisir</Button>
                </Card>
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                    <Zap className="h-5 w-5 text-yellow-500" /> Options de Paiement Tech
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleCryptoPayment} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-14">
                        <Globe className="mr-2 h-5 w-5" /> Payer via Binance Afrique (BTC/CFA)
                    </Button>
                    <Button variant="outline" className="flex-1 border-primary text-primary font-bold h-14">
                        Carte Bancaire / Mobile Money
                    </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-4 text-center uppercase tracking-widest">
                    Propulsé par NexusHub Fintech &bull; Transactions sécurisées par Blockchain
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Restez informé de l'activité de vos artistes favoris.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-xl">
                        <Label htmlFor="notif-1">Nouveaux chapitres</Label>
                        <Switch id="notif-1" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-xl">
                        <Label htmlFor="notif-2">Messages de la communauté</Label>
                        <Switch id="notif-2" />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Sécurité du compte</CardTitle>
                    <CardDescription>Protégez vos AfriCoins et vos données.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="old-pass">Mot de passe actuel</Label>
                        <Input id="old-pass" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-pass">Nouveau mot de passe</Label>
                        <Input id="new-pass" type="password" />
                    </div>
                    <Button>Mettre à jour</Button>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
