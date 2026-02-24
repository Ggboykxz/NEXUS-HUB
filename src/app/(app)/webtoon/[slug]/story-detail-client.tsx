'use client';

import { useEffect, useState } from 'react';
import { getChapterUrl, comments as allComments, artists } from '@/lib/data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, Share2, Play, BookOpen, Clock, Eye, Star, Award, 
  ChevronRight, Map, Info, MessageSquare, Flame, ShieldCheck, 
  Flag, Lock, Sparkles, LayoutGrid, ScrollText, Timer, ThumbsUp, MoreHorizontal, Crown
} from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import type { Story, UserProfile } from '@/lib/types';

interface StoryDetailClientProps {
  story: Story;
  artist: UserProfile | null;
  similarStories: Story[];
}

export default function StoryDetailClient({ story, artist, similarStories }: StoryDetailClientProps) {
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [particles, setParticles] = useState<{id: number, top: string, left: string, dur: string, del: string, tx: string, ty: string}[]>([]);

  useEffect(() => {
    // Particules pour le hero
    const newParticles = [...Array(15)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      dur: `${5 + Math.random() * 5}s`,
      del: `${Math.random() * 3}s`,
      tx: `${Math.random() * 40 - 20}px`,
      ty: `${Math.random() * -80}px`
    }));
    setParticles(newParticles);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const chapterComments = allComments.filter(c => c.storyId === story.id);

  const formatStat = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
    return num.toString();
  };

  const handleLike = () => {
    if (!currentUser) {
      openAuthModal('ajouter cette œuvre à votre bibliothèque');
      return;
    }
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Retiré des favoris" : "Ajouté aux favoris !",
      description: isLiked ? `"${story.title}" n'est plus dans votre bibliothèque.` : `Retrouvez "${story.title}" dans votre bibliothèque.`,
    });
  };

  const handleSupport = () => {
    if (!currentUser) {
      openAuthModal('soutenir vos artistes avec des AfriCoins');
      return;
    }
    toast({ title: "Merci pour votre soutien ! (Simulation)" });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 1. HERO IMMERSIF */}
      <section className="relative min-h-[85vh] flex flex-col justify-end overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <Image
            src={story.coverImage.imageUrl}
            alt={story.title}
            fill
            className="object-cover scale-110 blur-[2px]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/40" />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
          
          {/* Animated Particles */}
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

        <div className="container relative z-10 mx-auto max-w-7xl px-6 pb-12 md:pb-20">
          <div className="flex flex-col md:flex-row items-end gap-8 lg:gap-12">
            {/* Massive Cover Art */}
            <div className="relative w-56 md:w-72 lg:w-80 aspect-[2/3] rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/10 group animate-in zoom-in duration-700">
              <Image
                src={story.coverImage.imageUrl}
                alt={story.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-700">
                <Link href={`/genre/${story.genreSlug}`}>
                  <Badge className="bg-primary text-black border-none uppercase tracking-[0.2em] font-black text-[10px] px-4 py-1.5 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    {story.genre}
                  </Badge>
                </Link>
                <Badge variant="secondary" className="bg-white/10 backdrop-blur-md text-white border-white/10 uppercase tracking-widest text-[9px] h-7 px-3">
                  {story.format}
                </Badge>
                {story.isPremium && (
                  <Badge className="bg-amber-500 text-black border-none uppercase tracking-widest font-black text-[9px] h-7 px-3 animate-pulse">
                    <Crown className="h-3.5 w-3.5 mr-1 inline fill-current" /> Premium
                  </Badge>
                )}
                <Badge variant="outline" className={cn(
                  "uppercase tracking-widest text-[9px] h-7 px-3 border-emerald-500/50 text-emerald-500",
                  story.status === 'Terminé' && "border-blue-500/50 text-blue-500"
                )}>
                  {story.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black text-white leading-[0.9] tracking-tighter gold-resplendant drop-shadow-[0_0_20px_rgba(212,168,67,0.4)]">
                  {story.title}
                </h1>
                <p className="text-lg md:text-xl text-stone-200 font-light italic max-w-2xl leading-relaxed animate-in fade-in duration-1000 delay-300">
                  "{story.description.slice(0, 120)}..."
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <Link href={`/artiste/${artist?.slug}`} className="group flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 p-2 pr-6 rounded-full transition-all hover:bg-white/10 hover:border-primary/50">
                  <Avatar className="h-10 w-10 border-2 border-primary/30 ring-2 ring-primary/10">
                    <AvatarImage src={artist?.photoURL} />
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">{story.artistName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-bold text-sm leading-none group-hover:text-primary transition-colors">{story.artistName}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">Créateur</span>
                      {artist?.role === 'artist_pro' && <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[7px] h-3.5 px-1.5">Pro</Badge>}
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-6 text-white/80">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-black font-display tracking-tighter text-primary">4.9</span>
                    <div className="flex gap-0.5"><Star className="h-2.5 w-2.5 fill-primary text-primary" /><Star className="h-2.5 w-2.5 fill-primary text-primary" /><Star className="h-2.5 w-2.5 fill-primary text-primary" /><Star className="h-2.5 w-2.5 fill-primary text-primary" /><Star className="h-2.5 w-2.5 fill-primary text-primary" /></div>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-white">{formatStat(story.views)}</span>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-stone-400">Lectures</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-white">{formatStat(story.likes)}</span>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-stone-400">Likes</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-6">
                <Button asChild size="lg" className="h-14 px-10 rounded-full font-black text-lg shadow-[0_0_30px_rgba(212,168,67,0.3)] gold-shimmer group overflow-hidden">
                  <Link href={getChapterUrl(story, story.chapters?.[0]?.slug || 'chapitre-1')}>
                    <Play className="mr-2 h-5 w-5 fill-current group-hover:scale-110 transition-transform" />
                    Lire le Chapitre 1
                  </Link>
                </Button>
                <Button 
                  onClick={handleLike}
                  variant="outline" 
                  size="lg" 
                  className={cn(
                    "h-14 px-8 rounded-full border-white/20 bg-white/5 backdrop-blur-md text-white font-bold transition-all",
                    isLiked && "bg-primary/10 border-primary text-primary"
                  )}
                >
                  <Heart className={cn("mr-2 h-5 w-5", isLiked && "fill-current")} />
                  {isLiked ? 'Dans vos Favoris' : 'Ajouter aux Favoris'}
                </Button>
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full border border-white/10 text-white hover:bg-white/10">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BARRE DE NAVIGATION / OUTILS STICKY */}
      <div className="sticky top-14 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur-md shadow-sm">
        <div className="container max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent h-14 p-0 gap-8">
              {['summary', 'chapters', 'world', 'comments'].map((tab) => (
                <TabsTrigger 
                  key={tab}
                  value={tab}
                  className="h-14 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-bold text-sm uppercase tracking-widest px-0 transition-all"
                >
                  {tab === 'summary' && 'Résumé'}
                  {tab === 'chapters' && `Épisodes (${story.chapterCount})`}
                  {tab === 'world' && 'World Building'}
                  {tab === 'comments' && `Communauté (${chapterComments.length})`}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="hidden lg:flex items-center gap-3 pl-8 border-l">
            <Button variant="outline" size="sm" className="rounded-full border-primary/20 text-primary font-bold gap-2">
              <Timer className="h-4 w-4" /> Prochaine sortie : Samedi
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 3. CONTENU DES ONGLETS */}
      <main className="container max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="summary" className="space-y-12 animate-in fade-in duration-500">
                <section>
                  <h2 className="text-3xl font-display font-black mb-6 flex items-center gap-3">
                    <ScrollText className="text-primary h-8 w-8" /> Synopsis Complet
                  </h2>
                  <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/80 leading-relaxed font-light space-y-6">
                    <p className="lead text-2xl italic text-primary/80 border-l-4 border-primary pl-6">
                      Imaginez un futur où les divinités ancestrales ne sont plus des mythes, mais des entités numériques régissant une Afrique hyper-connectée.
                    </p>
                    <p>{story.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-8">
                    {story.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-muted hover:bg-primary/10 transition-colors cursor-pointer px-4 py-1">#{tag}</Badge>
                    ))}
                  </div>
                </section>

                <Separator className="opacity-50" />

                <section>
                  <h2 className="text-3xl font-display font-black mb-8 flex items-center gap-3">
                    <Sparkles className="text-primary h-8 w-8" /> Ambiance & Moodboard
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="group relative aspect-[16/9] rounded-2xl overflow-hidden border-2 border-primary/5 hover:border-primary/40 transition-all cursor-pointer shadow-xl">
                        <Image src={story.coverImage.imageUrl} alt={`Concept ${i}`} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="text-white h-8 w-8" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="chapters" className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-display font-black flex items-center gap-3">
                    <Play className="text-primary h-8 w-8" /> Liste des Épisodes
                  </h2>
                </div>

                <div className="space-y-3">
                  {story.chapters?.map((chapter, index) => {
                    const isNew = index === 0;
                    
                    return (
                      <Link key={chapter.id} href={getChapterUrl(story, chapter.slug)}>
                        <Card className="group relative overflow-hidden transition-all hover:shadow-2xl hover:border-primary/30 bg-card/50 border-border/50 mb-3">
                          {isNew && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}
                          <CardContent className="p-4 flex items-center gap-6">
                            <div className="relative h-20 w-32 rounded-xl overflow-hidden shadow-lg border border-white/5">
                              <Image src={story.coverImage.imageUrl} alt={chapter.title} fill className="object-cover transition-transform group-hover:scale-110" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="text-white h-6 w-6 fill-current" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-black text-primary uppercase tracking-widest">Épisode {story.chapterCount - index}</span>
                                {isNew && <Badge className="bg-primary text-black text-[8px] h-4 font-black">NOUVEAU</Badge>}
                              </div>
                              <h3 className="text-xl font-bold font-display truncate group-hover:text-primary transition-colors">{chapter.title}</h3>
                            </div>

                            <div className="flex items-center gap-4">
                              <Badge variant="outline" className="border-primary/20 text-primary font-bold text-[10px]">GRATUIT</Badge>
                              <Button className="rounded-full h-10 w-10 p-0 shadow-lg">
                                <Play className="h-4 w-4 fill-current ml-0.5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="world" className="space-y-12 animate-in fade-in duration-500">
                <section className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4"><Sparkles className="h-12 w-12 text-primary opacity-20" /></div>
                  <h3 className="text-2xl font-display font-black mb-4 flex items-center gap-2">
                    <Info className="h-6 w-6 text-primary" /> Notes de l'Auteur
                  </h3>
                  <p className="text-foreground/80 leading-relaxed italic font-light">
                    "Ce projet est né d'une volonté de montrer un futur où les traditions Fang ne sont pas oubliées mais augmentées par la technologie."
                  </p>
                </section>
              </TabsContent>

              <TabsContent value="comments" className="space-y-12 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-display font-black flex items-center gap-3">
                    <MessageSquare className="text-primary h-8 w-8" /> Communauté du Hub
                  </h2>
                  <Badge variant="outline" className="gap-1.5 border-emerald-500/30 text-emerald-500 font-black text-[10px]">
                    <ShieldCheck className="h-3.5 w-3.5" /> MODÉRATION IA ACTIVE
                  </Badge>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* SIDEBAR DÉTAILS */}
          <aside className="space-y-8">
            <Card className="border-none bg-stone-900 shadow-2xl relative overflow-hidden rounded-[2.5rem] p-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[80px]" />
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-white">
                  <LayoutGrid className="h-5 w-5 text-primary" /> Fiche Technique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] uppercase font-black text-stone-500 tracking-[0.2em] mb-1">Mises à jour</p>
                    <p className="text-xs font-bold text-white">Chaque Samedi</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] uppercase font-black text-stone-500 tracking-[0.2em] mb-1">Format</p>
                    <p className="text-xs font-bold text-white">{story.format}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="text-[10px] uppercase font-black text-primary tracking-[0.3em]">Soutenir l'Équipe</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8"><AvatarImage src={artist?.photoURL} /></Avatar>
                        <span className="text-[11px] font-bold text-white">{story.artistName}</span>
                      </div>
                      <Button onClick={handleSupport} variant="ghost" size="sm" className="h-7 text-[9px] font-black text-primary hover:bg-primary/10">DONNER 🪙</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      {/* 4. SELECTION SUGGESTIONS */}
      <section className="container max-w-7xl mx-auto px-6 py-20 border-t border-border/50">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-display font-black tracking-tighter">
            Vous Aimerez <span className="text-primary underline decoration-primary/30 decoration-8 underline-offset-8 italic">Aussi</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {similarStories.map((s) => (
            <Link key={s.id} href={getChapterUrl(s, s.chapters?.[0]?.slug || 'chapitre-1')} className="group">
              <Card className="border-none bg-transparent shadow-none overflow-hidden transition-all">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4 border-2 border-transparent group-hover:border-primary/50 transition-all shadow-xl group-hover:-translate-y-2">
                  <Image src={s.coverImage.imageUrl} alt={s.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <h3 className="font-display font-black text-lg group-hover:text-primary transition-colors truncate">{s.title}</h3>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Par {s.artistName}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}