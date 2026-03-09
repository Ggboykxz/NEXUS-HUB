
'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Story } from '@/lib/types';
import { StoryCard } from '@/components/story-card';
import { BookOpen, SlidersHorizontal, LayoutGrid, Search as SearchIcon, X, Loader2, Plus, Filter, Sparkles, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { useGenres } from '@/components/providers/genres-provider';
import { useQuery } from '@tanstack/react-query';

function StoryGridSkeleton({ count = 10 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[3/4] w-full bg-stone-800 animate-pulse rounded-2xl" />
          <Skeleton className="h-4 w-3/4 bg-stone-800" />
          <Skeleton className="h-3 w-1/2 bg-stone-800/50" />
        </div>
      ))}
    </div>
  );
}

function StoriesContent() {
  const searchParams = useSearchParams();
  const initialGenre = searchParams.get('genre') || 'all';
  const { genres: uniqueGenres } = useGenres();
  
  const [genreFilter, setGenreFilter] = useState(initialGenre);
  const [sortFilter, setSortFilter] = useState('popular');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [indexError, setIndexError] = useState(false);

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['stories-list', genreFilter, typeFilter, sortFilter],
    queryFn: async () => {
      setIndexError(false);
      const storiesRef = collection(db, 'stories');
      let constraints: any[] = [where('isPublished', '==', true)];

      if (typeFilter === 'public') constraints.push(where('isPremium', '==', false));
      if (typeFilter === 'premium') constraints.push(where('isPremium', '==', true));
      if (genreFilter !== 'all') constraints.push(where('genreSlug', '==', genreFilter));

      let orderField = 'views';
      if (sortFilter === 'newest') orderField = 'updatedAt';
      if (sortFilter === 'likes') orderField = 'likes';
      
      try {
        const q = query(storiesRef, ...constraints, orderBy(orderField, 'desc'), limit(40));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
      } catch (e: any) {
        if (e.code === 'failed-precondition' || e.message.includes('index')) {
          console.warn("Index manquant pour cette combinaison de filtres. Passage en mode dégradé.");
          setIndexError(true);
          const fallbackQ = query(storiesRef, ...constraints, limit(40));
          const snap = await getDocs(fallbackQ);
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
        }
        throw e;
      }
    },
    staleTime: 2 * 60 * 1000,
  });

  const displayedStories = useMemo(() => {
    if (!searchQuery.trim()) return stories;
    const lowerTerm = searchQuery.toLowerCase();
    return stories.filter(story => 
      story.title.toLowerCase().includes(lowerTerm) || 
      story.description.toLowerCase().includes(lowerTerm)
    );
  }, [stories, searchQuery]);

  const activeFiltersCount = (genreFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0) + (searchQuery.trim() ? 1 : 0);

  if (isLoading) {
    return (
      <div className="space-y-10">
        <StoryGridSkeleton count={10} />
      </div>
    );
  }

  return (
    <>
      {indexError && process.env.NODE_ENV === 'development' && (
        <div className="mb-8 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <div className="text-xs">
              <p className="text-amber-200 font-bold">Mode Dégradé : Index Firestore Manquant</p>
              <p className="text-amber-500/70">L'affichage fonctionne sans tri pour cette combinaison de filtres.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black" asChild>
            <a href="https://console.firebase.google.com/v1/r/project/studio-7543974359-3b6f7/firestore/indexes" target="_blank" rel="noopener noreferrer">Gérer les Index</a>
          </Button>
        </div>
      )}

      <Card className="mb-12 bg-card/50 backdrop-blur-md border-primary/10 shadow-xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary/50" />
        <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="flex items-center gap-3 font-bold text-lg flex-shrink-0 min-w-[120px] text-white">
                    <SlidersHorizontal className="w-5 h-5 text-primary" />
                    <span>Filtres</span>
                    {activeFiltersCount > 0 && (
                        <Badge className="ml-1 bg-primary text-primary-foreground h-5 min-w-5 flex items-center justify-center p-0 rounded-full text-[10px]">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </div>
                
                <Separator orientation="vertical" className="hidden lg:block h-10 bg-border/50" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Recherche</label>
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-600" />
                            <Input 
                                placeholder="Titre, résumé..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-11 bg-stone-900/50 rounded-xl border-white/5 focus:border-primary/50 text-white transition-all text-xs"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-600 hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Catégorie</label>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full h-11 bg-stone-900/50 rounded-xl border-white/5 text-white text-xs font-bold">
                                <SelectValue placeholder="Type d'œuvre" />
                            </SelectTrigger>
                            <SelectContent className="bg-stone-900 border-white/10">
                                <SelectItem value="all">Toutes les œuvres</SelectItem>
                                <SelectItem value="public">Publiques</SelectItem>
                                <SelectItem value="premium">Premium Pro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Genre</label>
                        <Select value={genreFilter} onValueChange={setGenreFilter}>
                            <SelectTrigger className="w-full h-11 bg-stone-900/50 rounded-xl border-white/5 text-white text-xs font-bold">
                                <SelectValue placeholder="Genre" />
                            </SelectTrigger>
                            <SelectContent className="bg-stone-900 border-white/10">
                                <SelectItem value="all">Tous les genres</SelectItem>
                                {uniqueGenres.map(genre => (
                                    <SelectItem key={genre.slug} value={genre.slug}>{genre.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black tracking-widest text-stone-500 ml-1">Trier par</label>
                        <Select value={sortFilter} onValueChange={setSortFilter}>
                            <SelectTrigger className="w-full h-11 bg-stone-900/50 rounded-xl border-white/5 text-white text-xs font-bold">
                                <SelectValue placeholder="Tri" />
                            </SelectTrigger>
                            <SelectContent className="bg-stone-900 border-white/10">
                                <SelectItem value="popular">Popularité (Vues)</SelectItem>
                                <SelectItem value="newest">Date de mise à jour</SelectItem>
                                <SelectItem value="likes">Engagement (Likes)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </CardContent>
       </Card>

      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10"><LayoutGrid className="h-5 w-5 text-primary" /></div>
            <h2 className="text-xl font-display font-black text-white uppercase tracking-tighter">
                {displayedStories.length} résultats chargés
            </h2>
        </div>
      </div>

      {displayedStories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12 animate-in fade-in duration-700">
          {displayedStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5 space-y-6">
          <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center opacity-20">
            <BookOpen className="h-10 w-10 text-stone-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Aucune œuvre trouvée</h3>
            <p className="text-stone-500 max-w-xs mx-auto italic font-light leading-relaxed">"Le voyageur qui ne pose pas de questions ne trouvera jamais son chemin." Réessayez avec d'autres filtres.</p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-full px-10 h-12 border-primary text-primary font-black uppercase text-xs tracking-widest"
            onClick={() => {setGenreFilter('all'); setTypeFilter('all'); setSortFilter('popular'); setSearchQuery('');}}
          >
            Réinitialiser tout
          </Button>
        </div>
      )}
    </>
  );
}

export default function StoriesPage() {
  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-2">
            <div className="bg-primary/10 p-3 rounded-2xl">
                <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <div>
                <h1 className="text-4xl md:text-5xl font-black font-display tracking-tighter text-white">Toutes les œuvres</h1>
                <p className="text-lg text-stone-400 font-light mt-1 max-w-2xl italic">
                  Explorez notre collection complète de récits épiques et de mondes imaginaires panafricains.
                </p>
            </div>
        </div>
      </header>
      
      <Suspense fallback={
        <div className="space-y-10">
            <StoryGridSkeleton count={10} />
        </div>
      }>
        <StoriesContent />
      </Suspense>
    </div>
  );
}
