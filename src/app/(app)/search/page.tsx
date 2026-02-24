'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { stories, artists, type Story, type UserProfile } from '@/lib/types';
import { StoryCard } from '@/components/story-card';
import { Input } from '@/components/ui/input';
import { 
  Search, Users, BookOpen, X, Sparkles, Mic, MicOff, 
  Filter, MapPin, Languages, Clock, Hash, Globe, 
  ChevronDown, SlidersHorizontal, CheckCircle2, History
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, where, limit } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchTerm, setSearchState] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all');
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // --- FILTERS STATE ---
  const [filters, setFilters] = useState({
    country: 'Tous',
    language: 'Toutes',
    status: 'Tous',
    length: 'Toutes',
    theme: 'Tous'
  });

  // Fetch all stories for local smart filtering (Simulation semantic)
  const { data: allStories = [], isLoading: loadingStories } = useQuery({
    queryKey: ['search-all-stories'],
    queryFn: async () => {
      const q = query(collection(db, 'stories'), limit(100));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
    }
  });

  // Fetch all artists
  const { data: allArtists = [], isLoading: loadingArtists } = useQuery({
    queryKey: ['search-all-artists'],
    queryFn: async () => {
      const q = query(collection(db, 'users'), where('role', 'in', ['artist_draft', 'artist_pro']), limit(50));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
    }
  });

  const filteredStories = useMemo(() => {
    let results = allStories;

    // Search term matching (Title, Description, Tags - "Semantic" simulation)
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      results = results.filter(s => 
        s.title.toLowerCase().includes(lowerTerm) ||
        s.description.toLowerCase().includes(lowerTerm) ||
        s.genre.toLowerCase().includes(lowerTerm) ||
        s.artistName?.toLowerCase().includes(lowerTerm) ||
        s.tags.some(t => t.toLowerCase().includes(lowerTerm))
      );
    }

    // Advanced Filters
    if (filters.status !== 'Tous') results = results.filter(s => s.status === filters.status);
    if (filters.country !== 'Tous') results = results.filter(s => s.region === filters.country);
    
    return results;
  }, [searchTerm, allStories, filters]);

  const filteredArtists = useMemo(() => {
    if (!searchTerm.trim()) return allArtists;
    const lowerTerm = searchTerm.toLowerCase();
    return allArtists.filter(a => 
      a.displayName.toLowerCase().includes(lowerTerm) ||
      a.bio?.toLowerCase().includes(lowerTerm)
    );
  }, [searchTerm, allArtists]);

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({ 
        title: "Recherche vocale non supportée", 
        description: "Votre navigateur ne supporte pas la reconnaissance vocale.",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast({ title: "NexusHub à l'écoute...", description: "Parlez maintenant pour chercher une œuvre." });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchState(transcript);
      router.push(`/search?q=${encodeURIComponent(transcript)}`);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({ title: "Erreur vocale", description: "Désolé, je n'ai pas pu comprendre votre demande.", variant: "destructive" });
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

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
      {/* 1. HERO SEARCH WITH VOICE */}
      <section className="relative py-12 px-6 rounded-[2.5rem] bg-stone-950 border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10 space-y-8">
            <div className="space-y-2">
                <Badge variant="outline" className="border-primary/20 text-primary uppercase tracking-[0.3em] font-black text-[9px] px-4">Système de Recherche Intelligent</Badge>
                <h1 className="text-3xl md:text-5xl font-bold font-display text-white gold-resplendant">Découvrez votre prochain coup de cœur</h1>
            </div>

            <form onSubmit={handleSearch} className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary h-6 w-6 pointer-events-none group-focus-within:scale-110 transition-transform">
                    <Search className="h-6 w-6" />
                </div>
                <Input 
                    value={searchTerm}
                    onChange={(e) => setSearchState(e.target.value)}
                    placeholder="Titre, thèmes (ex: aventure savane), auteur..."
                    className="h-16 pl-14 pr-28 text-xl rounded-full border-white/10 focus:border-primary shadow-2xl bg-white/5 backdrop-blur-xl text-white font-light placeholder:text-stone-600 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {searchTerm && (
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {setSearchState(''); router.push('/search')}}
                            className="text-stone-500 hover:text-white rounded-full"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                    <Button 
                        type="button" 
                        onClick={handleVoiceSearch}
                        className={cn(
                            "h-11 w-11 rounded-full shadow-lg transition-all",
                            isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-primary text-black hover:bg-primary/90"
                        )}
                    >
                        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                </div>
            </form>

            <div className="flex flex-wrap justify-center gap-2">
                <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest self-center mr-2">Tendances Africaines :</span>
                {['Mythologie', 'Afrofuturisme', 'Action', 'Cyberpunk', 'Empire Mandingue'].map(tag => (
                    <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="px-4 py-1.5 cursor-pointer bg-white/5 text-stone-300 hover:bg-primary hover:text-black transition-all rounded-full border border-white/5 font-bold text-[10px]"
                        onClick={() => handleQuickFilter(tag)}
                    >
                        #{tag}
                    </Badge>
                ))}
            </div>
        </div>
      </section>

      {/* 2. ADVANCED FILTERS PANEL */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
                <Button 
                    onClick={() => setShowFilters(!showFilters)}
                    variant="outline" 
                    className={cn(
                        "rounded-full gap-2 border-primary/20 text-xs font-black uppercase tracking-widest h-10 px-6",
                        showFilters && "bg-primary text-black"
                    )}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    {showFilters ? 'Masquer Filtres' : 'Filtres Avancés'}
                </Button>
                <div className="h-8 w-px bg-border/50 hidden md:block" />
                <p className="text-muted-foreground text-xs font-medium">
                    {filteredStories.length} œuvres trouvées
                </p>
            </div>

            <div className="flex bg-muted/50 p-1 rounded-2xl border border-border/50">
                <Button 
                    variant={activeTab === 'all' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setActiveTab('all')}
                    className="rounded-xl h-9 text-[10px] font-black uppercase tracking-tighter"
                >
                    Tout
                </Button>
                <Button 
                    variant={activeTab === 'stories' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setActiveTab('stories')}
                    className="rounded-xl h-9 gap-2 text-[10px] font-black uppercase tracking-tighter"
                >
                    <BookOpen className="h-3.5 w-3.5" /> Œuvres
                </Button>
                <Button 
                    variant={activeTab === 'artists' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setActiveTab('artists')}
                    className="rounded-xl h-9 gap-2 text-[10px] font-black uppercase tracking-tighter"
                >
                    <Users className="h-3.5 w-3.5" /> Créateurs
                </Button>
            </div>
        </div>

        {showFilters && (
            <Card className="border-primary/10 bg-muted/20 animate-in slide-in-from-top-4 duration-500">
                <CardContent className="p-6 grid grid-cols-2 md:grid-cols-5 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Pays d'origine</Label>
                        <Select value={filters.country} onValueChange={(val) => setFilters({...filters, country: val})}>
                            <SelectTrigger className="h-9 rounded-xl bg-background border-none shadow-sm text-xs font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Tous">Tous</SelectItem>
                                <SelectItem value="Gabon">Gabon 🇬🇦</SelectItem>
                                <SelectItem value="Sénégal">Sénégal 🇸🇳</SelectItem>
                                <SelectItem value="Nigeria">Nigeria 🇳🇬</SelectItem>
                                <SelectItem value="Côte d'Ivoire">C. d'Ivoire 🇨🇮</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1.5"><Languages className="h-3 w-3" /> Langue</Label>
                        <Select value={filters.language} onValueChange={(val) => setFilters({...filters, language: val})}>
                            <SelectTrigger className="h-9 rounded-xl bg-background border-none shadow-sm text-xs font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Toutes">Toutes</SelectItem>
                                <SelectItem value="Français">Français</SelectItem>
                                <SelectItem value="Swahili">Swahili</SelectItem>
                                <SelectItem value="Wolof">Wolof</SelectItem>
                                <SelectItem value="Yoruba">Yoruba</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1.5"><History className="h-3 w-3" /> Statut</Label>
                        <Select value={filters.status} onValueChange={(val) => setFilters({...filters, status: val})}>
                            <SelectTrigger className="h-9 rounded-xl bg-background border-none shadow-sm text-xs font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Tous">Tous</SelectItem>
                                <SelectItem value="En cours">En cours</SelectItem>
                                <SelectItem value="Terminé">Terminé</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" /> Longueur</Label>
                        <Select value={filters.length} onValueChange={(val) => setFilters({...filters, length: val})}>
                            <SelectTrigger className="h-9 rounded-xl bg-background border-none shadow-sm text-xs font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Toutes">Toutes</SelectItem>
                                <SelectItem value="One-Shot">One-Shot</SelectItem>
                                <SelectItem value="Courte (1-10)">Courte</SelectItem>
                                <SelectItem value="Moyenne (10-50)">Moyenne</SelectItem>
                                <SelectItem value="Épique (50+)">Épique</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1.5"><Hash className="h-3 w-3" /> Thème</Label>
                        <Select value={filters.theme} onValueChange={(val) => setFilters({...filters, theme: val})}>
                            <SelectTrigger className="h-9 rounded-xl bg-background border-none shadow-sm text-xs font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Tous">Tous</SelectItem>
                                <SelectItem value="Mythologie">Mythologie</SelectItem>
                                <SelectItem value="Action">Action</SelectItem>
                                <SelectItem value="Romance">Romance</SelectItem>
                                <SelectItem value="Histoire">Histoire</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        )}
      </div>

      {/* 3. RESULTS DISPLAY */}
      <div className="min-h-[400px]">
        {activeTab === 'all' && (
          <div className="space-y-16 animate-in fade-in duration-500">
            {filteredStories.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg"><BookOpen className="text-primary h-5 w-5" /></div>
                    <h3 className="text-2xl font-display font-black">Œuvres</h3>
                  </div>
                  <Button variant="link" onClick={() => setActiveTab('stories')} className="text-primary font-bold text-xs uppercase tracking-widest">Voir tout ({filteredStories.length})</Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {filteredStories.slice(0, 5).map(story => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              </section>
            )}

            {filteredArtists.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg"><Users className="text-emerald-500 h-5 w-5" /></div>
                    <h3 className="text-2xl font-display font-black">Créateurs</h3>
                  </div>
                  <Button variant="link" onClick={() => setActiveTab('artists')} className="text-emerald-500 font-bold text-xs uppercase tracking-widest">Voir tout ({filteredArtists.length})</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArtists.slice(0, 6).map(artist => (
                    <Link key={artist.uid} href={`/artiste/${artist.slug}`}>
                      <Card className="hover:border-primary/50 transition-all group overflow-hidden bg-muted/20 border-none rounded-2xl">
                        <CardContent className="p-6 flex items-center gap-4">
                          <Avatar className="h-16 w-16 border-2 border-primary/20 group-hover:border-primary transition-colors">
                            <AvatarImage src={artist.photoURL} alt={artist.displayName} />
                            <AvatarFallback className="bg-primary/5 text-primary font-bold">{artist.displayName.slice(0,1)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate font-display">{artist.displayName}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-2 font-light italic">{artist.bio || "Explorateur de récits."}</p>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[8px] uppercase font-black border-stone-700">{artist.subscribersCount.toLocaleString()} fans</Badge>
                                {artist.role?.includes('pro') && <Badge className="bg-emerald-500 text-white border-none text-[8px] h-4 font-black">PRO</Badge>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {filteredStories.length === 0 && filteredArtists.length === 0 && !loadingStories && (
              <div className="text-center py-32 bg-muted/10 rounded-[3rem] border-2 border-dashed border-border/50">
                <div className="bg-muted p-6 rounded-full w-fit mx-auto mb-6">
                    <Sparkles className="h-12 w-12 text-muted-foreground opacity-20" />
                </div>
                <h2 className="text-2xl font-bold font-display mb-2">Les sables sont restés muets...</h2>
                <p className="text-muted-foreground max-w-sm mx-auto mb-8 font-light italic">Essayez d'autres mots-clés ou utilisez la recherche vocale pour explorer le Hub.</p>
                <Button 
                    variant="outline" 
                    className="rounded-full px-10 h-12 border-primary text-primary hover:bg-primary hover:text-black font-black" 
                    onClick={() => {setSearchState(''); router.push('/search')}}
                >
                    Réinitialiser tout
                </Button>
              </div>
            )}
          </div>
        )}

        {(activeTab === 'stories' || activeTab === 'artists') && (
            <div className="animate-in fade-in duration-500">
                {activeTab === 'stories' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {filteredStories.map(story => <StoryCard key={story.id} story={story} />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArtists.map(artist => (
                            <Link key={artist.uid} href={`/artiste/${artist.slug}`}>
                                <Card className="hover:border-primary/50 transition-all group bg-muted/20 border-none rounded-2xl">
                                    <CardContent className="p-6 flex items-center gap-4">
                                        <Avatar className="h-20 w-20 border-2 border-primary/20 group-hover:border-primary transition-colors">
                                            <AvatarImage src={artist.photoURL} alt={artist.displayName} />
                                            <AvatarFallback>{artist.displayName.slice(0,1)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-xl group-hover:text-primary transition-colors truncate font-display">{artist.displayName}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 font-light italic">{artist.bio}</p>
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="text-[8px] uppercase font-black">{artist.subscribersCount.toLocaleString()} fans</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}

// #region Helper UI
function Label({ children, className }: any) {
    return <label className={cn("text-xs font-bold text-foreground", className)}>{children}</label>;
}

const Select = ({ value, onValueChange, children }: any) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between h-9 text-xs font-bold rounded-xl border-border/50 bg-background/50 hover:bg-muted">
                    {value} <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 rounded-xl p-1 border-primary/10 shadow-2xl">
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const SelectContent = ({ children }: any) => <>{children}</>;
const SelectItem = ({ value, children, onClick }: any) => (
    <DropdownMenuItem className="rounded-lg h-9 text-xs font-medium cursor-pointer" onClick={() => (window as any)._onValChange(value)}>
        {children}
    </DropdownMenuItem>
);
const SelectTrigger = ({ children, className }: any) => <div className={className}>{children}</div>;
const SelectValue = ({ children }: any) => <>{children}</>;
// #endregion

export default function SearchPage() {
  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <Suspense fallback={
        <div className="h-96 flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground font-display font-bold animate-pulse uppercase tracking-widest text-[10px]">Ouverture des archives Nexus...</p>
        </div>
      }>
        <SearchResultsContent />
      </Suspense>
    </div>
  );
}
