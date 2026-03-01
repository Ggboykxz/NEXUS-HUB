'use client';

import { use, useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StoryCard } from '@/components/story-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, BookOpen, Sparkles, Flame, Trophy, ShieldCheck, 
  MessageSquare, Settings as SettingsIcon, Share2, Plus, 
  History, Zap, Lock, EyeOff, Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy, documentId } from 'firebase/firestore';
import type { UserProfile, Story, LibraryEntry } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function ReaderProfilePage(props: { params: Promise<{ readerId: string }> }) {
  const params = use(props.params);
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMe, setIsMe] = useState(false);
  const [libraryEntries, setLibraryEntries] = useState<LibraryEntry[]>([]);
  const [displayStories, setDisplayStories] = useState<(Story & { progress?: number })[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  useEffect(() => {
    async function fetchProfileAndLibrary() {
      try {
        const docRef = doc(db, 'users', params.readerId);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
          const userData = snap.data() as UserProfile;
          setProfile(userData);
          
          // Vérification si c'est mon propre profil
          onAuthStateChanged(auth, (user) => {
            setIsMe(user?.uid === params.readerId);
          });

          // Fetch Library si publique ou si c'est mon profil
          const canSeeLibrary = userData.preferences?.privacy?.showHistory || (auth.currentUser?.uid === params.readerId);
          
          if (canSeeLibrary) {
            setLoadingLibrary(true);
            const libRef = collection(db, 'users', params.readerId, 'library');
            const qLib = query(libRef, orderBy('lastReadAt', 'desc'), limit(10));
            const libSnap = await getDocs(qLib);
            
            const entries = libSnap.docs.map(d => d.data() as LibraryEntry);
            setLibraryEntries(entries);

            if (entries.length > 0) {
              const storyIds = entries.map(e => e.storyId);
              // Batch fetch stories (Firestore limit is 30 for 'in' queries, we take 10 here)
              const storiesRef = collection(db, 'stories');
              const qStories = query(storiesRef, where(documentId(), 'in', storyIds.slice(0, 10)));
              const storiesSnap = await getDocs(qStories);
              
              const fetchedStories = storiesSnap.docs.map(d => {
                const storyData = { id: d.id, ...d.data() } as Story;
                const entry = entries.find(e => e.storyId === d.id);
                return { ...storyData, progress: entry?.progress || 0 };
              });

              // Trier les stories pour qu'elles correspondent à l'ordre de l'historique
              const sortedStories = fetchedStories.sort((a, b) => {
                const indexA = storyIds.indexOf(a.id);
                const indexB = storyIds.indexOf(b.id);
                return indexA - indexB;
              });

              setDisplayStories(sortedStories);
            }
            setLoadingLibrary(false);
          }
        }
      } catch (e) {
        console.error("Error loading profile data:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProfileAndLibrary();
  }, [params.readerId]);

  const handleFollow = () => {
    if (!auth.currentUser) {
      toast({ title: "Connexion requise", description: "Veuillez vous connecter pour suivre ce lecteur.", variant: "destructive" });
      return;
    }
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Abonnement retiré" : "Nouvel abonnement !",
      description: isFollowing ? `Vous ne suivez plus ${profile?.displayName}.` : `Vous suivez désormais les aventures de ${profile?.displayName}.`,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-[0.3em]">Ouverture des archives...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-32 text-center space-y-6">
        <div className="bg-white/5 p-6 rounded-full w-fit mx-auto border border-white/10">
          <EyeOff className="h-12 w-12 text-stone-700" />
        </div>
        <h2 className="text-3xl font-display font-black text-white">Profil Introuvable</h2>
        <p className="text-stone-500 italic max-w-sm mx-auto">"Ce voyageur semble avoir disparu dans les sables du temps."</p>
        <Button asChild variant="outline" className="rounded-full border-primary text-primary">
          <Link href="/">Retour à l'accueil</Link>
        </Button>
      </div>
    );
  }

  const isLibraryPublic = profile.preferences?.privacy?.showHistory || isMe;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 1. HERO HEADER DU PROFIL */}
      <header className="relative py-16 bg-stone-950 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="container max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="relative group">
              <Avatar className="h-40 w-40 border-4 border-background ring-4 ring-primary shadow-[0_0_50px_rgba(212,168,67,0.3)] transition-transform duration-700 group-hover:scale-105">
                <AvatarImage src={profile.photoURL} alt={profile.displayName} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-4xl font-black">{profile.displayName.slice(0, 2)}</AvatarFallback>
              </Avatar>
              {profile.isCertified && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2.5 rounded-full border-4 border-stone-950 shadow-2xl animate-bounce">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter">{profile.displayName}</h1>
                  <Badge variant="secondary" className="bg-white/5 text-stone-400 border-white/10 uppercase text-[9px] font-black tracking-widest px-3">
                    {profile.role === 'reader' ? 'Lecteur Légendaire' : 'Artiste Créateur'}
                  </Badge>
                </div>
                <p className="text-stone-400 font-light italic text-lg leading-relaxed max-w-xl">
                  "{profile.bio || "Le voyageur qui ne pose pas de questions ne trouvera jamais son chemin."}"
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-stone-500 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5"><Users className="h-4 w-4 text-primary" /> {profile.subscribersCount} abonnés</span>
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5"><BookOpen className="h-4 w-4 text-emerald-500" /> {profile.readingStats?.chaptersRead || 0} chapitres lus</span>
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5"><Flame className="h-4 w-4 text-orange-500" /> {profile.readingStreak?.currentCount || 0}j de streak</span>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                {isMe ? (
                  <Button asChild size="lg" className="rounded-full px-8 font-black bg-primary text-black gold-shimmer h-14 shadow-xl shadow-primary/20">
                    <Link href="/settings"><SettingsIcon className="mr-2 h-5 w-5" /> Éditer mon Profil</Link>
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleFollow}
                      variant={isFollowing ? 'secondary' : 'default'} 
                      size="lg"
                      className={cn("rounded-full px-10 font-black h-14 transition-all", isFollowing ? "bg-white/5 text-white" : "bg-primary text-black gold-shimmer shadow-xl shadow-primary/20")}
                    >
                      {isFollowing ? 'Abonné' : 'Suivre'}
                    </Button>
                    <Button variant="outline" size="lg" className="h-14 w-14 rounded-full border-white/10 text-white hover:bg-white/5">
                      <MessageSquare className="h-6 w-6" />
                    </Button>
                    <Button variant="outline" size="lg" className="h-14 w-14 rounded-full border-white/10 text-white hover:bg-white/5">
                      <Share2 className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. CONTENU PRINCIPAL PAR ONGLETS */}
      <main className="container max-w-6xl mx-auto px-6 py-12">
        <Tabs defaultValue="library" className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-14 border border-border/50 max-w-2xl w-full">
              <TabsTrigger value="library" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                <BookOpen className="h-4 w-4" /> Vitrine
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                <History className="h-4 w-4" /> Activité
              </TabsTrigger>
              <TabsTrigger value="stats" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                <Zap className="h-4 w-4" /> Talent
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="library" className="space-y-12 animate-in fade-in duration-700">
            {/* EN DIRECT - Si activé dans les préférences */}
            {profile.preferences?.privacy?.showCurrentReading && libraryEntries[0] && (
              <section className="bg-primary/[0.03] border border-primary/10 rounded-[3rem] p-10 relative overflow-hidden group shadow-xl">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000"><History className="h-48 w-48 text-primary" /></div>
                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                  <div className="text-center md:text-left space-y-3">
                    <Badge className="bg-primary text-black animate-pulse uppercase tracking-[0.2em] font-black text-[8px] px-4 py-1">LIT ACTUELLEMENT</Badge>
                    <h3 className="text-3xl font-display font-black text-white">L'immersion continue</h3>
                    <p className="text-stone-500 text-sm italic font-light max-w-xs">"Découvrez la série qui passionne {profile.displayName} en ce moment."</p>
                  </div>
                  <div className="flex-1 flex justify-center md:justify-end">
                    <Link href={`/read/${libraryEntries[0].storyId}`} className="group/card">
                      <div className="bg-stone-900 border border-white/5 p-5 rounded-[2.5rem] flex items-center gap-6 hover:border-primary/30 transition-all shadow-2xl backdrop-blur-md">
                        <div className="relative h-28 w-20 rounded-2xl overflow-hidden shadow-lg shrink-0 border border-white/5">
                          <Image src={libraryEntries[0].storyCover} alt="Current" fill className="object-cover group-hover/card:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="min-w-0 space-y-2">
                          <h4 className="font-bold text-lg text-white group-hover/card:text-primary transition-colors truncate max-w-[180px]">{libraryEntries[0].storyTitle}</h4>
                          <p className="text-[10px] text-stone-500 uppercase font-black tracking-widest">Épisode {libraryEntries[0].lastReadChapterTitle}</p>
                          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${libraryEntries[0].progress}%` }} />
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="rounded-full text-primary h-12 w-12 bg-primary/10 group-hover/card:scale-110 transition-transform"><ArrowRight className="h-6 w-6" /></Button>
                      </div>
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* BIBLIOTHÈQUE PARTAGÉE */}
            <section className="space-y-10">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-2xl font-display font-black flex items-center gap-3 text-white uppercase tracking-tighter">
                  <Heart className="h-6 w-6 text-rose-500 fill-rose-500" /> Coups de Cœur
                </h3>
                {isMe && <Link href="/library" className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline">Gérer ma bibliothèque ({libraryEntries.length})</Link>}
              </div>

              {!isLibraryPublic ? (
                <div className="text-center py-24 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center gap-4">
                  <Lock className="h-12 w-12 text-stone-700 opacity-20" />
                  <p className="text-stone-500 italic font-light">"Ce voyageur garde ses récits secrets. Seuls les initiés peuvent voir sa bibliothèque."</p>
                </div>
              ) : loadingLibrary ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-stone-900 animate-pulse rounded-2xl border border-white/5" />
                  ))}
                </div>
              ) : displayStories.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
                  {displayStories.map(story => (
                    <StoryCard key={story.id} story={story} progress={story.progress} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5 space-y-6">
                  <Sparkles className="h-12 w-12 text-stone-700 mx-auto opacity-20" />
                  <p className="text-stone-500 italic font-light">"Aucune œuvre n'a encore été ajoutée à cette vitrine."</p>
                  {isMe && (
                    <Button asChild variant="outline" className="rounded-full border-primary text-primary font-black text-[10px] uppercase tracking-widest">
                      <Link href="/stories">Explorer le catalogue</Link>
                    </Button>
                  )}
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="activity" className="animate-in fade-in duration-700">
            <div className="max-w-2xl mx-auto space-y-6">
              {[
                { type: 'like', text: 'a aimé "Chroniques d\'Orisha"', time: 'Il y a 2h', icon: Heart, color: 'text-rose-500' },
                { type: 'read', text: 'a terminé le chapitre 15 de "Cyber-Reines"', time: 'Hier', icon: BookOpen, color: 'text-emerald-500' },
                { type: 'comment', text: 'a partagé une théorie sur le forum', time: 'Il y a 2 jours', icon: MessageSquare, color: 'text-primary' },
              ].map((act, i) => (
                <Card key={i} className="bg-stone-900/50 border-white/5 rounded-3xl hover:border-primary/20 transition-all group shadow-lg">
                  <CardContent className="p-6 flex items-center gap-5">
                    <div className={cn("p-3 rounded-2xl bg-white/5 transition-transform group-hover:scale-110", act.color)}><act.icon className="h-5 w-5" /></div>
                    <div className="flex-1">
                      <p className="text-base font-medium text-white"><span className="font-black">{profile.displayName}</span> {act.text}</p>
                      <p className="text-[10px] text-stone-500 uppercase font-black tracking-widest mt-1.5 flex items-center gap-2">
                        <Clock className="h-3 w-3" /> {act.time}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="animate-in fade-in duration-700">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { label: 'Niveau Nexus', val: '42', icon: Trophy, color: 'text-primary', sub: '650 / 1000 XP', progress: 65 },
                { label: 'Engagement', val: 'Top 5%', icon: Zap, color: 'text-emerald-500', sub: 'Lecteur de la Semaine', progress: 100 },
                { label: 'Affinité', val: 'Afro-Futur', icon: Sparkles, color: 'text-orange-500', sub: 'Genre Préféré', progress: 100 },
              ].map((stat, i) => (
                <Card key={i} className="bg-stone-900 border-none rounded-[3rem] p-10 shadow-2xl text-center space-y-6 group hover:scale-[1.02] transition-all">
                  <div className={cn("p-5 rounded-[2rem] w-fit mx-auto transition-transform group-hover:scale-110 bg-white/5", stat.color)}>
                    <stat.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-stone-500 tracking-[0.2em] mb-2">{stat.label}</h4>
                    <p className="text-4xl font-black text-white tracking-tighter">{stat.val}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className={cn("h-full transition-all duration-1000", stat.color.replace('text-', 'bg-'))} style={{ width: `${stat.progress}%`, filter: 'brightness(1.5)' }} />
                    </div>
                    <p className={cn("text-[9px] font-black uppercase tracking-widest", stat.color)}>{stat.sub}</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ArrowRight(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
}
