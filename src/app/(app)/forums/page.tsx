
'use client';

import { useState, useEffect } from 'react';
import { forumThreads, artists } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, PlusCircle, Crown, ShieldAlert, Lock, ArrowRight, Eye, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function ForumsPage() {
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  useEffect(() => {
    // Simuler la vérification du statut premium
    const status = localStorage.getItem('accountType') === 'artist'; // Pour démo, les artistes sont premium
    setIsPremiumUser(status);
  }, []);

  const publicThreads = forumThreads.filter(t => !t.isPremium);
  const premiumThreads = forumThreads.filter(t => t.isPremium);

  const ThreadTable = ({ threads, isLocked = false }: { threads: typeof forumThreads, isLocked?: boolean }) => (
    <div className="relative">
      {isLocked && !isPremiumUser && (
        <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-8 rounded-xl border-2 border-dashed border-primary/20">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold font-display mb-2">Accès Réservé aux Abonnés</h3>
          <p className="text-muted-foreground max-w-md mb-6 leading-relaxed">
            Plongez dans les spéculations les plus folles et les analyses détaillées avec la communauté Pro. Spoilers autorisés !
          </p>
          <Button asChild className="rounded-full px-8 shadow-xl shadow-primary/20">
            <Link href="/settings?tab=africoins">Devenir Membre Premium</Link>
          </Button>
        </div>
      )}
      
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50%] uppercase text-[10px] font-bold tracking-widest">Sujet</TableHead>
            <TableHead className="text-center uppercase text-[10px] font-bold tracking-widest">Réponses</TableHead>
            <TableHead className="text-center uppercase text-[10px] font-bold tracking-widest">Vues</TableHead>
            <TableHead className="uppercase text-[10px] font-bold tracking-widest">Dernier Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {threads.map((thread) => {
            const authorIsArtist = artists.find(a => a.name === thread.author);
            const lastPostAuthorIsArtist = artists.find(a => a.name === thread.lastPost.author);
            
            return (
              <TableRow key={thread.id} className="group transition-colors">
                <TableCell className="py-4">
                  <div className="flex flex-col gap-1">
                    <Link 
                      href={isLocked && !isPremiumUser ? "#" : `/forums/${thread.id}`} 
                      className={cn(
                        "font-bold text-base transition-colors flex items-center gap-2",
                        isLocked && !isPremiumUser ? "text-muted-foreground/50 cursor-not-allowed" : "hover:text-primary"
                      )}
                    >
                      {thread.title}
                      {thread.isPremium && <Crown className="h-3.5 w-3.5 text-primary fill-primary" />}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>par</span>
                      {authorIsArtist ? (
                        <Link href={`/artists/${authorIsArtist.id}`} className="font-bold hover:text-primary transition-colors">{thread.author}</Link>
                      ) : (
                        <span className="font-bold">{thread.author}</span>
                      )}
                      {authorIsArtist ? (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] h-4">Artiste</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] h-4">Lecteur</Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">{thread.replies}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">{thread.views}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold truncate max-w-[100px]">{thread.lastPost.author}</span>
                      {lastPostAuthorIsArtist && <Crown className="h-2.5 w-2.5 text-primary" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{thread.lastPost.time}</p>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-display">Forums Communautaires</h1>
              <p className="text-lg text-muted-foreground mt-1">
                L'espace d'échange pour tous les passionnés du 9ème art africain.
              </p>
            </div>
          </div>
        </div>
        <Button className="shadow-lg shadow-primary/20 rounded-full px-6">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouveau Sujet
        </Button>
      </div>

      <Tabs defaultValue="public" className="w-full space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/30 p-2 rounded-2xl border border-border/50">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-2 h-12 bg-transparent">
            <TabsTrigger value="public" className="rounded-xl font-bold data-[state=active]:bg-background data-[state=active]:shadow-md">
              Forum Public
            </TabsTrigger>
            <TabsTrigger value="premium" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <Crown className="h-4 w-4" /> Forum Premium
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-3 px-4">
            <Badge variant="outline" className="gap-1.5 border-primary/20 text-primary font-bold">
              <ShieldAlert className="h-3 w-3" />
              Politique Anti-Spoiler active
            </Badge>
          </div>
        </div>

        <TabsContent value="public" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Card className="border-none shadow-2xl bg-card/50 overflow-hidden">
            <div className="h-1.5 w-full bg-primary/20" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Discussions Générales</CardTitle>
              <CardDescription>Partagez vos coups de cœur et échangez sans spoilers majeurs.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ThreadTable threads={publicThreads} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="premium" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Card className="border-primary/20 shadow-2xl bg-stone-950/40 overflow-hidden relative">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                Espace Pro & Spéculations
                <Badge className="bg-primary text-black border-none text-[10px] uppercase font-black">Spoliers OK</Badge>
              </CardTitle>
              <CardDescription>Discussions avancées, théories et spoilers autorisés pour les abonnés.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ThreadTable threads={premiumThreads} isLocked={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <section className="mt-20 grid md:grid-cols-2 gap-8">
        <Card className="bg-primary/5 border-primary/10 p-8 rounded-[2rem] group hover:border-primary/30 transition-all">
          <h3 className="text-2xl font-bold font-display mb-4">Guide du Parfait Lecteur</h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Respectez les auteurs et les autres lecteurs. Utilisez les balises spoiler dans le forum public pour ne pas gâcher le plaisir des autres.
          </p>
          <Button variant="link" className="p-0 h-auto font-bold text-primary group-hover:gap-2 transition-all">
            Lire le règlement <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Card>
        
        <Card className="bg-emerald-500/5 border-emerald-500/10 p-8 rounded-[2rem] group hover:border-emerald-500/30 transition-all">
          <h3 className="text-2xl font-bold font-display mb-4">Espace Créateurs</h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Artistes Draft et Pro, retrouvez des tutoriels exclusifs et des conseils de world building dans la section dédiée.
          </p>
          <Button variant="link" className="p-0 h-auto font-bold text-emerald-500 group-hover:gap-2 transition-all">
            Accéder à l'Atelier <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Card>
      </section>
    </div>
  );
}
