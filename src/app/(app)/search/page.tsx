'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { type Story, type UserProfile } from '@/lib/types';
import { StoryCard } from '@/components/story-card';
import { Input } from '@/components/ui/input';
import { 
  Search, Users, BookOpen, X, Sparkles, Mic, MicOff, 
  Filter, MapPin, Languages, Clock, Hash, Globe, 
  ChevronDown, SlidersHorizontal, CheckCircle2, History,
  LayoutGrid, Star, Zap, Loader2, Waveform, AlertCircle
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
  const [interimTranscript, setInterimTranscript] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // --- FILTERS STATE ---
  const [filters, setFilters] = useState({
    country: 'Tous',
    language: 'Toutes',
    status: 'Tous',
    length: 'Toutes',
    theme: 'Tous'
  });

  // MULTI-FIELD FIRESTORE SEARCH FOR STORIES
  const { data: filteredStories = [], isLoading: loadingStories } = useQuery({
    queryKey: ['search-stories-firestore', searchTerm, filters.status],
    queryFn: async () => {
      const storiesRef = collection(db, 'stories');
      
      if (!searchTerm.trim()) {
        // Default: Show popular if no search
        const qDefault = query(storiesRef, where('isPublished', '==', true), limit(20));
        const snap = await getDocs(qDefault);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
      }

      // 1. Prefix query on Title (Case sensitive in Firestore)
      const qTitle = query(
        storiesRef,
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + ''),
        limit(20)
      );

      // 2. Exact match on Genre Slug
      const qGenre = query(
        storiesRef,
        where('genreSlug', '==', searchTerm.toLowerCase()),
        limit(20)
      );

      // 3. Array contains match on Tags
      const qTags = query(
        storiesRef,
        where('tags', 'array-contains', searchTerm.toLowerCase()),
        limit(20)
      );

      const [snapTitle, snapGenre, snapTags] = await Promise.all([
        getDocs(qTitle),
        getDocs(qGenre),
        getDocs(qTags)
      ]);

      // Merge and deduplicate results
      const resultMap = new Map<string, Story>();
      [...snapTitle.docs, ...snapGenre.docs, ...snapTags.docs].forEach(doc => {
        const data = { id: doc.id, ...doc.data() } as Story;
        // Client-side status filter since Firestore doesn't support OR between different fields easily
        if (filters.status === 'Tous' || data.status === filters.status) {
          resultMap.set(doc.id, data);
        }
      });

      return Array.from(resultMap.values());
    }
  });

  // ARTIST SEARCH
  const { data: filteredArtists = [], isLoading: loadingArtists } = useQuery({
    queryKey: ['search-artists-firestore', searchTerm],
    queryFn: async () => {
      const usersRef = collection(db, 'users');
      const baseQuery = query(usersRef, where('role', 'in', ['artist_draft', 'artist_pro']), limit(50));
      const snap = await getDocs(baseQuery);
      
      let results = snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
      
      if (searchTerm.trim()) {
        const lowerTerm = searchTerm.toLowerCase();
        results = results.filter(a => 
          a.displayName.toLowerCase().includes(lowerTerm) ||
          a.bio?.toLowerCase().includes(lowerTerm)
        );
      }
      return results;
    }
  });

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Recherche vocale non supportée",
        description: "Votre navigateur ne supporte pas l'API de reconnaissance vocale.",
        variant: "destructive"
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript('');
    };

    recognition.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          const finalResult = e.results[i][0].transcript;
          setSearchState(finalResult);
          router.push(`/search?q=${encodeURIComponent(finalResult)}`);
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (e: any) => {
      console.error(e);
      setIsListening(false);
      setInterimTranscript('');
      toast({ title: "Erreur de reconnaissance", variant: "destructive" });
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

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
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Nexus Search Engine v2.5</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none">
                  Les Archives <br/><span className="gold-resplendant">du Hub</span>
                </h1>
            </div>

            <div className="space-y-4">
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

              {isListening && interimTranscript && (
                <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <p className="text-sm text-primary font-medium italic text-left leading-tight line-clamp-2">
                      "{interimTranscript}..."
                    </p>
                  </div>
                </div>
              )}
            </div>

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
      </section>

      {/* 2. RESULTS & TABS */}
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-2">
            <div className="flex flex-col gap-4 w-full md:w-auto">
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
                
                {showFilters && (
                  <div className="animate-in slide-in-from-top-2 duration-300 p-6 bg-stone-900/50 border border-white/5 rounded-[2rem] space-y-6">
                    <div className="flex items-center gap-3 text-amber-500 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
                        Recherche avancée via Algolia disponible prochainement pour une expérience ultra-rapide et tolérante aux fautes.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-stone-500 ml-1">Statut</label>
                        <Select value={filters.status} onValueChange={(val) => setFilters({...filters, status: val})}>
                          <SelectTrigger className="h-10 bg-white/5 border-white/10 rounded-xl text-xs font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Tous">Tous les statuts</SelectItem>
                            <SelectItem value="En cours">En cours</SelectItem>
                            <SelectItem value="Terminé">Terminé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            <div className="flex bg-muted/50 p-1 rounded-2xl border border-border/50 h-12 w-full md:w-auto">
                <Button variant={activeTab === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('all')} className="rounded-xl flex-1 md:flex-none px-8 font-black text-[10px] uppercase tracking-widest">Tout</Button>
                <Button variant={activeTab === 'stories' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('stories')} className="rounded-xl flex-1 md:flex-none px-8 font-black text-[10px] uppercase tracking-widest gap-2"><BookOpen className="h-3.5 w-3.5" /> Œuvres</Button>
                <Button variant={activeTab === 'artists' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('artists')} className="rounded-xl flex-1 md:flex-none px-8 font-black text-[10px] uppercase tracking-widest gap-2"><Users className="h-3.5 w-3.5" /> Artistes</Button>
            </div>
        </div>

        <div className="min-h-[400px]">
          {loadingStories || loadingArtists ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-widest">Sondage des profondeurs...</p>
            </div>
          ) : (
            <div className="space-y-20 animate-in fade-in duration-700">
              {(activeTab === 'all' || activeTab === 'stories') && filteredStories.length > 0 && (
                <section className="space-y-10">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-xl"><BookOpen className="text-primary h-5 w-5" /></div>
                      <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Histoires Trouvées</h3>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase font-black border-white/10 text-stone-500 px-3">{filteredStories.length} résultats</Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {filteredStories.map(story => (
                      <StoryCard key={story.id} story={story} />
                    ))}
                  </div>
                </section>
              )}

              {(activeTab === 'all' || activeTab === 'artists') && filteredArtists.length > 0 && (
                <section className="space-y-10">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500/10 p-2 rounded-xl"><Users className="text-emerald-500 h-5 w-5" /></div>
                      <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Créateurs Associés</h3>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase font-black border-white/10 text-stone-500 px-3">{filteredArtists.length} artistes</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArtists.map(artist => (
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

              {filteredStories.length === 0 && filteredArtists.length === 0 && (
                <div className="text-center py-32 bg-stone-900/30 rounded-[3.5rem] border-2 border-dashed border-white/5">
                  <div className="bg-white/5 p-8 rounded-full w-fit mx-auto mb-8">
                      <Sparkles className="h-16 w-16 text-stone-700 animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-bold font-display text-white mb-2">Les sables sont restés muets...</h2>
                  <p className="text-stone-500 max-w-sm mx-auto mb-10 font-light italic">"Le voyageur qui ne pose pas de questions ne trouvera jamais son chemin." Essayez d'autres mots-clés ou vérifiez la casse.</p>
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
