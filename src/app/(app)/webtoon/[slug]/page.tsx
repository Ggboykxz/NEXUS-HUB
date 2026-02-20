'use client';

import { use, useEffect, useState } from 'react';
import { stories, artists, getChapterUrl } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Share2, Play, BookOpen, Clock, Eye, Star, Award, PenSquare, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function StoryDetailPage({ params: propsParams }: { params: Promise<{ slug: string }> }) {
  const params = use(propsParams);
  const story = stories.find(s => s.slug === params.slug);
  const [isLiked, setIsLiked] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    if (story) {
      setLastUpdate(format(new Date(story.updatedAt), 'd MMMM yyyy', { locale: fr }));
    }
  }, [story]);

  if (!story) {
    notFound();
  }

  const artist = artists.find(a => a.id === story.artistId);
  const hasChapters = story.chapters.length > 0;
  const firstChapterUrl = hasChapters ? getChapterUrl(story, story.chapters[0].slug) : '#';

  const formatStat = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <Image
          src={story.coverImage.imageUrl}
          alt={story.title}
          fill
          className="object-cover blur-xl opacity-20 scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="container relative z-10 mx-auto max-w-7xl h-full px-6 flex flex-col md:flex-row items-end gap-8 pb-12">
          <div className="relative w-48 md:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-background shrink-0 -mb-6 md:mb-0">
            <Image
              src={story.coverImage.imageUrl}
              alt={story.title}
              fill
              className="object-cover"
              data-ai-hint={story.coverImage.imageHint}
            />
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary text-white border-none uppercase tracking-widest text-[10px] px-3">
                {story.genre}
              </Badge>
              <Badge variant="outline" className="border-primary/20 text-primary uppercase tracking-widest text-[10px] px-3">
                {story.format}
              </Badge>
              {story.isPremium && <Badge className="bg-amber-500 text-black border-none uppercase tracking-widest text-[10px] px-3">PREMIUM</Badge>}
              <Badge variant="secondary" className="bg-background/50 backdrop-blur-md text-[9px] h-5 gap-1.5 font-bold tracking-tight uppercase">
                <Clock className="h-3 w-3 text-primary" /> Mis à jour : {lastUpdate}
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">{story.title}</h1>
            
            <div className="flex items-center gap-4">
              <Link href={`/artiste/${artist?.slug}`} className="group flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/20 group-hover:border-primary transition-colors">
                  <AvatarImage src={artist?.avatar.imageUrl} alt={artist?.name} />
                  <AvatarFallback>{artist?.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold group-hover:text-primary transition-colors">{artist?.name}</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Créateur</p>
                </div>
              </Link>
              {artist?.isMentor && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 h-5 px-2 text-[9px]">CERTIFIÉ PRO</Badge>}
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Button asChild size="lg" className="flex-1 md:flex-none rounded-full h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20">
              <Link href={firstChapterUrl}><Play className="mr-2 h-5 w-5 fill-current" /> Lire</Link>
            </Button>
            <Button variant="outline" size="icon" className="h-14 w-14 rounded-full" onClick={() => setIsLiked(!isLiked)}>
              <Heart className={cn("h-6 w-6", isLiked && "fill-destructive text-destructive")} />
            </Button>
            <Button variant="outline" size="icon" className="h-14 w-14 rounded-full">
              <Share2 className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
                <BookOpen className="text-primary h-6 w-6" /> Synopsis
              </h2>
              <p className="text-lg text-foreground/80 leading-relaxed font-light">
                {story.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-6">
                {story.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-muted hover:bg-primary/10 transition-colors">#{tag}</Badge>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-bold flex items-center gap-3">
                  <Play className="text-primary h-6 w-6" /> Épisodes
                </h2>
                <Badge variant="outline" className="text-muted-foreground font-mono">
                  {story.chapters.length} chapitres
                </Badge>
              </div>
              
              <div className="grid gap-3">
                {story.chapters.map((chapter, index) => (
                  <Link key={chapter.id} href={getChapterUrl(story, chapter.slug)}>
                    <Card className="hover:bg-muted/50 transition-all border-none bg-muted/20 group">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center font-bold text-primary border border-primary/10">
                            {story.chapters.length - index}
                          </div>
                          <div>
                            <h3 className="font-bold group-hover:text-primary transition-colors">{chapter.title}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                              <Clock className="h-3 w-3" /> {new Date(chapter.releaseDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <Card className="border-primary/10 bg-primary/[0.02]">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-display font-bold text-lg border-b pb-4">Statistiques du Hub</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1.5">
                      <Eye className="h-3 w-3 text-primary" /> Lectures
                    </p>
                    <p className="text-2xl font-black">{formatStat(story.views)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1.5">
                      <Heart className="h-3 w-3 text-destructive" /> Favoris
                    </p>
                    <p className="text-2xl font-black">{formatStat(story.likes)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1.5">
                      <Star className="h-3 w-3 text-blue-500" /> Abonnés
                    </p>
                    <p className="text-2xl font-black">{formatStat(story.subscriptions)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1.5">
                      <Star className="h-3 w-3 text-yellow-500" /> Note
                    </p>
                    <p className="text-2xl font-black">4.9</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {story.collaborators && story.collaborators.length > 0 && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-display font-bold text-lg border-b pb-4">Équipe Créative</h3>
                  <div className="space-y-4">
                    {story.collaborators.map(collab => (
                      <div key={collab.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={collab.avatar.imageUrl} />
                          <AvatarFallback>{collab.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold">{collab.name}</p>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">{collab.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
