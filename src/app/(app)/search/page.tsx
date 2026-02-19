'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { stories, artists, type Story, type Artist } from '@/lib/data';
import { StoryCard } from '@/components/story-card';
import { Input } from '@/components/ui/input';
import { Search, Users, BookOpen, X, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [searchTerm, setSearchState] = useState(query);
  const [activeTab, setActiveTab] = useState('all');

  // Logic for filtering based on title and summary (description)
  const filteredStories = useMemo(() => {
    if (!searchTerm.trim()) return stories;
    const lowerTerm = searchTerm.toLowerCase();
    return stories.filter(s => 
      s.title.toLowerCase().includes(lowerTerm) ||
      s.description.toLowerCase().includes(lowerTerm) || // Filtering by summary
      s.genre.toLowerCase().includes(lowerTerm) ||
      s.artistName?.toLowerCase().includes(lowerTerm) ||
      s.tags.some(t => t.toLowerCase().includes(lowerTerm))
    );
  }, [searchTerm]);

  const filteredArtists = useMemo(() => {
    if (!searchTerm.trim()) return artists;
    const lowerTerm = searchTerm.toLowerCase();
    return artists.filter(a => 
      a.name.toLowerCase().includes(lowerTerm) ||
      a.bio.toLowerCase().includes(lowerTerm)
    );
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleQuickFilter = (tag: string) => {
    setSearchState(tag);
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="space-y-10">
      {/* Search Header */}
      <section className="relative py-12 px-6 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-accent/5 border border-primary/10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold font-display mb-8">Que souhaitez-vous lire aujourd'hui ?</h1>
            <form onSubmit={handleSearch} className="relative mb-8">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary h-6 w-6" />
                <Input 
                value={searchTerm}
                onChange={(e) => setSearchState(e.target.value)}
                placeholder="Titre, résumé, auteur, genre..."
                className="h-16 pl-14 pr-12 text-xl rounded-full border-2 border-primary/20 focus:border-primary shadow-2xl bg-card/80 backdrop-blur-xl"
                />
                {searchTerm && (
                <button 
                    type="button" 
                    onClick={() => {setSearchState(''); router.push('/search')}}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
                )}
            </form>
            <div className="flex flex-wrap justify-center gap-3">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest self-center mr-2">Populaire :</span>
                {['Mythologie', 'Afrofuturisme', 'Action', 'Cyberpunk'].map(tag => (
                    <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="px-4 py-1.5 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all rounded-full border border-primary/10"
                        onClick={() => handleQuickFilter(tag)}
                    >
                        #{tag}
                    </Badge>
                ))}
            </div>
        </div>
      </section>

      {/* Results Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-border/50 pb-8">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold">
            {searchTerm ? (
                <>Résultats pour <span className="text-primary">"{searchTerm}"</span></>
            ) : (
                <>Découvrir tout le catalogue</>
            )}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {filteredStories.length} œuvres et {filteredArtists.length} artistes correspondent à votre recherche.
          </p>
        </div>
        
        <div className="flex bg-muted p-1 rounded-xl">
            <Button 
                variant={activeTab === 'all' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('all')}
                className="rounded-lg h-9"
            >
                Tout
            </Button>
            <Button 
                variant={activeTab === 'stories' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('stories')}
                className="rounded-lg h-9 gap-2"
            >
                <BookOpen className="h-4 w-4" /> Œuvres
            </Button>
            <Button 
                variant={activeTab === 'artists' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('artists')}
                className="rounded-lg h-9 gap-2"
            >
                <Users className="h-4 w-4" /> Artistes
            </Button>
        </div>
      </div>

      {/* Results Display */}
      <div className="min-h-[400px]">
        {activeTab === 'all' && (
          <div className="space-y-16 animate-in fade-in duration-500">
            {filteredStories.length > 0 ? (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg"><BookOpen className="text-primary h-5 w-5" /></div>
                    <h3 className="text-2xl font-display font-bold">Œuvres</h3>
                  </div>
                  <Button variant="link" onClick={() => setActiveTab('stories')} className="text-primary font-bold">Voir tout ({filteredStories.length})</Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {filteredStories.slice(0, 5).map(story => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              </section>
            ) : null}

            {filteredArtists.length > 0 ? (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg"><Users className="text-emerald-500 h-5 w-5" /></div>
                    <h3 className="text-2xl font-display font-bold">Créateurs</h3>
                  </div>
                  <Button variant="link" onClick={() => setActiveTab('artists')} className="text-emerald-500 font-bold">Voir tout ({filteredArtists.length})</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArtists.slice(0, 6).map(artist => (
                    <Link key={artist.id} href={`/artiste/${artist.slug}`}>
                      <Card className="hover:border-primary/50 transition-all group overflow-hidden bg-muted/20 border-none">
                        <CardContent className="p-6 flex items-center gap-4">
                          <Avatar className="h-16 w-16 border-2 border-primary/20 group-hover:border-primary transition-colors">
                            <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} />
                            <AvatarFallback>{artist.name.slice(0,1)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">{artist.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{artist.bio}</p>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] uppercase">{artist.subscribers.toLocaleString()} fans</Badge>
                                {artist.isMentor && <Badge className="bg-emerald-500 text-white border-none text-[10px]">PRO</Badge>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {filteredStories.length === 0 && filteredArtists.length === 0 && (
              <div className="text-center py-32 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
                <div className="bg-muted p-6 rounded-full w-fit mx-auto mb-6">
                    <Sparkles className="h-12 w-12 text-muted-foreground opacity-40" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Pas de chance, nous n'avons rien trouvé !</h2>
                <p className="text-muted-foreground max-w-sm mx-auto mb-8">Essayez avec d'autres mots-clés ou explorez nos genres populaires ci-dessus.</p>
                <Button variant="outline" className="rounded-full px-8" onClick={() => {setSearchState(''); router.push('/search')}}>
                    Réinitialiser la recherche
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stories' && (
          <div className="animate-in fade-in duration-500">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredStories.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
            {filteredStories.length === 0 && (
                <p className="text-center py-20 text-muted-foreground">Aucune œuvre trouvée pour cette recherche.</p>
            )}
          </div>
        )}

        {activeTab === 'artists' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {filteredArtists.map(artist => (
              <Link key={artist.id} href={`/artiste/${artist.slug}`}>
                <Card className="hover:border-primary/50 transition-all group bg-muted/20 border-none">
                  <CardContent className="p-6 flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-primary/20 group-hover:border-primary transition-colors">
                      <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} />
                      <AvatarFallback>{artist.name.slice(0,1)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl group-hover:text-primary transition-colors truncate">{artist.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{artist.bio}</p>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-[10px]">{artist.portfolio.length} séries</Badge>
                        <Badge variant="outline" className="text-[10px]">{artist.subscribers.toLocaleString()} fans</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {filteredArtists.length === 0 && (
                <p className="text-center col-span-full py-20 text-muted-foreground">Aucun artiste trouvé pour cette recherche.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <Suspense fallback={
        <div className="h-96 flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground font-display font-bold animate-pulse">Initialisation du moteur de recherche...</p>
        </div>
      }>
        <SearchResultsContent />
      </Suspense>
    </div>
  );
}
