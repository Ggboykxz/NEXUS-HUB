'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Story } from '@/lib/types';
import { StoryCard } from '@/components/story-card';
import { BookOpen, SlidersHorizontal, LayoutGrid, Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useGenres } from '@/components/providers/genres-provider';
import { useQuery } from '@tanstack/react-query';

function StoriesContent() {
  const searchParams = useSearchParams();
  const initialGenre = searchParams.get('genre') || 'all';
  const { genres: uniqueGenres } = useGenres();
  
  const [genreFilter, setGenreFilter] = useState(initialGenre);
  const [sortFilter, setSortFilter] = useState('popular');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allStories = [], isLoading } = useQuery({
    queryKey: ['stories', 'all'],
    queryFn: async () => {
      const q = query(collection(db, 'stories'), orderBy('views', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
    }
  });

  const filteredAndSortedStories = useMemo(() => {
    let filtered = allStories;

    if (typeFilter === 'public') {
      filtered = filtered.filter(story => !story.isPremium);
    } else if (typeFilter === 'premium') {
      filtered = filtered.filter(story => story.isPremium);
    }

    if (genreFilter !== 'all') {
      const targetGenre = uniqueGenres.find(g => g.slug === genreFilter)?.name;
      if (targetGenre) {
        filtered = filtered.filter(story => story.genre === targetGenre);
      }
    }

    if (searchQuery.trim()) {
      const lowerTerm = searchQuery.toLowerCase();
      filtered = filtered.filter(story => 
        story.title.toLowerCase().includes(lowerTerm) || 
        story.description.toLowerCase().includes(lowerTerm)
      );
    }

    const sorted = [...filtered];
    switch (sortFilter) {
      case 'popular':
        sorted.sort((a, b) => b.views - a.views);
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.updatedAt as string).getTime() - new Date(a.updatedAt as string).getTime());
        break;
      case 'likes':
        sorted.sort((a, b) => b.likes - a.likes);
        break;
    }

    return sorted;
  }, [allStories, genreFilter, sortFilter, typeFilter, searchQuery, uniqueGenres]);

  const activeFiltersCount = (genreFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0) + (searchQuery.trim() ? 1 : 0);

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-display font-bold">Chargement de la bibliothèque...</p>
      </div>
    );
  }

  return (
    <>
      <Card className="mb-12 bg-card/50 backdrop-blur-md border-primary/10 shadow-xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary/50" />
        <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="flex items-center gap-3 font-bold text-lg flex-shrink-0 min-w-[120px]">
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
                        <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Recherche</label>
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Titre, résumé..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-11 bg-background/50 rounded-xl border-border/50 focus:ring-primary/20 transition-all"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Catégorie</label>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full h-11 bg-background/50 rounded-xl border-border/50 focus:ring-primary/20 transition-all">
                                <SelectValue placeholder="Type d'œuvre" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les œuvres</SelectItem>
                                <SelectItem value="public">Publiques</SelectItem>
                                <SelectItem value="premium">Premium Pro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Genre</label>
                        <Select value={genreFilter} onValueChange={setGenreFilter}>
                            <SelectTrigger className="w-full h-11 bg-background/50 rounded-xl border-border/50 focus:ring-primary/20 transition-all">
                                <SelectValue placeholder="Genre" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les genres</SelectItem>
                                {uniqueGenres.map(genre => (
                                    <SelectItem key={genre.slug} value={genre.slug}>{genre.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Trier par</label>
                        <Select value={sortFilter} onValueChange={setSortFilter}>
                            <SelectTrigger className="w-full h-11 bg-background/50 rounded-xl border-border/50 focus:ring-primary/20 transition-all">
                                <SelectValue placeholder="Tri" />
                            </SelectTrigger>
                            <SelectContent>
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

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-display font-bold">
                {filteredAndSortedStories.length} résultats trouvés
            </h2>
        </div>
      </div>

      {filteredAndSortedStories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12 animate-in fade-in duration-700">
          {filteredAndSortedStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-muted/10 rounded-3xl border-2 border-dashed border-border/50">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold mb-2">Aucune œuvre ne correspond à vos filtres</h3>
          <p className="text-muted-foreground max-w-xs mx-auto mb-8">Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.</p>
          <Button 
            variant="outline" 
            className="rounded-full"
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
                <h1 className="text-4xl md:text-5xl font-bold font-display">Toutes les œuvres</h1>
                <p className="text-lg text-muted-foreground font-light mt-1">
                    Explorez notre collection complète de récits épiques et de mondes imaginaires.
                </p>
            </div>
        </div>
      </header>
      
      <Suspense fallback={
        <div className="h-96 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-display font-bold">Chargement de la bibliothèque...</p>
        </div>
      }>
        <StoriesContent />
      </Suspense>
    </div>
  );
}
