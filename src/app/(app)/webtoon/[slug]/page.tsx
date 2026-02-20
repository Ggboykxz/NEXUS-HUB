'use client';

import { use, useEffect, useState, useMemo } from 'react';
import { stories, artists, getChapterUrl, comments as allComments } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, Share2, Play, BookOpen, Clock, Eye, Star, Award, 
  ChevronRight, Map, Info, MessageSquare, Flame, ShieldCheck, 
  Flag, Lock, Sparkles, LayoutGrid, ScrollText, Timer
} from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function StoryDetailPage({ params: propsParams }: { params: Promise<{ slug: string }> }) {
  const params = use(propsParams);
  const story = stories.find(s => s.slug === params.slug);
  const { toast } = useToast();
  
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
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
  }, []);

  if (!story) {
    notFound();
  }

  const artist = artists.find(a => a.id === story.artistId);
  const chapterComments = allComments.filter(c => c.storyId === story.id);
  const similarStories = stories.filter(s => s.genre === story.genre && s.id !== story.id).slice(0, 4);

  const formatStat = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
    return num.toString();
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Retiré des favoris" : "Ajouté aux favoris !",
      description: isLiked ? `"${story.title}" n'est plus dans votre bibliothèque.` : `Retrouvez "${story.title}" dans votre bibliothèque.`,
    });
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
                data-ai-hint={story.coverImage.imageHint}
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
                    <AvatarImage src={artist?.avatar.imageUrl} />
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">{story.artistName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-bold text-sm leading-none group-hover:text-primary transition-colors">{story.artistName}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">Créateur</span>
                      {artist?.isMentor && <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[7px] h-3.5 px-1.5">Pro</Badge>}
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
                  <Link href={getChapterUrl(story, story.chapters[0]?.slug || '')}>
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
                  {tab === 'chapters' && `Épisodes (${story.chapters.length})`}
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
                    <p>
                      Dans cette épopée visuelle, chaque planche est une célébration de l'héritage culturel panafricain. Entre trahisons divines et technologies mystiques, découvrez le voyage de protagonistes inoubliables au cœur du Gabon futuriste et bien au-delà.
                    </p>
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
                  <p className="text-xs text-muted-foreground mt-4 text-center italic">
                    "Inspiré par l'esthétique de Black Panther et le mysticisme des films de Mati Diop."
                  </p>
                </section>
              </TabsContent>

              <TabsContent value="chapters" className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-display font-black flex items-center gap-3">
                    <Play className="text-primary h-8 w-8" /> Liste des Épisodes
                  </h2>
                  <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest">Ordre Croissant</Button>
                    <Button variant="secondary" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest">Récent</Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {story.chapters.map((chapter, index) => {
                    const isNew = index === 0;
                    const isLocked = !story.isPremium && index > 5; // Simulation de lock
                    
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
                                <span className="text-xs font-black text-primary uppercase tracking-widest">Épisode {story.chapters.length - index}</span>
                                {isNew && <Badge className="bg-primary text-black text-[8px] h-4 font-black">NOUVEAU</Badge>}
                              </div>
                              <h3 className="text-xl font-bold font-display truncate group-hover:text-primary transition-colors">{chapter.title}</h3>
                              <p className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(chapter.releaseDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                <span className="flex items-center gap-1"><Info className="h-3 w-3" /> 22 pages</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              <Badge variant="outline" className="border-primary/20 text-primary font-bold text-[10px]">GRATUIT</Badge>
                              <Button className="rounded-full h-10 w-10 p-0 gold-shimmer shadow-lg">
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
                <section>
                  <h2 className="text-3xl font-display font-black mb-8 flex items-center gap-3 text-primary">
                    <Map className="h-8 w-8" /> Explorations de l'Univers
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <Card className="bg-stone-900 border-primary/20 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                      <CardHeader>
                        <div className="bg-primary/10 p-3 rounded-2xl w-fit mb-4"><LayoutGrid className="text-primary h-6 w-6" /></div>
                        <CardTitle className="text-white">Fiches Personnages</CardTitle>
                        <CardDescription>Découvrez les secrets de vos héros préférés.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          {[1, 2, 3].map(i => (
                            <Avatar key={i} className="h-12 w-12 border-2 border-primary/20 hover:border-primary transition-all cursor-pointer">
                              <AvatarFallback className="bg-primary/5 text-primary text-xs">CH{i}</AvatarFallback>
                            </Avatar>
                          ))}
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full border-2 border-dashed border-white/10 text-white/40"><ChevronRight /></Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-stone-900 border-primary/20 shadow-2xl relative overflow-hidden group">
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                      <CardHeader>
                        <div className="bg-primary/10 p-3 rounded-2xl w-fit mb-4"><Map className="text-primary h-6 w-6" /></div>
                        <CardTitle className="text-white">Cartographie</CardTitle>
                        <CardDescription>Visualisez les cités du futur africain.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 grayscale hover:grayscale-0 transition-all cursor-zoom-in">
                          <Image src={story.coverImage.imageUrl} alt="Map" fill className="object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Badge className="bg-primary text-black font-black">EXPLORER LA CARTE</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <Separator className="opacity-50" />

                <section className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4"><Sparkles className="h-12 w-12 text-primary opacity-20" /></div>
                  <h3 className="text-2xl font-display font-black mb-4 flex items-center gap-2">
                    <Info className="h-6 w-6 text-primary" /> Notes de l'Auteur
                  </h3>
                  <p className="text-foreground/80 leading-relaxed italic font-light">
                    "Ce projet est né d'une volonté de montrer un futur où les traditions Fang ne sont pas oubliées mais augmentées par la technologie. Le personnage principal tire ses pouvoirs de la synchronisation entre son interface neurale et le rythme du tambour sacré..."
                  </p>
                  <Button variant="link" className="text-primary font-bold p-0 mt-4 h-auto">Lire le Making-of complet →</Button>
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

                {/* Formulaire Commentaire */}
                <Card className="border-2 border-primary/10 bg-primary/[0.02] rounded-[2rem] overflow-hidden">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 border-2 border-primary/20"><AvatarFallback>ME</AvatarFallback></Avatar>
                      <div className="flex-1 space-y-4">
                        <textarea 
                          placeholder="Partagez vos impressions... Soyez bienveillants !"
                          className="w-full min-h-[120px] bg-background border-none rounded-2xl p-6 text-lg font-light focus:ring-2 focus:ring-primary transition-all resize-none shadow-inner"
                        />
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-full border border-border/50">
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Pas de spoilers majeurs ici !</span>
                          </div>
                          <Button className="rounded-full px-10 h-12 font-black shadow-xl shadow-primary/20 gold-shimmer">
                            Poster mon Avis
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Liste Commentaires */}
                <div className="space-y-8">
                  {chapterComments.map((comment) => (
                    <div key={comment.id} className="group animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 border-2 border-border group-hover:border-primary/50 transition-all shadow-md">
                          <AvatarImage src={comment.authorAvatar.imageUrl} />
                          <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm hover:text-primary transition-colors cursor-pointer">{comment.authorName}</span>
                              <Badge variant="outline" className="text-[8px] uppercase font-black tracking-widest px-1.5 h-4 border-primary/30 text-primary">
                                {comment.authorBadge || 'LECTEUR'}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{comment.timestamp}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></Button>
                          </div>
                          
                          <div className="text-sm text-foreground/80 leading-relaxed font-light bg-muted/30 p-4 rounded-2xl rounded-tl-none border border-border/50">
                            {comment.tag === 'Théorie' ? (
                              <details className="cursor-pointer group/spoiler">
                                <summary className="font-black text-primary list-none flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                  <Flame className="h-3 w-3" /> SPOILER MASQUÉ : Cliquez pour révéler
                                </summary>
                                <p className="mt-3 pt-3 border-t border-primary/10 transition-all">{comment.content}</p>
                              </details>
                            ) : (
                              <p>{comment.content}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-4 pl-2">
                            <button className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground hover:text-primary transition-all">
                              <ThumbsUp className="h-3.5 w-3.5" /> {comment.likes}
                            </button>
                            <button className="text-[10px] font-black text-muted-foreground hover:text-primary transition-all">RÉPONDRE</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] uppercase font-black text-stone-500 tracking-[0.2em] mb-1">Âge</p>
                    <p className="text-xs font-bold text-white">12+</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] uppercase font-black text-stone-500 tracking-[0.2em] mb-1">Note Global</p>
                    <p className="text-xs font-bold text-white">4.92 / 5</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="text-[10px] uppercase font-black text-primary tracking-[0.3em]">Soutenir l'Équipe</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8"><AvatarImage src={artist?.avatar.imageUrl} /></Avatar>
                        <span className="text-[11px] font-bold text-white">{story.artistName}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black text-primary hover:bg-primary/10">DONNER 🪙</Button>
                    </div>
                    {story.collaborators?.map(collab => (
                      <div key={collab.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8"><AvatarImage src={collab.avatar.imageUrl} /></Avatar>
                          <div>
                            <p className="text-[11px] font-bold text-white">{collab.name}</p>
                            <p className="text-[8px] uppercase font-black text-stone-500">{collab.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/[0.03] rounded-[2rem] p-6 text-center space-y-6">
              <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto"><Flame className="h-8 w-8 text-primary" /></div>
              <div>
                <h3 className="text-lg font-display font-black text-foreground">Abonnez-vous au Forum</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed mt-2">
                  Rejoignez 12k fans passionnés et discutez des théories les plus folles sur le Forum Premium !
                </p>
              </div>
              <Button asChild variant="outline" className="w-full rounded-full border-primary/30 text-primary font-black shadow-lg">
                <Link href="/forums">Ouvrir le Forum lié</Link>
              </Button>
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
          <Button asChild variant="ghost" className="font-black text-primary uppercase tracking-widest text-xs gap-2 group">
            <Link href="/stories">Tout Voir <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {similarStories.map((s) => (
            <Link key={s.id} href={getChapterUrl(s, s.chapters[0]?.slug || '')} className="group">
              <Card className="border-none bg-transparent shadow-none overflow-hidden transition-all">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4 border-2 border-transparent group-hover:border-primary/50 transition-all shadow-xl group-hover:-translate-y-2">
                  <Image src={s.coverImage.imageUrl} alt={s.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <Badge className="bg-primary text-black font-black w-full text-center">LIRE GRATUIT</Badge>
                  </div>
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
