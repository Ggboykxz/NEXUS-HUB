'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { stories, artists, type Story, type Artist } from '@/lib/data';
import { StoryCard } from '@/components/story-card';
import { Input } from '@/components/ui/input';
import { Search, Filter, Users, BookOpen, X, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [searchTerm, setSearchState] = useState(query);
  const [activeTab, setActiveTab] = useState('all');

  const filteredStories = stories.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredArtists = artists.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.bio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input 
          value={searchTerm}
          onChange={(e) => setSearchState(e.target.value)}
          placeholder="Rechercher une œuvre, un artiste, un genre..."
          className="h-14 pl-12 pr-4 text-lg rounded-full border-primary/20 focus:border-primary shadow-lg bg-card/50 backdrop-blur-sm"
        />
        {searchTerm && (
          <button 
            type="button" 
            onClick={() => setSearchState('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </form>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Résultats pour <span className="text-primary">"{searchTerm || 'Tout explorer'}"</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            {filteredStories.length} œuvres et {filteredArtists.length} artistes trouvés.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-primary/10">#Fantasy</Badge>
          <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-primary/10">#Cyberpunk</Badge>
          <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-primary/10">#Mythologie</Badge>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-12">
          <TabsTrigger value="all">Tout</TabsTrigger>
          <TabsTrigger value="stories">Œuvres</TabsTrigger>
          <TabsTrigger value="artists">Artistes</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-16 animate-in fade-in duration-500">
          {filteredStories.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <BookOpen className="text-primary h-6 w-6" />
                <h2 className="text-2xl font-display font-bold">Œuvres populaires</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredStories.slice(0, 5).map(story => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
              {filteredStories.length > 5 && (
                <Button variant="ghost" className="mt-8 w-full text-primary" onClick={() => setActiveTab('stories')}>
                  Voir les {filteredStories.length} œuvres
                </Button>
              )}
            </section>
          )}

          {filteredArtists.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <Users className="text-primary h-6 w-6" />
                <h2 className="text-2xl font-display font-bold">Artistes correspondants</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArtists.map(artist => (
                  <Link key={artist.id} href={`/artiste/${artist.slug}`}>
                    <Card className="hover:border-primary/50 transition-all group overflow-hidden">
                      <CardContent className="p-6 flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20 group-hover:border-primary transition-colors">
                          <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} />
                          <AvatarFallback>{artist.name.slice(0,1)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{artist.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{artist.bio}</p>
                          <Badge variant="outline" className="mt-2 text-[10px] uppercase">{artist.subscribers.toLocaleString()} abonnés</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {filteredStories.length === 0 && filteredArtists.length === 0 && (
            <div className="text-center py-24 border-2 border-dashed rounded-3xl">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h2 className="text-xl font-bold mb-2">Aucun résultat trouvé</h2>
              <p className="text-muted-foreground">Essayez avec d'autres mots-clés ou explorez nos genres populaires.</p>
              <Button variant="outline" className="mt-6" onClick={() => setSearchState('')}>Tout réinitialiser</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stories" className="animate-in fade-in duration-500">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredStories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="artists" className="animate-in fade-in duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map(artist => (
              <Link key={artist.id} href={`/artiste/${artist.slug}`}>
                <Card className="hover:border-primary/50 transition-all group">
                  <CardContent className="p-6 flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-primary/20 group-hover:border-primary transition-colors">
                      <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} />
                      <AvatarFallback>{artist.name.slice(0,1)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{artist.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{artist.bio}</p>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-[10px]">{artist.portfolio.length} séries</Badge>
                        <Badge variant="outline" className="text-[10px]">{artist.subscribers.toLocaleString()} fans</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <Suspense fallback={<div className="h-96 flex items-center justify-center">Initialisation du moteur de recherche...</div>}>
        <SearchResultsContent />
      </Suspense>
    </div>
  );
}
