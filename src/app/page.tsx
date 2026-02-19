'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/story-card';
import { stories, artists, getStoryUrl, getChapterUrl, type Story } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Play, Info, Star, Award, PenSquare, ChevronRight, Zap, Sparkles, BookHeart, TrendingUp, Clock, Compass, Landmark, ScrollText, Buildings, Rocket, Users, Heart, UploadCloud } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/providers/language-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [recommendations, setRecommendations] = useState<Story[]>([]);
  const [recTitle, setRecTitle] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const genres = [
    { id: 'all', label: 'Tout' },
    { id: 'mythologie-africaine', label: 'Mythologie' },
    { id: 'afrofuturisme', label: 'Afrofuturisme' },
    { id: 'contes-revisites', label: 'Contes' },
    { id: 'histoire-africaine', label: 'Histoire' },
    { id: 'science-fiction', label: 'Science-Fiction' },
  ];

  const autoplay = useRef(
    Autoplay({ delay: 6500, stopOnInteraction: true })
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    // Recommandations logic
    const prefs = localStorage.getItem('preferredGenres');
    let list: Story[] = [];
    
    if (prefs) {
      try {
        const preferredGenres = JSON.parse(prefs) as string[];
        list = stories.filter(s => preferredGenres.includes(s.genre));
      } catch (e) {
        console.error("Error parsing preferences", e);
      }
    }

    if (list.length < 3) {
      // Fallback to random/trending
      list = [...stories].sort(() => 0.5 - Math.random()).slice(0, 10);
      setRecTitle(t('home.trending_fallback'));
    } else {
      list = list.slice(0, 10);
      setRecTitle(t('home.for_you_title'));
    }
    setRecommendations(list);
  }, [t]);
  
  const trendingStories = [...stories].sort((a, b) => b.views - a.views).slice(0, 12);
  const newestStories = [...stories].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6);
  const proStories = stories.filter(s => artists.find(a => a.id === s.artistId)?.isMentor).slice(0, 10);
  const draftStories = stories.filter(s => !artists.find(a => a.id === s.artistId)?.isMentor).slice(0, 10);
  const featuredStories = stories.filter(s => ['1', '2', '3'].includes(s.id));
  const topArtists = artists.slice(0, 3); 

  const submissionImage = PlaceHolderImages.find(img => img.id === 'submission-cta');

  const filteredByGenre = useMemo(() => {
    if (selectedGenre === 'all') return stories.slice(0, 10);
    return stories.filter(s => s.genreSlug === selectedGenre).slice(0, 10);
  }, [selectedGenre]);

  const handleSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Merci pour votre soumission !",
      description: "Notre équipe éditoriale examinera votre projet dans les plus brefs délais.",
    });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="flex flex-col gap-12 bg-background">
      <h1 className="sr-only">NexusHub - Moodboard Afro-futuriste & Bandes Dessinées Africaines</h1>
      
      {/* Featured Moodboard Carousel Section with Parallax */}
      <section className="relative w-full pt-4 md:pt-8 overflow-hidden">
        <div className="container max-w-7xl mx-auto px-4 lg:px-8">
            <Carousel
                setApi={setApi}
                opts={{ loop: true }}
                plugins={[autoplay.current]}
                className="w-full"
            >
                <CarouselContent>
                    {featuredStories.map((story, index) => {
                        const storyUrl = getStoryUrl(story);
                        const readingUrl = story.chapters.length > 0 ? getChapterUrl(story, story.chapters[0].slug) : storyUrl;
                        const artist = artists.find(a => a.id === story.artistId);
                        
                        return (
                            <CarouselItem key={story.id}>
                                <div className="relative w-full aspect-[3/4] sm:aspect-[16/10] md:aspect-[21/9] min-h-[650px] md:min-h-[550px] rounded-[2rem] overflow-hidden group shadow-2xl border border-primary/10 bg-stone-950">
                                    
                                    {/* Parallax Background Image */}
                                    <div 
                                      className="absolute inset-0 transition-transform duration-700 ease-out"
                                      style={{ 
                                        transform: `translateY(${scrollY * 0.15}px) scale(${1.05 + scrollY * 0.0001})` 
                                      }}
                                    >
                                      <Image
                                          src={story.coverImage.imageUrl}
                                          alt={story.title}
                                          fill
                                          className="object-cover opacity-40 md:opacity-50"
                                          priority={index === 0}
                                          data-ai-hint={story.coverImage.imageHint}
                                      />
                                    </div>
                                    
                                    {/* Cinematic Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/80 md:via-black/40 to-transparent flex flex-col justify-end items-start p-8 md:p-16 lg:p-20 z-10">
                                        <div className="carousel-content-animate flex flex-col gap-4 md:gap-6 max-w-3xl w-full">
                                            
                                            {/* Badges & Tags */}
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 backdrop-blur-xl px-4 py-1.5 font-bold text-[10px] uppercase tracking-[0.2em] shadow-inner">
                                                    {story.genre}
                                                </Badge>
                                                {index === 0 && (
                                                    <Badge className="bg-cyan-500 text-white border-none px-4 py-1.5 font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg animate-pulse">
                                                        <Sparkles className="h-3 w-3 mr-2" /> Nouveau
                                                    </Badge>
                                                )}
                                                {story.isPremium && (
                                                    <Badge className="bg-amber-500 text-black border-none px-4 py-1.5 font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg">
                                                        <Zap className="h-3 w-3 mr-2 fill-current" /> Premium
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            {/* Titre Impactant Cliquable */}
                                            <Link href={storyUrl} className="group/title inline-block">
                                                <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-black text-white leading-none tracking-tighter drop-shadow-2xl group-hover/title:text-primary transition-colors duration-300">
                                                    {story.title}
                                                </h2>
                                            </Link>
                                            
                                            {/* Synopsis Style Moodboard */}
                                            <div className="relative pl-6 border-l-2 border-primary/40 max-w-2xl">
                                                <p className="text-white/90 text-base md:text-xl font-light leading-relaxed italic line-clamp-3 md:line-clamp-4 drop-shadow-lg">
                                                    "{story.description}"
                                                </p>
                                            </div>

                                            {/* Infos Artiste Cliquables */}
                                            <Link href={`/artiste/${artist?.slug}`} className="flex items-center gap-4 mt-2 group/artist-info w-fit">
                                                <div className="relative">
                                                    <Avatar className="h-12 w-12 border-2 border-primary/40 p-0.5 bg-background group-hover/artist-info:border-primary transition-colors">
                                                        <AvatarImage src={artist?.avatar.imageUrl} alt={story.artistName} />
                                                        <AvatarFallback>{story.artistName?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    {artist?.isMentor && (
                                                        <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-background shadow-lg">
                                                            <Award className="h-3 w-3 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-base tracking-tight group-hover/artist-info:text-primary transition-colors">{story.artistName}</span>
                                                    <span className="text-primary/80 text-[10px] uppercase tracking-widest font-bold">
                                                        {artist?.isMentor ? 'Artiste Certifié Pro' : 'Jeune Talent NexusHub'}
                                                    </span>
                                                </div>
                                            </Link>

                                            {/* Boutons d'Action */}
                                            <div className="flex flex-wrap items-center gap-4 mt-4">
                                                <Button asChild size="lg" className="h-14 md:h-16 px-10 md:px-12 rounded-full font-bold text-base shadow-2xl shadow-primary/30 transition-transform active:scale-95 group/btn">
                                                    <Link href={readingUrl}>
                                                        <Play className="mr-3 h-5 w-5 fill-current group-hover/btn:scale-110 transition-transform" />
                                                        {t('common.read')}
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="outline" size="lg" className="h-14 md:h-16 px-10 md:px-12 rounded-full bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-xl text-base transition-all hover:border-white/40 shadow-xl">
                                                    <Link href={storyUrl}>
                                                        <Info className="mr-3 h-5 w-5" />
                                                        {t('common.details')}
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
            </Carousel>

            {/* Pagination Dots Animés */}
            <div className="flex justify-center items-center gap-3 mt-10">
                {Array.from({ length: count }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => api?.scrollTo(index)}
                        className={cn(
                            "transition-all duration-500 rounded-full",
                            current === index 
                                ? "w-12 h-2.5 bg-primary shadow-lg shadow-primary/20" 
                                : "w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                        )}
                        aria-label={`Aller à l'œuvre ${index + 1}`}
                    />
                ))}
            </div>
        </div>
      </section>

      {/* Sections de contenu */}
      <main className="container max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-24">
        
        {/* Section Recommandations Personnalisées */}
        {recommendations.length > 0 && (
          <section className="animate-in fade-in-up duration-700">
            <div className="flex justify-between items-center mb-10 border-b border-primary/10 pb-6">
              <Link href="/for-you" className="flex items-center gap-4 group/for-you w-fit">
                <div className="bg-primary/10 p-3 rounded-2xl group-hover/for-you:bg-primary/20 transition-colors">
                  <BookHeart className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-bold text-foreground tracking-tight group-hover/for-you:text-primary transition-colors">{recTitle}</h2>
                  <p className="text-sm text-muted-foreground font-light">Une sélection aux petits oignons pour vos yeux.</p>
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <Button asChild variant="outline" className="rounded-full font-bold">
                  <Link href="/for-you">Voir Plus</Link>
                </Button>
              </div>
            </div>
            <div className="flex overflow-x-auto pb-8 gap-6 hide-scrollbar snap-x snap-mandatory">
              {recommendations.map((story) => (
                <div key={`rec-${story.id}`} className="flex-none w-[220px] sm:w-[260px] snap-start">
                  <StoryCard story={story} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section Tendances */}
        <section className="animate-in fade-in-up duration-700 delay-150">
          <div className="flex justify-between items-center mb-10 border-b border-rose-500/10 pb-6">
            <Link href="/rankings" className="flex items-center gap-4 group/title">
              <div className="bg-rose-500/10 p-3 rounded-xl group-hover/title:bg-rose-500/20 transition-colors">
                <TrendingUp className="h-8 w-8 text-rose-500" />
              </div>
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground tracking-tight group-hover/title:text-rose-500 transition-colors">Tendances – Les Plus Lus Actuellement</h2>
                <p className="text-sm text-muted-foreground font-light">Les œuvres qui font vibrer la communauté cette semaine.</p>
              </div>
            </Link>
            <Link href="/rankings" className="text-sm font-bold text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-1 group">
              Voir Toutes les Tendances <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="flex overflow-x-auto pb-8 gap-6 hide-scrollbar snap-x snap-mandatory">
            {trendingStories.map((story) => (
              <div key={`trending-${story.id}`} className="flex-none w-[200px] sm:w-[240px] snap-start">
                <StoryCard story={story} />
              </div>
            ))}
          </div>
        </section>

        {/* Section Genres / Explorer par Univers */}
        <section className="animate-in fade-in-up duration-700">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-b border-primary/10 pb-6">
            <Link href="/stories" className="flex items-center gap-4 group/genre-title w-fit">
              <div className="bg-primary/10 p-3 rounded-xl group-hover/genre-title:bg-primary/20 transition-colors">
                <Compass className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground tracking-tight group-hover/genre-title:text-primary transition-colors">Explorez par Genre</h2>
                <p className="text-sm text-muted-foreground font-light">Plongez dans les univers qui vous passionnent.</p>
              </div>
            </Link>
            <Link href="/stories" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group">
              Voir tout le catalogue <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-4 mb-12">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={cn(
                  "px-8 py-4 rounded-2xl border-2 transition-all duration-300 group",
                  selectedGenre === genre.id 
                    ? "border-primary bg-primary text-primary-foreground shadow-lg scale-105" 
                    : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                <span className="font-bold text-sm uppercase tracking-wider">{genre.label}</span>
              </button>
            ))}
          </div>

          <div className="flex overflow-x-auto pb-8 gap-6 hide-scrollbar snap-x snap-mandatory min-h-[400px]">
            {filteredByGenre.length > 0 ? (
              filteredByGenre.map((story) => (
                <div key={`genre-${story.id}-${selectedGenre}`} className="flex-none w-[220px] sm:w-[260px] snap-start">
                  <StoryCard story={story} />
                </div>
              ))
            ) : (
              <div className="w-full flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-3xl">
                <Compass className="h-12 w-12 mb-4 opacity-20" />
                <p className="italic">Aucune œuvre trouvée dans cet univers pour le moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* Section Nouveautés - Derniers Chapitres */}
        <section className="animate-in fade-in-up duration-700 delay-300">
          <div className="flex justify-between items-center mb-10 border-b border-cyan-500/10 pb-6">
            <Link href="/new-releases" className="flex items-center gap-4 group/title">
              <div className="bg-cyan-500/10 p-3 rounded-xl group-hover/title:bg-cyan-500/20 transition-colors">
                <Clock className="h-8 w-8 text-cyan-500" />
              </div>
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground tracking-tight group-hover/title:text-cyan-500 transition-colors">{t('home.new_releases_title')}</h2>
                <p className="text-sm text-muted-foreground font-light">Les dernières aventures ajoutées au catalogue.</p>
              </div>
            </Link>
            <Link href="/new-releases" className="text-sm font-bold text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1 group">
              Voir Tout <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newestStories.map((story) => {
              const latestChapter = story.chapters[story.chapters.length - 1];
              const artist = artists.find(a => a.id === story.artistId);
              const readingUrl = latestChapter ? getChapterUrl(story, latestChapter.slug) : getStoryUrl(story);
              
              return (
                <Card key={`new-${story.id}`} className="group hover:border-cyan-500/30 transition-all duration-300 overflow-hidden bg-muted/20 border-none shadow-sm">
                  <CardContent className="p-4 flex gap-4">
                    <Link href={getStoryUrl(story)} className="shrink-0">
                      <div className="relative w-24 aspect-[2/3] rounded-lg overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-500">
                        <Image
                          src={story.coverImage.imageUrl}
                          alt={story.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Link href={getStoryUrl(story)}>
                            <h3 className="font-bold text-base truncate group-hover:text-cyan-500 transition-colors">{story.title}</h3>
                          </Link>
                          <Badge variant="outline" className="text-[9px] uppercase tracking-tighter border-cyan-500/20 text-cyan-500">
                            Chap. {story.chapters.length}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                          par <span className="font-semibold text-foreground/80">{story.artistName}</span>
                          {artist?.isMentor ? <Award className="h-3.5 w-3.5 text-emerald-500" /> : <PenSquare className="h-3.5 w-3.5 text-orange-400" />}
                        </p>
                        <p className="text-xs text-muted-foreground/70 italic line-clamp-2 leading-relaxed mb-3">
                          "{story.description}"
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Il y a 2h
                        </span>
                        <Button asChild size="sm" className="h-8 px-4 rounded-full bg-cyan-600 hover:bg-cyan-700 text-xs font-bold">
                          <Link href={readingUrl}>Lire</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Section Artistes à l'honneur */}
        <section className="animate-in fade-in-up duration-700">
          <div className="flex justify-between items-center mb-12 border-b border-primary/10 pb-6">
            <Link href="/artists" className="flex items-center gap-4 group/artist-title">
              <div className="bg-primary/10 p-3 rounded-xl group-hover/artist-title:bg-primary/20 transition-colors">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground tracking-tight group-hover/artist-title:text-primary transition-colors">Découvrez Nos Créateurs</h2>
                <p className="text-sm text-muted-foreground font-light">Les esprits derrière vos univers préférés.</p>
              </div>
            </Link>
            <Link href="/artists" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group">
              Voir tous les artistes <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topArtists.map((artist) => {
              const artistStories = stories.filter(s => s.artistId === artist.id).slice(0, 3);
              return (
                <Card key={artist.id} className="relative group overflow-hidden border-2 border-primary/5 hover:border-primary/20 transition-all duration-500 bg-card shadow-lg flex flex-col h-full">
                  <CardContent className="p-8 space-y-6 flex-1">
                    <div className="flex items-start justify-between">
                      <Avatar className="h-20 w-20 border-4 border-background ring-4 ring-primary/10">
                        <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} />
                        <AvatarFallback>{artist.name[0]}</AvatarFallback>
                      </Avatar>
                      {artist.isMentor ? (
                        <Badge className="bg-emerald-500 text-white border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                          <Award className="h-3 w-3 mr-1.5" /> Certifié Pro
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-orange-500/50 text-orange-500 px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                          <PenSquare className="h-3 w-3 mr-1.5" /> Talent Draft
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="text-2xl font-display font-bold mb-2 group-hover:text-primary transition-colors">{artist.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed italic">
                        "{artist.bio}"
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Œuvres phares</p>
                      <div className="flex gap-3">
                        {artistStories.map(story => (
                          <Link key={story.id} href={getStoryUrl(story)} className="relative w-12 aspect-[2/3] rounded-md overflow-hidden hover:scale-110 transition-transform duration-300 border border-border/50">
                            <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0 mt-auto">
                    <Button asChild variant="outline" className="w-full rounded-xl font-bold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all group/btn">
                      <Link href={`/artiste/${artist.slug}`}>
                        Voir le Profil <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Mentorship Tease Banner */}
          <div className="mt-16 p-1 bg-gradient-to-r from-primary/20 via-primary/5 to-emerald-500/20 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-background rounded-[2.4rem] m-0.5 z-0" />
            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="max-w-2xl space-y-4">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <Rocket className="h-6 w-6 text-primary animate-bounce" />
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-bold">PROGRAMME DE MENTORAT</Badge>
                </div>
                <h3 className="text-3xl md:text-4xl font-display font-black leading-tight">
                  Devenez Mentor ou Rejoignez la <span className="text-orange-500">Communauté Draft</span>.
                </h3>
                <p className="text-muted-foreground text-lg font-light leading-relaxed">
                  NexusHub est plus qu'une plateforme, c'est un tremplin. Partagez votre savoir ou faites éclore votre talent aux côtés des meilleurs artistes du continent.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Button asChild size="lg" className="h-16 px-10 rounded-full font-bold shadow-xl shadow-primary/20 bg-primary text-primary-foreground hover:scale-105 transition-transform">
                  <Link href="/mentorship">En savoir plus</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-full font-bold border-2 hover:bg-muted transition-all">
                  <Link href="/submit">Lancer mon projet</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section Partagez Votre Vision - Call to Submit */}
        <section className="relative rounded-[3rem] overflow-hidden bg-stone-900 border border-white/5 shadow-3xl">
          <div className="grid lg:grid-cols-2">
            <div className="relative h-[400px] lg:h-auto overflow-hidden">
              <Image 
                src={submissionImage?.imageUrl || "https://images.unsplash.com/photo-1544256718-3bcf237f3974"} 
                alt="Artiste en création" 
                fill 
                className="object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
                data-ai-hint="artist drawing"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent lg:bg-gradient-to-r" />
              <div className="absolute inset-0 flex flex-col justify-end p-10 lg:p-16">
                <Badge className="w-fit mb-4 bg-primary text-white border-none uppercase tracking-widest px-4 py-1.5 font-bold text-xs">REJOIGNEZ LA RÉVOLUTION</Badge>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white leading-tight">
                  {t('home.vision_title')}
                </h2>
                <p className="text-stone-400 text-lg mt-4 max-w-md font-light">
                  {t('home.vision_subtitle')}
                </p>
              </div>
            </div>
            
            <div className="p-10 lg:p-16 bg-stone-950/50 backdrop-blur-xl">
              <form 
                onSubmit={handleSubmission}
                className="space-y-6"
                data-netlify="true"
                name="nexus-hub-submission"
              >
                <input type="hidden" name="form-name" value="nexus-hub-submission" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sub-title" className="text-stone-300 font-bold uppercase tracking-wider text-[10px]">Titre de l'œuvre</Label>
                    <Input id="sub-title" name="title" placeholder="Ex: L'Éveil des Étoiles" className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-primary transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub-genre" className="text-stone-300 font-bold uppercase tracking-wider text-[10px]">Genre</Label>
                    <Select name="genre" required>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-primary transition-all">
                        <SelectValue placeholder="Choisir un genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mythology">Mythologie</SelectItem>
                        <SelectItem value="afrofuturism">Afrofuturisme</SelectItem>
                        <SelectItem value="history">Histoire & Culture</SelectItem>
                        <SelectItem value="urban">Urbain Contemporain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sub-summary" className="text-stone-300 font-bold uppercase tracking-wider text-[10px]">Résumé (Synopsis)</Label>
                  <Textarea id="sub-summary" name="summary" placeholder="Décrivez votre univers en quelques lignes..." className="bg-white/5 border-white/10 text-white min-h-[120px] rounded-xl focus:border-primary transition-all" required />
                </div>

                <div className="space-y-2">
                  <Label className="text-stone-300 font-bold uppercase tracking-wider text-[10px]">Teaser / Concept Art (.jpg, .png)</Label>
                  <div className="relative group/upload">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-3 group-hover/upload:border-primary group-hover/upload:bg-primary/5 transition-all">
                      <UploadCloud className="h-10 w-10 text-stone-500 group-hover/upload:text-primary transition-colors" />
                      <p className="text-stone-400 text-sm font-medium">Déposez votre visuel ou <span className="text-primary underline">parcourez</span></p>
                      <p className="text-[10px] text-stone-600 uppercase tracking-tighter">Maximum 5Mo • Format portrait recommandé</p>
                    </div>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full h-16 rounded-full font-black text-lg bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 transition-transform active:scale-95">
                  {t('home.vision_cta')}
                </Button>
                
                <p className="text-[9px] text-stone-500 text-center uppercase tracking-widest leading-relaxed">
                  En soumettant ce formulaire, vous confirmez être l'auteur original de l'œuvre. <br/>
                  NexusHub garantit la confidentialité de vos concepts.
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* Section Pro */}
        <section className="relative">
            <div className="absolute -inset-x-6 md:-inset-x-12 -inset-y-8 bg-emerald-500/[0.02] -z-10 rounded-3xl" />
            <div className="flex justify-between items-center mb-12 border-b border-emerald-500/10 pb-6">
                <Link href="/stories?type=premium" className="flex items-center gap-4 group/title">
                    <div className="bg-emerald-500/10 p-3 rounded-xl group-hover/title:bg-emerald-500/20 transition-colors">
                        <Award className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-display font-bold text-foreground tracking-tight group-hover/title:text-emerald-500 transition-colors">{t('home.pro_title')}</h2>
                        <p className="text-sm text-muted-foreground font-light">L'élite de la narration visuelle africaine.</p>
                    </div>
                </Link>
                <Link href="/stories?type=premium" className="text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1 group">
                    Voir tout <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            <div className="flex overflow-x-auto pb-8 gap-6 hide-scrollbar snap-x snap-mandatory">
                {proStories.map((story) => (
                    <div key={`pro-${story.id}`} className="flex-none w-[200px] sm:w-[240px] snap-start">
                      <StoryCard story={story} />
                    </div>
                ))}
            </div>
        </section>

        {/* Section Draft */}
        <section className="relative">
            <div className="absolute -inset-x-6 md:-inset-x-12 -inset-y-8 bg-orange-500/[0.02] -z-10 rounded-3xl" />
            <div className="flex justify-between items-center mb-12 border-b border-orange-500/10 pb-6">
                <Link href="/stories?type=public" className="flex items-center gap-4 group/title">
                    <div className="bg-orange-500/10 p-3 rounded-xl group-hover/title:bg-orange-500/20 transition-colors">
                        <PenSquare className="h-8 w-8 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-display font-bold text-foreground tracking-tight group-hover/title:text-orange-400 transition-colors">{t('home.draft_title')}</h2>
                        <p className="text-sm text-muted-foreground font-light">Les nouveaux visages du 9ème art continental.</p>
                    </div>
                </Link>
                <Link href="/stories?type=public" className="text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1 group">
                    Voir tout <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            <div className="flex overflow-x-auto pb-8 gap-6 hide-scrollbar snap-x snap-mandatory">
                {draftStories.map((story) => (
                    <div key={`draft-${story.id}`} className="flex-none w-[200px] sm:w-[240px] snap-start">
                      <StoryCard story={story} />
                    </div>
                ))}
            </div>
        </section>
      </main>
    </div>
  );
}
