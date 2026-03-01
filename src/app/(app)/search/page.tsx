'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { type Story, type UserProfile } from '@/lib/types';
import { StoryCard } from '@/components/story-card';
import { Input } from '@/components/ui/input';
import { 
  Search, Users, BookOpen, X, Sparkles, Mic, MicOff, 
  Filter, MapPin, Languages, Clock, Hash, Globe, 
  ChevronDown, SlidersHorizontal, CheckCircle2, History,
  LayoutGrid, Star, Zap
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

  const { data: allStories = [], isLoading: loadingStories } = useQuery({
    queryKey: ['search-all-stories'],
    queryFn: async () => {
      const q = query(collection(db, 'stories'), limit(100));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
    }
  });

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
    if (filters.status !== 'Tous') results = results.filter(s => s.status === filters.status);
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
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setSearchState(transcript);
      router.push(`/search?q=${encodeURIComponent(transcript)}`);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="space-y-16">
      {/* 1. NEXUS ARCHIVES HEADER */}
      <section className="relative p-12 rounded-[3rem] bg-stone-950 border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="max-w-3xl mx-auto text-center relative z-10 space-y-10">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
                  <Search className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Nexus Search Engine v2.0</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none">
                  Les Archives <br/><span className="gold-resplendant">du Hub</span>
                </h1>
            </div>

            <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-600 h-6 w-6 pointer-events-none group-focus-within:text-primary transition-all">
                    <Search className="h-6 w-6" />
                </div>
                <Input 
                    value={searchTerm}
                    onChange={(e) => setSearchState(e.target.value)}
                    placeholder="Titre, auteur, mythologie..."
                    className="h-16 pl-16 pr-28 text-xl rounded-full border-white/10 focus:border-primary shadow-2xl bg-white/5 backdrop-blur-xl text-white font-light placeholder:text-stone-700 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Button 
                        type="button" 
                        onClick={handleVoiceSearch}
                        className={cn(
                            "h-11 w-11 rounded-full shadow-lg transition-all",
                            isListening ? "bg-rose-600 animate-pulse" : "bg-primary text-black hover:bg-primary/90"
                        )}
                    >
                        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                </div>
            </form>

            <div className="flex flex-wrap justify-center gap-3">
                {['Mythologie', 'Action', 'Afrofuturisme', 'Romance', 'Elite'].map(tag => (
                    <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="px-5 py-2 cursor-pointer bg-white/5 text-stone-400 hover:bg-primary hover:text-black transition-all rounded-full border border-white/5 font-bold text-[10px] uppercase tracking-widest"
                        onClick={() => { setSearchState(tag); router.push(`/search?q=${tag}`) }}
                    >
                        #{tag}
                    </Badge>
                ))}
            </div>
        </div>
      </header>

      {/* 2. RESULTS & TABS */}
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-2">
            <div className="flex items-center gap-4">
                <Button 
                    onClick={() => setShowFilters(!showFilters)}
                    variant="outline" 
                    className={cn(
                        "rounded-full gap-3 border-white/10 text-[10px] font-black uppercase tracking-[0.2em] h-12 px-8",
                        showFilters && "bg-primary text-black"
                    )}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    {showFilters ? 'Fermer Filtres' : 'Affiner la quête'}
                </Button>
                <div className="hidden sm:block text-[10px] uppercase font-black text-stone-600 tracking-widest">
                  {filteredStories.length + filteredArtists.length} découvertes
                </div>
            </div>

            <div className="flex bg-muted/50 p-1 rounded-2xl border border-border/50 h-12 w-full md:w-auto">
                <Button variant={activeTab === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('all')} className="rounded-xl flex-1 md:flex-none px-8 font-black text-[10px] uppercase tracking-widest">Tout</Button>
                <Button variant={activeTab === 'stories' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('stories')} className="rounded-xl flex-1 md:flex-none px-8 font-black text-[10px] uppercase tracking-widest gap-2"><BookOpen className="h-3.5 w-3.5" /> Œuvres</Button>
                <Button variant={activeTab === 'artists' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('artists')} className="rounded-xl flex-1 md:flex-none px-8 font-black text-[10px] uppercase tracking-widest gap-2"><Users className="h-3.5 w-3.5" /> Artistes</Button>
            </div>
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'all' && (
            <div className="space-y-20 animate-in fade-in duration-700">
              {filteredStories.length > 0 && (
                <section className="space-y-10">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-xl"><BookOpen className="text-primary h-5 w-5" /></div>
                      <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Histoires Trouvées</h3>
                    </div>
                    <Button variant="link" onClick={() => setActiveTab('stories')} className="text-primary font-black text-[10px] uppercase tracking-widest">Voir tout ({filteredStories.length})</Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {filteredStories.slice(0, 5).map(story => (
                      <StoryCard key={story.id} story={story} />
                    ))}
                  </div>
                </section>
              )}

              {filteredArtists.length > 0 && (
                <section className="space-y-10">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500/10 p-2 rounded-xl"><Users className="text-emerald-500 h-5 w-5" /></div>
                      <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Créateurs Associés</h3>
                    </div>
                    <Button variant="link" onClick={() => setActiveTab('artists')} className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">Voir tout ({filteredArtists.length})</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArtists.slice(0, 6).map(artist => (
                      <Link key={artist.uid} href={`/artiste/${artist.slug}`}>
                        <Card className="hover:border-primary/30 transition-all group overflow-hidden bg-white/[0.02] border-white/5 rounded-[2rem] p-6">
                          <div className="flex items-center gap-5">
                            <Avatar className="h-20 w-20 border-4 border-white/5 group-hover:ring-4 ring-primary/20 transition-all shadow-xl">
                              <AvatarImage src={artist.photoURL} alt={artist.displayName} />
                              <AvatarFallback className="bg-primary/5 text-primary font-bold text-xl">{artist.displayName.slice(0,1)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-xl group-hover:text-primary transition-colors truncate font-display text-white">{artist.displayName}</h3>
                              <p className="text-xs text-stone-500 line-clamp-1 mb-3 font-light italic">"{artist.bio || "Explorateur de récits."}"</p>
                              <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[8px] uppercase font-black border-white/10 text-stone-400 px-2 py-0.5">{artist.subscribersCount.toLocaleString()} fans</Badge>
                                  {artist.role?.includes('pro') && <Badge className="bg-emerald-500 text-white border-none text-[8px] h-4 font-black px-2 py-0.5">PRO</Badge>}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {filteredStories.length === 0 && filteredArtists.length === 0 && !loadingStories && (
                <div className="text-center py-32 bg-stone-900/30 rounded-[3.5rem] border-2 border-dashed border-white/5">
                  <div className="bg-white/5 p-8 rounded-full w-fit mx-auto mb-8">
                      <Sparkles className="h-16 w-16 text-stone-700 animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-bold font-display text-white mb-2">Les sables sont restés muets...</h2>
                  <p className="text-stone-500 max-w-sm mx-auto mb-10 font-light italic">"Le voyageur qui ne pose pas de questions ne trouvera jamais son chemin." Essayez d'autres mots-clés.</p>
                  <Button 
                      variant="outline" 
                      className="rounded-full px-12 h-14 border-primary text-primary hover:bg-primary hover:text-black font-black uppercase text-xs tracking-widest" 
                      onClick={() => {setSearchState(''); router.push('/search')}}
                  >
                      Réinitialiser la Quête
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MicOff(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>;
}

function Label({ children, className }: any) {
    return <label className={cn("text-[9px] font-black uppercase tracking-widest text-stone-500", className)}>{children}</label>;
}

export default function SearchPage() {
  return (
    <div className="container max-w-7xl mx-auto px-6 py-12">
      <Suspense fallback={
        <div className="h-96 flex flex-col items-center justify-center gap-6">
            <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(212,168,67,0.3)]" />
            <p className="text-stone-500 font-display font-black animate-pulse uppercase tracking-[0.3em] text-[10px]">Consultation des archives Nexus...</p>
        </div>
      }>
        <SearchResultsContent />
      </Suspense>
    </div>
  );
}
