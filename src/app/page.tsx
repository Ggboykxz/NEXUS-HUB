'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/story-card';
import { stories, artists, getStoryUrl, getChapterUrl, type Story } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Play, Info, Star, Award, PenSquare, ChevronRight, Zap, Sparkles, BookHeart, TrendingUp, Clock, Compass, Landmark, ScrollText, Buildings, Rocket, Users, Heart, UploadCloud, MessageSquare } from 'lucide-react';
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

  const topComments = [
    {
      id: 'c1',
      name: "Léa Dubois",
      avatar: "https://images.unsplash.com/photo-1557053910-d9eadeed1c58",
      text: "Ce premier chapitre des Chroniques d'Orisha est incroyable ! Les designs sont d'une finesse rare.",
      work: "Les Chroniques d'Orisha",
      date: "Hier"
    },
    {
      id: 'c2',
      name: "Yannick Beauchamp",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      text: "Le world building de Néo-Dakar me rappelle le meilleur du cyberpunk, avec une touche locale unique.",
      work: "Néo-Dakar 2088",
      date: "Il y a 2h"
    },
    {
      id: 'c3',
      name: "Moussa Traoré",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      text: "Enfin une plateforme qui met en avant nos récits avec autant de professionnalisme. Merci NexusHub !",
      work: "Le Sentier de Sankofa",
      date: "Il y a 1j"
    },
    {
      id: 'c4',
      name: "Awa Ndiaye",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
      text: "Je suis fan du style graphique de Jelani. Chaque planche est un tableau !",
      work: "NexusHub Pro",
      date: "Aujourd'hui"
    },
    {
      id: 'c5',
      name: "Idriss Koné",
      avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79",
      text: "La fluidité du lecteur Webtoon est parfaite sur mon mobile. Une expérience au top.",
      work: "Zéro Heure",
      date: "Il y a 5h"
    }
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
    <div className="flex flex-col gap-8 bg-background">
      <h1 className="sr-only">NexusHub - Moodboard Afro-futuriste & Bandes Dessinées Africaines</h1>
      
      {/* Featured Moodboard Carousel Section with Parallax */}
      <section className="relative w-full pt-4 md:pt-6 overflow-hidden">
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
                                <div className="relative w-full aspect-[3/4] sm:aspect-[16/10] md:aspect-[21/9] min-h-[500px] md:min-h-[450px] rounded-[1.5rem] overflow-hidden group shadow-xl border border-primary/10 bg-stone-950">
                                    
                                    {/* Parallax Background Image */}
                                    <div 
                                      className="absolute inset-0 transition-transform duration-700 ease-out"
                                      style={{ 
                                        transform: `translateY(${scrollY * 0.1}px) scale(${1.02 + scrollY * 0.0001})` 
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
                                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/80 md:via-black/40 to-transparent flex flex-col justify-end items-start p-6 md:p-12 lg:p-16 z-10">
                                        <div className="carousel-content-animate flex flex-col gap-3 md:gap-4 max-w-2xl w-full">
                                            
                                            {/* Badges & Tags */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 backdrop-blur-xl px-3 py-1 font-bold text-[9px] uppercase tracking-[0.2em]">
                                                    {story.genre}
                                                </Badge>
                                                {index === 0 && (
                                                    <Badge className="bg-cyan-500 text-white border-none px-3 py-1 font-bold text-[9px] uppercase tracking-[0.2em] shadow-lg animate-pulse">
                                                        <Sparkles className="h-2.5 w-2.5 mr-1.5" /> Nouveau
                                                    </Badge>
                                                )}
                                                {story.isPremium && (
                                                    <Badge className="bg-amber-500 text-black border-none px-3 py-1 font-bold text-[9px] uppercase tracking-[0.2em]">
                                                        <Zap className="h-2.5 w-2.5 mr-1.5 fill-current" /> Premium
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            {/* Titre Impactant Cliquable */}
                                            <Link href={storyUrl} className="group/title inline-block">
                                                <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-white leading-tight tracking-tighter group-hover/title:text-primary transition-colors duration-300">
                                                    {story.title}
                                                </h2>
                                            </Link>
                                            
                                            {/* Synopsis Style Moodboard */}
                                            <div className="relative pl-4 border-l-2 border-primary/40 max-w-xl">
                                                <p className="text-white/90 text-sm md:text-lg font-light leading-relaxed italic line-clamp-2 md:line-clamp-3">
                                                    "{story.description}"
                                                </p>
                                            </div>

                                            {/* Infos Artiste Cliquables */}
                                            <Link href={`/artiste/${artist?.slug}`} className="flex items-center gap-3 mt-1 group/artist-info w-fit">
                                                <div className="relative">
                                                    <Avatar className="h-10 w-10 border-2 border-primary/40 p-0.5 bg-background group-hover/artist-info:border-primary transition-colors">
                                                        <AvatarImage src={artist?.avatar.imageUrl} alt={story.artistName} />
                                                        <AvatarFallback>{story.artistName?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    {artist?.isMentor && (
                                                        <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-background shadow-lg">
                                                            <Award className="h-2.5 w-2.5 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-sm tracking-tight group-hover/artist-info:text-primary transition-colors">{story.artistName}</span>
                                                    <span className="text-primary/80 text-[9px] uppercase tracking-widest font-bold">
                                                        {artist?.isMentor ? 'Artiste Certifié Pro' : 'Jeune Talent NexusHub'}
                                                    </span>
                                                </div>
                                            </Link>

                                            {/* Boutons d'Action */}
                                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                                <Button asChild size="lg" className="h-12 md:h-14 px-8 md:px-10 rounded-full font-bold text-sm shadow-xl transition-transform active:scale-95 group/btn">
                                                    <Link href={readingUrl}>
                                                        <Play className="mr-2 h-4 w-4 fill-current group-hover/btn:scale-110 transition-transform" />
                                                        {t('common.read')}
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="outline" size="lg" className="h-12 md:h-14 px-8 md:px-10 rounded-full bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-xl text-sm transition-all hover:border-white/40">
                                                    <Link href={storyUrl}>
                                                        <Info className="mr-2 h-4 w-4" />
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
            <div className="flex justify-center items-center gap-2 mt-6">
                {Array.from({ length: count }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => api?.scrollTo(index)}
                        className={cn(
                            "transition-all duration-500 rounded-full",
                            current === index 
                                ? "w-10 h-2 bg-primary shadow-md" 
                                : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                        )}
                        aria-label={`Aller à l'œuvre ${index + 1}`}
                    />
                ))}
            </div>
        </div>
      </section>

      {/* Sections de contenu */}
      <main className="container max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-16">
        
        {/* Section Recommandations Personnalisées */}
        {recommendations.length > 0 && (
          <section className="animate-in fade-in-up duration-700">
            <div className="flex justify-between items-center mb-6 border-b border-primary/10 pb-4">
              <Link href="/for-you" className="flex items-center gap-3 group/for-you w-fit">
                <div className="bg-primary/10 p-2 rounded-xl group-hover/for-you:bg-primary/20 transition-colors">
                  <BookHeart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground tracking-tight group-hover/for-you:text-primary transition-colors">{recTitle}</h2>
                  <p className="text-xs text-muted-foreground font-light">Une sélection aux petits oignons.</p>
                </div>
              </Link>
              <Button asChild variant="outline" size="sm" className="rounded-full font-bold">
                <Link href="/for-you">Voir Plus</Link>
              </Button>
            </div>
            <div className="flex overflow-x-auto pb-6 gap-5 hide-scrollbar snap-x snap-mandatory">
              {recommendations.map((story) => (
                <div key={`rec-${story.id}`} className="flex-none w-[180px] sm:w-[220px] snap-start">
                  <StoryCard story={story} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section Tendances */}
        <section className="animate-in fade-in-up duration-700 delay-150">
          <div className="flex justify-between items-center mb-6 border-b border-rose-500/10 pb-4">
            <Link href="/rankings" className="flex items-center gap-3 group/title">
              <div className="bg-rose-500/10 p-2 rounded-xl group-hover/title:bg-rose-500/20 transition-colors">
                <TrendingUp className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground tracking-tight group-hover/title:text-rose-500 transition-colors">Tendances</h2>
                <p className="text-xs text-muted-foreground font-light">Les œuvres qui font vibrer la communauté.</p>
              </div>
            </Link>
            <Link href="/rankings" className="text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-1 group">
              Voir Tout <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="flex overflow-x-auto pb-6 gap-5 hide-scrollbar snap-x snap-mandatory">
            {trendingStories.map((story) => (
              <div key={`trending-${story.id}`} className="flex-none w-[180px] sm:w-[220px] snap-start">
                <StoryCard story={story} />
              </div>
            ))}
          </div>
        </section>

        {/* Section Genres / Explorer par Univers */}
        <section className="animate-in fade-in-up duration-700">
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4 border-b border-primary/10 pb-4">
            <Link href="/stories" className="flex items-center gap-3 group/genre-title w-fit">
              <div className="bg-primary/10 p-2 rounded-xl group-hover/genre-title:bg-primary/20 transition-colors">
                <Compass className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground tracking-tight group-hover/genre-title:text-primary transition-colors">Explorer par Genre</h2>
                <p className="text-xs text-muted-foreground font-light">Plongez dans les univers qui vous passionnent.</p>
              </div>
            </Link>
            <Link href="/stories" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group">
              Voir tout le catalogue <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={cn(
                  "px-6 py-3 rounded-xl border-2 transition-all duration-300 group",
                  selectedGenre === genre.id 
                    ? "border-primary bg-primary text-primary-foreground shadow-md scale-105" 
                    : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                <span className="font-bold text-xs uppercase tracking-wider">{genre.label}</span>
              </button>
            ))}
          </div>

          <div className="flex overflow-x-auto pb-6 gap-5 hide-scrollbar snap-x snap-mandatory min-h-[350px]">
            {filteredByGenre.length > 0 ? (
              filteredByGenre.map((story) => (
                <div key={`genre-${story.id}-${selectedGenre}`} className="flex-none w-[180px] sm:w-[220px] snap-start">
                  <StoryCard story={story} />
                </div>
              ))
            ) : (
              <div className="w-full flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed rounded-2xl">
                <Compass className="h-10 w-10 mb-3 opacity-20" />
                <p className="italic text-sm">Aucune œuvre trouvée dans cet univers.</p>
              </div>
            )}
          </div>
        </section>

        {/* Section Nouveautés - Derniers Chapitres */}
        <section className="animate-in fade-in-up duration-700 delay-300">
          <div className="flex justify-between items-center mb-6 border-b border-cyan-500/10 pb-4">
            <Link href="/new-releases" className="flex items-center gap-3 group/title">
              <div className="bg-cyan-500/10 p-2 rounded-xl group-hover/title:bg-cyan-500/20 transition-colors">
                <Clock className="h-6 w-6 text-cyan-500" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground tracking-tight group-hover/title:text-cyan-500 transition-colors">{t('home.new_releases_title')}</h2>
                <p className="text-xs text-muted-foreground font-light">Les dernières aventures ajoutées.</p>
              </div>
            </Link>
            <Link href="/new-releases" className="text-xs font-bold text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1 group">
              Voir Tout <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {newestStories.map((story) => {
              const latestChapter = story.chapters[story.chapters.length - 1];
              const artist = artists.find(a => a.id === story.artistId);
              const readingUrl = latestChapter ? getChapterUrl(story, latestChapter.slug) : getStoryUrl(story);
              
              return (
                <Card key={`new-${story.id}`} className="group hover:border-cyan-500/30 transition-all duration-300 overflow-hidden bg-muted/20 border-none shadow-sm">
                  <CardContent className="p-3 flex gap-3">
                    <Link href={getStoryUrl(story)} className="shrink-0">
                      <div className="relative w-20 aspect-[2/3] rounded-lg overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-500">
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
                        <div className="flex items-center justify-between mb-0.5">
                          <Link href={getStoryUrl(story)}>
                            <h3 className="font-bold text-sm truncate group-hover:text-cyan-500 transition-colors">{story.title}</h3>
                          </Link>
                          <Badge variant="outline" className="text-[8px] h-4 uppercase tracking-tighter border-cyan-500/20 text-cyan-500">
                            Ch. {story.chapters.length}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
                          par <span className="font-semibold text-foreground/80">{story.artistName}</span>
                          {artist?.isMentor ? <Award className="h-3 w-3 text-emerald-500" /> : <PenSquare className="h-3 w-3 text-orange-400" />}
                        </p>
                        <p className="text-[11px] text-muted-foreground/70 italic line-clamp-2 leading-tight mb-2">
                          "{story.description}"
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> Il y a 2h
                        </span>
                        <Button asChild size="sm" className="h-7 px-3 rounded-full bg-cyan-600 hover:bg-cyan-700 text-[10px] font-bold">
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
          <div className="flex justify-between items-center mb-10 border-b border-primary/10 pb-4">
            <Link href="/artists" className="flex items-center gap-3 group/artist-title">
              <div className="bg-primary/10 p-2 rounded-xl group-hover/artist-title:bg-primary/20 transition-colors">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground tracking-tight group-hover/artist-title:text-primary transition-colors">Nos Créateurs</h2>
                <p className="text-xs text-muted-foreground font-light">Les esprits derrière vos univers.</p>
              </div>
            </Link>
            <Link href="/artists" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group">
              Voir tous les artistes <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topArtists.map((artist) => {
              const artistStories = stories.filter(s => s.artistId === artist.id).slice(0, 3);
              return (
                <Card key={artist.id} className="relative group overflow-hidden border-2 border-primary/5 hover:border-primary/20 transition-all duration-500 bg-card shadow-md flex flex-col h-full">
                  <CardContent className="p-6 space-y-4 flex-1">
                    <div className="flex items-start justify-between">
                      <Avatar className="h-16 w-16 border-4 border-background ring-4 ring-primary/10">
                        <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} />
                        <AvatarFallback>{artist.name[0]}</AvatarFallback>
                      </Avatar>
                      {artist.isMentor ? (
                        <Badge className="bg-emerald-500 text-white border-none px-2.5 py-0.5 font-bold text-[9px] uppercase tracking-wider">
                          <Award className="h-2.5 w-2.5 mr-1" /> Pro
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-orange-500/50 text-orange-400 px-2.5 py-0.5 font-bold text-[9px] uppercase tracking-wider">
                          <PenSquare className="h-2.5 w-2.5 mr-1" /> Draft
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-display font-bold mb-1 group-hover:text-primary transition-colors">{artist.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
                        "{artist.bio}"
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">Œuvres phares</p>
                      <div className="flex gap-2">
                        {artistStories.map(story => (
                          <Link key={story.id} href={getStoryUrl(story)} className="relative w-10 aspect-[2/3] rounded-md overflow-hidden hover:scale-110 transition-transform duration-300 border border-border/50">
                            <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-5 pt-0 mt-auto">
                    <Button asChild variant="outline" size="sm" className="w-full rounded-xl font-bold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all group/btn">
                      <Link href={`/artiste/${artist.slug}`}>
                        Voir le Profil <ChevronRight className="h-3.5 w-3.5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Mentorship Tease Banner */}
          <div className="mt-12 p-1 bg-gradient-to-r from-primary/20 via-primary/5 to-emerald-500/20 rounded-[2rem] shadow-xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-background rounded-[1.9rem] m-0.5 z-0" />
            <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="max-w-xl space-y-3">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Rocket className="h-5 w-5 text-primary animate-bounce" />
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-bold text-[10px]">PROGRAMME DE MENTORAT</Badge>
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-black leading-tight">
                  Devenez Mentor ou Rejoignez la <span className="text-orange-500">Communauté Draft</span>.
                </h3>
                <p className="text-muted-foreground text-sm font-light leading-relaxed">
                  NexusHub est plus qu'une plateforme, c'est un tremplin. Partagez votre savoir ou faites éclore votre talent aux côtés des meilleurs.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button asChild size="lg" className="h-12 px-8 rounded-full font-bold text-sm shadow-lg bg-primary text-primary-foreground hover:scale-105 transition-transform">
                  <Link href="/mentorship">En savoir plus</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-full font-bold text-sm border-2 hover:bg-muted transition-all">
                  <Link href="/submit">Lancer mon projet</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section Partagez Votre Vision - Call to Submit */}
        <section className="relative rounded-[2.5rem] overflow-hidden bg-stone-900 border border-white/5 shadow-2xl">
          <div className="grid lg:grid-cols-2">
            <div className="relative h-[300px] lg:h-auto overflow-hidden">
              <Image 
                src={submissionImage?.imageUrl || "https://images.unsplash.com/photo-1544256718-3bcf237f3974"} 
                alt="Artiste en création" 
                fill 
                className="object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
                data-ai-hint="artist drawing"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent lg:bg-gradient-to-r" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
                <Badge className="w-fit mb-3 bg-primary text-white border-none uppercase tracking-widest px-3 py-1 font-bold text-[9px]">REJOIGNEZ LA RÉVOLUTION</Badge>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-white leading-tight">
                  {t('home.vision_title')}
                </h2>
                <p className="text-stone-400 text-base mt-2 max-w-sm font-light">
                  {t('home.vision_subtitle')}
                </p>
              </div>
            </div>
            
            <div className="p-8 lg:p-12 bg-stone-950/50 backdrop-blur-xl">
              <form 
                onSubmit={handleSubmission}
                className="space-y-4"
                data-netlify="true"
                name="nexus-hub-submission"
              >
                <input type="hidden" name="form-name" value="nexus-hub-submission" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="sub-title" className="text-stone-300 font-bold uppercase tracking-wider text-[9px]">Titre de l'œuvre</Label>
                    <Input id="sub-title" name="title" placeholder="Ex: L'Éveil des Étoiles" className="bg-white/5 border-white/10 text-white h-10 rounded-xl focus:border-primary transition-all text-sm" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sub-genre" className="text-stone-300 font-bold uppercase tracking-wider text-[9px]">Genre</Label>
                    <Select name="genre" required>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white h-10 rounded-xl focus:border-primary transition-all text-sm">
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

                <div className="space-y-1.5">
                  <Label htmlFor="sub-summary" className="text-stone-300 font-bold uppercase tracking-wider text-[9px]">Résumé (Synopsis)</Label>
                  <Textarea id="sub-summary" name="summary" placeholder="Décrivez votre univers..." className="bg-white/5 border-white/10 text-white min-h-[100px] rounded-xl focus:border-primary transition-all text-sm" required />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-stone-300 font-bold uppercase tracking-wider text-[9px]">Teaser / Concept Art (.jpg, .png)</Label>
                  <div className="relative group/upload">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                    <div className="border border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-2 group-hover/upload:border-primary group-hover/upload:bg-primary/5 transition-all">
                      <UploadCloud className="h-8 w-8 text-stone-500 group-hover/upload:text-primary transition-colors" />
                      <p className="text-stone-400 text-xs font-medium">Déposez votre visuel ou <span className="text-primary underline">parcourez</span></p>
                      <p className="text-[8px] text-stone-600 uppercase tracking-tighter">Maximum 5Mo</p>
                    </div>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full h-14 rounded-full font-black text-base bg-primary hover:bg-primary/90 text-white shadow-xl transition-transform active:scale-95">
                  {t('home.vision_cta')}
                </Button>
                
                <p className="text-[8px] text-stone-500 text-center uppercase tracking-widest leading-relaxed">
                  NexusHub garantit la confidentialité de vos concepts.
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* Section Communauté / Témoignages */}
        <section className="py-10 overflow-hidden bg-primary/[0.02] -mx-6 lg:-mx-8">
          <div className="container max-w-7xl mx-auto px-6 lg:px-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">{t('home.community_title')}</h2>
                <p className="text-xs text-muted-foreground font-light">Le cœur battant de NexusHub.</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-full font-bold group">
              <Link href="/forums">
                {t('home.community_cta')} <ChevronRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="relative flex overflow-x-hidden group">
            <div className="animate-marquee whitespace-nowrap flex gap-5 py-2 px-6 items-center">
              {[...topComments, ...topComments].map((comment, idx) => (
                <Card key={`${comment.id}-${idx}`} className="inline-block w-[300px] whitespace-normal bg-card shadow-lg border-primary/5 hover:border-primary/20 transition-all duration-300">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 border border-primary/10">
                          <AvatarImage src={comment.avatar} alt={comment.name} />
                          <AvatarFallback>{comment.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-bold leading-none">{comment.name}</p>
                          <p className="text-[9px] text-muted-foreground mt-0.5 uppercase font-bold tracking-widest">{comment.date}</p>
                        </div>
                      </div>
                      <Star className="h-3 w-3 text-primary fill-current" />
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed italic line-clamp-3">
                      "{comment.text}"
                    </p>
                    <div className="pt-2 border-t border-primary/5 flex items-center justify-between">
                      <Badge variant="outline" className="text-[8px] uppercase tracking-tighter border-primary/20 text-primary h-4">
                        {comment.work}
                      </Badge>
                      <div className="flex gap-1">
                        <Heart className="h-2.5 w-2.5 text-destructive fill-destructive" />
                        <span className="text-[8px] font-bold">TOP FAN</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Section Pro */}
        <section className="relative">
            <div className="absolute -inset-x-6 md:-inset-x-12 -inset-y-6 bg-emerald-500/[0.02] -z-10 rounded-2xl" />
            <div className="flex justify-between items-center mb-8 border-b border-emerald-500/10 pb-4">
                <Link href="/stories?type=premium" className="flex items-center gap-3 group/title">
                    <div className="bg-emerald-500/10 p-2 rounded-xl group-hover/title:bg-emerald-500/20 transition-colors">
                        <Award className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-display font-bold text-foreground tracking-tight group-hover/title:text-emerald-500 transition-colors">{t('home.pro_title')}</h2>
                        <p className="text-xs text-muted-foreground font-light">L'élite de la narration visuelle africaine.</p>
                    </div>
                </Link>
                <Link href="/stories?type=premium" className="text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1 group">
                    Voir tout <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            <div className="flex overflow-x-auto pb-6 gap-5 hide-scrollbar snap-x snap-mandatory">
                {proStories.map((story) => (
                    <div key={`pro-${story.id}`} className="flex-none w-[180px] sm:w-[220px] snap-start">
                      <StoryCard story={story} />
                    </div>
                ))}
            </div>
        </section>

        {/* Section Draft */}
        <section className="relative">
            <div className="absolute -inset-x-6 md:-inset-x-12 -inset-y-6 bg-orange-500/[0.02] -z-10 rounded-2xl" />
            <div className="flex justify-between items-center mb-8 border-b border-orange-500/10 pb-4">
                <Link href="/stories?type=public" className="flex items-center gap-3 group/title">
                    <div className="bg-orange-500/10 p-2 rounded-xl group-hover/title:bg-orange-500/20 transition-colors">
                        <PenSquare className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-display font-bold text-foreground tracking-tight group-hover/title:text-orange-400 transition-colors">{t('home.draft_title')}</h2>
                        <p className="text-xs text-muted-foreground font-light">Les nouveaux visages du 9ème art.</p>
                    </div>
                </Link>
                <Link href="/stories?type=public" className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1 group">
                    Voir tout <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            <div className="flex overflow-x-auto pb-6 gap-5 hide-scrollbar snap-x snap-mandatory">
                {draftStories.map((story) => (
                    <div key={`draft-${story.id}`} className="flex-none w-[180px] sm:w-[220px] snap-start">
                      <StoryCard story={story} />
                    </div>
                ))}
            </div>
        </section>
      </main>
    </div>
  );
}