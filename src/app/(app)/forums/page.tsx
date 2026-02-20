'use client';

import { useState, useEffect, useMemo } from 'react';
import { forumThreads, artists, stories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  MessageSquare, 
  PlusCircle, 
  Crown, 
  ShieldAlert, 
  Lock, 
  ArrowRight, 
  Eye, 
  MessageCircle, 
  Search, 
  Flame, 
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuthModal } from '@/components/providers/auth-modal-provider';

export default function ForumsPage() {
  const { openAuthModal } = useAuthModal();
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('public');
  const [particles, setParticles] = useState<{id: number, top: string, left: string, dur: string, del: string, tx: string, ty: string}[]>([]);

  useEffect(() => {
    // Generate particles for the gold hero
    const newParticles = [...Array(10)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      dur: `${5 + Math.random() * 5}s`,
      del: `${Math.random() * 5}s`,
      tx: `${Math.random() * 60 - 30}px`,
      ty: `${Math.random() * -100}px`
    }));
    setParticles(newParticles);

    // Simulate login status
    const status = localStorage.getItem('accountType') === 'artist';
    setIsPremiumUser(status);
  }, []);

  const handleCreateTopic = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      openAuthModal('créer une nouvelle discussion');
      return;
    }
    // Simulation: redirect to create topic page
  };

  const filteredThreads = useMemo(() => {
    let threads = forumThreads.filter(t => activeTab === 'premium' ? t.isPremium : !t.isPremium);
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      threads = threads.filter(t => t.title.toLowerCase().includes(lower) || t.author.toLowerCase().includes(lower));
    }
    return threads;
  }, [activeTab, searchQuery]);

  return (
    <div className="flex flex-col bg-background min-h-screen">
      {/* 1. HERO / EN-TÊTE DU FORUM */}
      <section className="relative py-20 px-6 overflow-hidden border-b border-primary/10">
        <div className="absolute inset-0 bg-stone-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
          
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <div 
                key={p.id} 
                className="particle bg-primary/30" 
                style={{
                  top: p.top,
                  left: p.left,
                  '--dur': p.dur,
                  '--del': p.del,
                  '--tx': p.tx,
                  '--ty': p.ty
                } as any} 
              />
            ))}
          </div>
        </div>

        <div className="container relative z-10 max-w-5xl mx-auto text-center space-y-6">
          <div className="space-y-4 animate-in fade-in slide-in-from-top-10 duration-1000">
            <h1 className="text-4xl md:text-6xl font-display font-black leading-tight text-white gold-resplendant drop-shadow-[0_0_20px_rgba(212,168,67,0.4)]">
              Forum NexusHub – Partagez Vos Passions Panafricaines
            </h1>
            <p className="text-lg md:text-xl text-stone-300 font-light max-w-3xl mx-auto leading-relaxed italic">
              Discutez des histoires, théories et inspirations africaines. Respectez les règles : bienveillance, pas de harcèlement, et spoilers encadrés.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4 animate-in fade-in duration-1000 delay-300">
            {[
              { icon: ShieldAlert, text: "Forum Public : Débats sans spoilers", color: "text-primary" },
              { icon: Crown, text: "Forum Premium : Spéculations avancées", color: "text-amber-500" },
              { icon: CheckCircle2, text: "IA de modération active", color: "text-emerald-500" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full">
                <item.icon className={cn("h-4 w-4", item.color)} />
                <span className="text-xs font-bold text-stone-200 tracking-tight">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 pt-8">
            <Button 
              onClick={() => setActiveTab('public')}
              variant={activeTab === 'public' ? 'default' : 'outline'}
              className={cn(
                "rounded-full px-8 h-12 font-bold transition-all",
                activeTab === 'public' ? "bg-primary text-black shadow-[0_0_20px_rgba(212,168,67,0.4)]" : "border-white/20 text-white"
              )}
            >
              Forum Public
            </Button>
            <Button 
              onClick={() => setActiveTab('premium')}
              variant={activeTab === 'premium' ? 'default' : 'outline'}
              className={cn(
                "rounded-full px-8 h-12 font-bold transition-all group",
                activeTab === 'premium' ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]" : "border-white/20 text-white"
              )}
            >
              {!isPremiumUser && <Lock className="mr-2 h-4 w-4 text-amber-500 group-hover:animate-bounce" />}
              Forum Premium
            </Button>
          </div>
        </div>
      </section>

      {/* 2. BARRE DE NAVIGATION / FILTRES (STICKY) */}
      <div className="sticky top-14 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur-md py-3 shadow-sm">
        <div className="container max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher une discussion..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-full bg-muted/50 border-none"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full gap-2">
                  <Filter className="h-4 w-4" /> <span className="hidden sm:inline">Filtrer</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>Plus Récent</DropdownMenuItem>
                <DropdownMenuItem>Plus Populaire</DropdownMenuItem>
                <DropdownMenuItem>Par Œuvre (Orisha)</DropdownMenuItem>
                <DropdownMenuItem>Par Œuvre (Néo-Dakar)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button onClick={handleCreateTopic} className="w-full md:w-auto h-10 px-6 rounded-full font-bold shadow-lg shadow-primary/20 gold-shimmer">
            <PlusCircle className="mr-2 h-4 w-4" />
            Créer un Nouveau Sujet
          </Button>
        </div>
      </div>

      {/* 3. LISTE DES THREADS */}
      <main className="container max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border/50 pb-6">
            <div>
              <h2 className="text-3xl font-bold font-display flex items-center gap-3">
                {activeTab === 'public' ? (
                  <>Forum Public – Débats Ouverts à Tous</>
                ) : (
                  <span className="flex items-center gap-3 text-amber-500">
                    <Crown className="h-8 w-8" /> Forum Premium – Pour Abonnés Passionnés
                  </span>
                )}
              </h2>
              <p className="text-muted-foreground mt-2 max-w-2xl italic font-light">
                {activeTab === 'public' 
                  ? "Discussions générales sur les œuvres, inspirations ciné/world building, sans spoilers. Balises obligatoires pour contenu sensible."
                  : "Spéculations profondes, théories wild, spoilers autorisés. Accès exclusif aux abonnés – soutenez vos artistes !"}
              </p>
            </div>
            {activeTab === 'public' && (
              <Badge variant="outline" className="gap-1.5 border-primary/20 text-primary font-bold">
                <ShieldAlert className="h-3 w-3" /> Anti-Spoiler Actif
              </Badge>
            )}
          </div>

          <div className="relative">
            {activeTab === 'premium' && !isPremiumUser && (
              <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-md flex flex-col items-center justify-center text-center p-12 rounded-3xl border-2 border-dashed border-amber-500/20">
                <div className="bg-amber-500/10 p-6 rounded-full mb-6">
                  <Lock className="h-12 w-12 text-amber-500" />
                </div>
                <h3 className="text-3xl font-bold font-display mb-4">Espace de Spéculation Réservé</h3>
                <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
                  Découvrez des discussions exclusives sur le futur de vos séries préférées. Spoilers autorisés ! Rejoignez la communauté Pro pour débloquer cet espace.
                </p>
                <Button onClick={() => openAuthModal('accéder au Forum Premium')} size="lg" className="rounded-full px-12 bg-amber-500 hover:bg-amber-600 text-black font-black shadow-xl shadow-amber-500/20">
                  S'abonner pour 2,99€/mois
                </Button>
              </div>
            )}

            <div className="space-y-4">
              {filteredThreads.map((thread) => {
                const authorInfo = artists.find(a => a.name === thread.author);
                const isHot = thread.replies > 30;
                
                return (
                  <Link key={thread.id} href={`/forums/${thread.id}`} className="block group">
                    <Card className={cn(
                      "transition-all duration-300 hover:shadow-2xl hover:border-primary/30 bg-card/50",
                      thread.isPremium ? "border-amber-500/20 shadow-amber-500/5" : "border-border/50"
                    )}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                          <div className="hidden md:flex flex-col items-center gap-1 w-16 text-center">
                            <Avatar className="h-12 w-12 border-2 border-background shadow-md ring-2 ring-primary/20 group-hover:ring-primary transition-all">
                              <AvatarImage src={authorInfo?.avatar.imageUrl} />
                              <AvatarFallback>{thread.author.slice(0,2)}</AvatarFallback>
                            </Avatar>
                            <span className="text-[8px] uppercase font-black tracking-widest text-primary mt-1">
                              {authorInfo?.isMentor ? 'PRO' : 'LECTEUR'}
                            </span>
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              {isHot && (
                                <Badge className="bg-orange-600 text-white border-none gap-1 px-2 py-0.5 text-[9px] uppercase font-black animate-pulse">
                                  <Flame className="h-3 w-3" /> HOT
                                </Badge>
                              )}
                              <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-bold uppercase tracking-widest px-2">
                                {thread.category}
                              </Badge>
                              {thread.isPremium && (
                                <Badge className="bg-amber-500 text-black border-none gap-1 px-2 py-0.5 text-[9px] uppercase font-black">
                                  <Crown className="h-3 w-3 fill-current" /> Premium
                                </Badge>
                              )}
                            </div>

                            <h3 className="text-xl font-bold font-display group-hover:text-primary transition-colors leading-tight">
                              {thread.title}
                            </h3>
                            
                            <p className="text-sm text-muted-foreground line-clamp-1 font-light italic">
                              "J'ai remarqué une chose étrange dans le dernier chapitre de Orisha, est-ce que quelqu'un d'autre a vu..."
                            </p>

                            <div className="flex items-center gap-4 pt-2">
                              <div className="md:hidden flex items-center gap-2">
                                <Avatar className="h-6 w-6 border">
                                  <AvatarImage src={authorInfo?.avatar.imageUrl} />
                                  <AvatarFallback>{thread.author.slice(0,1)}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-bold">{thread.author}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span>{thread.replies} réponses</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                <Eye className="h-3.5 w-3.5" />
                                <span>{thread.views} vues</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold ml-auto">
                                Dernier post par {thread.lastPost.author} &bull; {thread.lastPost.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}

              {filteredThreads.length === 0 && (
                <div className="text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground italic">Aucune discussion ne correspond à votre recherche.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 4. SECTION RÈGLES ET MODÉRATION */}
      <section className="container max-w-7xl mx-auto px-6 py-20 border-t border-border/50">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-display">Règles du Forum – Pour un Espace Sain</h2>
            <div className="space-y-4">
              {[
                "Respect mutuel et bienveillance envers tous les membres.",
                "Pas d'insultes, de discrimination ou de propos haineux.",
                "Utilisation obligatoire des balises spoiler (<details>).",
                "Interdiction de spam, de piratage ou de publicités non sollicitées.",
                "Contenus sensibles encadrés par des avertissements clairs."
              ].map((rule, i) => (
                <div key={i} className="flex gap-3">
                  <div className="bg-primary/10 p-1 rounded-full h-fit mt-1">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>
            <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl flex items-center gap-4">
              <Sparkles className="h-8 w-8 text-primary shrink-0" />
              <p className="text-xs font-medium text-foreground/80 leading-relaxed">
                Notre intelligence artificielle analyse les messages en temps réel pour détecter les spoilers non signalés et les contenus inappropriés.
              </p>
            </div>
          </div>

          <Card className="p-8 border-none bg-stone-900 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-0" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="bg-white/10 p-4 rounded-full">
                <AlertTriangle className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Besoin de signaler un problème ?</h3>
                <p className="text-stone-400 text-sm leading-relaxed">
                  Si vous rencontrez un comportement inapproprié ou un spoiler non marqué, prévenez nos modérateurs immédiatement.
                </p>
              </div>
              <Button onClick={() => openAuthModal('signaler un problème')} variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-black font-bold px-8 h-12 transition-all">
                Signaler un Message <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}