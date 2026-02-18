'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, CircleDollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const [accountType, setAccountType] = useState<string | null>(null);

  useEffect(() => {
    // This logic runs only on the client, after hydration
    const type = localStorage.getItem('accountType');
    setAccountType(type);
  }, []);

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
        
        <TabsContent value="profile">
          {accountType === 'artist' ? (
            <Card>
              <CardHeader>
                <CardTitle>Profil d'Artiste</CardTitle>
                <CardDescription>
                  Ces informations seront affichées sur votre profil public. Soignez votre image !
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    {/* In a real app, this would be dynamic and allow upload */}
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
                  <Input id="name" defaultValue="" placeholder="Votre nom ou pseudonyme" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    placeholder="Parlez-nous de vous, de votre art, de votre parcours..."
                    className="min-h-[120px]"
                  />
                </div>

                <div>
                  <h3 className="text-base font-medium mb-4">Réseaux sociaux et liens</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="personal-site">Site Personnel</Label>
                      <Input id="personal-site" placeholder="https://votresite.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amazon-link">Lien Auteur Amazon</Label>
                      <Input id="amazon-link" placeholder="https://amazon.com/author/..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input id="twitter" placeholder="https://twitter.com/..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input id="instagram" placeholder="https://instagram.com/..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input id="facebook" placeholder="https://facebook.com/..." />
                    </div>
                  </div>
                </div>
                <Button>Enregistrer les modifications</Button>
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
                  <Input id="reader-name" defaultValue="" placeholder="Votre nom" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reader-bio">Biographie</Label>
                  <Textarea
                    id="reader-bio"
                    placeholder="Parlez un peu de vous, de vos lectures préférées..."
                    className="min-h-[120px]"
                  />
                </div>
                <Button>Enregistrer les modifications</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Gérez comment vous recevez les notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="new-chapter" className="text-base">Nouveaux chapitres</Label>
                        <p className="text-sm text-muted-foreground">
                            Recevoir une notification quand un artiste que vous suivez publie un nouveau chapitre.
                        </p>
                    </div>
                    <Switch id="new-chapter" defaultChecked />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="new-work" className="text-base">Nouvelles œuvres</Label>
                        <p className="text-sm text-muted-foreground">
                            Recevoir une notification quand un artiste que vous suivez publie une nouvelle œuvre.
                        </p>
                    </div>
                    <Switch id="new-work" defaultChecked />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="forum-reply" className="text-base">Réponses aux forums</Label>
                        <p className="text-sm text-muted-foreground">
                            Recevoir une notification quand quelqu'un répond à vos sujets ou commentaires.
                        </p>
                    </div>
                    <Switch id="forum-reply" />
                </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
              <CardDescription>
                Changez votre mot de passe et gérez la sécurité de votre compte.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button>Changer le mot de passe</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="africoins">
          <Card>
            <CardHeader>
              <CardTitle>AfriCoins</CardTitle>
              <CardDescription>
                Achetez des AfriCoins pour débloquer des chapitres premium et soutenir vos créateurs préférés.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Votre Solde</Label>
                  <p className="text-2xl font-bold flex items-center gap-2">
                    <CircleDollarSign className="h-6 w-6 text-primary"/> 150
                  </p>
                </div>
                <Button variant="outline">Historique d'achats</Button>
              </div>
              
              <div className="space-y-4 pt-4">
                <h3 className="font-semibold">Recharger vos AfriCoins</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Card className="flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-3xl font-bold flex items-center gap-2">
                      <CircleDollarSign className="h-6 w-6 text-primary"/> 100
                    </p>
                    <Button className="mt-4 w-full">Acheter pour 1,99€</Button>
                  </Card>
                  <Card className="flex flex-col items-center justify-center p-4 text-center border-primary border-2 relative">
                     <Badge className="absolute -top-3">Populaire</Badge>
                     <p className="text-3xl font-bold flex items-center gap-2">
                      <CircleDollarSign className="h-6 w-6 text-primary"/> 550
                    </p>
                    <p className="text-sm text-primary font-semibold">+10% Bonus</p>
                    <Button className="mt-4 w-full">Acheter pour 9,99€</Button>
                  </Card>
                  <Card className="flex flex-col items-center justify-center p-4 text-center">
                     <p className="text-3xl font-bold flex items-center gap-2">
                      <CircleDollarSign className="h-6 w-6 text-primary"/> 1200
                    </p>
                    <p className="text-sm text-primary font-semibold">+20% Bonus</p>
                    <Button className="mt-4 w-full">Acheter pour 19,99€</Button>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}