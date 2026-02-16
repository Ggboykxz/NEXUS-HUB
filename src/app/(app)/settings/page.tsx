'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, CircleDollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Settings className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-bold">Paramètres du Compte</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="africoins">AfriCoins</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil Public</CardTitle>
              <CardDescription>
                Ces informations seront affichées sur votre profil public.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom d'utilisateur</Label>
                <Input id="name" defaultValue="Léa Dubois" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  defaultValue="Passionnée de lecture depuis toujours, je suis à l'affût des nouvelles pépites de la BD africaine."
                />
              </div>
               <Button>Enregistrer les modifications</Button>
            </CardContent>
          </Card>
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
