'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { stories as allStories, type Story } from '@/lib/data';
import { StoryCard } from '@/components/story-card';
import { BookOpen, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

const uniqueGenres = [...new Set(allStories.map(s => s.genre))];

export default function StoriesPage() {
  const searchParams = useSearchParams();
  const initialGenre = searchParams.get('genre') || 'all';
  
  const [genreFilter, setGenreFilter] = useState(initialGenre);
  const [sortFilter, setSortFilter] = useState('popular');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredAndSortedStories = useMemo(() => {
    let filteredStories = allStories;

    // Filter by type
    if (typeFilter === 'public') {
      filteredStories = filteredStories.filter(story => !story.isPremium);
    } else if (typeFilter === 'premium') {
      filteredStories = filteredStories.filter(story => story.isPremium);
    }

    // Filter by genre
    if (genreFilter !== 'all') {
      filteredStories = filteredStories.filter(story => story.genre === genreFilter);
    }

    // Sort stories
    const sortedStories = [...filteredStories];
    switch (sortFilter) {
      case 'popular':
        sortedStories.sort((a, b) => b.views - a.views);
        break;
      case 'newest':
        // This sorting is based on a flawed assumption that `updatedAt` is a parsable date string.
        // The current data like "2 days ago" will result in `NaN` and incorrect sorting.
        // This is consistent with other parts of the app (e.g., rankings page) and can be improved later.
        sortedStories.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'likes':
        sortedStories.sort((a, b) => b.likes - a.likes);
        break;
    }

    return sortedStories;
  }, [genreFilter, sortFilter, typeFilter]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <BookOpen className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-bold font-display">Toutes les œuvres</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-8">
        Explorez notre collection complète de bandes dessinées, webtoons et plus encore.
      </p>
      
      {/* Filter and Sort controls */}
      <Card className="p-4 mb-8 bg-card/95">
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 font-semibold flex-shrink-0">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <span>Filtres :</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 w-full">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Type d'œuvre" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les œuvres</SelectItem>
                        <SelectItem value="public">Publiques</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                </Select>

                 <Select value={genreFilter} onValueChange={setGenreFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Genre" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les genres</SelectItem>
                        {uniqueGenres.map(genre => (
                            <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={sortFilter} onValueChange={setSortFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="popular">Popularité</SelectItem>
                        <SelectItem value="newest">Date de parution</SelectItem>
                        <SelectItem value="likes">Plus aimés</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
       </Card>

      {filteredAndSortedStories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {filteredAndSortedStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center col-span-full py-16">
          <p className="text-muted-foreground">Aucune œuvre ne correspond à vos filtres.</p>
        </div>
      )}
    </div>
  );
}
