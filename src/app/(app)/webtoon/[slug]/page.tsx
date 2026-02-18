'use client';

import { useState, use, useEffect } from 'react';
import { stories, artists, comments as allComments, type Story, type Artist, type Chapter, getChapterUrl, getStoryUrl } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Eye, Heart, Star, Share2, Bookmark, Play, MessageSquare, ChevronRight, Check, Coins, Lock, Award, PenSquare, Sparkles, Zap, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { StoryCard } from '@/components/story-card';
import { differenceInDays } from 'date-fns';

const formatStat = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
  return num.toString();
};

function HeroSection({ story, artist, collaborators }: { story: Story, artist: Artist, collaborators: any[] }) {
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({ title: isBookmarked ? 'Retiré de votre bibliothèque' : 'Ajouté à votre bibliothèque !' });
  };
  
  const handleShare = () => {
    if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: "Lien copié dans le presse-papiers" });
    }
  };

  const firstChapterUrl = story.chapters.length > 0 ? getChapterUrl(story, story.chapters[0].slug) : '#';
  const isNew = differenceInDays(new Date(), new Date(story.updatedAt)) < 7;
  const isTrending = story.likes > 50000;

  return (
    <section className="hero relative overflow-hidden bg-background py-12 md:py-24">
        <div className="hero-bg" />
        <div className="hero-pattern" />
        <div className="hero-deco" />

        <div className="container max-w-7xl mx-auto px-6 lg:px-12 relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-12 items-center">
                <div className="hero-content-wrapper fade-in-up">
                    <div className="hero-eyebrow flex flex-wrap items-center gap-2 mb-6">
                        <Badge variant="outline" className="border-primary/50 text-primary font-bold uppercase tracking-wider">{story.format}</Badge>
                        <Badge variant="secondary" className={cn("bg-stone-800/50 backdrop-blur-sm border-white/10", story.status === 'Terminé' && "bg-blue-500/20 text-blue-400 border-blue-500/30")}>
                            <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", story.status === 'Terminé' ? "bg-blue-400" : "bg-emerald-400")}></span> {story.status}
                        </Badge>
                        {isNew && (
                          <Badge className="bg-cyan-500 text-white border-none shadow-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                            <Sparkles className="h-3 w-3 mr-1" /> Nouveau
                          </Badge>
                        )}
                        {isTrending && (
                          <Badge className="bg-rose-500 text-white border-none shadow-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                            <Zap className="h-3 w-3 mr-1" /> Tendance
                          </Badge>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4 leading-tight drop-shadow-sm">{story.title}</h1>
                    <p className="text-xl text-primary font-medium mb-8 italic opacity-90">
                        {story.genre} — Un récit épique par {artist.name}
                    </p>

                    <div className="flex flex-wrap gap-4 mb-8">
                        <Link href={`/artiste/${artist.slug}`} className="flex items-center gap-3 bg-card/40 backdrop-blur-md border border-border/50 p-1.5 pr-5 rounded-full transition-all hover:border-primary/50 hover:bg-card/60">
                            <Avatar className="h-9 w-9 border-2 border-primary/20">
                                <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} />
                                <AvatarFallback>{artist.name.slice(0,1)}</AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                                <div className="text-xs font-bold leading-tight">{artist.name}</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Auteur Principal</div>
                            </div>
                        </Link>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                        {story.tags.map(tag => (
                            <Link key={tag} href="#" className="px-4 py-1.5 bg-primary/5 border border-primary/20 rounded-full text-xs font-bold text-primary transition-all hover:bg-primary hover:text-white uppercase tracking-wider">
                                #{tag}
                            </Link>
                        ))}
                    </div>
                    
                    <p className="text-lg text-foreground/80 leading-relaxed mb-12 max-w-2xl line-clamp-4">
                        {story.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-10 mb-12">
                        <div className="flex flex-col">
                            <span className="text-3xl font-display font-bold text-primary">{formatStat(story.views)}</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mt-1">Lectures</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-display font-bold text-primary">{formatStat(story.likes)}</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mt-1">Favoris</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-display font-bold text-primary">{story.chapters.length}</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mt-1">Chapitres</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {story.chapters.length > 0 ? (
                            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 rounded-full h-14 text-base font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
                                <Link href={firstChapterUrl} className="flex items-center gap-3">
                                    <Play className="h-5 w-5 fill-current"/> Commencer la lecture
                                </Link>
                            </Button>
                        ) : (
                            <Button disabled size="lg" className="bg-muted text-muted-foreground px-10 rounded-full h-14 text-base font-bold">
                                <CalendarDays className="h-5 w-5 mr-2" /> Bientôt disponible
                            </Button>
                        )}
                        <Button variant="outline" size="lg" className="rounded-full h-14 w-14 border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:bg-primary/10 hover:border-primary/50" onClick={handleBookmark} title="Sauvegarder">
                            <Bookmark className={cn("h-6 w-6", isBookmarked && "fill-primary text-primary")} />
                        </Button>
                        <Button variant="outline" size="lg" className="rounded-full h-14 w-14 border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:bg-primary/10 hover:border-primary/50" onClick={handleShare} title="Partager">
                            <Share2 className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                <div className="hero-visual-side hidden lg:block fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] border-2 border-white/10 group">
                        <Image 
                            src={story.coverImage.imageUrl} 
                            alt={story.title} 
                            fill 
                            className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                            data-ai-hint={story.coverImage.imageHint} 
                            priority 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                        <div className="absolute top-6 left-6 z-30">
                          {artist?.isMentor ? (
                            <Badge className="bg-emerald-500 text-white border-none px-4 py-1.5 text-xs font-bold uppercase tracking-widest shadow-xl flex items-center gap-2">
                                <Award className="h-4 w-4" /> NexusHub Pro
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-500 text-white border-none px-4 py-1.5 text-xs font-bold uppercase tracking-widest shadow-xl flex items-center gap-2">
                                <PenSquare className="h-4 w-4" /> NexusHub Draft
                            </Badge>
                          )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}

const ChapterRow = ({ chapter, story }: { chapter: Chapter, story: Story }) => {
    const isNew = chapter.status === 'Programmé';
    const isPremium = chapter.id.includes('premium');
    const isRead = chapter.status === 'Publié';
    const readingUrl = getChapterUrl(story, chapter.slug);

    return (
        <Link href={readingUrl} className={cn("chapter-row flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-primary/20 hover:bg-card/50 transition-all group", isNew && "opacity-60")}>
            <div className="ch-num w-10 h-10 flex items-center justify-center bg-muted rounded-lg font-display text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {isPremium ? <Lock className="h-4 w-4"/> : chapter.id.split('-')[1]}
            </div>
            <div className="ch-info flex-1">
                <div className="ch-title font-semibold group-hover:text-primary transition-colors">{chapter.title}</div>
                <div className="ch-meta text-xs text-muted-foreground flex items-center gap-2">
                    <span>{chapter.releaseDate}</span>
                    <span>•</span>
                    <span>{chapter.pageCount} pages</span>
                </div>
            </div>
            <div className="ch-right flex items-center gap-3">
                {isNew && <Badge variant="secondary" className="text-[10px]">Nouveau</Badge>}
                {isPremium && <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">Premium</Badge>}
                {isRead && !isPremium && !isNew && <Badge variant="outline" className="text-[10px]">Déjà lu</Badge>}
            </div>
        </Link>
    )
}

const RightSidebar = ({ story, artist }: { story: Story, artist: Artist }) => {
    const { toast } = useToast();
    const [isFollowing, setIsFollowing] = useState(false);
    
    const handleFollow = () => {
        setIsFollowing(!isFollowing);
        toast({ title: isFollowing ? `Vous ne suivez plus ${artist.name}` : `Vous suivez maintenant ${artist.name}` });
    };

    return (
        <aside className="right-col space-y-8">
            <Card className="artist-hero-card overflow-hidden border-border/50 shadow-xl rounded-2xl group">
                <div className="artist-card-banner h-24 bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 transition-all duration-500" />
                <CardContent className="artist-card-body px-6 pb-8 text-center -mt-12 relative z-10">
                    <Avatar className="h-24 w-24 mx-auto border-4 border-background ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all duration-500">
                        <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} />
                        <AvatarFallback>{artist.name.slice(0,1)}</AvatarFallback>
                        <div className="artist-verified-badge absolute bottom-0 right-0 bg-emerald-500 text-white rounded-full p-1 border-2 border-background"><Check size={12} /></div>
                    </Avatar>
                    <p className="artist-name mt-4 font-display font-bold text-xl group-hover:text-primary transition-colors">{artist.name}</p>
                    <p className="artist-role text-xs text-primary font-bold uppercase tracking-widest mb-6">Artiste Certifié</p>
                    
                    <div className="artist-stats-row grid grid-cols-3 gap-2 py-4 border-y border-border/50 mb-6">
                         <div className="art-stat flex flex-col"><span className="v text-lg font-bold">{formatStat(artist.subscribers)}</span><span className="l text-[9px] uppercase text-muted-foreground tracking-tighter">Fans</span></div>
                         <div className="art-stat flex flex-col"><span className="v text-lg font-bold">{(story.views/1000).toFixed(0)}k</span><span className="l text-[9px] uppercase text-muted-foreground tracking-tighter">Vues</span></div>
                         <div className="art-stat flex flex-col"><span className="v text-lg font-bold">{artist.portfolio.length}</span><span className="l text-[9px] uppercase text-muted-foreground tracking-tighter">Séries</span></div>
                    </div>
                    
                    <div className="artist-btns flex gap-2">
                        <Button className={cn("flex-1 rounded-full font-bold", isFollowing ? "bg-muted text-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90")} onClick={handleFollow}>
                            {isFollowing ? '✓ Abonné' : '+ Suivre'}
                        </Button>
                        <Button variant="outline" className="rounded-full w-12" onClick={() => toast({title: `Favoris mis à jour`})}>
                            <Heart className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="afri-widget p-6 bg-primary/5 border-primary/20 rounded-2xl">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="afri-title text-sm flex items-center gap-2 font-display text-primary">
                        <Coins className="h-5 w-5" /> SOUTENIR L'ARTISTE
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6">Envoyez des AfriCoins directement à {artist.name} pour encourager la création du prochain chapitre.</p>
                    <div className="coin-row grid grid-cols-2 gap-2 mb-4">
                        {[50, 100, 500, 1000].map(amount => (
                            <Button key={amount} variant="outline" className="coin-opt h-10 border-primary/20 text-xs font-bold hover:bg-primary hover:text-white" onClick={() => toast({title: `${amount} AfriCoins envoyés !`})}>{amount} 🪙</Button>
                        ))}
                    </div>
                    <Button className="w-full bg-primary text-primary-foreground rounded-full font-bold h-12 shadow-lg shadow-primary/20">Envoyer des AfriCoins</Button>
                </CardContent>
            </Card>
        </aside>
    )
}

export default function WebtoonDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = use(props.params);
  const story = stories.find((s) => s.slug === slug);

  if (!story) {
    notFound();
  }
  
  const artist = artists.find((a) => a.id === story.artistId);
  if(!artist) {
    notFound();
  }
  
  const collaborators = story.collaborators || [];
  const storyComments = allComments.filter(c => c.storyId === story.id);
  
  return (
    <div className="min-h-screen bg-background">
        <HeroSection story={story} artist={artist} collaborators={collaborators}/>
        
        <main className="main-body container max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-12 px-6 lg:px-12 py-16">
            <div className="left-col space-y-16">
                {/* Chapters Section */}
                <section className="fade-in-up">
                    <div className="section-heading flex items-center gap-4 mb-8">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <h2 className="text-xl font-display tracking-widest uppercase">CHAPITRES</h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                        <span className="text-xs font-bold text-muted-foreground">{story.chapters.length} disponibles</span>
                    </div>

                    {story.chapters.length > 0 ? (
                        <div className="chapters-list space-y-2">
                            {story.chapters.map(chapter => (
                                <ChapterRow key={chapter.id} chapter={chapter} story={story} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/30">
                            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                            <h3 className="text-2xl font-display font-bold text-foreground mb-2">À Venir...</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                L'auteur prépare activement le premier chapitre. Abonnez-vous pour recevoir une notification dès la sortie !
                            </p>
                            <Button variant="outline" className="mt-6 rounded-full border-primary text-primary hover:bg-primary/10">
                                Me prévenir de la sortie
                            </Button>
                        </div>
                    )}
                </section>

                {/* Similar Works */}
                <section className="fade-in-up">
                    <div className="section-heading flex items-center gap-4 mb-8">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <h2 className="text-xl font-display tracking-widest uppercase">DANS LE MÊME UNIVERS</h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {stories.filter(s => s.id !== story.id).slice(0, 5).map(s => (
                            <StoryCard key={s.id} story={s} />
                        ))}
                    </div>
                </section>
            </div>

            <RightSidebar story={story} artist={artist} />
        </main>
    </div>
  );
}
